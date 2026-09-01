import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Power,
  PowerOff,
  UserCheck,
  AlertTriangle,
  Building,
  Users,
  Send,
  MessageSquare,
  Activity,
} from "lucide-react";

export const superAdminGetUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Database self-healing: Ensure only mail@virratglobal.com is super admin
    await supabaseAdmin
      .from("profiles")
      .update({ is_super_admin: false })
      .neq("email", "mail@virratglobal.com");

    await supabaseAdmin
      .from("profiles")
      .update({ is_super_admin: true })
      .eq("email", "mail@virratglobal.com");

    // Verify caller is super admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_super_admin")
      .eq("id", userId)
      .single();
    if (!profile?.is_super_admin) {
      throw new Error("Access Denied: You do not have permission to view all users");
    }

    // Fetch all profiles along with their organization names and roles from tenant_members
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select(`
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
      `)
      .order("created_at", { ascending: false });

    if (pErr) throw pErr;

    return profiles ?? [];
  });

export const superAdminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string }) => d)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { targetUserId } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify caller is super admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_super_admin")
      .eq("id", userId)
      .single();
    if (!profile?.is_super_admin) {
      throw new Error("Access Denied: You do not have permission to delete users");
    }

    if (userId === targetUserId) {
      throw new Error("You cannot delete your own super admin account from here.");
    }

    // 1. Manually remove them from all organizations to prevent FK issues on tenant_members
    await supabaseAdmin.from("tenant_members").delete().eq("user_id", targetUserId);

    // 2. Delete user via admin client
    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    
    if (error) {
      console.error("Supabase Admin deleteUser error:", error);
      throw new Error(`Database error preventing deletion: ${error.message || JSON.stringify(error)}`);
    }

    // 3. Just to be absolutely sure, delete their profile if it wasn't cascaded
    await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);

    return { success: true };
  });

export const Route = createFileRoute("/_authenticated/super-admin")({
  component: SuperAdminDashboard,
});

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  suspended: boolean;
  created_at: string;
  member_count: string;
  contact_count: string;
  campaign_count: string;
};

type SystemErrorRow = {
  id: string;
  tenant_name: string | null;
  type: string;
  error: string;
  context: Record<string, any> | null;
  created_at: string;
};

type AnalyticsData = {
  total_tenants: number;
  active_tenants: number;
  total_contacts: number;
  total_campaigns: number;
  total_messages_sent: number;
};

function SuperAdminDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("tenants");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // 1. Authorize: Check if super admin
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  // 2. Fetch Analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["super-admin-analytics"],
    enabled: !!profile?.is_super_admin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("super_admin_get_analytics");
      if (error) throw error;
      return data as unknown as AnalyticsData;
    },
  });

  // 3. Fetch Tenants
  const {
    data: tenants,
    isLoading: tenantsLoading,
    refetch: refetchTenants,
  } = useQuery<TenantRow[]>({
    queryKey: ["super-admin-tenants"],
    enabled: !!profile?.is_super_admin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("super_admin_get_tenants");
      if (error) throw error;
      return (data ?? []) as unknown as TenantRow[];
    },
  });

  // 4. Fetch System Errors
  const {
    data: errors,
    isLoading: errorsLoading,
    refetch: refetchErrors,
  } = useQuery<SystemErrorRow[]>({
    queryKey: ["super-admin-errors"],
    enabled: !!profile?.is_super_admin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("super_admin_get_system_errors");
      if (error) throw error;
      return (data ?? []) as unknown as SystemErrorRow[];
    },
  });

  const getUsersFn = useServerFn(superAdminGetUsers);
  const deleteUserFn = useServerFn(superAdminDeleteUser);

  // 5. Fetch Users
  const {
    data: allUsers,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["super-admin-users"],
    enabled: !!profile?.is_super_admin,
    queryFn: async () => {
      const data = await getUsersFn();
      return data as any[];
    },
  });

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  async function handleDeleteUser(targetUserId: string, targetUserEmail: string) {
    if (!confirm(`Are you absolutely sure you want to permanently delete the user account "${targetUserEmail}"? This will log them out, delete their profile, and remove them from all organizations. This action is permanent and cannot be undone.`)) {
      return;
    }
    setDeletingUserId(targetUserId);
    try {
      await deleteUserFn({ data: { targetUserId } });
      toast.success("User account deleted successfully");
      refetchUsers();
      qc.invalidateQueries({ queryKey: ["super-admin-tenants"] });
      qc.invalidateQueries({ queryKey: ["super-admin-analytics"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user account");
    } finally {
      setDeletingUserId(null);
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-sm text-muted-foreground">
        Loading Super Admin Platform…
      </div>
    );
  }

  // Gate Check
  if (!profile?.is_super_admin) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <div className="size-12 rounded-xl bg-destructive/10 text-destructive grid place-items-center mx-auto">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You do not have platform Super Admin permissions.
          </p>
        </div>
      </div>
    );
  }

  // Toggle Tenant Suspension
  async function toggleTenantSuspension(tenantId: string, currentlySuspended: boolean) {
    setTogglingId(tenantId);
    try {
      const targetStatus = !currentlySuspended;
      const { error } = await supabase.rpc("super_admin_toggle_tenant_status", {
        _tenant_id: tenantId,
        _suspended: targetStatus,
      });
      if (error) throw error;
      toast.success(
        targetStatus ? "Tenant suspended successfully" : "Tenant activated successfully",
      );
      qc.invalidateQueries({ queryKey: ["super-admin-tenants"] });
      qc.invalidateQueries({ queryKey: ["super-admin-analytics"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change tenant status");
    } finally {
      setTogglingId(null);
    }
  }

  // Start Tenant Impersonation
  async function handleLoginAs(tenantId: string) {
    setImpersonatingId(tenantId);
    try {
      const { error } = await supabase.rpc("start_impersonating_tenant", { _tenant_id: tenantId });
      if (error) throw error;

      // Save impersonator state
      localStorage.setItem("wa-crm.impersonator", "true");
      localStorage.setItem("wa-crm.active-tenant", tenantId);

      // Invalidate queries to reload namespaces
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });

      toast.success("Impersonation started. Redirecting…");

      // Force redirect to reload application context
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impersonation failed");
      setImpersonatingId(null);
    }
  }

  // Search/Filter logic for tenants
  const filteredTenants = (tenants ?? []).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "active") return matchesSearch && !t.suspended;
    if (statusFilter === "suspended") return matchesSearch && t.suspended;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Super Admin Platform</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor workspaces, query analytics, manage suspension status, and impersonate accounts.
        </p>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Tenants"
          value={analytics?.total_tenants}
          loading={analyticsLoading}
          icon={Building}
        />
        <KpiCard
          title="Active Tenants"
          value={analytics?.active_tenants}
          loading={analyticsLoading}
          icon={Activity}
        />
        <KpiCard
          title="Total Contacts"
          value={analytics?.total_contacts}
          loading={analyticsLoading}
          icon={Users}
        />
        <KpiCard
          title="Total Campaigns"
          value={analytics?.total_campaigns}
          loading={analyticsLoading}
          icon={Send}
        />
        <KpiCard
          title="Messages Sent"
          value={analytics?.total_messages_sent}
          loading={analyticsLoading}
          icon={MessageSquare}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="tenants">Tenant Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tenants List */}
        <TabsContent value="tenants" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or slug"
                  className="pl-9 bg-background"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetchTenants()}
                  aria-label="Refresh tenants"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>

            {tenantsLoading ? (
              <p className="text-sm text-muted-foreground p-6 text-center">Loading tenants…</p>
            ) : !filteredTenants.length ? (
              <p className="text-sm text-muted-foreground p-12 text-center">No tenants found</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Workspace Name</th>
                      <th className="text-left px-4 py-3 font-medium">Slug</th>
                      <th className="text-left px-4 py-3 font-medium">Contacts</th>
                      <th className="text-left px-4 py-3 font-medium">Campaigns</th>
                      <th className="text-left px-4 py-3 font-medium">Members</th>
                      <th className="text-left px-4 py-3 font-medium">Created</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 w-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.slug}</td>
                        <td className="px-4 py-3">{t.contact_count}</td>
                        <td className="px-4 py-3">{t.campaign_count}</td>
                        <td className="px-4 py-3">{t.member_count}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              t.suspended
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary-soft text-primary"
                            }`}
                          >
                            {t.suspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              disabled={impersonatingId === t.id}
                              onClick={() => handleLoginAs(t.id)}
                            >
                              <UserCheck className="size-3.5 mr-1" />
                              {impersonatingId === t.id ? "Entering…" : "Login"}
                            </Button>
                            <Button
                              variant={t.suspended ? "outline" : "destructive"}
                              size="sm"
                              className="text-xs"
                              disabled={togglingId === t.id}
                              onClick={() => toggleTenantSuspension(t.id, t.suspended)}
                            >
                              {t.suspended ? (
                                <>
                                  <Power className="size-3.5 mr-1 text-primary" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <PowerOff className="size-3.5 mr-1" />
                                  Suspend
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 2: User Management */}
        <TabsContent value="users" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name or email"
                  className="pl-9 bg-background"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetchUsers()}
                  aria-label="Refresh users"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>

            {usersLoading ? (
              <p className="text-sm text-muted-foreground p-6 text-center">Loading users…</p>
            ) : !allUsers || !allUsers.length ? (
              <p className="text-sm text-muted-foreground p-12 text-center">No users found</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">User Details</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Joined Date</th>
                      <th className="text-left px-4 py-3 font-medium">Organizations & Roles</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 w-10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allUsers
                      .filter((u: any) => {
                        const term = search.toLowerCase().trim();
                        if (!term) return true;
                        return (
                          (u.full_name ?? "").toLowerCase().includes(term) ||
                          (u.email ?? "").toLowerCase().includes(term)
                        );
                      })
                      .map((u: any) => {
                        const isSelf = u.id === user?.id;
                        return (
                          <tr key={u.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="size-full rounded-full object-cover" />
                                  ) : (
                                    (u.full_name?.[0] || u.email?.[0] || "U").toUpperCase()
                                  )}
                                </div>
                                <div className="font-medium truncate">
                                  {u.full_name || "—"}
                                  {isSelf && (
                                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">You</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{u.email}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              {u.tenant_members && u.tenant_members.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-sm">
                                  {u.tenant_members.map((tm: any, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-muted text-[10px] text-foreground font-medium border">
                                      {tm.tenants?.name || "Workspace"} ({tm.role})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No organizations</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {u.is_super_admin ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning-foreground">
                                  Super Admin
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs text-muted-foreground bg-muted">
                                  Standard User
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {!isSelf && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingUserId === u.id}
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className="rounded-lg text-xs"
                                >
                                  {deletingUserId === u.id ? "Deleting…" : "Delete Account"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 3: System Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" /> Recent System Errors
              </h2>
              <Button variant="outline" size="sm" onClick={() => refetchErrors()}>
                <RefreshCw className="size-4 mr-2" /> Refresh
              </Button>
            </div>

            {errorsLoading ? (
              <p className="text-sm text-muted-foreground p-6 text-center">Loading logs…</p>
            ) : !errors?.length ? (
              <p className="text-sm text-muted-foreground p-12 text-center">
                No system errors logged
              </p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium w-40">Timestamp</th>
                      <th className="text-left px-4 py-3 font-medium w-48">Tenant Workspace</th>
                      <th className="text-left px-4 py-3 font-medium w-36">Type</th>
                      <th className="text-left px-4 py-3 font-medium">Error Description</th>
                      <th className="text-left px-4 py-3 font-medium w-48">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {errors.map((err) => (
                      <tr key={err.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                          {new Date(err.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {err.tenant_name || "System Level"}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold uppercase">{err.type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-destructive max-w-sm break-words">
                          {err.error}
                        </td>
                        <td className="px-4 py-3">
                          {err.context ? (
                            <details className="cursor-pointer text-xs">
                              <summary className="text-primary hover:underline">
                                View Metadata
                              </summary>
                              <pre className="mt-1 p-2 rounded bg-muted/60 text-[10px] overflow-auto max-w-xs font-mono max-h-32">
                                {JSON.stringify(err.context, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  title,
  value,
  loading,
  icon: Icon,
}: {
  title: string;
  value?: number;
  loading: boolean;
  icon: any;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{title}</div>
          <div className="text-2xl font-semibold mt-1">
            {loading ? "…" : value !== undefined ? value.toLocaleString() : "0"}
          </div>
        </div>
        <div className="size-9 rounded-lg bg-primary-soft text-primary grid place-items-center">
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  );
}
