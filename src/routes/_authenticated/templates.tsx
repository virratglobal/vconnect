import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { syncMetaTemplates, submitTemplateToMeta } from "@/lib/templates.functions";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  RefreshCcw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";

type Template = {
  id: string;
  template_name: string;
  language: string;
  category: string | null;
  body: string;
  header: string | null;
  footer: string | null;
  variables: string[] | null;
  version: number;
  source: string;
  sync_status: "approved" | "pending" | "rejected" | "disabled" | "draft";
  meta_template_id: string | null;
  submitted_at: string | null;
  last_sync_at: string | null;
  updated_at: string;
  header_type?: string | null;
  header_format?: string | null;
  example_media_url?: string | null;
  approval_status?: string | null;
  rejection_reason?: string | null;
};

function extractVariables(body: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*(\d+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) set.add(m[1]);
  return Array.from(set).sort((a, b) => Number(a) - Number(b));
}

const STATUS_LABEL: Record<Template["sync_status"], string> = {
  draft: "Draft (local)",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  disabled: "Disabled",
};

function statusVariant(s: Template["sync_status"]) {
  switch (s) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
    case "disabled":
      return "destructive";
    default:
      return "outline";
  }
}

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({ meta: [{ title: "Templates · Virrat Reach" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { activeId, membership } = useActiveTenant();
  const allowed = canManage(membership?.role, "admin");
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (membership?.role === "agent") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [membership?.role, navigate]);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "meta" | "manual">("all");
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState<Template | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("tenant_id", activeId!)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Template[];
    },
  });

  const filtered = useMemo(() => {
    let list = templates ?? [];
    if (tab !== "all") list = list.filter((t) => t.source === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.template_name.toLowerCase().includes(q) ||
          (t.category ?? "").toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q),
      );
    }
    return list;
  }, [templates, search, tab]);

  const syncFn = useServerFn(syncMetaTemplates);
  const sync = useMutation({
    mutationFn: async () => syncFn({ data: { tenantId: activeId! } }),
    onSuccess: (r) => {
      const removed = (r as { removed?: number }).removed ?? 0;
      const removedMsg = removed ? ` · ${removed} marked rejected (no longer on Meta)` : "";
      toast.success(`Synced ${r.count} template${r.count === 1 ? "" : "s"} from Meta${removedMsg}`);
      qc.invalidateQueries({ queryKey: ["templates", activeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitFn = useServerFn(submitTemplateToMeta);
  const submit = useMutation({
    mutationFn: async (id: string) => submitFn({ data: { tenantId: activeId!, templateId: id } }),
    onSuccess: (r) => {
      toast.success(
        r.status === "approved"
          ? "Template approved by Meta"
          : r.status === "rejected"
            ? "Meta rejected the template — see status for details"
            : "Submitted to Meta — pending review",
      );
      qc.invalidateQueries({ queryKey: ["templates", activeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const softDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("message_templates")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: ["templates", activeId] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage WhatsApp message templates. Sync approved templates from Meta or author internal
            drafts.
          </p>
        </div>
        {allowed && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => sync.mutate()} disabled={sync.isPending}>
              {sync.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              Sync from Meta
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New Template
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, body…"
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? "No matching templates" : "No templates yet"}
          description={
            search
              ? "Try a different search term."
              : 'Click "Sync from Meta" to pull approved templates, or create a manual draft.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight break-all">
                    {t.template_name}
                  </CardTitle>
                  <Badge variant={statusVariant(t.sync_status)} className="shrink-0">
                    {STATUS_LABEL[t.sync_status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <Badge variant="outline">{t.language}</Badge>
                  {t.category && <Badge variant="outline">{t.category}</Badge>}
                  {t.header_type === "IMAGE" && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      IMAGE
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {t.source}
                  </Badge>
                  <Badge variant="outline">v{t.version}</Badge>
                  <Badge variant="outline">
                    {(t.variables ?? []).length} var{(t.variables ?? []).length === 1 ? "" : "s"}
                  </Badge>
                </div>
                {(t.submitted_at || t.last_sync_at) && (
                  <p className="text-[11px] text-muted-foreground">
                    {t.submitted_at && (
                      <>Submitted {new Date(t.submitted_at).toLocaleDateString()} · </>
                    )}
                    {t.last_sync_at && <>Synced {new Date(t.last_sync_at).toLocaleDateString()}</>}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {t.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setPreviewing(t)}>
                    <Eye className="size-4" /> Preview
                  </Button>
                  {allowed && t.source === "manual" && (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                      <Pencil className="size-4" /> Edit
                    </Button>
                  )}
                  {allowed &&
                    t.source === "manual" &&
                    (t.sync_status === "draft" || t.sync_status === "rejected") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={submit.isPending}
                        onClick={() => submit.mutate(t.id)}
                      >
                        {submit.isPending && submit.variables === t.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                        Submit to Meta
                      </Button>
                    )}
                  {allowed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(t)}
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && activeId && (
        <TemplateEditor
          tenantId={activeId}
          template={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => qc.invalidateQueries({ queryKey: ["templates", activeId] })}
        />
      )}

      <Dialog open={!!previewing} onOpenChange={(o) => !o && setPreviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="break-all">{previewing?.template_name}</DialogTitle>
            <DialogDescription>
              {previewing?.language} · {previewing?.category} · v{previewing?.version}
            </DialogDescription>
          </DialogHeader>
          {previewing && (
            <div className="rounded-lg bg-[#e7f3df] dark:bg-emerald-950/40 p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <div className="rounded-lg bg-background shadow-sm p-3 space-y-2 text-sm">
                {previewing.header_type === "IMAGE" ? (
                  <div className="space-y-2 pb-2 border-b">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Header Type: IMAGE
                    </div>
                    {previewing.example_media_url ? (
                      <img
                        src={previewing.example_media_url}
                        alt="Header Example"
                        className="max-h-40 rounded object-contain w-full bg-muted/20"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded text-center">
                        Image required during campaign creation.
                      </div>
                    )}
                  </div>
                ) : (
                  previewing.header && <div className="font-semibold">{previewing.header}</div>
                )}
                <div className="whitespace-pre-wrap">{previewing.body}</div>
                {previewing.footer && (
                  <div className="text-xs text-muted-foreground">{previewing.footer}</div>
                )}
              </div>
              {(previewing.variables ?? []).length > 0 && (
                <div className="text-xs text-muted-foreground pt-2">
                  Variables: {(previewing.variables ?? []).map((v) => `{{${v}}}`).join(", ")}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.template_name}" will be hidden from this workspace. Meta-sourced templates
              can be re-synced from Meta later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && softDelete.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TemplateEditor({
  tenantId,
  template,
  onClose,
  onSaved,
}: {
  tenantId: string;
  template: Template | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template?.template_name ?? "");
  const [language, setLanguage] = useState(template?.language ?? "en");
  const [category, setCategory] = useState(template?.category ?? "UTILITY");
  const [header, setHeader] = useState(template?.header ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [footer, setFooter] = useState(template?.footer ?? "");
  const [saving, setSaving] = useState(false);

  const [headerType, setHeaderType] = useState<"NONE" | "TEXT" | "IMAGE">(
    (template?.header_type as "NONE" | "TEXT" | "IMAGE") ?? (template?.header ? "TEXT" : "NONE"),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(template?.example_media_url ?? "");

  const variables = useMemo(() => extractVariables(body), [body]);

  const save = async () => {
    if (!name.trim() || !body.trim()) {
      toast.error("Name and body are required");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(name)) {
      toast.error("Name must be lowercase letters, numbers, or underscores");
      return;
    }
    if (headerType === "IMAGE" && !imageUrl) {
      toast.error("An example image is required for Image header templates");
      return;
    }
    setSaving(true);
    try {
      let uploadedUrl = imageUrl;
      if (headerType === "IMAGE" && imageFile) {
        const fileExt = imageFile.name.split(".").pop()?.toLowerCase();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${tenantId}/templates/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("campaign-media")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("campaign-media").getPublicUrl(filePath);
        uploadedUrl = publicUrl;
      }

      const templatePayload = {
        template_name: name,
        language,
        category,
        header: headerType === "TEXT" ? header || null : null,
        body,
        footer: footer || null,
        variables,
        header_type: headerType,
        header_format: headerType,
        example_media_url: headerType === "IMAGE" ? uploadedUrl || null : null,
      };

      if (template) {
        const versionBump = template.body !== body ? template.version + 1 : template.version;
        const { error } = await supabase
          .from("message_templates")
          .update({
            ...templatePayload,
            version: versionBump,
          })
          .eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("message_templates").insert({
          ...templatePayload,
          tenant_id: tenantId,
          version: 1,
          source: "manual",
          sync_status: "draft",
        });
        if (error) throw error;
      }
      toast.success(template ? "Template updated" : "Template created");
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit template" : "New template"}</DialogTitle>
          <DialogDescription>
            Use {"{{1}}"}, {"{{2}}"}… in the body for variables. They map to contact fields when
            building a campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="t-name">Name</Label>
              <Input
                id="t-name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="order_confirmation"
                disabled={!!template}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-lang">Language</Label>
              <Input
                id="t-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="en"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="UTILITY">Utility</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Header Type</Label>
            <Select
              value={headerType}
              onValueChange={(v) => setHeaderType(v as "NONE" | "TEXT" | "IMAGE")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select header type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="IMAGE">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {headerType === "TEXT" && (
            <div className="space-y-1.5">
              <Label htmlFor="t-header">Header text (optional)</Label>
              <Input id="t-header" value={header} onChange={(e) => setHeader(e.target.value)} />
            </div>
          )}
          {headerType === "IMAGE" && (
            <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
              <Label>Header Image Example</Label>
              <p className="text-xs text-muted-foreground">
                Required for Meta template approval. (Max 5MB, JPG/JPEG/PNG only).
              </p>
              {imageUrl ? (
                <div className="space-y-2">
                  <img
                    src={imageUrl}
                    alt="Template Header Preview"
                    className="max-h-40 rounded border object-contain bg-background"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive"
                    onClick={() => {
                      setImageUrl("");
                      setImageFile(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File exceeds maximum size of 5MB");
                        return;
                      }
                      setImageFile(file);
                      setImageUrl(URL.createObjectURL(file));
                    }}
                  />
                </div>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="t-body">Body</Label>
            <Textarea
              id="t-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Hello {{1}}, your order {{2}} is confirmed."
            />
            <p className="text-xs text-muted-foreground">
              Detected variables:{" "}
              {variables.length ? variables.map((v) => `{{${v}}}`).join(", ") : "none"}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-footer">Footer (optional)</Label>
            <Input id="t-footer" value={footer} onChange={(e) => setFooter(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {template ? "Save changes" : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
