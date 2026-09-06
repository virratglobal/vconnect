import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-settings-CJYIkZV9.js
var deleteUserAccount_createServerFn_handler = createServerRpc({
	id: "35592131e0d2acf66b6bb2b63b9f56aae11d40b0999708f5c33803c1b5648373",
	name: "deleteUserAccount",
	filename: "src/routes/_authenticated/account-settings.tsx"
}, (opts) => deleteUserAccount.__executeServer(opts));
var deleteUserAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(deleteUserAccount_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { supabaseAdmin } = await import("./client.server-Bs0W82-x.mjs").then((n) => n.t).then((n) => n.t);
	const { data: ownedMemberships, error: memErr } = await supabaseAdmin.from("tenant_members").select("tenant_id").eq("user_id", userId).eq("role", "owner");
	if (memErr) throw memErr;
	for (const m of ownedMemberships ?? []) {
		const { data: owners } = await supabaseAdmin.from("tenant_members").select("user_id").eq("tenant_id", m.tenant_id).eq("role", "owner");
		if (owners && owners.length === 1) {
			const { data: tenant } = await supabaseAdmin.from("tenants").select("name").eq("id", m.tenant_id).single();
			throw new Error(`Cannot delete account: You are the sole owner of "${tenant?.name || "Workspace"}". Please transfer ownership or delete that organization first.`);
		}
	}
	const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
	if (error) throw error;
	return { success: true };
});
//#endregion
export { deleteUserAccount_createServerFn_handler };
