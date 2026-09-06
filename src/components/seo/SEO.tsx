import { useEffect } from "react";
import { SEO_CONFIG, pageTitle, canonicalUrl } from "@/lib/seo-config";

interface SEOProps {
  /** Page title. By default, " | CONVEXA" is appended unless preventSuffix is true. */
  title?: string;
  /** Page description. Fallback to default enterprise description. */
  description?: string;
  /** Comma-separated list of keywords. */
  keywords?: string;
  /** Pathname or full canonical URL for the page. */
  canonical?: string;
  /** Custom robots directive. */
  robots?: string;
  /** Open Graph type (e.g. website, article). Defaults to website. */
  ogType?: string;
  /** Open Graph / Twitter image URL. Defaults to default OG image. */
  ogImage?: string;
  /** Set to true if you don't want the brand suffix appended to the title. */
  preventSuffix?: boolean;
  /** Optional JSON-LD structured data specific to this page (e.g. FAQ, Product). */
  jsonLd?: Record<string, any>;
}

/**
 * Reusable SEO component for CONVEXA.
 * Leverages React 19's native head hoisting for title, meta, and link tags.
 * Ensures sitemap, robots, OG, and structured data standards are met.
 */
export function SEO({
  title,
  description = "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management.",
  keywords = "WhatsApp CRM, bulk WhatsApp sender, WhatsApp automation, AI chatbot, shared team inbox",
  canonical,
  robots = SEO_CONFIG.robots,
  ogType = "website",
  ogImage = SEO_CONFIG.ogImage,
  preventSuffix = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? (preventSuffix ? title : pageTitle(title)) : SEO_CONFIG.siteName;

  const resolvedCanonical = canonical
    ? canonical.startsWith("http")
      ? canonical
      : canonicalUrl(canonical)
    : SEO_CONFIG.siteUrl;

  const resolvedOgImage = ogImage.startsWith("http") ? ogImage : `${SEO_CONFIG.siteUrl}${ogImage}`;

  // Synchronize document.title client-side just in case
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SEO_CONFIG.author} />
      <meta name="robots" content={robots} />
      <meta name="theme-color" content={SEO_CONFIG.themeColor} />
      <meta name="application-name" content={SEO_CONFIG.siteName} />
      <meta name="generator" content="React / TanStack" />
      <meta name="referrer" content="no-referrer-when-downgrade" />

      {/* Canonical Link */}
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:creator" content={SEO_CONFIG.twitterHandle} />

      {/* Optional Page-Specific Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
