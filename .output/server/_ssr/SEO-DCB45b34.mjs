import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as canonicalUrl, r as pageTitle, t as SEO_CONFIG } from "./seo-config-D26ywXuX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SEO-DCB45b34.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Reusable SEO component for CONVEXA.
* Leverages React 19's native head hoisting for title, meta, and link tags.
* Ensures sitemap, robots, OG, and structured data standards are met.
*/
function SEO({ title, description = "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management.", keywords = "WhatsApp CRM, bulk WhatsApp sender, WhatsApp automation, AI chatbot, shared team inbox", canonical, robots = SEO_CONFIG.robots, ogType = "website", ogImage = SEO_CONFIG.ogImage, preventSuffix = false, jsonLd }) {
	const fullTitle = title ? preventSuffix ? title : pageTitle(title) : SEO_CONFIG.siteName;
	const resolvedCanonical = canonical ? canonical.startsWith("http") ? canonical : canonicalUrl(canonical) : SEO_CONFIG.siteUrl;
	const resolvedOgImage = ogImage.startsWith("http") ? ogImage : `${SEO_CONFIG.siteUrl}${ogImage}`;
	(0, import_react.useEffect)(() => {
		document.title = fullTitle;
	}, [fullTitle]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: fullTitle }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "description",
			content: description
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "keywords",
			content: keywords
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "author",
			content: SEO_CONFIG.author
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "robots",
			content: robots
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "theme-color",
			content: SEO_CONFIG.themeColor
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "application-name",
			content: SEO_CONFIG.siteName
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "generator",
			content: "React / TanStack"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "referrer",
			content: "no-referrer-when-downgrade"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
			rel: "canonical",
			href: resolvedCanonical
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:type",
			content: ogType
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:title",
			content: fullTitle
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:description",
			content: description
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:url",
			content: resolvedCanonical
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:image",
			content: resolvedOgImage
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:site_name",
			content: SEO_CONFIG.siteName
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			property: "og:locale",
			content: SEO_CONFIG.locale
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "twitter:card",
			content: "summary_large_image"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "twitter:title",
			content: fullTitle
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "twitter:description",
			content: description
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "twitter:image",
			content: resolvedOgImage
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "twitter:creator",
			content: SEO_CONFIG.twitterHandle
		}),
		jsonLd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) }
		})
	] });
}
//#endregion
export { SEO as t };
