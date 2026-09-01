/**
 * use-notification-sound
 *
 * Plays a subtle chime sound when a new inbound WhatsApp message arrives
 * for the current tenant. Designed to:
 *   - Fire only on INSERT events for direction='inbound' messages
 *   - Prevent duplicate playback across multiple browser tabs via BroadcastChannel
 *   - Store preference + volume in localStorage (no DB schema change required)
 *   - Work independently of which page the user is currently on
 *   - Not fire on page load / reconnect (uses insertedAt guard)
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── localStorage key helpers ────────────────────────────────────────────────

const STORAGE_KEY_ENABLED = "notification_sound_enabled";
const STORAGE_KEY_VOLUME = "notification_sound_volume";
const BROADCAST_CHANNEL_NAME = "whats-crm-notification-sound";

export function getSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENABLED);
    if (raw === null) return true; // default: enabled
    return raw === "true";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
  } catch {
    // ignore
  }
}

export function getSoundVolume(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOLUME);
    if (raw === null) return 70; // default: 70%
    const n = parseInt(raw, 10);
    return isNaN(n) ? 70 : Math.max(0, Math.min(100, n));
  } catch {
    return 70;
  }
}

export function setSoundVolume(volume: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_VOLUME, String(Math.round(volume)));
  } catch {
    // ignore
  }
}

// ─── Sound generation via Web Audio API ──────────────────────────────────────

/**
 * Synthesise a short, pleasant double-ping chime using the Web Audio API.
 * No external audio file required — works offline, loads instantly.
 *
 * Sound characteristics:
 *  - Two sine-tone pings at 880 Hz and 1108 Hz (a pleasant major third)
 *  - Each ping fades in quickly and decays over ~0.4 s
 *  - Total duration ≈ 0.7 s
 *  - Soft and office-friendly
 */
function playChime(volumePct: number): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const masterGain = volumePct / 100;

    function scheduleChime() {
      function ping(freq: number, delaySeconds: number) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;
        gain.connect(ctx.destination);

        const startTime = ctx.currentTime + delaySeconds;
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(masterGain * 0.35, startTime + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

        osc.connect(env);
        env.connect(gain);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      }

      ping(880, 0);         // A5
      ping(1108, 0.18);     // C#6 (major third above A5)

      // Close AudioContext after sound completes to free resources
      setTimeout(() => {
        try { ctx.close(); } catch { /* ignore */ }
      }, 900);
    }

    // Must resume AudioContext before scheduling — browsers start it suspended
    if (ctx.state === "suspended") {
      ctx.resume().then(scheduleChime).catch(() => {
        try { ctx.close(); } catch { /* ignore */ }
      });
    } else {
      scheduleChime();
    }
  } catch {
    // Silently ignore if Web Audio is blocked/unavailable
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Mount this hook once at the top level of the authenticated layout.
 * It creates ONE tenant-scoped realtime subscription on conversation_messages
 * and plays a chime on each new inbound message, subject to user preferences.
 *
 * @param tenantId - The active tenant ID. Pass null/undefined to disable.
 */
export function useNotificationSound(tenantId: string | null | undefined): void {
  // Track when this hook mounted so we ignore pre-existing messages
  const mountedAtRef = useRef<string>(new Date().toISOString());
  // BroadcastChannel for cross-tab dedup
  const bcRef = useRef<BroadcastChannel | null>(null);
  // Whether this tab is the "leader" (last to receive the broadcast wins nothing — first wins)
  const isLeaderRef = useRef<boolean>(false);

  useEffect(() => {
    if (!tenantId) return;

    // Set up BroadcastChannel for cross-tab dedup
    try {
      bcRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bcRef.current.onmessage = () => {
        // Another tab already played the sound; mark us as follower for this event
        isLeaderRef.current = false;
      };
    } catch {
      // BroadcastChannel not available (e.g., private browsing in some browsers)
      bcRef.current = null;
    }

    const mountedAt = mountedAtRef.current;

    const channel = supabase
      .channel(`inbound-sound:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const row = payload.new as {
            direction?: string;
            created_at?: string;
            tenant_id?: string;
          };

          // Only fire for inbound messages
          if (row.direction !== "inbound") return;

          // Skip messages that existed before this page loaded (reconnect guard)
          if (row.created_at && row.created_at < mountedAt) return;

          // Check user preference
          if (!getSoundEnabled()) return;

          // Leader election: this tab tries to become the leader
          isLeaderRef.current = true;

          // Broadcast to other tabs so they know NOT to play
          try {
            bcRef.current?.postMessage({ type: "sound-played", tenantId });
          } catch {
            // ignore
          }

          // Small delay to let BroadcastChannel propagate and let followers cancel
          setTimeout(() => {
            if (!isLeaderRef.current) return; // another tab already played it
            // Reset for next event
            isLeaderRef.current = false;
            const vol = getSoundVolume();
            if (vol > 0) {
              playChime(vol);
            }
          }, 30);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      try { bcRef.current?.close(); } catch { /* ignore */ }
      bcRef.current = null;
    };
  }, [tenantId]);
}
