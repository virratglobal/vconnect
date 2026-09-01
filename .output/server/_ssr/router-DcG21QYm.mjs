import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { t as Route$18 } from "./account-settings-CFbQuYKv.mjs";
import { n as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as SEO_CONFIG } from "./seo-config-D26ywXuX.mjs";
import { a as sendMetaTemplate } from "./whatsapp-service-CN9sXmbC.mjs";
import { t as useBranding } from "./use-branding-UdiGE1Ur.mjs";
import { t as Route$19 } from "./dashboard-CEmpL9IX.mjs";
import { t as Route$20 } from "./settings-Bows4HpH.mjs";
import { t as Route$21 } from "./super-admin-DcIuJ4ql.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DcG21QYm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-CrtBgliy.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
/** JSON-LD Organization structured data — rendered once in the root shell */
var organizationSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: SEO_CONFIG.siteName,
	url: SEO_CONFIG.siteUrl,
	logo: `${SEO_CONFIG.siteUrl}/logo.png`,
	sameAs: ["https://twitter.com/virratreach", "https://www.linkedin.com/company/virrat-reach"],
	contactPoint: {
		"@type": "ContactPoint",
		contactType: "customer support",
		availableLanguage: ["English", "Hindi"]
	}
};
/** JSON-LD SoftwareApplication structured data */
var softwareAppSchema = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: SEO_CONFIG.siteName,
	operatingSystem: "Web",
	applicationCategory: "BusinessApplication",
	description: "AI-Powered WhatsApp CRM for bulk broadcasting, chatbot automation, smart inbox, and voice call campaigns.",
	offers: {
		"@type": "Offer",
		priceCurrency: "INR",
		availability: "https://schema.org/InStock"
	}
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$17 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: `CONVEXA - Professional WhatsApp CRM` },
			{
				name: "description",
				content: "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management."
			},
			{
				name: "author",
				content: SEO_CONFIG.author
			},
			{
				name: "robots",
				content: SEO_CONFIG.robots
			},
			{
				name: "theme-color",
				content: SEO_CONFIG.themeColor
			},
			{
				name: "application-name",
				content: SEO_CONFIG.siteName
			},
			{
				name: "referrer",
				content: "no-referrer-when-downgrade"
			},
			{
				property: "og:title",
				content: SEO_CONFIG.siteName
			},
			{
				property: "og:description",
				content: "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:url",
				content: SEO_CONFIG.siteUrl
			},
			{
				property: "og:image",
				content: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}`
			},
			{
				property: "og:site_name",
				content: SEO_CONFIG.siteName
			},
			{
				property: "og:locale",
				content: SEO_CONFIG.locale
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: SEO_CONFIG.siteName
			},
			{
				name: "twitter:description",
				content: "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management."
			},
			{
				name: "twitter:image",
				content: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}`
			},
			{
				name: "twitter:creator",
				content: SEO_CONFIG.twitterHandle
			}
		],
		links: [
			{
				rel: "canonical",
				href: SEO_CONFIG.siteUrl
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/x-icon",
				href: "/favicon.ico?v=convexa"
			},
			{
				rel: "shortcut icon",
				type: "image/x-icon",
				href: "/favicon.ico?v=convexa"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png?v=convexa"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon.png?v=convexa"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(organizationSchema) }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(softwareAppSchema) }
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function BrandingInitializer() {
	useBranding();
	return null;
}
function RootComponent() {
	const { queryClient } = Route$17.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingInitializer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})
		]
	});
}
var $$splitComponentImporter$13 = () => import("./auth-rHQLj_UB.mjs");
var Route$16 = createFileRoute("/auth")({
	ssr: false,
	beforeLoad: async () => {
		const { data } = await supabase.auth.getSession();
		if (data.session) throw redirect({ to: "/dashboard" });
	},
	head: () => {
		const title = "Sign In | CONVEXA";
		const description = "Sign in or sign up to your CONVEXA workspace to manage WhatsApp campaigns, broadcasts, and AI chatbots.";
		const url = `${SEO_CONFIG.siteUrl}/auth`;
		const ogImage = `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}`;
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: description
				},
				{
					name: "robots",
					content: "noindex, nofollow"
				},
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:description",
					content: description
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: url
				},
				{
					property: "og:image",
					content: ogImage
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: title
				},
				{
					name: "twitter:description",
					content: description
				},
				{
					name: "twitter:image",
					content: ogImage
				}
			],
			links: [{
				rel: "canonical",
				href: url
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./route-BroRgGpB.mjs");
var Route$15 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data } = await supabase.auth.getSession();
		if (!data.session) throw redirect({ to: "/auth" });
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./routes-S2GKKC3F.mjs");
var Route$14 = createFileRoute("/")({
	ssr: false,
	beforeLoad: async () => {
		const { data } = await supabase.auth.getSession();
		if (data.session) throw redirect({ to: "/dashboard" });
	},
	head: () => {
		const title = "CONVEXA – AI-Powered WhatsApp CRM for Businesses";
		const description = "Send bulk WhatsApp broadcasts, build AI chatbots, manage customer chats with a shared inbox, run voice campaigns, and automate customer engagement.";
		const url = SEO_CONFIG.siteUrl;
		const ogImage = `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}`;
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: description
				},
				{
					name: "keywords",
					content: "WhatsApp CRM, Bulk WhatsApp Sender, WhatsApp Marketing, AI Chatbot, Shared Inbox, Voice Campaigns, CONVEXA"
				},
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:description",
					content: description
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: url
				},
				{
					property: "og:image",
					content: ogImage
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: title
				},
				{
					name: "twitter:description",
					content: description
				},
				{
					name: "twitter:image",
					content: ogImage
				}
			],
			links: [{
				rel: "canonical",
				href: url
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./templates-DNav3JS_.mjs");
var Route$13 = createFileRoute("/_authenticated/templates")({
	head: () => ({ meta: [{ title: "Templates · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./reports-DVicKLhn.mjs");
var Route$12 = createFileRoute("/_authenticated/reports")({
	head: () => ({ meta: [{ title: "Enterprise Analytics · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./organization-BIQVus50.mjs");
var Route$11 = createFileRoute("/_authenticated/organization")({
	head: () => ({ meta: [{ title: "My Organizations · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./help-BTl_Vdcu.mjs");
var Route$10 = createFileRoute("/_authenticated/help")({
	head: () => ({ meta: [{ title: "Help & Support · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./conversations-BuuXGJ0E.mjs");
var Route$9 = createFileRoute("/_authenticated/conversations")({
	head: () => ({ meta: [{ title: "Conversations · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./contacts-v-6WH3Rq.mjs");
var Route$8 = createFileRoute("/_authenticated/contacts")({
	head: () => ({ meta: [{ title: "Contacts · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./campaigns-BZ38Oee_.mjs");
var Route$7 = createFileRoute("/_authenticated/campaigns")({
	head: () => ({ meta: [{ title: "Campaigns · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./contacts.index-CdcamNFm.mjs");
var Route$6 = createFileRoute("/_authenticated/contacts/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var META_API = "https://graph.facebook.com/v20.0";
var Route$5 = createFileRoute("/api/debug/send-test")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) return Response.json({ error: "Unauthorized: Missing Bearer Token" }, { status: 401 });
		const token = authHeader.replace("Bearer ", "");
		const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
		const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
		if (authErr || !user) return Response.json({ error: "Unauthorized: Invalid Session" }, { status: 401 });
		const { phone_number, template_name, media_url, tenant_id, variables } = await request.json();
		if (!phone_number || !template_name) return Response.json({ error: "Missing required fields: phone_number, template_name" }, { status: 400 });
		let resolvedTenantId = tenant_id;
		if (!resolvedTenantId) {
			const { data: membership } = await supabaseAdmin.from("tenant_members").select("tenant_id").eq("user_id", user.id).limit(1).maybeSingle();
			if (!membership) return Response.json({ error: "User is not associated with any tenant" }, { status: 403 });
			resolvedTenantId = membership.tenant_id;
		}
		const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("phone_number_id, access_token").eq("tenant_id", resolvedTenantId).maybeSingle();
		if (!creds?.phone_number_id || !creds.access_token) return Response.json({ error: "WhatsApp credentials not configured for this tenant" }, { status: 400 });
		const { data: dbTemplate } = await supabaseAdmin.from("message_templates").select("language, variables, header_type").eq("tenant_id", resolvedTenantId).eq("template_name", template_name).maybeSingle();
		if (!dbTemplate) return Response.json({ error: `Message template "${template_name}" not found in database.` }, { status: 404 });
		const lang = (dbTemplate.language ?? "").trim();
		if (!lang) return Response.json({ error: `Template language is empty for "${template_name}". Re-sync your templates.` }, { status: 400 });
		const vars = dbTemplate?.variables || [];
		const normalizedPhone = phone_number.replace(/\D/g, "");
		const parameters = vars.map((idx) => {
			return {
				type: "text",
				text: (variables?.[idx] ?? `Test_${idx}`).toString() || "-"
			};
		});
		const components = [];
		if (parameters.length) components.push({
			type: "body",
			parameters
		});
		if (media_url && (dbTemplate?.header_type === "IMAGE" || !dbTemplate)) components.push({
			type: "header",
			parameters: [{
				type: "image",
				image: { link: media_url }
			}]
		});
		const payload = {
			messaging_product: "whatsapp",
			to: normalizedPhone,
			type: "template",
			template: {
				name: template_name,
				language: { code: lang },
				components
			}
		};
		const res = await fetch(`${META_API}/${creds.phone_number_id}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${creds.access_token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
		const responseText = await res.text();
		let responseJson = {};
		try {
			responseJson = JSON.parse(responseText);
		} catch {
			responseJson = { raw: responseText };
		}
		return Response.json({
			payload,
			http_status: res.status,
			response: responseJson,
			message_id: responseJson?.messages?.[0]?.id || null,
			delivery_status: res.ok && responseJson?.messages?.[0]?.id ? "sent_to_meta" : "failed"
		});
	} catch (e) {
		return Response.json({ error: e.message }, { status: 500 });
	}
} } } });
var $$splitComponentImporter$2 = () => import("./contacts.tags-DnAIpxLy.mjs");
var Route$4 = createFileRoute("/_authenticated/contacts/tags")({
	head: () => ({ meta: [{ title: "Groups & Tags · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./contacts.import-BILmq2cr.mjs");
var Route$3 = createFileRoute("/_authenticated/contacts/import")({
	head: () => ({ meta: [{ title: "Import CSV Contacts · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./contacts.bulk-BOsiERUO.mjs");
var Route$2 = createFileRoute("/_authenticated/contacts/bulk")({
	head: () => ({ meta: [{ title: "Bulk Add Contacts · Virrat Reach" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var BATCH = 50;
var Route$1 = createFileRoute("/api/public/hooks/process-campaigns")({ server: { handlers: { POST: async () => {
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	const tenMinsAgo = (/* @__PURE__ */ new Date(Date.now() - 600 * 1e3)).toISOString();
	await supabaseAdmin.from("campaign_recipients").update({ status: "pending" }).eq("status", "sending").lt("updated_at", tenMinsAgo);
	await supabaseAdmin.from("campaigns").update({
		status: "processing",
		started_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("status", "scheduled").lte("scheduled_at", (/* @__PURE__ */ new Date()).toISOString());
	const { data: active } = await supabaseAdmin.from("campaigns").select("id, tenant_id, template_id, template_snapshot, total_recipients, processed_count, failed_count, audience_criteria, created_by, tenants:tenant_id(suspended), campaign_media(file_url)").in("status", [
		"queued",
		"sending",
		"processing"
	]).limit(20);
	if (!active?.length) return Response.json({ processed: 0 });
	let totalSent = 0;
	for (const c of active) {
		let isSuspended = c.tenants?.suspended === true;
		if (isSuspended) {
			const { data: ownerMember } = await supabaseAdmin.from("tenant_members").select("user_id").eq("tenant_id", c.tenant_id).eq("role", "owner").maybeSingle();
			let ownerEmail = null;
			if (ownerMember?.user_id) {
				const { data: ownerProfile } = await supabaseAdmin.from("profiles").select("email").eq("id", ownerMember.user_id).maybeSingle();
				ownerEmail = ownerProfile?.email ?? null;
			}
			if (ownerEmail === "mail@virratglobal.com") isSuspended = false;
		}
		if (isSuspended) {
			await supabaseAdmin.from("campaigns").update({
				status: "failed",
				completed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", c.id);
			await supabaseAdmin.from("system_errors").insert({
				tenant_id: c.tenant_id,
				type: "campaign_send",
				error: "Campaign aborted: Workspace is suspended",
				context: { campaign_id: c.id }
			});
			continue;
		}
		if (c.created_by) {
			const { data: isCreatorManagerPlus } = await supabaseAdmin.rpc("has_tenant_role", {
				_tenant: c.tenant_id,
				_user: c.created_by,
				_roles: [
					"owner",
					"admin",
					"manager"
				]
			});
			if (!isCreatorManagerPlus) {
				const audience = c.audience_criteria;
				let targetGroupIds = [];
				if (audience) {
					if (audience.mode === "groups" && Array.isArray(audience.ids)) targetGroupIds = audience.ids;
					else if (audience.mode === "audience_builder") {
						let activeAudience = audience;
						if (audience.savedAudienceId) {
							const { data: sa } = await supabaseAdmin.from("saved_audiences").select("criteria").eq("id", audience.savedAudienceId).maybeSingle();
							if (sa && sa.criteria) activeAudience = sa.criteria;
						}
						if (Array.isArray(activeAudience.includeGroups)) targetGroupIds = activeAudience.includeGroups;
					}
				}
				if (targetGroupIds.length > 0) {
					const { data: groups } = await supabaseAdmin.from("groups").select("id, created_by").in("id", targetGroupIds);
					const foreignGroupIds = (groups ?? []).filter((g) => g.created_by && g.created_by !== c.created_by).map((g) => g.id);
					if (foreignGroupIds.length > 0) {
						const { data: shares } = await supabaseAdmin.from("group_shares").select("group_id, can_use_in_campaigns").in("group_id", foreignGroupIds).eq("shared_with_user", c.created_by);
						const permittedGroupIds = (shares ?? []).filter((s) => s.can_use_in_campaigns).map((s) => s.group_id);
						if (foreignGroupIds.some((id) => !permittedGroupIds.includes(id))) {
							await supabaseAdmin.from("campaigns").update({
								status: "failed",
								completed_at: (/* @__PURE__ */ new Date()).toISOString()
							}).eq("id", c.id);
							await supabaseAdmin.from("system_errors").insert({
								tenant_id: c.tenant_id,
								type: "campaign_send",
								error: "Campaign aborted: Creator's access to the shared audience was revoked.",
								context: {
									campaign_id: c.id,
									creator_id: c.created_by
								}
							});
							await supabaseAdmin.from("campaign_recipients").update({
								status: "api_failed",
								meta_error: "Campaign aborted: Creator's access to the shared audience was revoked.",
								attempts: 1
							}).eq("campaign_id", c.id).eq("status", "pending");
							continue;
						}
					}
				}
			}
		}
		const { data: creds } = await supabaseAdmin.from("whatsapp_credentials").select("phone_number_id, access_token").eq("tenant_id", c.tenant_id).eq("is_default", true).maybeSingle();
		if (!creds?.phone_number_id || !creds.access_token) {
			await supabaseAdmin.from("campaigns").update({ status: "failed" }).eq("id", c.id);
			await supabaseAdmin.from("system_errors").insert({
				tenant_id: c.tenant_id,
				type: "campaign_send",
				error: "Missing WhatsApp credentials"
			});
			continue;
		}
		await supabaseAdmin.from("campaigns").update({ status: "processing" }).eq("id", c.id);
		const { data: pending } = await supabaseAdmin.from("campaign_recipients").select("id, contact_id, phone_number_normalized, rendered_variables, status").eq("campaign_id", c.id).eq("status", "pending").order("created_at", { ascending: true }).limit(BATCH);
		if (!pending?.length) {
			const { count: remaining } = await supabaseAdmin.from("campaign_recipients").select("id", {
				count: "exact",
				head: true
			}).eq("campaign_id", c.id).eq("status", "pending");
			if (!remaining) {
				const { count: countSent } = await supabaseAdmin.from("campaign_recipients").select("id", {
					count: "exact",
					head: true
				}).eq("campaign_id", c.id).in("status", ["sent", "sent_to_meta"]);
				const { count: countFailed } = await supabaseAdmin.from("campaign_recipients").select("id", {
					count: "exact",
					head: true
				}).eq("campaign_id", c.id).in("status", ["failed", "api_failed"]);
				let finalStatus = "completed";
				if (countFailed === c.total_recipients) finalStatus = "failed";
				else finalStatus = "completed";
				await supabaseAdmin.from("campaigns").update({
					status: finalStatus,
					completed_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", c.id);
			}
			continue;
		}
		const tpl = c.template_snapshot;
		const mediaUrl = c.campaign_media?.[0]?.file_url || null;
		const { data: dbTemplate } = c.template_id ? await supabaseAdmin.from("message_templates").select("id, template_name, language, sync_status, header_type").eq("id", c.template_id).maybeSingle() : { data: null };
		let templateValidationError = "";
		if (!dbTemplate) templateValidationError = `Template not found in database (ID: ${c.template_id})`;
		else if (dbTemplate.sync_status !== "approved") templateValidationError = `Template "${dbTemplate.template_name}" is not approved (Status: ${dbTemplate.sync_status})`;
		else if (dbTemplate.language !== tpl.language) templateValidationError = `CRM language ("${tpl.language}") differs from Meta synced template language ("${dbTemplate.language}")`;
		else if (dbTemplate.template_name !== tpl.template_name) templateValidationError = `CRM template name ("${tpl.template_name}") differs from Meta synced template name ("${dbTemplate.template_name}")`;
		if (templateValidationError) {
			await supabaseAdmin.from("campaigns").update({
				status: "failed",
				completed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", c.id);
			await supabaseAdmin.from("system_errors").insert({
				tenant_id: c.tenant_id,
				type: "campaign_send",
				error: `Campaign rejected: ${templateValidationError}`,
				context: {
					campaign_id: c.id,
					template_id: c.template_id
				}
			});
			await supabaseAdmin.from("campaign_recipients").update({
				status: "api_failed",
				meta_error: templateValidationError,
				attempts: 1
			}).eq("campaign_id", c.id).eq("status", "pending");
			await supabaseAdmin.from("campaign_logs").insert({
				tenant_id: c.tenant_id,
				campaign_id: c.id,
				log_type: "validation_fail",
				error_message: templateValidationError
			});
			continue;
		}
		let processed = 0;
		let failed = 0;
		let batchSent = false;
		for (const r of pending) {
			const { data: recipientCheck } = await supabaseAdmin.from("campaign_recipients").select("status").eq("id", r.id).maybeSingle();
			if (recipientCheck?.status && recipientCheck.status !== "pending") continue;
			const { data: lockedRows, error: lockErr } = await supabaseAdmin.from("campaign_recipients").update({
				status: "sending",
				attempts: 1
			}).eq("id", r.id).eq("status", "pending").select("id");
			if (lockErr || !lockedRows || lockedRows.length === 0) continue;
			try {
				const rawPhone = r.phone_number_normalized;
				const normalizedPhone = rawPhone.replace(/\D/g, "");
				const phoneValid = normalizedPhone.length >= 7 && normalizedPhone.length <= 15;
				let recipientValidationError = "";
				if (!phoneValid) recipientValidationError = `Invalid E.164 phone number: original="${rawPhone}", normalized="${normalizedPhone}"`;
				else if (dbTemplate.header_type === "IMAGE" && !mediaUrl) recipientValidationError = `Image template requires an image URL but none was provided`;
				if (!recipientValidationError && dbTemplate.header_type === "IMAGE" && mediaUrl) try {
					const headRes = await fetch(mediaUrl, {
						method: "HEAD",
						signal: AbortSignal.timeout(5e3)
					});
					if (!headRes.ok) recipientValidationError = `Image URL returned status ${headRes.status} (Not 200)`;
					else {
						const contentType = headRes.headers.get("content-type") ?? "";
						const contentLengthStr = headRes.headers.get("content-length");
						if (!contentType.startsWith("image/")) recipientValidationError = `Image URL content-type is ${contentType}, expected image/*`;
						else if (contentLengthStr) {
							const contentLength = parseInt(contentLengthStr, 10);
							if (contentLength > 5 * 1024 * 1024) recipientValidationError = `Image size (${(contentLength / 1024 / 1024).toFixed(2)}MB) exceeds Meta limit of 5MB`;
						}
					}
				} catch (e) {
					recipientValidationError = `Image URL not accessible: ${e.message}`;
				}
				if (recipientValidationError) {
					await supabaseAdmin.from("campaign_recipients").update({
						status: "api_failed",
						meta_error: recipientValidationError,
						attempts: 1
					}).eq("id", r.id);
					await supabaseAdmin.from("campaign_logs").insert({
						tenant_id: c.tenant_id,
						campaign_id: c.id,
						recipient_id: r.id,
						log_type: "validation_fail",
						error_message: recipientValidationError,
						request_payload: {
							phone_original: rawPhone,
							phone_normalized: normalizedPhone,
							media_url: mediaUrl
						}
					});
					failed++;
					continue;
				}
				const resolvedLang = dbTemplate.language ?? "";
				const langLogMsg = `[LANGUAGE_AUDIT] Campaign=${c.id} Recipient=${r.id} Template="${dbTemplate.template_name}" DB_Language="${resolvedLang}" PayloadLanguage="${resolvedLang}" Phone="${normalizedPhone}"`;
				console.log(langLogMsg);
				if (!resolvedLang) {
					await supabaseAdmin.from("campaign_recipients").update({
						status: "api_failed",
						meta_error: `Template language is empty for "${dbTemplate.template_name}" — re-sync templates from Meta`,
						attempts: 1
					}).eq("id", r.id);
					await supabaseAdmin.from("campaign_logs").insert({
						tenant_id: c.tenant_id,
						campaign_id: c.id,
						recipient_id: r.id,
						log_type: "validation_fail",
						error_message: `Empty language for template "${dbTemplate.template_name}"`,
						request_payload: {
							template_name: dbTemplate.template_name,
							db_language: resolvedLang,
							phone: normalizedPhone
						}
					});
					failed++;
					continue;
				}
				const result = await sendMetaTemplate({
					phoneNumberId: creds.phone_number_id,
					accessToken: creds.access_token,
					to: normalizedPhone,
					template: {
						...tpl,
						language: resolvedLang
					},
					variables: r.rendered_variables ?? {},
					mediaUrl
				});
				await supabaseAdmin.from("campaign_logs").insert({
					tenant_id: c.tenant_id,
					campaign_id: c.id,
					recipient_id: r.id,
					log_type: result.ok ? "send_success" : "api_fail",
					request_payload: result.requestPayload,
					response_payload: result.responsePayload,
					http_status: result.status ?? null,
					error_message: result.ok ? null : result.error
				});
				if (result.ok) {
					batchSent = true;
					await supabaseAdmin.from("campaign_recipients").update({
						status: "sent",
						meta_message_id: result.id,
						sent_at: (/* @__PURE__ */ new Date()).toISOString(),
						attempts: 1,
						meta_status: "sent_to_meta"
					}).eq("id", r.id);
					if (result.emptyVarIndices && result.emptyVarIndices.length > 0) await supabaseAdmin.from("system_errors").insert({
						tenant_id: c.tenant_id,
						type: "campaign_empty_var",
						error: `Recipient ${r.id}: variables [${result.emptyVarIndices.join(", ")}] were empty — sent with fallback " "`,
						context: {
							campaign_id: c.id,
							recipient_id: r.id,
							empty_vars: result.emptyVarIndices
						}
					});
					let bodyText = tpl.body || "";
					const vars = r.rendered_variables ?? {};
					for (const [key, val] of Object.entries(vars)) bodyText = bodyText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || "");
					const { data: conv } = await supabaseAdmin.from("conversations").upsert({
						tenant_id: c.tenant_id,
						contact_id: r.contact_id,
						phone_number: r.phone_number_normalized,
						status: "open",
						last_message: bodyText || "[Template]",
						last_message_at: (/* @__PURE__ */ new Date()).toISOString()
					}, { onConflict: "tenant_id,contact_id" }).select("id").single();
					if (conv) await supabaseAdmin.from("messages").insert({
						tenant_id: c.tenant_id,
						conversation_id: conv.id,
						contact_id: r.contact_id,
						campaign_id: c.id,
						direction: "out",
						type: "template",
						body: tpl.body,
						meta_message_id: result.id,
						status: "sent",
						payload: result.requestPayload
					});
					processed++;
					totalSent++;
				} else {
					await supabaseAdmin.from("campaign_recipients").update({
						status: "api_failed",
						error: result.error,
						meta_error: result.error,
						attempts: 1
					}).eq("id", r.id);
					failed++;
					if (result.code === 132001) {
						const staleError = `Template "${tpl.template_name}" does not exist on Meta (code 132001)`;
						if (c.template_id) await supabaseAdmin.from("message_templates").update({
							sync_status: "rejected",
							last_sync_at: (/* @__PURE__ */ new Date()).toISOString()
						}).eq("id", c.template_id);
						await supabaseAdmin.from("campaign_recipients").update({
							status: "api_failed",
							meta_error: staleError,
							attempts: 1
						}).eq("campaign_id", c.id).eq("status", "pending");
						await supabaseAdmin.from("campaigns").update({
							status: "failed",
							completed_at: (/* @__PURE__ */ new Date()).toISOString()
						}).eq("id", c.id);
						await supabaseAdmin.from("campaign_logs").insert({
							tenant_id: c.tenant_id,
							campaign_id: c.id,
							log_type: "validation_fail",
							error_message: staleError
						});
						break;
					}
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Unknown error";
				await supabaseAdmin.from("campaign_recipients").update({
					status: "api_failed",
					error: `Handler exception: ${msg}`,
					meta_error: msg,
					attempts: 1
				}).eq("id", r.id);
				failed++;
			}
		}
		if (batchSent) await supabaseAdmin.from("whatsapp_credentials").update({ last_successful_message_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", c.tenant_id).eq("is_default", true);
		if (processed || failed) try {
			await supabaseAdmin.rpc("increment_campaign_counters", {
				_campaign_id: c.id,
				_processed: processed,
				_failed: failed
			});
		} catch {
			await supabaseAdmin.from("campaigns").update({
				processed_count: (c.processed_count ?? 0) + processed,
				failed_count: (c.failed_count ?? 0) + failed
			}).eq("id", c.id);
		}
		const { count: stillPending } = await supabaseAdmin.from("campaign_recipients").select("id", {
			count: "exact",
			head: true
		}).eq("campaign_id", c.id).in("status", ["pending", "sending"]);
		if (!stillPending) {
			const { count: countSent } = await supabaseAdmin.from("campaign_recipients").select("id", {
				count: "exact",
				head: true
			}).eq("campaign_id", c.id).in("status", ["sent", "sent_to_meta"]);
			const { count: countFailed } = await supabaseAdmin.from("campaign_recipients").select("id", {
				count: "exact",
				head: true
			}).eq("campaign_id", c.id).in("status", ["failed", "api_failed"]);
			let finalStatus = "completed";
			if (countFailed === c.total_recipients) finalStatus = "failed";
			else finalStatus = "completed";
			await supabaseAdmin.from("campaigns").update({
				status: finalStatus,
				completed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", c.id);
		}
	}
	try {
		const { data: nextPending } = await supabaseAdmin.from("campaign_recipients").select("id").eq("status", "pending").limit(1);
		if (nextPending && nextPending.length > 0) {
			const origin = process.env.PUBLIC_BASE_URL ?? "https://convexa.virratglobal.com";
			fetch(`${origin}/api/public/hooks/process-campaigns`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{}"
			}).catch(() => {});
		}
	} catch {}
	return Response.json({ processed: totalSent });
} } } });
var Route = createFileRoute("/api/public/hooks/meta-whatsapp")({ server: { handlers: {
	GET: async ({ request }) => {
		const url = new URL(request.url);
		const mode = url.searchParams.get("hub.mode");
		const token = url.searchParams.get("hub.verify_token");
		const challenge = url.searchParams.get("hub.challenge");
		if (mode !== "subscribe" || !token || !challenge) return new Response("Bad request", { status: 400 });
		const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
		const { data: tenantData } = await supabaseAdmin.from("tenants").select("id").eq("webhook_verify_token", token).maybeSingle();
		if (tenantData) {
			await supabaseAdmin.from("whatsapp_credentials").update({ last_incoming_webhook_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", tenantData.id).eq("is_default", true);
			return new Response(challenge, {
				status: 200,
				headers: { "content-type": "text/plain" }
			});
		}
		const { data: credData } = await supabaseAdmin.from("whatsapp_credentials").select("tenant_id").eq("webhook_verify_token", token).maybeSingle();
		if (credData) {
			await supabaseAdmin.from("whatsapp_credentials").update({ last_incoming_webhook_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", credData.tenant_id).eq("webhook_verify_token", token);
			return new Response(challenge, {
				status: 200,
				headers: { "content-type": "text/plain" }
			});
		}
		return new Response("Forbidden", { status: 403 });
	},
	POST: async ({ request }) => {
		const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
		const raw = await request.text();
		let payload;
		try {
			payload = JSON.parse(raw);
		} catch {
			return new Response("Bad JSON", { status: 400 });
		}
		for (const entry of payload.entry ?? []) for (const change of entry.changes ?? []) {
			const phoneNumberId = change.value?.metadata?.phone_number_id;
			if (!phoneNumberId) continue;
			const { data: cred } = await supabaseAdmin.from("whatsapp_credentials").select("tenant_id").eq("phone_number_id", phoneNumberId).order("last_success_at", {
				ascending: false,
				nullsFirst: false
			}).order("updated_at", { ascending: false }).limit(1).maybeSingle();
			if (!cred) continue;
			const tenantId = cred.tenant_id;
			await supabaseAdmin.from("whatsapp_credentials").update({ last_incoming_webhook_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("tenant_id", tenantId).eq("phone_number_id", phoneNumberId);
			await supabaseAdmin.from("webhook_events").insert({
				tenant_id: tenantId,
				source: "meta",
				event_type: change.field,
				payload: change
			});
			for (const s of change.value.statuses ?? []) {
				const updatePayload = { meta_status: s.status };
				if (s.status === "delivered") updatePayload.delivered_at = (/* @__PURE__ */ new Date()).toISOString();
				else if (s.status === "read") {
					updatePayload.read_at = (/* @__PURE__ */ new Date()).toISOString();
					updatePayload.delivered_at = (/* @__PURE__ */ new Date()).toISOString();
				} else if (s.status === "failed") {
					updatePayload.status = "failed";
					const errObj = s.errors?.[0];
					if (errObj) {
						const details = errObj.message ?? errObj.error_data?.details ?? "Unknown error";
						updatePayload.meta_error = `(${errObj.code}) ${errObj.title}: ${details}`;
					} else updatePayload.meta_error = "Meta delivery failed";
				}
				const { data: recipient } = await supabaseAdmin.from("campaign_recipients").update(updatePayload).eq("meta_message_id", s.id).eq("tenant_id", tenantId).select("id, campaign_id").maybeSingle();
				const msgUpdate = { status: s.status };
				if (s.status === "sent") msgUpdate.sent_at = (/* @__PURE__ */ new Date()).toISOString();
				if (s.status === "delivered") msgUpdate.delivered_at = (/* @__PURE__ */ new Date()).toISOString();
				if (s.status === "read") {
					msgUpdate.read_at = (/* @__PURE__ */ new Date()).toISOString();
					msgUpdate.delivered_at = (/* @__PURE__ */ new Date()).toISOString();
				}
				await supabaseAdmin.from("messages").update(msgUpdate).eq("meta_message_id", s.id).eq("tenant_id", tenantId);
				if (s.status === "failed" && recipient) {
					const errObj = s.errors?.[0];
					const errMsg = errObj ? `(${errObj.code}) ${errObj.title}: ${errObj.message ?? "Unknown details"}` : "Webhook reported delivery failure";
					await supabaseAdmin.from("campaign_logs").insert({
						tenant_id: tenantId,
						campaign_id: recipient.campaign_id,
						recipient_id: recipient.id,
						log_type: "delivery_fail",
						response_payload: s,
						error_message: errMsg
					});
				}
				if (recipient && s.status === "failed") await supabaseAdmin.rpc("increment_campaign_counters", {
					_campaign_id: recipient.campaign_id,
					_processed: 0,
					_failed: 1
				});
			}
			for (const m of change.value.messages ?? []) {
				const from = m.from.replace(/\D/g, "");
				const msgBody = m.text?.body ?? `[${m.type}]`;
				const now = (/* @__PURE__ */ new Date()).toISOString();
				const { data: contact } = await supabaseAdmin.from("contacts").select("id, name").eq("tenant_id", tenantId).eq("phone_number_normalized", from).is("deleted_at", null).maybeSingle();
				let contactId = contact?.id;
				if (!contactId) {
					const { data: ins } = await supabaseAdmin.from("contacts").insert({
						tenant_id: tenantId,
						name: from,
						phone_number_raw: from,
						phone_number_normalized: from,
						opt_in_source: "inbound",
						opt_in_date: now
					}).select("id").single();
					contactId = ins?.id;
				}
				if (!contactId) continue;
				let { data: existingConv } = await supabaseAdmin.from("conversations").select("id, unread_count, contact_id").eq("tenant_id", tenantId).eq("contact_id", contactId).order("created_at", { ascending: false }).limit(1).maybeSingle();
				if (!existingConv && from) {
					const { data: convByPhone } = await supabaseAdmin.from("conversations").select("id, unread_count, contact_id").eq("tenant_id", tenantId).eq("phone_number", from).order("created_at", { ascending: false }).limit(1).maybeSingle();
					existingConv = convByPhone;
				}
				let convId;
				if (existingConv) {
					convId = existingConv.id;
					await supabaseAdmin.from("conversations").update({
						contact_id: contactId || existingConv.contact_id,
						last_message: msgBody,
						last_message_at: now,
						last_inbound_at: now,
						unread_count: (existingConv.unread_count ?? 0) + 1,
						phone_number: from,
						status: "open",
						updated_at: now
					}).eq("id", convId);
				} else {
					const { data: newConv } = await supabaseAdmin.from("conversations").upsert({
						tenant_id: tenantId,
						contact_id: contactId,
						phone_number: from,
						last_message: msgBody,
						last_message_at: now,
						last_inbound_at: now,
						unread_count: 1,
						status: "open",
						updated_at: now
					}, { onConflict: "tenant_id,contact_id" }).select("id").single();
					if (!newConv) continue;
					convId = newConv.id;
				}
				await supabaseAdmin.from("messages").insert({
					tenant_id: tenantId,
					conversation_id: convId,
					contact_id: contactId,
					direction: "in",
					type: m.type,
					body: msgBody,
					meta_message_id: m.id,
					status: "received",
					payload: m
				});
			}
		}
		return new Response("ok");
	}
} } });
var AuthRoute = Route$16.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$17
});
var AuthenticatedRouteRoute = Route$15.update({
	id: "/_authenticated",
	getParentRoute: () => Route$17
});
var IndexRoute = Route$14.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$17
});
var AuthenticatedTemplatesRoute = Route$13.update({
	id: "/templates",
	path: "/templates",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSuperAdminRoute = Route$21.update({
	id: "/super-admin",
	path: "/super-admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$20.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReportsRoute = Route$12.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedOrganizationRoute = Route$11.update({
	id: "/organization",
	path: "/organization",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHelpRoute = Route$10.update({
	id: "/help",
	path: "/help",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$19.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedConversationsRoute = Route$9.update({
	id: "/conversations",
	path: "/conversations",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedContactsRoute = Route$8.update({
	id: "/contacts",
	path: "/contacts",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCampaignsRoute = Route$7.update({
	id: "/campaigns",
	path: "/campaigns",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAccountSettingsRoute = Route$18.update({
	id: "/account-settings",
	path: "/account-settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedContactsIndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedContactsRoute
});
var ApiDebugSendTestRoute = Route$5.update({
	id: "/api/debug/send-test",
	path: "/api/debug/send-test",
	getParentRoute: () => Route$17
});
var AuthenticatedContactsTagsRoute = Route$4.update({
	id: "/tags",
	path: "/tags",
	getParentRoute: () => AuthenticatedContactsRoute
});
var AuthenticatedContactsImportRoute = Route$3.update({
	id: "/import",
	path: "/import",
	getParentRoute: () => AuthenticatedContactsRoute
});
var AuthenticatedContactsBulkRoute = Route$2.update({
	id: "/bulk",
	path: "/bulk",
	getParentRoute: () => AuthenticatedContactsRoute
});
var ApiPublicHooksProcessCampaignsRoute = Route$1.update({
	id: "/api/public/hooks/process-campaigns",
	path: "/api/public/hooks/process-campaigns",
	getParentRoute: () => Route$17
});
var ApiPublicHooksMetaWhatsappRoute = Route.update({
	id: "/api/public/hooks/meta-whatsapp",
	path: "/api/public/hooks/meta-whatsapp",
	getParentRoute: () => Route$17
});
var AuthenticatedContactsRouteChildren = {
	AuthenticatedContactsBulkRoute,
	AuthenticatedContactsImportRoute,
	AuthenticatedContactsTagsRoute,
	AuthenticatedContactsIndexRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAccountSettingsRoute,
	AuthenticatedCampaignsRoute,
	AuthenticatedContactsRoute: AuthenticatedContactsRoute._addFileChildren(AuthenticatedContactsRouteChildren),
	AuthenticatedConversationsRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedHelpRoute,
	AuthenticatedOrganizationRoute,
	AuthenticatedReportsRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedSuperAdminRoute,
	AuthenticatedTemplatesRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	ApiDebugSendTestRoute,
	ApiPublicHooksMetaWhatsappRoute,
	ApiPublicHooksProcessCampaignsRoute
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
