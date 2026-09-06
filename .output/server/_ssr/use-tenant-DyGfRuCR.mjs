import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
import { n as useAuth } from "./use-auth-BLya4MAJ.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-tenant-DyGfRuCR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var STORAGE_KEY = "wa-crm.active-tenant";
function useMyTenants() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["my-tenants", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_members").select("tenant_id, role, tenants:tenant_id(id, name, slug, suspended, branding_level, custom_domain)").eq("user_id", user.id).order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useActiveTenant() {
	const { data: tenants, isLoading } = useMyTenants();
	const [activeId, setActiveId] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(STORAGE_KEY);
	});
	(0, import_react.useEffect)(() => {
		if (!tenants?.length) return;
		if (!activeId || !tenants.find((t) => t.tenant_id === activeId)) {
			const first = tenants[0].tenant_id;
			setActiveId(first);
			localStorage.setItem(STORAGE_KEY, first);
		}
	}, [tenants, activeId]);
	const membership = tenants?.find((t) => t.tenant_id === activeId) ?? null;
	return {
		tenants: tenants ?? [],
		activeId,
		membership,
		isLoading,
		switchTenant: (id) => {
			setActiveId(id);
			localStorage.setItem(STORAGE_KEY, id);
		}
	};
}
function canManage(role, level) {
	if (!role) return false;
	const order = {
		owner: 4,
		admin: 3,
		manager: 2,
		agent: 1
	};
	return order[role] >= order[level];
}
//#endregion
export { useActiveTenant as n, useMyTenants as r, canManage as t };
