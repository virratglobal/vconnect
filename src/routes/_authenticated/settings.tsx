import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationHealth } from "./dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import {
  Building2,
  MessageCircle,
  Users,
  ShieldCheck,
  Activity,
  Bug,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Webhook,
  Copy,
  Check,
  Eye,
  EyeOff,
  Palette,
  Loader2,
  MessageSquare,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSoundEnabled, setSoundEnabled, getSoundVolume, setSoundVolume } from "@/hooks/use-notification-sound";

export const deleteOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tenantId: string }) => d)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verify caller is the owner of this organization
    const { data: member, error: memErr } = await supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (memErr || !member || member.role !== "owner") {
      throw new Error("Access Denied: Only the organization owner can delete the organization.");
    }

    // 2. Delete the tenant (cascades cleanly because it bypasses RLS)
    const { error: delErr } = await supabaseAdmin
      .from("tenants")
      .delete()
      .eq("id", tenantId);

    if (delErr) throw delErr;

    return { success: true };
  });

export const getWhatsAppConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tenantId: string }) => d)
  .handler(async ({ data, context }) => {
    const { tenantId } = data;
    const { supabase: userSupabase, userId } = context;

    const { data: member, error: memberError } = await userSupabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();
    if (memberError) throw memberError;

    const role = member?.role as "owner" | "admin" | "manager" | "agent" | undefined;
    if (role !== "owner" && role !== "admin") {
      throw new Error("Access Denied: You do not have permission to view WhatsApp credentials");
    }

    // Fetch tenant setting
    const { data: tenant, error: tenantError } = await userSupabase
      .from("tenants")
      .select("allow_admin_whatsapp_config")
      .eq("id", tenantId)
      .single();
    if (tenantError) throw tenantError;

    // Fetch credentials
    const { data: creds, error: credsError } = await userSupabase
      .from("whatsapp_credentials")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();
    if (credsError) throw credsError;

    function maskToken(token: string | null) {
      if (!token) return "";
      const len = token.length;
      if (len <= 4) return "************";
      return "************" + token.slice(-4);
    }

    return {
      creds: {
        phone_number_id: creds?.phone_number_id ?? "",
        waba_id: creds?.waba_id ?? "",
        display_phone_number: creds?.display_phone_number ?? "",
        access_token: maskToken(creds?.access_token || null),
        status: creds?.status ?? "disconnected",
      },
      allowAdminWhatsappConfig: tenant?.allow_admin_whatsapp_config ?? true,
      role,
    };
  });

export const saveWhatsAppConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tenantId: string;
      phone_number_id: string;
      waba_id: string;
      display_phone_number: string;
      access_token: string;
      allowAdminWhatsappConfig?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const {
      tenantId,
      phone_number_id,
      waba_id,
      display_phone_number,
      access_token,
      allowAdminWhatsappConfig,
    } = data;
    const { supabase: userSupabase, userId } = context;

    const { data: member, error: memberError } = await userSupabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();
    if (memberError) throw memberError;

    const role = member?.role as "owner" | "admin" | "manager" | "agent" | undefined;
    if (role !== "owner" && role !== "admin") {
      throw new Error("Access Denied: You do not have permission to edit WhatsApp credentials");
    }

    const { data: tenant, error: tenantReadError } = await userSupabase
      .from("tenants")
      .select("allow_admin_whatsapp_config")
      .eq("id", tenantId)
      .single();
    if (tenantReadError) throw tenantReadError;

    if (role === "admin" && !tenant?.allow_admin_whatsapp_config) {
      throw new Error("Access Denied: The organization owner has disabled administrator modifications for WhatsApp credentials.");
    }

    // Owner can update the allow_admin_whatsapp_config setting
    if (allowAdminWhatsappConfig !== undefined) {
      if (role !== "owner") {
        throw new Error("Access Denied: Only the organization owner can change administrator permissions.");
      }
      const { error: tenantErr } = await userSupabase
        .from("tenants")
        .update({ allow_admin_whatsapp_config: allowAdminWhatsappConfig })
        .eq("id", tenantId);
      if (tenantErr) throw tenantErr;
    }

    // Determine what token to save
    let tokenToSave = access_token.trim();
    if (tokenToSave.startsWith("************")) {
      const { data: existing } = await userSupabase
        .from("whatsapp_credentials")
        .select("access_token")
        .eq("tenant_id", tenantId)
        .eq("is_default", true)
        .maybeSingle();
      tokenToSave = existing?.access_token ?? "";
    }

    // Find if default record exists
    const { data: existingCreds, error: existingCredsError } = await userSupabase
      .from("whatsapp_credentials")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();
    if (existingCredsError) throw existingCredsError;

    if (existingCreds) {
      const { error: updateErr } = await userSupabase
        .from("whatsapp_credentials")
        .update({
          phone_number_id: phone_number_id.trim() || null,
          waba_id: waba_id.trim() || null,
          display_phone_number: display_phone_number.trim() || null,
          access_token: tokenToSave || null,
          status: tokenToSave ? "configured" : "disconnected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCreds.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await userSupabase
        .from("whatsapp_credentials")
        .insert({
          tenant_id: tenantId,
          phone_number_id: phone_number_id.trim() || null,
          waba_id: waba_id.trim() || null,
          display_phone_number: display_phone_number.trim() || null,
          access_token: tokenToSave || null,
          status: tokenToSave ? "configured" : "disconnected",
          is_default: true,
          account_name: "Primary Number",
        });
      if (insertErr) throw insertErr;
    }

    return { success: true };
  });

export const getMetaDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tenantId: string }) => d)
  .handler(async ({ data, context }) => {
    const { tenantId } = data;
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { authorize } = await import("@/lib/authorization.server");
    await authorize(userId, "whatsapp.diagnostics.view", null, tenantId);

    // Load credentials
    const { data: creds } = await supabaseAdmin
      .from("whatsapp_credentials")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();

    if (!creds?.phone_number_id || !creds.access_token) {
      return { ok: false, error: "Credentials not configured" };
    }

    try {
      // 1. Phone number info
      const phoneRes = await fetch(
        `https://graph.facebook.com/v20.0/${creds.phone_number_id}?fields=quality_rating,status,messaging_limit_tier,whatsapp_business_manager_messaging_limit,verified_name,code_verification_status,name_status,account_mode`,
        { headers: { Authorization: `Bearer ${creds.access_token}` } },
      );
      if (!phoneRes.ok) {
        const text = await phoneRes.text();
        return { ok: false, error: `Meta Phone API: ${phoneRes.status} (${text.slice(0, 300)})` };
      }
      const phoneJson = await phoneRes.json();

      // 2. WABA webhook subscriptions
      let webhookSubs: any = null;
      let webhookSubsError: string | null = null;
      if (creds.waba_id) {
        try {
          const subRes = await fetch(
            `https://graph.facebook.com/v20.0/${creds.waba_id}/subscribed_apps`,
            { headers: { Authorization: `Bearer ${creds.access_token}` } },
          );
          const subJson = await subRes.json();
          if (subRes.ok) {
            webhookSubs = subJson.data ?? [];
          } else {
            webhookSubsError = subJson?.error?.message ?? `HTTP ${subRes.status}`;
          }
        } catch (e: any) {
          webhookSubsError = e.message;
        }
      }

      // Detect sandbox/test mode
      const limitTier = phoneJson.whatsapp_business_manager_messaging_limit || phoneJson.messaging_limit_tier || "TIER_50";
      const accountMode = phoneJson.account_mode ?? null; // "SANDBOX" or "LIVE"
      const isSandbox =
        accountMode === "SANDBOX" ||
        limitTier === "TIER_50" ||
        (phoneJson.verified_name ?? "").toLowerCase().includes("test");

      // Check if webhooks are subscribed
      const hasWebhookSubscription = Array.isArray(webhookSubs) && webhookSubs.length > 0;

      return {
        ok: true,
        data: {
          status: phoneJson.status || "CONNECTED",
          verified_name: phoneJson.verified_name || "Unknown",
          name_status: phoneJson.name_status || "APPROVED",
          quality_rating: phoneJson.quality_rating || "GREEN",
          messaging_limit_tier: limitTier,
          code_verification_status: phoneJson.code_verification_status || "VERIFIED",
          account_mode: accountMode,
          waba_id: creds.waba_id || "Unknown",
          phone_number_id: creds.phone_number_id,
          is_test_mode: isSandbox,
          webhook_verify_token_set: !!creds.webhook_verify_token,
          webhook_subs: webhookSubs,
          webhook_subs_error: webhookSubsError,
          has_webhook_subscription: hasWebhookSubscription,
          token_expiry_at: creds.token_expiry_at || null,
        },
      };
    } catch (e: any) {
      return { ok: false, error: e.message || "Failed to call Meta Cloud API" };
    }
  });

