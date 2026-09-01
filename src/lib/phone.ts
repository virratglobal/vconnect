// Phone-number normalization used across imports, contacts and dedupe.
// Normalization rules from PRD §4:
//   +919876543210 / 919876543210 / 9876543210  →  9876543210 (last 10 digits)
// We store both the raw and the normalized value. Normalized = digits only,
// with optional default country code prepended when the number is local.

export interface NormalizeOptions {
  defaultCountryCode?: string; // e.g. "91"
}

export interface NormalizeResult {
  raw: string;
  normalized: string | null;
  valid: boolean;
  reason?: string;
}

export function normalizePhone(input: string, opts: NormalizeOptions = {}): NormalizeResult {
  const raw = (input ?? "").trim();
  if (!raw) return { raw, normalized: null, valid: false, reason: "Empty" };

  let digits = raw.replace(/\D+/g, "");
  if (!digits) return { raw, normalized: null, valid: false, reason: "No digits" };

  // Strip leading zeros before evaluating length or prepending
  digits = digits.replace(/^0+/, "");
  if (!digits) return { raw, normalized: null, valid: false, reason: "No digits" };

  const cc = (opts.defaultCountryCode ?? "").replace(/\D+/g, "");
  let normalized = digits;

  // If shorter than 7 digits → invalid (local number should have at least 7 digits after stripping leading zero)
  if (digits.length < 7) return { raw, normalized: null, valid: false, reason: "Too short" };

  // If digits look like a local number and we have a default cc, prepend it.
  if (cc && digits.length <= 10) {
    normalized = cc + digits.slice(-10);
  }

  // Cap at 15 digits (E.164 max)
  if (normalized.length > 15) return { raw, normalized: null, valid: false, reason: "Too long" };

  return { raw, normalized, valid: true };
}

export function dedupeNormalized<T extends { normalized: string | null }>(
  rows: T[],
): {
  unique: T[];
  duplicates: T[];
} {
  const seen = new Set<string>();
  const unique: T[] = [];
  const duplicates: T[] = [];
  for (const r of rows) {
    if (!r.normalized) continue;
    if (seen.has(r.normalized)) duplicates.push(r);
    else {
      seen.add(r.normalized);
      unique.push(r);
    }
  }
  return { unique, duplicates };
}
