import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { createCampaign, cancelCampaign, resumeCampaign, previewCampaign } from "@/lib/campaigns.functions";
import { AudienceBuilder, AudienceCriteria } from "@/components/AudienceBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns · Virrat Reach" }] }),
  component: CampaignsPage,
});

const STATUS_META: Record<string, { label: string; tone: string; icon: typeof Send }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground", icon: Clock },
  scheduled: { label: "Scheduled", tone: "bg-primary-soft text-primary", icon: Calendar },
  sending: { label: "Sending", tone: "bg-warning-soft text-warning-foreground", icon: Loader2 },
  processing: { label: "Processing", tone: "bg-warning-soft text-warning-foreground", icon: Loader2 },
  completed: {
    label: "Completed",
    tone: "bg-success-soft text-success-foreground",
    icon: CheckCircle2,
  },
  partial: {
    label: "Completed",
    tone: "bg-success-soft text-success-foreground",
    icon: CheckCircle2,
  },
  failed: { label: "Failed", tone: "bg-destructive/10 text-destructive", icon: AlertCircle },
  cancelled: { label: "Cancelled", tone: "bg-muted text-muted-foreground", icon: XCircle },
};


function CampaignsPage() {
  const { activeId, membership } = useActiveTenant();
  const canCreate = canManage(membership?.role, "manager");
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select(
          `
          id, name, description, status, scheduled_at, total_recipients, 
          processed_count, failed_count, created_at, template_id,
          template:template_id(template_name, header_type),
          campaign_media(file_url)
        `,
        )
        .eq("tenant_id", activeId!)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    // Auto-refresh while any campaign is actively sending/scheduled so the
    // progress cards reflect server-side work without a manual reload.
    refetchInterval: (q) => {
      const rows = (q.state.data ?? []) as Array<{ status?: string }>;
      return rows.some((r) => r.status === "sending" || r.status === "scheduled") ? 4000 : false;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and monitor template broadcasts.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New Campaign
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : !campaigns?.length ? (
        <EmptyState
          icon={Send}
          title="No campaigns yet"
          description="Create your first WhatsApp template broadcast — pick a template, audience and schedule."
          action={
            canCreate ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" /> New Campaign
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const meta = STATUS_META[c.status as string] ?? STATUS_META.draft;
            const Icon = meta.icon;
            const total = c.total_recipients ?? 0;
            const sent = c.processed_count ?? 0;
            const failed = c.failed_count ?? 0;
            const pct = total ? Math.round(((sent + failed) / total) * 100) : 0;
            return (
              <button key={c.id} onClick={() => setDetailId(c.id)} className="text-left">
                <Card className="p-5 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3 items-start min-w-0 flex-1">
                      {c.template?.header_type === "IMAGE" && c.campaign_media?.[0]?.file_url && (
                        <img
                          src={c.campaign_media[0].file_url}
                          alt="Thumbnail"
                          className="size-12 rounded object-cover bg-muted shrink-0 border"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{c.name}</div>
                        {c.template?.template_name && (
                          <div className="text-[10px] font-medium text-primary uppercase tracking-wider mt-0.5">
                            {c.template.template_name}
                          </div>
                        )}
                        {c.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={meta.tone + " gap-1 shrink-0"} variant="outline">
                      <Icon
                        className={"size-3 " + (c.status === "sending" ? "animate-spin" : "")}
                      />{" "}
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" /> {total} recipients
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-success-foreground">
                        <CheckCircle2 className="size-3" /> {sent}
                      </span>
                      {failed > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="size-3" /> {failed}
                        </span>
                      )}
                    </div>
                  </div>
                  {c.scheduled_at && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(c.scheduled_at).toLocaleString()}
                    </div>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {open && <CreateCampaignDialog onClose={() => setOpen(false)} />}
      {detailId && <CampaignDetailDialog id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

type ValidationIssue = {
  contactId: string;
  contactName: string;
  phone: string;
  variable: string;
  field: string;
  fieldLabel: string;
};

function CreateCampaignDialog({ onClose }: { onClose: () => void }) {
  const { activeId } = useActiveTenant();
  const qc = useQueryClient();
  const create = useServerFn(createCampaign);
  const preview = useServerFn(previewCampaign);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [audience, setAudience] = useState<AudienceCriteria>({
    mode: "all",
    ids: [],
    includeGroups: [],
    includeTags: [],
    excludeGroups: [],
    excludeTags: [],
    savedAudienceId: null,
    manualContactIds: [],
    freezeAudience: false,
  });
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({});
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [issues, setIssues] = useState<ValidationIssue[] | null>(null);
  const [phoneError, setPhoneError] = useState<{
    message: string;
    count: number;
    samples: string[];
  } | null>(null);

  const [campaignImageUrl, setCampaignImageUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: templates } = useQuery({
    queryKey: ["campaigns:templates", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("message_templates")
        .select(
          "id, template_name, language, sync_status, body, variables, header_type, header_format",
        )
        .eq("tenant_id", activeId!)
        .eq("sync_status", "approved")
        .is("deleted_at", null)
        .order("template_name");
      return data ?? [];
    },
  });

  const selectedTemplate = useMemo(
    () => templates?.find((t) => t.id === templateId),
    [templates, templateId],
  );

  function payload() {
    if (!activeId) throw new Error("No workspace");
    if (!name.trim() || !templateId) throw new Error("Name and template are required");
    if (selectedTemplate?.header_type === "IMAGE" && !campaignImageUrl) {
      throw new Error("Header image is required for this template");
    }
    const scheduledAtIso = scheduleType === "later" ? new Date(scheduledAt).toISOString() : null;
    return {
      tenantId: activeId,
      name: name.trim(),
      description: description.trim() || null,
      templateId,
      audience,
      variableMapping,
      scheduledAt: scheduledAtIso,
      mediaUrl: selectedTemplate?.header_type === "IMAGE" ? campaignImageUrl : null,
    };
  }

  const mut = useMutation({
    mutationFn: async () => {
      // P0-A: validation step before creation. Block launch when any variable resolves to empty.
      const pv = await preview({ data: payload() });
      if (pv.issues.length) {
        setIssues(pv.issues);
        throw new Error(`__VALIDATION__:${pv.issues.length}`);
      }
      setIssues(null);
      return create({ data: payload() });
    },
    onSuccess: (res) => {
      toast.success(`Campaign created — ${res.total} recipients queued`);
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      onClose();
    },
    onError: (e: Error) => {
      if (e.message.startsWith("__VALIDATION__:")) return; // validation screen handles it
      // server-side double-protection — parse VALIDATION_FAILED payload if create() itself blocked
      const m = e.message.match(/VALIDATION_FAILED:(.+)$/s);
      if (m) {
        try {
          const parsed = JSON.parse(m[1]) as { issues: ValidationIssue[] };
          setIssues(parsed.issues);
          return;
        } catch {
          /* fall through */
        }
      }
      // FIX-3 UI: Handle phone number country-code validation errors
      const pm = e.message.match(/PHONE_VALIDATION_FAILED:(.+)$/s);
      if (pm) {
        try {
          const parsed = JSON.parse(pm[1]) as { message: string; count: number; samples: string[] };
          setPhoneError(parsed);
          return;
        } catch {
          /* fall through */
        }
      }
      toast.error(e.message);
    },
  });

  const vars = (selectedTemplate?.variables as string[] | null) ?? [];

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
          <DialogDescription>Pick a template, audience and schedule.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Campaign name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Diwali Promo 2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an approved template" />
              </SelectTrigger>
              <SelectContent>
                {(templates ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.template_name} · {t.language}
                  </SelectItem>
                ))}
                {!templates?.length && (
                  <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                    No approved templates yet
                  </div>
                )}
              </SelectContent>
            </Select>
            {selectedTemplate?.body && (
              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md whitespace-pre-wrap">
                {selectedTemplate.body}
              </div>
            )}
          </div>

          {selectedTemplate?.header_type === "IMAGE" && (
            <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
              <Label className="font-semibold text-sm">Campaign Header Image (Required)</Label>
              <p className="text-xs text-muted-foreground">
                Select the image for this campaign. Max 5MB (JPG, JPEG, PNG only).
              </p>
              {campaignImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={campaignImageUrl}
                    alt="Campaign Header Preview"
                    className="max-h-40 rounded border object-contain bg-background"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive"
                    onClick={() => setCampaignImageUrl("")}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File exceeds maximum size of 5MB");
                        return;
                      }
                      setUploadingImage(true);
                      try {
                        const fileExt = file.name.split(".").pop()?.toLowerCase();
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${activeId}/campaigns/${fileName}`;
                        const { error: uploadError } = await supabase.storage
                          .from("campaign-media")
                          .upload(filePath, file);
                        if (uploadError) throw uploadError;
                        const {
                          data: { publicUrl },
                        } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
                        setCampaignImageUrl(publicUrl);
                        toast.success("Image uploaded successfully");
                      } catch (err) {
                        toast.error("Failed to upload image: " + (err as Error).message);
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                  />
                  {uploadingImage && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" /> Uploading image...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {vars.length > 0 && (
            <div className="space-y-2">
              <Label>Variables</Label>
              <p className="text-xs text-muted-foreground">
                Map each template variable to a contact field.
              </p>
              <div className="space-y-2">
                {vars.map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-1 bg-muted rounded">{`{{${v}}}`}</span>
                    <Select
                      value={variableMapping[v] ?? ""}
                      onValueChange={(val) => setVariableMapping({ ...variableMapping, [v]: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Contact field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Target Audience Selection</Label>
            <AudienceBuilder
              tenantId={activeId!}
              value={audience}
              onChange={setAudience}
              templateId={templateId}
              variableMapping={variableMapping}
              mediaUrl={campaignImageUrl}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Schedule</Label>
            <Select
              value={scheduleType}
              onValueChange={(v) => setScheduleType(v as "now" | "later")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="now">Send immediately</SelectItem>
                <SelectItem value="later">Schedule for later</SelectItem>
              </SelectContent>
            </Select>
            {scheduleType === "later" && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>

        {issues && issues.length > 0 && (
          <div className="border border-destructive/40 bg-destructive/5 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
              <AlertCircle className="size-4" />
              {issues.length} recipient{issues.length === 1 ? "" : "s"} missing required data — fix
              before sending
            </div>
            <div className="max-h-56 overflow-y-auto text-xs space-y-1">
              {issues.slice(0, 50).map((i, idx) => (
                <div key={idx} className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="font-medium">{i.contactName}</span>
                  <span className="text-muted-foreground">({i.phone})</span>
                  <span>missing</span>
                  <span className="font-medium">{i.fieldLabel}</span>
                  <span className="text-muted-foreground">required for {`{{${i.variable}}}`}</span>
                </div>
              ))}
              {issues.length > 50 && (
                <div className="text-muted-foreground">…and {issues.length - 50} more</div>
              )}
            </div>
          </div>
        )}

        {phoneError && (
          <div className="border border-destructive/40 bg-destructive/5 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
              <AlertCircle className="size-4" />
              Phone numbers missing country code — campaign blocked
            </div>
            <p className="text-xs text-muted-foreground">{phoneError.message}</p>
            {phoneError.samples.length > 0 && (
              <div className="text-xs font-mono space-y-0.5">
                {phoneError.samples.map((s, i) => (
                  <div key={i} className="text-destructive">
                    {s}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Go to <strong>Contacts → Bulk Add</strong> and include a country code (e.g.{" "}
              <code>91</code> for India) when pasting numbers, or re-import your CSV with the
              country code prefix.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mut.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {issues && issues.length > 0
              ? "Re-validate"
              : scheduleType === "later"
                ? "Schedule"
                : "Send now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignDetailDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { activeId, membership } = useActiveTenant();
  const qc = useQueryClient();
  const canEdit = canManage(membership?.role, "manager");
  const cancel = useServerFn(cancelCampaign);

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select(
          "*, template:template_id(template_name, language, body, header_type), campaign_media(file_url)",
        )
        .eq("id", id)
        .single();
      return data;
    },
    refetchInterval: 5000,
  });

  const { data: recipientStats } = useQuery({
    queryKey: ["campaign-stats", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaign_recipients")
        .select("status")
        .eq("campaign_id", id)
        .limit(10000);
      const counts: Record<string, number> = {};
      for (const r of data ?? [])
        counts[r.status as string] = (counts[r.status as string] ?? 0) + 1;
      return counts;
    },
    refetchInterval: 5000,
  });

  const { data: recipients } = useQuery({
    queryKey: ["campaign-recipients", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaign_recipients")
        .select(
          "id, phone_number_normalized, status, meta_status, meta_message_id, meta_error, error",
        )
        .eq("campaign_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const { data: revCheck } = useQuery({
    queryKey: ["campaign-revocation-check", campaign?.id, campaign?.audience_criteria, campaign?.created_by, campaign?.tenant_id],
    enabled: !!campaign && (campaign.status === "scheduled" || campaign.status === "sending" || campaign.status === "processing"),
    queryFn: async () => {
      const tenantId = campaign?.tenant_id;
      const creatorId = campaign?.created_by;
      if (!tenantId || !creatorId) return { revoked: false };

      const { data: isCreatorManagerPlus } = await supabase.rpc("has_tenant_role", {
        _tenant: tenantId,
        _user: creatorId,
        _roles: ["owner", "admin", "manager"],
      });

      if (isCreatorManagerPlus) return { revoked: false };

      const audience = campaign?.audience_criteria as any;
      let targetGroupIds: string[] = [];
      if (audience) {
        if (audience.mode === "groups" && Array.isArray(audience.ids)) {
          targetGroupIds = audience.ids;
        } else if (audience.mode === "audience_builder") {
          let activeAudience = audience;
          if (audience.savedAudienceId) {
            const { data: sa } = await supabase
              .from("saved_audiences")
              .select("criteria")
              .eq("id", audience.savedAudienceId)
              .maybeSingle();
            if (sa && sa.criteria) activeAudience = sa.criteria;
          }
          if (Array.isArray(activeAudience.includeGroups)) {
            targetGroupIds = activeAudience.includeGroups;
          }
        }
      }

      if (targetGroupIds.length === 0) return { revoked: false };

      const { data: groups } = await supabase
        .from("groups")
        .select("id, name, created_by")
        .in("id", targetGroupIds);

      const foreignGroupIds = (groups ?? [])
        .filter((g: any) => g.created_by && g.created_by !== creatorId)
        .map((g: any) => g.id);

      if (foreignGroupIds.length === 0) return { revoked: false };

      const { data: shares } = await supabase
        .from("group_shares")
        .select("group_id, can_use_in_campaigns")
        .in("group_id", foreignGroupIds)
        .eq("shared_with_user", creatorId);

      const permittedGroupIds = (shares ?? [])
        .filter((s: any) => s.can_use_in_campaigns)
        .map((s: any) => s.group_id);

      const unauthorizedGroups = (groups ?? []).filter(
        (g: any) => foreignGroupIds.includes(g.id) && !permittedGroupIds.includes(g.id)
      );

      if (unauthorizedGroups.length > 0) {
        return {
          revoked: true,
          groups: unauthorizedGroups.map((g) => g.name),
        };
      }

      return { revoked: false };
    },
  });

  const { data: audienceDetails } = useQuery({
    queryKey: ["campaign-audience-details", campaign?.id, campaign?.audience_criteria],
    enabled: !!campaign,
    queryFn: async () => {
      const audience = campaign?.audience_criteria as any;
      let targetGroupIds: string[] = [];
      if (audience) {
        if (audience.mode === "groups" && Array.isArray(audience.ids)) {
          targetGroupIds = audience.ids;
        } else if (audience.mode === "audience_builder") {
          let activeAudience = audience;
          if (audience.savedAudienceId) {
            const { data: sa } = await supabase
              .from("saved_audiences")
              .select("criteria")
              .eq("id", audience.savedAudienceId)
              .maybeSingle();
            if (sa && sa.criteria) activeAudience = sa.criteria;
          }
          if (Array.isArray(activeAudience.includeGroups)) {
            targetGroupIds = activeAudience.includeGroups;
          }
        }
      }

      if (targetGroupIds.length === 0) {
        return { mode: audience?.mode || "all", groups: [] };
      }

      const { data: groups } = await supabase
        .from("groups")
        .select("id, name, created_by, profiles:created_by(full_name, email)")
        .in("id", targetGroupIds);

      return {
        mode: audience?.mode || "groups",
        groups: (groups ?? []).map((g: any) => ({
          id: g.id,
          name: g.name,
          ownerName: g.profiles?.full_name || g.profiles?.email || "Workspace",
          isShared: g.created_by && g.created_by !== campaign?.created_by,
        })),
      };
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => cancel({ data: { tenantId: activeId!, campaignId: id } }),
    onSuccess: () => {
      toast.success("Campaign cancelled");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resume = useServerFn(resumeCampaign);
  const resumeMut = useMutation({
    mutationFn: () => resume({ data: { tenantId: activeId!, campaignId: id } }),
    onSuccess: () => {
      toast.success("Campaign resumed. Remaining messages are being processed.");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!campaign) return null;
  const meta = STATUS_META[campaign.status as string] ?? STATUS_META.draft;
  const canCancel =
    canEdit &&
    (campaign.status === "scheduled" ||
      campaign.status === "sending" ||
      campaign.status === "processing");

  const canResume =
    canEdit &&
    (campaign.status === "failed" ||
      campaign.status === "cancelled" ||
      campaign.status === "processing");



  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaign.name}
            <Badge className={meta.tone} variant="outline">
              {meta.label}
            </Badge>
          </DialogTitle>
          {campaign.description && <DialogDescription>{campaign.description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {revCheck?.revoked && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="text-sm font-sans">
                <p className="font-semibold">Campaign Audience Revoked</p>
                <p className="mt-0.5">
                  The creator's access to the shared group(s) (<strong>{revCheck.groups?.join(", ")}</strong>) has been revoked. This scheduled campaign will fail when processed.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Stat label="Total" value={campaign.total_recipients ?? 0} />
            <Stat
              label="Sent"
              value={(recipientStats?.sent ?? 0) + (recipientStats?.sent_to_meta ?? 0)}
            />
            <Stat
              label="Delivered"
              value={(recipientStats?.delivered ?? 0) + (recipientStats?.read ?? 0)}
            />
            <Stat
              label="Failed"
              value={(recipientStats?.failed ?? 0) + (recipientStats?.api_failed ?? 0)}
              tone="destructive"
            />
          </div>

          {campaign.template?.header_type === "IMAGE" &&
            (campaign as any).campaign_media?.[0]?.file_url && (
              <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Campaign Header Image Preview
                </div>
                <img
                  src={(campaign as any).campaign_media[0].file_url}
                  alt="Campaign Header Preview"
                  className="max-h-48 rounded border object-contain w-full bg-background"
                />
              </div>
            )}

          {audienceDetails && (
            <div className="space-y-2 border rounded-lg p-3 bg-muted/20 text-xs">
              <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                Campaign Audience Source
              </div>
              <div className="space-y-1 mt-1 font-sans">
                <p>
                  Target Mode: <span className="font-semibold capitalize">{audienceDetails.mode.replace("_", " ")}</span>
                </p>
                {audienceDetails.groups.length > 0 && (
                  <div>
                    <p className="mt-1.5 font-medium">Target Groups:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1 mt-0.5">
                      {audienceDetails.groups.map((g: any) => (
                        <li key={g.id}>
                          <span className="font-semibold">{g.name}</span>
                          {g.isShared && (
                            <span className="text-muted-foreground ml-1.5">
                              (Shared by {g.ownerName})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {((recipientStats?.failed ?? 0) + (recipientStats?.api_failed ?? 0)) > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-lg text-xs space-y-1.5 font-sans">
              <div className="font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertCircle className="size-4 shrink-0" />
                Meta Delivery Failures Explanation
              </div>
              <p>
                Messages marked as <strong>Failed</strong> were rejected directly by Meta's WhatsApp Cloud API for the following reasons:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>
                  <strong>Error 131049 (Ecosystem Health)</strong>: Meta's anti-spam policy blocked delivery because the recipient's phone number rarely engages with business accounts or reached Meta's marketing message frequency cap.
                </li>
                <li>
                  <strong>Error 130472 (Invalid / Restricted Number)</strong>: The phone number is not registered on WhatsApp or is restricted by Meta from receiving marketing templates.
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-sm">Recipients Delivery Details</h3>
            <div className="border rounded-lg overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs divide-y">
                <thead className="bg-muted/50 text-muted-foreground font-semibold sticky top-0 bg-background z-10">
                  <tr>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Message ID</th>
                    <th className="p-2">Details / Meta Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {recipients?.map((r) => {
                    const errorText = r.meta_error || r.error || "";
                    const isEcoSystemHealth = errorText.includes("131049");
                    const isInvalidNumber = errorText.includes("130472");

                    return (
                      <tr key={r.id}>
                        <td className="p-2 font-sans font-medium">+{r.phone_number_normalized}</td>
                        <td className="p-2">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize whitespace-nowrap",
                              r.status === "sent" ||
                                (r.status as string) === "sent_to_meta" ||
                                (r.status as string) === "delivered" ||
                                (r.status as string) === "read"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800",
                            )}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-2 text-[11px] truncate max-w-[140px]" title={r.meta_message_id ?? ""}>
                          {r.meta_message_id || "-"}
                        </td>
                        <td className="p-2 font-sans text-xs max-w-[280px]">
                          {errorText ? (
                            <div className="space-y-0.5">
                              <div className="text-destructive font-mono text-[11px] break-words">
                                {errorText}
                              </div>
                              {isEcoSystemHealth && (
                                <span className="inline-block bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-sans font-medium">
                                  Meta blocked (Recipient unengaged / frequency capped)
                                </span>
                              )}
                              {isInvalidNumber && (
                                <span className="inline-block bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] px-1.5 py-0.5 rounded font-sans font-medium">
                                  Number not on WhatsApp / Restricted by Meta
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(!recipients || recipients.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground font-sans">
                        No recipients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {campaign.scheduled_at && (
            <div className="text-sm text-muted-foreground">
              Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
            </div>
          )}

          <Link to="/conversations" className="text-sm text-primary hover:underline inline-block">
            View replies in Conversations →
          </Link>
        </div>

        <DialogFooter>
          {canResume && (
            <Button
              variant="outline"
              onClick={() => resumeMut.mutate()}
              disabled={resumeMut.isPending}
              className="border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
            >
              {resumeMut.isPending ? "Resuming..." : "Resume campaign"}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => cancelMut.mutate()}
              disabled={cancelMut.isPending}
            >
              Cancel campaign
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "destructive" }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div
        className={
          "text-2xl font-semibold tabular-nums " +
          (tone === "destructive" ? "text-destructive" : "")
        }
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
