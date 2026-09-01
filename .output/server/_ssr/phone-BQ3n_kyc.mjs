//#region node_modules/.nitro/vite/services/ssr/assets/phone-BQ3n_kyc.js
function normalizePhone(input, opts = {}) {
	const raw = (input ?? "").trim();
	if (!raw) return {
		raw,
		normalized: null,
		valid: false,
		reason: "Empty"
	};
	let digits = raw.replace(/\D+/g, "");
	if (!digits) return {
		raw,
		normalized: null,
		valid: false,
		reason: "No digits"
	};
	digits = digits.replace(/^0+/, "");
	if (!digits) return {
		raw,
		normalized: null,
		valid: false,
		reason: "No digits"
	};
	const cc = (opts.defaultCountryCode ?? "").replace(/\D+/g, "");
	let normalized = digits;
	if (digits.length < 7) return {
		raw,
		normalized: null,
		valid: false,
		reason: "Too short"
	};
	if (cc && digits.length <= 10) normalized = cc + digits.slice(-10);
	if (normalized.length > 15) return {
		raw,
		normalized: null,
		valid: false,
		reason: "Too long"
	};
	return {
		raw,
		normalized,
		valid: true
	};
}
function dedupeNormalized(rows) {
	const seen = /* @__PURE__ */ new Set();
	const unique = [];
	const duplicates = [];
	for (const r of rows) {
		if (!r.normalized) continue;
		if (seen.has(r.normalized)) duplicates.push(r);
		else {
			seen.add(r.normalized);
			unique.push(r);
		}
	}
	return {
		unique,
		duplicates
	};
}
//#endregion
export { normalizePhone as n, dedupeNormalized as t };
