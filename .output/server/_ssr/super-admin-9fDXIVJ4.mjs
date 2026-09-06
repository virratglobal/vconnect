import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBYtZ6z0.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin-9fDXIVJ4.js
var superAdminGetUsers_createServerFn_handler = createServerRpc({
	id: "52c0b988083b7c6e12ef841728698d151f34246c99e3ce72d1390286ba571a5c",
	name: "superAdminGetUsers",
	filename: "src/routes/_authenticated/super-admin.tsx"
}, (opts) => superAdminGetUsers.__executeServer(opts));
var superAdminGetUsers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(superAdminGetUsers_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	await supabaseAdmin.from("profiles").update({ is_super_admin: false }).neq("email", "mail@virratglobal.com");
	await supabaseAdmin.from("profiles").update({ is_super_admin: true }).eq("email", "mail@virratglobal.com");
	const { data: profile } = await supabaseAdmin.from("profiles").select("is_super_admin").eq("id", userId).single();
	if (!profile?.is_super_admin) throw new Error("Access Denied: You do not have permission to view all users");
	const { data: profiles, error: pErr } = await supabaseAdmin.from("profiles").select(`
        id,
        full_name,
        email,
        avatar_url,
        created_at,
        is_super_admin,
        tenant_members!tenant_members_user_id_profiles_fkey(
          role,
          tenants(name)
        )
      `).order("created_at", { ascending: false });
	if (pErr) throw pErr;
	return profiles ?? [];
});
var superAdminDeleteUser_createServerFn_handler = createServerRpc({
	id: "f485651a715e735897b2eb4c2006ce690023b9207b587c922565ec6a3d7f187d",
	name: "superAdminDeleteUser",
	filename: "src/routes/_authenticated/super-admin.tsx"
}, (opts) => superAdminDeleteUser.__executeServer(opts));
var superAdminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(superAdminDeleteUser_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { targetUserId } = data;
	const { supabaseAdmin } = await import("./client.server-Ck2b02Cx.mjs").then((n) => n.t).then((n) => n.t);
	const { data: profile } = await supabaseAdmin.from("profiles").select("is_super_admin").eq("id", userId).single();
	if (!profile?.is_super_admin) throw new Error("Access Denied: You do not have permission to delete users");
	if (userId === targetUserId) throw new Error("You cannot delete your own super admin account from here.");
	await supabaseAdmin.from("tenant_members").delete().eq("user_id", targetUserId);
	const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
	if (error) {
		console.error("Supabase Admin deleteUser error:", error);
		throw new Error(`Database error preventing deletion: ${error.message || JSON.stringify(error)}`);
	}
	await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);
	return { success: true };
});
//#endregion
export { superAdminDeleteUser_createServerFn_handler, superAdminGetUsers_createServerFn_handler };
