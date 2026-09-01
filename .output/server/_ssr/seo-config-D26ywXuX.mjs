//#region node_modules/.nitro/vite/services/ssr/assets/seo-config-D26ywXuX.js
/**
* Centralized SEO configuration for Virrat Reach.
* All meta values should be sourced from here to ensure consistency
* and make future updates to branding simple.
*/
var SEO_CONFIG = {
	/** Canonical site origin — update when domain is confirmed */
	siteUrl: "https://convexa.virratglobal.com",
	/** Brand name used across all title templates */
	siteName: "CONVEXA",
	/** Default Open Graph image (1200×630 recommended) */
	ogImage: "/og-image.png",
	/** Twitter / X account handle */
	twitterHandle: "@convexa",
	/** Default locale */
	locale: "en_IN",
	/** Theme color shown in supported browsers */
	themeColor: "#16a34a",
	/** App author / publisher */
	author: "CONVEXA",
	/** Default robots directive */
	robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
	/** Google Site Verification — fill in once obtained */
	googleSiteVerification: ""
};
/** Helper: build a fully-qualified canonical URL from a pathname */
function canonicalUrl(pathname) {
	return `${SEO_CONFIG.siteUrl.replace(/\/$/, "")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
/** Helper: build a complete page title using the brand suffix */
function pageTitle(title) {
	if (!title) return SEO_CONFIG.siteName;
	return `${title} | ${SEO_CONFIG.siteName}`;
}
//#endregion
export { canonicalUrl as n, pageTitle as r, SEO_CONFIG as t };