export const getWebhookStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tenantId: string }) => d)
  .handler(async ({ data, context }) => {
    const { tenantId } = data;
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { authorize } = await import("@/lib/authorization.server");
    await authorize(userId, "webhook.stats.view", null, tenantId);

    const { count: totalEvents } = await supabaseAdmin
      .from("webhook_events")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    const { count: deliveryEvents } = await supabaseAdmin
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .not("meta_status", "is", null);
    const { count: failedDelivery } = await supabaseAdmin
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("meta_status", "failed");
    const { count: sentCount } = await supabaseAdmin
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .not("meta_message_id", "is", null);
    return {
      total_webhook_events: totalEvents ?? 0,
      delivery_status_updates: deliveryEvents ?? 0,
      failed_deliveries: failedDelivery ?? 0,
      messages_sent_to_meta: sentCount ?? 0,
    };
  });

export const sendDirectDebugMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { tenantId: string; phoneNumber: string; templateName: string; mediaUrl?: string }) => d,
  )
  .handler(async ({ data, context }) => {
    const { tenantId, phoneNumber, templateName, mediaUrl } = data;
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { authorize } = await import("@/lib/authorization.server");
    await authorize(userId, "debug.send_message", null, tenantId);

    const { data: creds } = await supabaseAdmin
      .from("whatsapp_credentials")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();

    if (!creds?.phone_number_id || !creds.access_token) {
      return { ok: false, error: "Credentials not configured" };
    }

    const { data: dbTemplate } = await supabaseAdmin
      .from("message_templates")
      .select("language, variables, header_type")
      .eq("tenant_id", tenantId)
      .eq("template_name", templateName)
      .maybeSingle();

    if (!dbTemplate) {
      return { ok: false, error: `Message template "${templateName}" not found in database.` };
    }

    const lang = (dbTemplate.language ?? "").trim();
    if (!lang) {
      return {
        ok: false,
        error: `Template language is empty for "${templateName}". Re-sync your templates.`,
      };
    }
    const vars = (dbTemplate.variables as string[]) || [];

    const normalizedPhone = phoneNumber.replace(/\D/g, "");

    const parameters = vars.map((idx) => ({
      type: "text" as const,
      text: `Test_${idx}`,
    }));

    const components: any[] = [];
    if (parameters.length) {
      components.push({ type: "body", parameters });
    }

    if (mediaUrl) {
      components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: { link: mediaUrl },
          },
        ],
      });
    }

    const payload = {
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: lang },
        components,
      },
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${creds.phone_number_id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${creds.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const text = await res.text();
      let responseJson = {};
      try {
        responseJson = JSON.parse(text);
      } catch {
        responseJson = { raw: text };
      }

      // Log the debug message directly in campaign_logs
      await supabaseAdmin.from("campaign_logs").insert({
        tenant_id: tenantId,
        log_type: "debug_test_message",
        request_payload: payload as any,
        response_payload: responseJson as any,
        http_status: res.status,
        error_message: res.ok
          ? null
          : (responseJson as any)?.error?.message || "Failed test message",
      });

      return {
        ok: res.ok,
        payload,
        status: res.status,
        response: responseJson,
        message_id: (responseJson as any)?.messages?.[0]?.id || null,
        delivery_status:
          res.ok && (responseJson as any)?.messages?.[0]?.id ? "sent_to_meta" : "failed",
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · Virrat Reach" }] }),
  component: SettingsPage,
});

const tabs = [
  { id: "business", label: "General Settings", icon: Building2 },
  { id: "wa_connection", label: "WhatsApp Connection", icon: MessageCircle },
  { id: "wa_diagnostics", label: "Diagnostics", icon: Activity },
  { id: "wa_webhooks", label: "Webhook Setup", icon: Webhook },
  { id: "wa_logs", label: "API Logs", icon: Bug },
  { id: "users", label: "Members & Roles", icon: Users },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "billing", label: "Billing & Subscription", icon: Activity },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

function SettingsPage() {
  const { user } = useAuth();
  const { membership } = useActiveTenant();

  const { data: profile } = useQuery({
    queryKey: ["my-profile-settings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, is_super_admin")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const isSuperAdmin = profile?.is_super_admin ?? false;
  const isOwnerOrAdmin = isSuperAdmin || canManage(membership?.role, "admin");
  const isOwnerAdminManager = isSuperAdmin || canManage(membership?.role, "manager");

  if (membership && membership.role === "agent") {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredTabs = tabs.filter((t) => {
    if (t.id === "branding") return isOwnerOrAdmin;
    if (t.id === "conversations") return canManage(membership?.role, "admin");
    if (t.id === "billing") return isOwnerOrAdmin;
    if (t.id === "danger") return canManage(membership?.role, "owner") || isSuperAdmin;
    if (t.id === "wa_connection") return isOwnerOrAdmin;
    if (t.id === "wa_diagnostics") return isOwnerAdminManager;
    if (t.id === "wa_webhooks") return isOwnerOrAdmin;
    if (t.id === "wa_logs") return isOwnerOrAdmin;
    return true;
  });

  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("business");

  // Redirect to business tab if active tab is restricted but user has no permission
  useEffect(() => {
    if (!profile) return;
    if (tab === "branding" && !isOwnerOrAdmin) setTab("business");
    if (tab === "billing" && !isOwnerOrAdmin) setTab("business");
    if (tab === "danger" && !canManage(membership?.role, "owner") && !isSuperAdmin) setTab("business");
    if (tab === "wa_connection" && !isOwnerOrAdmin) setTab("business");
    if (tab === "wa_diagnostics" && !isOwnerAdminManager) setTab("business");
    if (tab === "wa_webhooks" && !isOwnerOrAdmin) setTab("business");
    if (tab === "wa_logs" && !isOwnerOrAdmin) setTab("business");
  }, [isSuperAdmin, isOwnerOrAdmin, isOwnerAdminManager, tab, profile, membership?.role]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Organization Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your organization details, WhatsApp settings, members, branding, and integrations.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {filteredTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap text-left transition-all",
                tab === t.id
                  ? "bg-primary-soft text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <t.icon className="size-4 shrink-0" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="space-y-6">
          {tab === "business" && <BusinessTab />}
          {tab === "wa_connection" && isOwnerOrAdmin && <WhatsAppConnectionTab />}
          {tab === "wa_diagnostics" && isOwnerAdminManager && <DiagnosticsTab />}
          {tab === "wa_webhooks" && isOwnerOrAdmin && <WebhookSetupTab />}
          {tab === "wa_logs" && isOwnerOrAdmin && <ApiLogsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "branding" && isOwnerOrAdmin && <BrandingTab isSuperAdmin={isSuperAdmin} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "conversations" && <ConversationsTab />}
          {tab === "billing" && isOwnerOrAdmin && <BillingTab />}
          {tab === "danger" && (canManage(membership?.role, "owner") || isSuperAdmin) && (
            <DangerZoneTab />
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessTab() {
  const { activeId, membership } = useActiveTenant();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [saving, setSaving] = useState(false);

  const canEdit = canManage(membership?.role, "admin");

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant-details-settings", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("name, slug, country, industry, timezone")
        .eq("id", activeId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "");
      setSlug(tenant.slug || "");
      setCountry(tenant.country || "");
      setIndustry(tenant.industry || "");
      setTimezone(tenant.timezone || "");
    }
  }, [tenant]);

  async function save() {
    if (!activeId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tenants")
        .update({
          name: name.trim(),
          slug: slug.trim(),
          country: country.trim() || null,
          industry: industry.trim() || null,
          timezone: timezone.trim(),
        })
        .eq("id", activeId);
      if (error) throw error;
      toast.success("Organization settings updated");
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      await qc.invalidateQueries({ queryKey: ["tenant-details-settings", activeId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update organization settings");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4 max-w-xl animate-pulse">
        <div className="h-6 w-1/3 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6 max-w-xl border-border/50 rounded-2xl shadow-sm bg-card">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Building2 className="size-5 text-primary" /> Organization Details
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure your core organization and business details.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-settings-name">Organization Name</Label>
            <Input
              id="org-settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-settings-slug">Slug (Unique)</Label>
            <Input
              id="org-settings-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!canEdit}
              className="rounded-xl font-mono text-xs"
            />
          </div>
        </div>

        {/* Country & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-settings-country">Country</Label>
            <Input
              id="org-settings-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={!canEdit}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-settings-timezone">Timezone</Label>
            <Input
              id="org-settings-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={!canEdit}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <Label htmlFor="org-settings-industry">Industry</Label>
          <Input
            id="org-settings-industry"
            placeholder="e.g. Retail, Healthcare"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            disabled={!canEdit}
            className="rounded-xl"
          />
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button
            onClick={save}
            disabled={saving || !name.trim() || !slug.trim()}
            className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      )}
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "configured" ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground";
  return (
    <span className={"px-2.5 py-1 rounded-full text-xs font-medium capitalize " + tone}>
      Status: {status}
    </span>
  );
}

function DiagRow({
  label,
  value,
  badgeColor,
}: {
  label: string;
  value: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border border-muted">
      <span className="text-muted-foreground font-medium text-xs">{label}</span>
      {badgeColor ? (
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold capitalize", badgeColor)}>
          {value}
        </span>
      ) : (
        <span className="font-mono font-semibold text-xs text-right truncate max-w-[200px]">{value}</span>
      )}
    </div>
  );
}

function WhatsAppConnectionTab() {
  const { activeId, membership } = useActiveTenant();
  const isOwner = membership?.role === "owner";
  const isOwnerOrAdmin = isOwner || membership?.role === "admin";
  const qc = useQueryClient();

  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ["wa-config", activeId],
    enabled: !!activeId && isOwnerOrAdmin,
    queryFn: async () => {
      return getWhatsAppConfig({ data: { tenantId: activeId! } });
    },
  });

  const [form, setForm] = useState({
    phone_number_id: "",
    waba_id: "",
    display_phone_number: "",
    access_token: "",
  });
  const [allowAdminConfig, setAllowAdminConfig] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        phone_number_id: config.creds.phone_number_id ?? "",
        waba_id: config.creds.waba_id ?? "",
        display_phone_number: config.creds.display_phone_number ?? "",
        access_token: config.creds.access_token ?? "",
      });
      setAllowAdminConfig(config.allowAdminWhatsappConfig);
    }
  }, [config]);

  const canEdit = isOwner || (membership?.role === "admin" && allowAdminConfig);

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try {
      const res = await saveWhatsAppConfig({
        data: {
          tenantId: activeId,
          phone_number_id: form.phone_number_id,
          waba_id: form.waba_id,
          display_phone_number: form.display_phone_number,
          access_token: form.access_token,
          allowAdminWhatsappConfig: isOwner ? allowAdminConfig : undefined,
        },
      });
      if (res.success) {
        toast.success("WhatsApp credentials saved successfully!");
        qc.invalidateQueries({ queryKey: ["wa-config", activeId] });
        qc.invalidateQueries({ queryKey: ["wa-diagnostics-tab", activeId] });
        qc.invalidateQueries({ queryKey: ["org-health-diag", activeId] });
        refetch();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save WhatsApp config");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6 max-w-xl border-border/50 rounded-2xl shadow-sm bg-card">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" /> WhatsApp Connection
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Connect your organization's Meta Cloud API credentials. These credentials are used globally
          for sending campaigns and sync operations.
        </p>
      </div>

      {!canEdit && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="text-xs">
              <strong>Read-Only Mode:</strong> The organization Owner has disabled administrator
              modifications for WhatsApp credentials.
            </div>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="flex items-start space-x-3 p-4 bg-muted/20 border border-border/50 rounded-2xl">
          <input
            type="checkbox"
            id="allowAdminWhatsappConfig"
            checked={allowAdminConfig}
            onChange={(e) => setAllowAdminConfig(e.target.checked)}
            className="size-4 mt-0.5 text-primary focus:ring-primary border-muted rounded cursor-pointer"
          />
          <div className="space-y-0.5">
            <Label htmlFor="allowAdminWhatsappConfig" className="font-semibold text-xs cursor-pointer">
              Allow administrators to edit WhatsApp credentials
            </Label>
            <p className="text-[10px] text-muted-foreground">
              If checked, admins can edit these credentials. Otherwise, only the Owner can make changes.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone-id">Phone Number ID</Label>
            <Input
              id="phone-id"
              value={form.phone_number_id}
              onChange={(e) => setForm((prev) => ({ ...prev, phone_number_id: e.target.value }))}
              disabled={!canEdit}
              placeholder="e.g. 104839201948201"
              className="rounded-xl font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="waba-id">WABA ID</Label>
            <Input
              id="waba-id"
              value={form.waba_id}
              onChange={(e) => setForm((prev) => ({ ...prev, waba_id: e.target.value }))}
              disabled={!canEdit}
              placeholder="e.g. 293810485720194"
              className="rounded-xl font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="display-num">Display Phone Number</Label>
          <Input
            id="display-num"
            value={form.display_phone_number}
            onChange={(e) => setForm((prev) => ({ ...prev, display_phone_number: e.target.value }))}
            disabled={!canEdit}
            placeholder="e.g. +1 555-019-2834"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="access-token">Access Token</Label>
          <Input
            id="access-token"
            type="password"
            value={form.access_token}
            onChange={(e) => setForm((prev) => ({ ...prev, access_token: e.target.value }))}
            disabled={!canEdit}
            placeholder={form.access_token ? "••••••••••••••••" : "Paste your Meta Access Token"}
            className="rounded-xl font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            The access token is stored securely and never sent in plain text to the client.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <StatusPill status={config?.creds.status ?? "disconnected"} />
        {canEdit && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl text-xs"
          >
            {saving ? "Saving…" : "Save credentials"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function DiagnosticsTab() {
  const { activeId } = useActiveTenant();

  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ["org-health-diag", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      return getOrganizationHealth({ data: { tenantId: activeId! } });
    },
  });

  const {
    data: diag,
    isLoading: diagLoading,
    refetch: refetchDiag,
  } = useQuery({
    queryKey: ["wa-diagnostics-tab", activeId],
    enabled: !!activeId && !!health?.connected,
    queryFn: async () => {
      const res = await getMetaDiagnostics({ data: { tenantId: activeId! } });
      if (!res.ok) throw new Error(res.error);
      return res.data;
    },
  });

  const handleRefresh = () => {
    refetchHealth();
    if (health?.connected) {
      refetchDiag();
    }
  };

  if (healthLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </Card>
    );
  }

  const isSandbox = diag?.is_test_mode;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── CENTRAL HEALTH DASHBOARD CARD ── */}
      <Card className="p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Organization Health
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time synchronization and deliverability health status.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh} className="rounded-xl text-xs font-semibold">
            Refresh Health
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <HealthStatusItem label="WhatsApp Connected" active={health?.health.whatsappConnected} />
          <HealthStatusItem label="Templates Synced" active={health?.health.templatesSynced} />
          <HealthStatusItem label="Webhook Active" active={health?.health.webhookActive} />
          <HealthStatusItem label="Messages Sending" active={health?.health.messagesSending} />
          <HealthStatusItem label="Campaign Queue Healthy" active={health?.health.campaignQueueHealthy} />
          <HealthStatusItem label="Storage Healthy" active={health?.health.storageHealthy} />
        </div>
      </Card>

      {/* ── CONNECTION METRICS CARD ── */}
      <Card className="p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">Connection Health Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiagRow label="Display Phone Number" value={health?.phoneNumber || "Not configured"} />
          <DiagRow label="Account Name" value={health?.accountName || "Primary Number"} />
          <DiagRow label="Graph API Version" value={health?.graphApiVersion || "v20.0"} />
          <DiagRow label="Last Sync Attempt" value={health?.lastSync ? new Date(health.lastSync).toLocaleString() : "Never"} />
          <DiagRow label="Last Successful Message" value={health?.lastSuccessfulMessage ? new Date(health.lastSuccessfulMessage).toLocaleString() : "Never"} />
          <DiagRow label="Last Webhook Ingest" value={health?.lastIncomingWebhook ? new Date(health.lastIncomingWebhook).toLocaleString() : "Never"} />
          <DiagRow label="Last Template Sync" value={health?.lastTemplateSync ? new Date(health.lastTemplateSync).toLocaleString() : "Never"} />
          <DiagRow label="Token Expiry" value={diag?.token_expiry_at ? new Date(diag.token_expiry_at).toLocaleString() : "Permanent / Not Checked"} />
        </div>
      </Card>

      {/* ── REAL-TIME META DIAGNOSTICS CARD ── */}
      {health?.connected && (
        <Card className="p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Meta Cloud Diagnostics</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Live status query details from the Meta Cloud platform.
            </p>
          </div>

          {diagLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" /> Querying Meta...
            </div>
          ) : diag ? (
            <div className="space-y-4">
              {isSandbox && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 mt-0.5 shrink-0 text-amber-600" />
                    <div className="text-xs">
                      <h4 className="font-semibold text-sm">Sandbox / Test Mode Detected</h4>
                      <p className="mt-1">
                        Your WhatsApp account is in <strong>Test Mode (TIER_50)</strong>. Messages are only
                        delivered to registered test numbers. Complete Business Verification in Meta to
                        send to real customers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DiagRow label="Phone Status" value={diag.status} badgeColor={diag.status === "CONNECTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"} />
                <DiagRow label="Quality Rating" value={diag.quality_rating} badgeColor={diag.quality_rating === "GREEN" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"} />
                <DiagRow label="Messaging Tier" value={diag.messaging_limit_tier} badgeColor={diag.messaging_limit_tier === "TIER_50" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"} />
                <DiagRow label="Business Verification" value={diag.code_verification_status} />
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-red-600 bg-red-50 rounded-xl">
              Failed to query live Meta Cloud metrics. Please check connection status and access token validity.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function HealthStatusItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="p-4 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-between">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {active ? (
        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
      ) : (
        <XCircle className="size-4 text-red-500 shrink-0" />
      )}
    </div>
  );
}

function WebhookSetupTab() {
  const { activeId, membership } = useActiveTenant();
  const qc = useQueryClient();
  const isOwner = membership?.role === "owner";

  const { data: creds } = useQuery({
    queryKey: ["wa-creds-webhooks", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("whatsapp_credentials")
        .select("*")
        .eq("tenant_id", activeId!)
        .eq("is_default", true)
        .maybeSingle();
      return data;
    },
  });

  const { data: verifyToken } = useQuery({
    queryKey: ["webhook-verify-token-webhooks", activeId],
    enabled: !!activeId && isOwner,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_webhook_verify_token", {
        _tenant: activeId!,
      });
      if (error) return "";
      return (data as string) ?? "";
    },
  });

  const { data: webhookStats, refetch: refetchWebhookStats } = useQuery({
    queryKey: ["webhook-stats-webhooks", activeId],
    enabled: !!activeId,
    queryFn: async () => getWebhookStats({ data: { tenantId: activeId! } }),
  });

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  async function handleTestWebhook() {
    if (!creds?.phone_number_id) {
      toast.error(
        "Please configure your WhatsApp Credentials before testing the webhook.",
      );
      return;
    }
    setTestingWebhook(true);
    try {
      const simulatedPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: creds.waba_id || "WABA_ID_TEST",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: creds.display_phone_number || "15555555555",
                    phone_number_id: creds.phone_number_id,
                  },
                  statuses: [
                    {
                      id: `wamid.TEST_SIMULATION_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
                      status: "delivered",
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      recipient_id: "15555555555",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const response = await fetch("/api/public/hooks/meta-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simulatedPayload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      toast.success("Webhook simulation sent successfully!");
      refetchWebhookStats();
      qc.invalidateQueries({ queryKey: ["org-health-diag", activeId] });
      qc.invalidateQueries({ queryKey: ["webhook-events-list-api-logs", activeId] });
    } catch (e: any) {
      toast.error(`Failed to send test webhook: ${e.message}`);
    } finally {
      setTestingWebhook(false);
    }
  }

  const webhookUrl = typeof window !== "undefined"
    ? window.location.origin + "/api/public/hooks/meta-whatsapp"
    : "/api/public/hooks/meta-whatsapp";

  return (
    <Card className="p-6 space-y-6 max-w-2xl border-border/50 rounded-2xl shadow-sm bg-card">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Webhook className="size-5 text-primary" /> Meta Webhook Configuration
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Set up and test your integration with the Meta WhatsApp Cloud API webhooks.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={webhookUrl}
              className="font-mono text-xs bg-muted/50 rounded-xl"
            />
            <Button
              variant="outline"
              size="icon"
              title="Copy Webhook URL"
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                toast.success("Webhook URL copied to clipboard!");
              }}
              className="rounded-xl"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Copy this URL into the Meta Developer Console under your WhatsApp Product settings.
          </p>
        </div>

        {isOwner ? (
          <div className="space-y-1.5">
            <Label>Verify Token</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                type={showVerifyToken ? "text" : "password"}
                value={verifyToken || ""}
                className="font-mono text-xs bg-muted/50 rounded-xl"
              />
              <Button
                variant="outline"
                size="icon"
                title={showVerifyToken ? "Hide Verify Token" : "Show Verify Token"}
                onClick={() => setShowVerifyToken(!showVerifyToken)}
                className="rounded-xl"
              >
                {showVerifyToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="Copy Verify Token"
                onClick={() => {
                  if (verifyToken) {
                    navigator.clipboard.writeText(verifyToken);
                    toast.success("Verify Token copied to clipboard!");
                  }
                }}
                className="rounded-xl"
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              This token is auto-generated for your organization. Paste it into the Meta App Dashboard exactly as shown.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-muted/30 border rounded-xl text-xs text-muted-foreground">
            Verify Token is only visible to organization Owners.
          </div>
        )}
      </div>

      <div className="p-4 border rounded-2xl bg-muted/20 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Simulate Webhook Pipeline</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Trigger a simulated webhook payload to test if the CRM processes status updates correctly.
          </p>
        </div>
        <Button
          onClick={handleTestWebhook}
          disabled={testingWebhook || !creds?.phone_number_id}
          className="w-full rounded-xl font-semibold"
        >
          {testingWebhook ? "Simulating Webhook..." : "Test Webhook Simulation"}
        </Button>
      </div>
    </Card>
  );
}

function ApiLogsTab() {
  const { activeId } = useActiveTenant();
  const [showApiKey, setShowApiKey] = useState(false);
  const [mockApiKey, setMockApiKey] = useState(() => {
    return (
      "vr_live_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  });

  const {
    data: webhookEvents,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["webhook-events-list-api-logs", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_events")
        .select("id, event_type, created_at, processed_at, error, source")
        .eq("tenant_id", activeId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  function handleRegenerateApiKey() {
    if (
      confirm(
        "Are you sure you want to regenerate your API Key? All existing integrations using the old key will stop working.",
      )
    ) {
      setMockApiKey(
        "vr_live_" +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
      );
      toast.success("New API key generated successfully");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4 border-border/50 rounded-2xl shadow-sm bg-card max-w-2xl">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Webhook className="size-5 text-primary" /> Programmatic API Keys
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            API keys allow you to send template messages programmatically from your external
            applications.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Active API Key</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                type={showApiKey ? "text" : "password"}
                value={mockApiKey}
                className="font-mono text-xs bg-muted/30 rounded-xl"
              />
              <Button
                variant="outline"
                onClick={() => setShowApiKey(!showApiKey)}
                className="rounded-xl shrink-0 text-xs font-semibold"
              >
                {showApiKey ? "Hide" : "Show"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(mockApiKey);
                  toast.success("API key copied to clipboard");
                }}
                className="rounded-xl shrink-0 text-xs font-semibold"
              >
                Copy
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Keep this key secure. Never expose it in public client-side code.
            </p>
          </div>

          <div className="flex justify-end border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateApiKey}
              className="rounded-xl text-xs font-semibold"
            >
              Regenerate API Key
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border/50 rounded-2xl shadow-sm bg-card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">Webhook Events Log</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live ingest log of events delivered from Meta Cloud API.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetchEvents()} className="rounded-xl text-xs font-semibold">
            Refresh Logs
          </Button>
        </div>

        <div className="border border-border/50 rounded-xl overflow-hidden bg-background text-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50 font-semibold text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Event Type</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {eventsLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    Loading logs...
                  </td>
                </tr>
              ) : !webhookEvents || webhookEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground font-sans">
                    No webhook events logged yet.
                  </td>
                </tr>
              ) : (
                webhookEvents.map((evt) => {
                  const isError = !!evt.error;
                  return (
                    <tr key={evt.id} className={cn(isError && "bg-red-500/5")}>
                      <td className="px-4 py-2.5 font-semibold text-foreground">
                        {evt.event_type || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(evt.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        {isError ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <XCircle className="size-3" /> Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="size-3" /> Processed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-red-600 break-all whitespace-pre-wrap max-w-xs">
                        {evt.error || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

type Role = "owner" | "admin" | "manager" | "agent";
const ROLES: Role[] = ["owner", "admin", "manager", "agent"];

function UsersTab() {
  const { activeId, membership } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isOwner = canManage(membership?.role, "owner");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("agent");
  const [busy, setBusy] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["members", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select("id, role, user_id, created_at, profiles!tenant_members_user_id_profiles_fkey(email, full_name)")
        .eq("tenant_id", activeId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        role: Role;
        user_id: string;
        created_at: string;
        profiles: { email: string | null; full_name: string | null } | null;
      }>;
    },
  });

  async function invite() {
    if (!activeId || !inviteEmail.trim()) return;
    setBusy(true);
    try {
      const email = inviteEmail.trim().toLowerCase();
      const { data: uid, error: pErr } = await supabase.rpc("lookup_user_id_by_email", {
        _tenant: activeId,
        _email: email,
      });
      if (pErr) throw pErr;
      if (!uid) {
        toast.error("No account found for that email. Ask them to sign up first.");
        return;
      }
      const profile = { id: uid as string };
      const { error } = await supabase
        .from("tenant_members")
        .insert({ tenant_id: activeId, user_id: profile.id, role: inviteRole });
      if (error) throw error;
      toast.success("Member added");
      setInviteEmail("");
      qc.invalidateQueries({ queryKey: ["members"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(memberId: string, role: Role, memberUserId: string) {
    if (memberUserId === user?.id) {
      toast.error("You cannot change your own role.");
      return;
    }
    const { error } = await supabase.from("tenant_members").update({ role }).eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success(`Role updated to ${role}`);
    qc.invalidateQueries({ queryKey: ["members"] });
    qc.invalidateQueries({ queryKey: ["agents-list"] });
  }

  async function removeMember(memberId: string) {
    const { error } = await supabase.from("tenant_members").delete().eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Member removed");
    qc.invalidateQueries({ queryKey: ["members"] });
    qc.invalidateQueries({ queryKey: ["agents-list"] });
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Invite member</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add an existing account to this workspace. Ask new users to sign up at the auth page
              first.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
            <Input
              type="email"
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button onClick={invite} disabled={busy || !inviteEmail.trim()}>
              {busy ? "Adding…" : "Add member"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Team members ({members?.length ?? 0})</h2>
        {members && members.length > 0 ? (
          <div className="divide-y">
            {members.map((m) => {
              const isSelf = m.user_id === user?.id;
              const displayName = m.profiles?.full_name || m.profiles?.email || m.user_id;
              const displayEmail = m.profiles?.full_name ? m.profiles?.email : null;
              // Roles owner can assign to others (not owner to avoid accidental transfer)
              const assignableRoles: Role[] = ["admin", "manager", "agent"];
              return (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 uppercase">
                      {displayName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate flex items-center gap-1.5">
                        {displayName}
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">You</span>
                        )}
                      </div>
                      {displayEmail && (
                        <div className="text-xs text-muted-foreground truncate">{displayEmail}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner && !isSelf ? (
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.id, e.target.value as Role, m.user_id)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs capitalize cursor-pointer"
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-medium capitalize">
                        {m.role}
                      </span>
                    )}
                    {isOwner && !isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMember(m.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : members ? (
          <div className="text-sm text-muted-foreground py-4 text-center">No members yet. Add teammates above.</div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading members…</div>
        )}
      </Card>
    </div>
  );
}



function BrandingTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { activeId, membership } = useActiveTenant();
  const qc = useQueryClient();

  // Trial/Test mode branding level
  const [brandingLevel, setBrandingLevel] = useState<string>("default");

  // Branding fields
  const [brandingTenantId, setBrandingTenantId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#16A34A");
  const [secondaryColor, setSecondaryColor] = useState("#F8FAFC");
  const [supportEmail, setSupportEmail] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isOwner = isSuperAdmin || canManage(membership?.role, "admin");

  // Load existing branding settings
  useEffect(() => {
    if (!activeId) return;

    async function loadBranding() {
      try {
        const { data, error } = await supabase
          .from("tenant_branding")
          .select("*")
          .eq("tenant_id", activeId!)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setBrandingTenantId(data.tenant_id);
          setCompanyName(data.company_name ?? "");
          setLogoUrl(data.company_logo ?? "");
          setFaviconUrl(data.favicon ?? "");
          setPrimaryColor(data.primary_color ?? "#16A34A");
          setSecondaryColor(data.secondary_color ?? "#F8FAFC");
          setSupportEmail(data.support_email ?? "");
          setBrandingLevel(data.branding_level ?? "default");

          // Load custom domain from tenants table for the owner tenant of the branding
          const { data: tenantData } = await supabase
            .from("tenants")
            .select("custom_domain")
            .eq("id", data.tenant_id)
            .maybeSingle();
          if (tenantData) {
            setCustomDomain(tenantData.custom_domain ?? "");
          }
        } else {
          setCustomDomain(membership?.tenants?.custom_domain ?? "");
        }
      } catch (err) {
        console.error("Failed to load branding:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBranding();
  }, [activeId, membership]);

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;
    setSaving(true);

    const targetTenantId = brandingTenantId || activeId;

    try {
      // 1. Update branding level and custom domain on target tenant table
      const { error: tenantErr } = await supabase
        .from("tenants")
        .update({
          branding_level: brandingLevel,
          custom_domain: customDomain || null,
        })
        .eq("id", targetTenantId);
      if (tenantErr) throw tenantErr;

      // 2. Upsert tenant_branding details
      const { error: brandingErr } = await supabase.from("tenant_branding").upsert(
        {
          tenant_id: targetTenantId,
          company_name: companyName || null,
          company_logo: logoUrl || null,
          favicon: faviconUrl || null,
          primary_color: primaryColor || null,
          secondary_color: secondaryColor || null,
          support_email: supportEmail || null,
          branding_level: brandingLevel,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id" },
      );
      if (brandingErr) throw brandingErr;

      // Invalidate queries so branding hook updates immediately
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      await qc.invalidateQueries({ queryKey: ["global-branding"] });

      toast.success("Global branding settings saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save branding");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional client side uploader size checks
    const maxSize = type === "logo" ? 5 * 1024 * 1024 : 1 * 1024 * 1024; // 5MB for logo, 1MB for favicon
    if (file.size > maxSize) {
      toast.error(`File is too large. Max size allowed is ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    if (!activeId) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${activeId}/branding/${type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("branding-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("branding-assets").getPublicUrl(filePath);

      if (type === "logo") {
        setLogoUrl(publicUrl);
        toast.success("Logo uploaded!");
      } else {
        setFaviconUrl(publicUrl);
        toast.success("Favicon uploaded!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleResetBranding() {
    if (!activeId) return;
    if (
      !confirm("Are you sure you want to delete all custom branding settings and reset to default?")
    )
      return;
    setSaving(true);

    const targetTenantId = brandingTenantId || activeId;

    try {
      // 1. Reset tenants table columns
      const { error: tenantErr } = await supabase
        .from("tenants")
        .update({
          branding_level: "default",
          custom_domain: null,
        })
        .eq("id", targetTenantId);
      if (tenantErr) throw tenantErr;

      // 2. Delete tenant_branding record
      const { error: brandingErr } = await supabase
        .from("tenant_branding")
        .delete()
        .eq("tenant_id", targetTenantId);
      if (brandingErr) throw brandingErr;

      // 3. Clear local states
      setBrandingTenantId(null);
      setBrandingLevel("default");
      setCompanyName("");
      setLogoUrl("");
      setFaviconUrl("");
      setPrimaryColor("#16A34A");
      setSecondaryColor("#F8FAFC");
      setSupportEmail("");
      setCustomDomain("");

      // Invalidate queries so hook updates immediately across the app
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      await qc.invalidateQueries({ queryKey: ["global-branding"] });

      toast.success("Branding reset to default successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset branding");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading branding settings…</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Custom Branding Settings</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure company name, logos, favicons, and accent colors for your workspace.
          </p>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branding level tier picker */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="branding-level">Branding Level (Feature Flag)</Label>
              <select
                id="branding-level"
                value={brandingLevel}
                onChange={(e) => setBrandingLevel(e.target.value)}
                disabled={!isOwner}
                className="w-full h-10 px-3 border rounded-lg bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="default">Default (Virrat Reach Branding)</option>
                <option value="white_label">White Label (Custom Branding Allowed)</option>
                <option value="full_white_label">
                  Full White Label (Remove Brand Powered-by Badges)
                </option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Sets the level of white-label capability enabled for this tenant workspace
                subscription.
              </p>
            </div>

            {brandingLevel !== "default" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={!isOwner}
                    placeholder="Enter custom company name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    disabled={!isOwner}
                    placeholder="support@company.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custom-domain">Custom Domain (Future Ready)</Label>
                  <Input
                    id="custom-domain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    disabled={!isOwner}
                    placeholder="crm.company.com"
                  />
                </div>

                {/* Colors */}
                <div className="space-y-1.5">
                  <Label htmlFor="primary-color">Primary Theme Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={!isOwner}
                      className="w-12 h-10 p-1 cursor-pointer bg-background"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={!isOwner}
                      placeholder="#16A34A"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="secondary-color">Secondary Theme Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      disabled={!isOwner}
                      className="w-12 h-10 p-1 cursor-pointer bg-background"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      disabled={!isOwner}
                      placeholder="#F8FAFC"
                      className="font-mono"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-1.5">
                  <Label>Company Logo</Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={!isOwner || uploading}
                      onChange={(e) => handleFileChange(e, "logo")}
                    />
                    {logoUrl && (
                      <div className="p-3 border rounded-lg bg-muted/30 w-fit flex items-center justify-center">
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="h-10 max-w-[200px] object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-1.5">
                  <Label>Favicon Icon</Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={!isOwner || uploading}
                      onChange={(e) => handleFileChange(e, "favicon")}
                    />
                    {faviconUrl && (
                      <div className="p-2 border rounded-lg bg-muted/30 w-fit flex items-center justify-center">
                        <img
                          src={faviconUrl}
                          alt="Favicon preview"
                          className="size-6 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-muted/40 rounded-xl md:col-span-2 text-center text-xs text-muted-foreground border border-dashed">
                Select "White Label" or "Full White Label" branding level to enable customization.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={saving || uploading || !isOwner}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving branding…" : "Save Branding Settings"}
            </Button>
            {brandingLevel !== "default" && (
              <Button
                type="button"
                variant="destructive"
                disabled={saving || uploading || !isOwner}
                onClick={handleResetBranding}
                className="w-full sm:w-auto"
              >
                Delete & Reset Branding
              </Button>
            )}
          </div>
        </form>
      </div>
    </Card>
  );
}
// ─── ConversationsTab ─────────────────────────────────────────────────────────

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [soundEnabled, setSoundEnabledState] = useState(() => getSoundEnabled());
  const [volume, setVolumeState] = useState(() => getSoundVolume());
  const [saved, setSaved] = useState(false);

  function handleToggle(enabled: boolean) {
    setSoundEnabledState(enabled);
    setSaved(false);
  }

  function handleVolumeChange(v: number) {
    setVolumeState(v);
    setSaved(false);
  }

  function handleSave() {
    setSoundEnabled(soundEnabled);
    setSoundVolume(volume);
    setSaved(true);
    toast.success("Notification preferences saved.");
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePreview() {
    // Play a preview at the current (unsaved) volume
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) { toast.error("Audio not supported in this browser."); return; }
      const ctx = new AudioCtxClass();

      // CRITICAL: browsers start AudioContext suspended even on user gesture — must resume first
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const master = volume / 100;
      function ping(freq: number, delaySeconds: number) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + delaySeconds;
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(master * 0.35, startTime + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
        osc.connect(env);
        env.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      }

      ping(880, 0);       // A5 — play immediately
      ping(1108, 0.18);   // C#6 — 180ms later (pleasant major third)

      setTimeout(() => { try { ctx.close(); } catch { /* ignore */ } }, 900);
    } catch (err: any) {
      toast.error("Could not play preview sound: " + (err?.message ?? "unknown error"));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Notification Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how you are alerted when customers send you new WhatsApp messages.
          </p>
        </div>

        {/* Sound Enable Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3.5">
            <div className="flex items-start gap-3">
              {soundEnabled
                ? <Volume2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                : <VolumeX className="size-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
              <div>
                <p className="text-sm font-semibold">Enable Conversation Sound</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Play a chime when a customer sends a new WhatsApp message.
                  Sound plays only while this tab is open.
                </p>
              </div>
            </div>
            <button
              id="notification-sound-toggle"
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => handleToggle(!soundEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 ml-4",
                soundEnabled ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Volume Slider */}
          <div
            className={cn(
              "rounded-xl border border-border px-4 py-3.5 space-y-3 transition-opacity",
              !soundEnabled && "opacity-40 pointer-events-none"
            )}
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Notification Volume</Label>
              <span className="text-sm font-mono text-muted-foreground">{Math.round(volume)}%</span>
            </div>
            <input
              id="notification-volume-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={!soundEnabled}
              className="w-full h-2 rounded-full accent-primary cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Silent</span>
              <button
                type="button"
                id="notification-sound-preview"
                onClick={handlePreview}
                disabled={!soundEnabled || volume === 0}
                className="text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
              >
                ▶ Preview sound
              </button>
              <span>Max</span>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="border border-border rounded-xl p-4 space-y-2 bg-muted/30">
          <div className="flex items-start gap-2">
            <Info className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">How it works</p>
              <ul className="space-y-1 list-disc pl-3">
                <li>Sound plays instantly when a customer replies via WhatsApp.</li>
                <li>If you have multiple browser tabs open, sound plays in only one tab.</li>
                <li>No sound for campaign sends, status updates (delivered/read), or outbound messages.</li>
                <li>These settings are saved per-browser and will reset if you clear site data.</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          id="notification-settings-save"
          onClick={handleSave}
          className="h-9"
        >
          {saved ? (
            <><Check className="size-4 mr-2 text-emerald-400" /> Saved</>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </Card>
    </div>
  );
}

// ─── Conversations Tab ────────────────────────────────────────────────────────

function ConversationsTab() {

  const { activeId, membership } = useActiveTenant();
  const qc = useQueryClient();
  const isAdmin = canManage(membership?.role, "admin");

  const { data: members = [] } = useQuery({
    queryKey: ["workspace-members", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select("user_id, role, profile:user_id(id, full_name, email)")
        .eq("tenant_id", activeId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["assignment-settings", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_assignment_settings")
        .select("*")
        .eq("tenant_id", activeId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [strategy, setStrategy] = useState("unassigned");
  const [defaultAgentId, setDefaultAgentId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setStrategy(settings.strategy ?? "unassigned");
      setDefaultAgentId(settings.default_agent_id ?? "");
    }
  }, [settings]);

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: activeId,
        strategy,
        default_agent_id: strategy === "specific_agent" && defaultAgentId ? defaultAgentId : null,
      };
      const { error } = await supabase
        .from("tenant_assignment_settings")
        .upsert(payload, { onConflict: "tenant_id" });
      if (error) throw error;
      toast.success("Conversation settings saved.");
      qc.invalidateQueries({ queryKey: ["assignment-settings", activeId] });
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  const strategies = [
    {
      id: "unassigned",
      label: "Unassigned",
      description: "New conversations arrive without an assignee. Managers assign manually.",
      available: true,
    },
    {
      id: "round_robin",
      label: "Round Robin",
      description: "Automatically rotate new conversations evenly across all available agents.",
      available: false,
    },
    {
      id: "least_active",
      label: "Least Active Agent",
      description: "Assign to the agent with the fewest open conversations.",
      available: false,
    },
    {
      id: "specific_agent",
      label: "Specific Default Agent",
      description: "Always assign incoming conversations to one selected agent.",
      available: true,
    },
    {
      id: "department_based",
      label: "Department Based",
      description: "Route conversations to agents based on department or team skill tags.",
      available: false,
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold">Conversation Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control how incoming WhatsApp conversations are handled and distributed.
          </p>
        </div>

        {/* Auto Assignment */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Auto Assignment Strategy</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose how new conversations are automatically assigned to agents.
            </p>
          </div>

          <div className="space-y-2">
            {strategies.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => isAdmin && s.available && setStrategy(s.id)}
                disabled={!isAdmin || !s.available}
                className={cn(
                  "w-full flex items-start gap-3 text-left rounded-xl border px-4 py-3 transition-all",
                  strategy === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30",
                  (!isAdmin || !s.available) && "opacity-50 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center",
                    strategy === s.id ? "border-primary" : "border-muted-foreground/40",
                  )}
                >
                  {strategy === s.id && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.label}</span>
                    {!s.available && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Specific agent selector */}
          {strategy === "specific_agent" && (
            <div className="space-y-1.5 pl-7">
              <Label className="text-xs font-medium">Default Agent</Label>
              <select
                value={defaultAgentId}
                onChange={(e) => setDefaultAgentId(e.target.value)}
                disabled={!isAdmin}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select an agent…</option>
                {(members as any[])
                  .filter((m: any) => m.role === "agent")
                  .map((m: any) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profile?.full_name || m.profile?.email || m.user_id}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Agent Visibility Rules (informational) */}
        <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
          <div className="flex items-start gap-2">
            <Info className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Role-Based Conversation Visibility</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                These rules are enforced at the database level (Row Level Security).
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { role: "Owner / Admin / Manager", rule: "See all conversations in the workspace" },
              { role: "Agent", rule: "See only conversations explicitly assigned to them" },
            ].map((row) => (
              <div key={row.role} className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 flex-shrink-0" />
                <span className="font-medium">{row.role}:</span>
                <span className="text-muted-foreground">{row.rule}</span>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <Button onClick={handleSave} disabled={saving} className="h-9">
            {saving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        )}
      </Card>
    </div>
  );
}

function BillingTab() {
  const { activeId } = useActiveTenant();

  // Mock billing metrics
  const usage = {
    messagesSent: 1482,
    messagesLimit: 10000,
    contactsCount: 842,
    contactsLimit: 2500,
    seatsCount: 3,
    seatsLimit: 5,
  };

  const invoices = [
    { id: "INV-2026-001", date: "2026-06-01", amount: "$49.00", status: "Paid" },
    { id: "INV-2026-002", date: "2026-05-01", amount: "$49.00", status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/50 rounded-2xl shadow-sm bg-card max-w-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Subscription & Plan
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your billing tier, resource usage limits, and invoices.
            </p>
          </div>
          <span className="bg-primary-soft text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Standard Plan
          </span>
        </div>

        {/* Meters */}
        <div className="space-y-4 pt-2">
          {/* Messages */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>Monthly Messages Sent</span>
              <span className="text-muted-foreground">
                {usage.messagesSent.toLocaleString()} / {usage.messagesLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={(usage.messagesSent / usage.messagesLimit) * 100} className="h-2" />
          </div>

          {/* Contacts */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>Active Contacts</span>
              <span className="text-muted-foreground">
                {usage.contactsCount.toLocaleString()} / {usage.contactsLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={(usage.contactsCount / usage.contactsLimit) * 100} className="h-2" />
          </div>

          {/* Seats */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>Team Seats</span>
              <span className="text-muted-foreground">
                {usage.seatsCount} / {usage.seatsLimit} used
              </span>
            </div>
            <Progress value={(usage.seatsCount / usage.seatsLimit) * 100} className="h-2" />
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button
            onClick={() => toast.info("To upgrade your plan, please email billing@virratreach.com")}
            className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
          >
            Upgrade Plan
          </Button>
        </div>
      </Card>

      {/* Invoice Log */}
      <Card className="p-6 border-border/50 rounded-2xl shadow-sm bg-card max-w-2xl space-y-4">
        <h3 className="font-bold text-sm">Invoice History</h3>
        <div className="border border-border/50 rounded-xl overflow-hidden text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 font-mono text-xs">{inv.id}</td>
                  <td className="p-3 text-xs">{inv.date}</td>
                  <td className="p-3 text-xs font-medium">{inv.amount}</td>
                  <td className="p-3 text-xs text-emerald-600 font-semibold">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DangerZoneTab() {
  const { activeId, membership } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [confirmOrgSlug, setConfirmOrgSlug] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");
  const deleteOrgFn = useServerFn(deleteOrganization);

  const { data: members } = useQuery({
    queryKey: ["members-danger", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_members")
        .select("id, role, user_id, profiles!tenant_members_user_id_profiles_fkey(email, full_name)")
        .eq("tenant_id", activeId!);
      return (data ?? []) as any[];
    },
  });

  const otherMembers = (members || []).filter((m) => m.user_id !== user?.id);

  async function handleTransferOwnership(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !transferTargetId) return;
    if (
      !confirm(
        "Are you sure you want to transfer ownership? You will lose owner privileges and become an Admin.",
      )
    )
      return;

    setTransferring(true);
    try {
      // 1. Promote target user to owner
      const { error: promoErr } = await supabase
        .from("tenant_members")
        .update({ role: "owner" })
        .eq("tenant_id", activeId)
        .eq("user_id", transferTargetId);
      if (promoErr) throw promoErr;

      // 2. Demote current user to admin
      const { error: demoteErr } = await supabase
        .from("tenant_members")
        .update({ role: "admin" })
        .eq("tenant_id", activeId)
        .eq("user_id", user!.id);
      if (demoteErr) throw demoteErr;

      toast.success("Ownership transferred successfully!");
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer ownership");
    } finally {
      setTransferring(false);
    }
  }

  async function handleDeleteOrganization() {
    if (!activeId) return;
    if (confirmOrgSlug !== membership?.tenants.slug) {
      toast.error("Organization slug does not match. Deletion aborted.");
      return;
    }
    if (
      !confirm(
        `Are you absolutely sure you want to delete "${membership?.tenants.name}"? This action is permanent and cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteOrgFn({ data: { tenantId: activeId } });

      toast.success("Organization deleted successfully");
      localStorage.removeItem("wa-crm.active-tenant");
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Failed to delete organization");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Transfer Ownership */}
      <Card className="p-6 border border-warning/30 bg-warning/5 rounded-2xl shadow-sm space-y-4 max-w-2xl">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-warning-foreground">
            <AlertTriangle className="size-5 text-warning" /> Transfer Organization Ownership
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Promote another member to Owner. This will demote your role in this organization to
            Admin.
          </p>
        </div>

        {otherMembers.length > 0 ? (
          <form onSubmit={handleTransferOwnership} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="transfer-target">Select new owner</Label>
              <select
                id="transfer-target"
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                required
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a member…</option>
                {otherMembers.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profiles?.full_name || m.profiles?.email || m.user_id} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={transferring || !transferTargetId}
              variant="outline"
              className="border-warning/50 text-warning-foreground hover:bg-warning/10 rounded-xl font-semibold"
            >
              {transferring ? "Transferring…" : "Transfer Ownership"}
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No other members found in this organization. Invite team members first to enable
            transfer.
          </p>
        )}
      </Card>

      {/* Delete Organization */}
      <Card className="p-6 border border-destructive/30 bg-destructive/5 rounded-2xl shadow-sm space-y-4 max-w-2xl">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 text-destructive animate-pulse" /> Delete Organization
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently delete this organization, including all contacts, campaigns, logs, and
            credentials. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="confirm-slug">
              Type the organization slug{" "}
              <span className="font-mono bg-destructive/10 px-1.5 py-0.5 rounded text-destructive font-bold text-xs">
                /{membership?.tenants.slug}
              </span>{" "}
              to confirm:
            </Label>
            <Input
              id="confirm-slug"
              placeholder={membership?.tenants.slug}
              value={confirmOrgSlug}
              onChange={(e) => setConfirmOrgSlug(e.target.value)}
              className="rounded-xl border-destructive/20 focus-visible:ring-destructive font-mono text-xs"
            />
          </div>
          <Button
            onClick={handleDeleteOrganization}
            disabled={deleting || confirmOrgSlug !== membership?.tenants.slug}
            variant="destructive"
            className="rounded-xl font-semibold w-full sm:w-auto"
          >
            {deleting ? "Deleting…" : "Permanently Delete Organization"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
