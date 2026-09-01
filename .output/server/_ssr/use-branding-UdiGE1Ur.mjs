import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-Cx80Vihe.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useActiveTenant } from "./use-tenant-B3bhUKig.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-branding-UdiGE1Ur.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useBranding() {
	const { activeId, membership } = useActiveTenant();
	const lastAppliedNameRef = (0, import_react.useRef)("CONVEXA");
	const { data: branding, isLoading } = useQuery({
		queryKey: ["global-branding", activeId],
		enabled: !!activeId,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_branding").select("*").eq("tenant_id", activeId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const brandingLevel = branding?.branding_level ?? "default";
	const isWhiteLabelEnabled = brandingLevel === "white_label" || brandingLevel === "full_white_label";
	(0, import_react.useEffect)(() => {
		if (isWhiteLabelEnabled && branding) {
			if (branding.primary_color) {
				document.documentElement.style.setProperty("--primary", branding.primary_color);
				document.documentElement.style.setProperty("--ring", branding.primary_color);
				document.documentElement.style.setProperty("--sidebar-primary", branding.primary_color);
				if (branding.primary_color.startsWith("#")) {
					document.documentElement.style.setProperty("--primary-soft", `${branding.primary_color}15`);
					document.documentElement.style.setProperty("--accent", `${branding.primary_color}15`);
					document.documentElement.style.setProperty("--sidebar-accent", `${branding.primary_color}15`);
				}
			} else resetBrandingStyles();
			if (branding.secondary_color) document.documentElement.style.setProperty("--secondary", branding.secondary_color);
			else document.documentElement.style.removeProperty("--secondary");
			if (branding.favicon) {
				let link = document.querySelector("link[rel~='icon']");
				if (!link) {
					link = document.createElement("link");
					link.rel = "icon";
					document.getElementsByTagName("head")[0].appendChild(link);
				}
				link.href = branding.favicon;
			} else resetFavicon();
		} else {
			resetBrandingStyles();
			resetFavicon();
		}
	}, [branding, isWhiteLabelEnabled]);
	(0, import_react.useEffect)(() => {
		const targetName = isWhiteLabelEnabled && branding?.company_name ? branding.company_name : "CONVEXA";
		const lastName = lastAppliedNameRef.current;
		const updateTitle = () => {
			const currentTitle = document.title;
			let newTitle = currentTitle;
			if (lastName !== targetName && currentTitle.includes(lastName)) newTitle = currentTitle.replace(new RegExp(lastName, "g"), targetName);
			else if (currentTitle.includes("CONVEXA")) newTitle = currentTitle.replace(/CONVEXA/g, targetName);
			if (newTitle !== currentTitle) document.title = newTitle;
			lastAppliedNameRef.current = targetName;
		};
		updateTitle();
		const titleEl = document.querySelector("head > title");
		if (!titleEl) return;
		const observer = new MutationObserver(() => {
			const currentTitle = document.title;
			const currentTarget = lastAppliedNameRef.current;
			if (currentTitle.includes("CONVEXA")) {
				const newTitle = currentTitle.replace(/CONVEXA/g, currentTarget);
				if (newTitle !== currentTitle) document.title = newTitle;
			} else if (lastName !== currentTarget && currentTitle.includes(lastName)) {
				const newTitle = currentTitle.replace(new RegExp(lastName, "g"), currentTarget);
				if (newTitle !== currentTitle) document.title = newTitle;
			}
		});
		observer.observe(titleEl, {
			childList: true,
			characterData: true,
			subtree: true
		});
		return () => {
			observer.disconnect();
		};
	}, [branding?.company_name, isWhiteLabelEnabled]);
	return {
		branding: isWhiteLabelEnabled ? branding : null,
		brandingLevel,
		tenantName: membership?.tenants?.name ?? null,
		isLoading
	};
}
function resetBrandingStyles() {
	document.documentElement.style.removeProperty("--primary");
	document.documentElement.style.removeProperty("--ring");
	document.documentElement.style.removeProperty("--sidebar-primary");
	document.documentElement.style.removeProperty("--primary-soft");
	document.documentElement.style.removeProperty("--accent");
	document.documentElement.style.removeProperty("--sidebar-accent");
	document.documentElement.style.removeProperty("--secondary");
}
function resetFavicon() {
	const link = document.querySelector("link[rel~='icon']");
	if (link) link.href = "/favicon.ico?v=convexa";
}
//#endregion
export { useBranding as t };
