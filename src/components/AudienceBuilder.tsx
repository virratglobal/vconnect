import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/MultiSelect";
import { supabase } from "@/integrations/supabase/client";
import { previewCampaign } from "@/lib/campaigns.functions";
import { getAudienceContacts, saveSavedAudience } from "@/lib/contacts.functions";
import {
  Users,
  Tag,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface AudienceCriteria {
  mode: "all" | "tags" | "groups" | "audience_builder";
  ids?: string[]; // for backwards compatibility
  includeGroups: string[];
  includeTags: string[];
  excludeGroups: string[];
  excludeTags: string[];
  savedAudienceId?: string | null;
  manualContactIds: string[];
  freezeAudience?: boolean;
}

export function AudienceBuilder({
  tenantId,
  value,
  onChange,
  templateId,
  variableMapping = {},
  mediaUrl = null,
}: {
  tenantId: string;
  value: AudienceCriteria;
  onChange: (next: AudienceCriteria) => void;
  templateId?: string | null;
  variableMapping?: Record<string, string>;
  mediaUrl?: string | null;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const previewFn = useServerFn(previewCampaign);
  const getContactsFn = useServerFn(getAudienceContacts);
  const saveAudienceFn = useServerFn(saveSavedAudience);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [audienceName, setAudienceName] = useState("");
  const [audienceDesc, setAudienceDesc] = useState("");
  const [savingAudience, setSavingAudience] = useState(false);

  // Preview Pagination
  const [previewPage, setPreviewPage] = useState(0);
  const [previewSearch, setPreviewSearch] = useState("");

  // Queries for Tags & Groups
  const { data: tags } = useQuery({
    queryKey: ["campaigns:tags", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("id, name").eq("tenant_id", tenantId);
      return data ?? [];
    },
  });

  const { data: groups } = useQuery({
    queryKey: ["campaigns:groups", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("id, name, created_by").eq("tenant_id", tenantId);
      return data ?? [];
    },
  });

  const formattedGroups = useMemo(() => {
    if (!groups) return [];
    return groups.map((g: any) => {
      const isShared = g.created_by && g.created_by !== user?.id;
      return {
        id: g.id,
        name: isShared ? `${g.name} (Shared)` : g.name,
      };
    });
  }, [groups, user?.id]);

  // Query for Saved Audiences
  const { data: savedAudiences } = useQuery({
    queryKey: ["saved-audiences", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_audiences")
        .select("id, name, description, criteria")
        .eq("tenant_id", tenantId)
        .order("name");
      return data ?? [];
    },
  });

  // Calculate live statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["audience-stats", tenantId, templateId, value, variableMapping, mediaUrl],
    enabled: !!tenantId && !!templateId,
    queryFn: async () => {
      try {
        const res = await previewFn({
          data: {
            tenantId,
            name: "Live Stats",
            templateId: templateId!,
            audience: value,
            variableMapping,
            scheduledAt: null,
            mediaUrl: mediaUrl || null,
          },
        });
        return res;
      } catch (err) {
        console.error(err);
        return {
          error: (err as Error).message,
          totalRecipients: 0,
          excludedCount: 0,
          duplicateCount: 0,
        };
      }
    },
  });

  // Query for paginated preview list
  const { data: previewContacts, isLoading: isPreviewLoading } = useQuery({
    queryKey: [
      "audience-preview-contacts",
      tenantId,
      value,
      previewSearch,
      previewPage,
      previewOpen,
    ],
    enabled: !!tenantId && previewOpen,
    queryFn: async () => {
      const res = await getContactsFn({
        data: {
          tenantId,
          audience: value,
          search: previewSearch,
          page: previewPage,
          pageSize: 10,
        },
      });
      return res;
    },
  });

  // Sync Saved Audience Criteria when selected
  function handleSelectSavedAudience(saId: string) {
    if (!saId) {
      onChange({
        ...value,
        savedAudienceId: null,
      });
      return;
    }
    const sa = savedAudiences?.find((item) => item.id === saId);
    if (sa && sa.criteria) {
      const crit = sa.criteria as any;
      onChange({
        ...value,
        savedAudienceId: saId,
        includeGroups: crit.includeGroups ?? [],
        includeTags: crit.includeTags ?? [],
        excludeGroups: crit.excludeGroups ?? [],
        excludeTags: crit.excludeTags ?? [],
      });
    }
  }

  // Save Audience Criteria to DB
  async function handleSaveAudience() {
    if (!audienceName.trim()) {
      toast.error("Please enter a name for the audience");
      return;
    }
    setSavingAudience(true);
    try {
      const criteria = {
        includeGroups: value.includeGroups,
        includeTags: value.includeTags,
        excludeGroups: value.excludeGroups,
        excludeTags: value.excludeTags,
      };
      const res = await saveAudienceFn({
        data: {
          tenantId,
          name: audienceName.trim(),
          description: audienceDesc.trim() || null,
          criteria,
        },
      });
      toast.success("Audience saved successfully");
      setSaveOpen(false);
      setAudienceName("");
      setAudienceDesc("");
      qc.invalidateQueries({ queryKey: ["saved-audiences"] });
      // Select the newly created audience
      onChange({
        ...value,
        savedAudienceId: res.id,
      });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingAudience(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Target Mode</Label>
          <Select
            value={value.mode}
            onValueChange={(val) =>
              onChange({
                ...value,
                mode: val as any,
                savedAudienceId: null,
                includeGroups: [],
                includeTags: [],
                excludeGroups: [],
                excludeTags: [],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Entire Contact List</SelectItem>
              <SelectItem value="audience_builder">
                Audience Builder (Rules & Exclusions)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.mode === "audience_builder" && (
          <div className="space-y-1.5">
            <Label>Load Saved Audience</Label>
            <Select
              value={value.savedAudienceId || "none"}
              onValueChange={(val) => handleSelectSavedAudience(val === "none" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a saved template…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Create Custom Rule</SelectItem>
                {(savedAudiences ?? []).map((sa) => (
                  <SelectItem key={sa.id} value={sa.id}>
                    {sa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {value.mode === "audience_builder" && (
        <Card className="p-4 space-y-4 bg-muted/10 border-dashed">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Users className="size-4 text-primary" /> Target Selection Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold">
                Include Groups (OR)
              </Label>
              <MultiSelect
                options={formattedGroups.map((g: any) => ({ id: g.id, label: g.name }))}
                value={value.includeGroups}
                onChange={(next) =>
                  onChange({ ...value, includeGroups: next, savedAudienceId: null })
                }
                placeholder="Target these groups…"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold">
                Include Tags (OR)
              </Label>
              <MultiSelect
                options={(tags ?? []).map((t) => ({ id: t.id, label: t.name }))}
                value={value.includeTags}
                onChange={(next) =>
                  onChange({ ...value, includeTags: next, savedAudienceId: null })
                }
                placeholder="Target these tags…"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-destructive uppercase font-semibold">
                Exclude Groups
              </Label>
              <MultiSelect
                options={formattedGroups.map((g: any) => ({ id: g.id, label: g.name }))}
                value={value.excludeGroups}
                onChange={(next) =>
                  onChange({ ...value, excludeGroups: next, savedAudienceId: null })
                }
                placeholder="Exclude these groups…"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-destructive uppercase font-semibold">
                Exclude Tags
              </Label>
              <MultiSelect
                options={(tags ?? []).map((t) => ({ id: t.id, label: t.name }))}
                value={value.excludeTags}
                onChange={(next) =>
                  onChange({ ...value, excludeTags: next, savedAudienceId: null })
                }
                placeholder="Exclude these tags…"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {!value.savedAudienceId && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => setSaveOpen(true)}
                disabled={
                  !value.includeGroups.length &&
                  !value.includeTags.length &&
                  !value.excludeGroups.length &&
                  !value.excludeTags.length
                }
              >
                <Save className="size-3.5" /> Save Audience Template
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => {
                setPreviewPage(0);
                setPreviewOpen(true);
              }}
            >
              Preview Audience list
            </Button>
          </div>
        </Card>
      )}

      {/* Live Recipient Metrics card */}
      {templateId && (stats as any)?.error && (
        <Card className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-start gap-2.5 rounded-lg mb-3">
          <AlertCircle className="size-4.5 mt-0.5 flex-shrink-0 text-red-600" />
          <div className="space-y-1">
            <div className="font-semibold text-red-700">Audience Validation Error:</div>
            <div className="opacity-95 leading-relaxed">
              {(() => {
                const str = String((stats as any).error);
                if (str.includes("VALIDATION_FAILED:")) {
                  try {
                    const jsonStr = str.substring(str.indexOf(":") + 1);
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.issues?.length) {
                      return `Variable mapping validation failed: Please map all variables. (Affected template has ${parsed.totalIssues || parsed.issues.length} variables or issues)`;
                    }
                    return parsed.message || str;
                  } catch {
                    return str;
                  }
                }
                if (str.includes("PHONE_VALIDATION_FAILED:")) {
                  try {
                    const jsonStr = str.substring(str.indexOf(":") + 1);
                    const parsed = JSON.parse(jsonStr);
                    return parsed.message || str;
                  } catch {
                    return str;
                  }
                }
                return str;
              })()}
            </div>
          </div>
        </Card>
      )}

      {templateId && (
        <Card className="p-3 bg-primary-soft/10 border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1">
              {isStatsLoading ? (
                <Loader2 className="size-3.5 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              )}
              Matching Recipients:{" "}
              <strong className="text-sm font-bold tabular-nums ml-0.5">
                {isStatsLoading
                  ? "Calculating…"
                  : (stats as any)?.error
                    ? "0"
                    : (stats?.totalRecipients ?? 0)}
              </strong>
            </span>

            {value.mode === "audience_builder" && !isStatsLoading && !(stats as any)?.error && (
              <>
                <span className="text-muted-foreground">
                  Duplicates Removed: <strong>{stats?.duplicateCount ?? 0}</strong>
                </span>
                <span className="text-muted-foreground">
                  Excluded Contacts: <strong>{stats?.excludedCount ?? 0}</strong>
                </span>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Audience List</DialogTitle>
            <DialogDescription>
              Verify contacts matches before scheduling campaign. (Showing max 5,000 matches)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!previewContacts?.permissionDenied && (
              <div className="flex gap-2">
                <Input
                  placeholder="Search matching name or phone number normalized…"
                  value={previewSearch}
                  onChange={(e) => {
                    setPreviewPage(0);
                    setPreviewSearch(e.target.value);
                  }}
                />
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Groups</th>
                    <th className="p-2.5">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isPreviewLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
                        Resolving matches…
                      </td>
                    </tr>
                  ) : previewContacts?.permissionDenied ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground font-sans">
                        <div className="flex flex-col items-center justify-center space-y-2 py-6">
                          <span className="p-3 bg-destructive/10 text-destructive rounded-full">
                            <AlertCircle className="size-6" />
                          </span>
                          <p className="font-semibold text-foreground">Access Restricted</p>
                          <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            You do not have View Contacts permission for this shared audience. Contact list details are hidden.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : previewContacts?.rows?.length ? (
                    previewContacts.rows.map((r: any) => {
                      const grps = (r.contact_groups ?? [])
                        .map((cg: any) => cg.groups?.name)
                        .filter(Boolean);
                      const tgs = (r.contact_tags ?? [])
                        .map((ct: any) => ct.tags?.name)
                        .filter(Boolean);
                      return (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="p-2.5 font-medium">{r.name || "Unnamed"}</td>
                          <td className="p-2.5 font-mono text-xs">+{r.phone_number_normalized}</td>
                          <td className="p-2.5">
                            <div className="flex flex-wrap gap-1">
                              {grps.map((g: string) => (
                                <span
                                  key={g}
                                  className="px-1.5 py-0.5 rounded bg-info-soft text-info text-[10px] font-medium"
                                >
                                  {g}
                                </span>
                              ))}
                              {!grps.length && (
                                <span className="text-muted-foreground text-[10px]">—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="flex flex-wrap gap-1">
                              {tgs.map((t: string) => (
                                <span
                                  key={t}
                                  className="px-1.5 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium"
                                >
                                  {t}
                                </span>
                              ))}
                              {!tgs.length && (
                                <span className="text-muted-foreground text-[10px]">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground font-sans">
                        No matching contacts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {previewContacts && !previewContacts.permissionDenied && previewContacts.total > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Showing {previewPage * 10 + 1}–
                  {Math.min((previewPage + 1) * 10, previewContacts.total)} of{" "}
                  {previewContacts.total} matching
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={previewPage === 0}
                    onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={(previewPage + 1) * 10 >= previewContacts.total}
                    onClick={() => setPreviewPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Audience Dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Audience Template</DialogTitle>
            <DialogDescription>
              Save this rules configuration so you can easily target it in future campaigns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Audience Template Name</Label>
              <Input
                placeholder="e.g. VIP Customers, Hot Leads"
                value={audienceName}
                onChange={(e) => setAudienceName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe who matches this audience…"
                value={audienceDesc}
                onChange={(e) => setAudienceDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAudience} disabled={savingAudience}>
              {savingAudience ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              Save Audience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
