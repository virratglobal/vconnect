/**
 * Centralized SEO configuration for Virrat Reach.
 * All meta values should be sourced from here to ensure consistency
 * and make future updates to branding simple.
 */

export const SEO_CONFIG = {
  /** Canonical site origin — update when domain is confirmed */
  siteUrl: "https://vconnect.virratglobal.com",

  /** Brand name used across all title templates */
  siteName: "VCONNECT",

  /** Default Open Graph image (1200×630 recommended) */
  ogImage: "/og-image.png",

  /** Twitter / X account handle */
  twitterHandle: "@vconnect",

  /** Default locale */
  locale: "en_IN",

  /** Theme color shown in supported browsers */
  themeColor: "#16a34a",

  /** App author / publisher */
  author: "VCONNECT",

  /** Default robots directive */
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  /** Google Site Verification — fill in once obtained */
  googleSiteVerification: "",
} as const;

/** Helper: build a fully-qualified canonical URL from a pathname */
export function canonicalUrl(pathname: string): string {
  const base = SEO_CONFIG.siteUrl.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

/** Helper: build a complete page title using the brand suffix */
export function pageTitle(title: string): string {
  if (!title) return SEO_CONFIG.siteName;
  return `${title} | ${SEO_CONFIG.siteName}`;
}
