import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-notification-sound-CMbE1SaD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
var STORAGE_KEY_ENABLED = "notification_sound_enabled";
var STORAGE_KEY_VOLUME = "notification_sound_volume";
var BROADCAST_CHANNEL_NAME = "whats-crm-notification-sound";
function getSoundEnabled() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_ENABLED);
		if (raw === null) return true;
		return raw === "true";
	} catch {
		return true;
	}
}
function setSoundEnabled(enabled) {
	try {
		localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
	} catch {}
}
function getSoundVolume() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_VOLUME);
		if (raw === null) return 70;
		const n = parseInt(raw, 10);
		return isNaN(n) ? 70 : Math.max(0, Math.min(100, n));
	} catch {
		return 70;
	}
}
function setSoundVolume(volume) {
	try {
		localStorage.setItem(STORAGE_KEY_VOLUME, String(Math.round(volume)));
	} catch {}
}
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
function playChime(volumePct) {
	try {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		const masterGain = volumePct / 100;
		function scheduleChime() {
			function ping(freq, delaySeconds) {
				const osc = ctx.createOscillator();
				const env = ctx.createGain();
				const gain = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = freq;
				gain.connect(ctx.destination);
				const startTime = ctx.currentTime + delaySeconds;
				env.gain.setValueAtTime(0, startTime);
				env.gain.linearRampToValueAtTime(masterGain * .35, startTime + .008);
				env.gain.exponentialRampToValueAtTime(1e-4, startTime + .45);
				osc.connect(env);
				env.connect(gain);
				osc.start(startTime);
				osc.stop(startTime + .5);
			}
			ping(880, 0);
			ping(1108, .18);
			setTimeout(() => {
				try {
					ctx.close();
				} catch {}
			}, 900);
		}
		if (ctx.state === "suspended") ctx.resume().then(scheduleChime).catch(() => {
			try {
				ctx.close();
			} catch {}
		});
		else scheduleChime();
	} catch {}
}
/**
* Mount this hook once at the top level of the authenticated layout.
* It creates ONE tenant-scoped realtime subscription on conversation_messages
* and plays a chime on each new inbound message, subject to user preferences.
*
* @param tenantId - The active tenant ID. Pass null/undefined to disable.
*/
function useNotificationSound(tenantId) {
	const mountedAtRef = (0, import_react.useRef)((/* @__PURE__ */ new Date()).toISOString());
	const bcRef = (0, import_react.useRef)(null);
	const isLeaderRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!tenantId) return;
		try {
			bcRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
			bcRef.current.onmessage = () => {
				isLeaderRef.current = false;
			};
		} catch {
			bcRef.current = null;
		}
		const mountedAt = mountedAtRef.current;
		const channel = supabase.channel(`inbound-sound:${tenantId}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "conversation_messages",
			filter: `tenant_id=eq.${tenantId}`
		}, (payload) => {
			const row = payload.new;
			if (row.direction !== "inbound") return;
			if (row.created_at && row.created_at < mountedAt) return;
			if (!getSoundEnabled()) return;
			isLeaderRef.current = true;
			try {
				bcRef.current?.postMessage({
					type: "sound-played",
					tenantId
				});
			} catch {}
			setTimeout(() => {
				if (!isLeaderRef.current) return;
				isLeaderRef.current = false;
				const vol = getSoundVolume();
				if (vol > 0) playChime(vol);
			}, 30);
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
			try {
				bcRef.current?.close();
			} catch {}
			bcRef.current = null;
		};
	}, [tenantId]);
}
//#endregion
export { useNotificationSound as a, setSoundVolume as i, getSoundVolume as n, setSoundEnabled as r, getSoundEnabled as t };
