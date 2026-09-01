import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { normalizePhone, dedupeNormalized } from "@/lib/phone";
import { CheckCircle2, XCircle, AlertCircle, ListChecks } from "lucide-react";
import { CreatorMultiSelect } from "@/components/CreatorMultiSelect";
import { useServerFn } from "@tanstack/react-start";
import { importContactsBulk } from "@/lib/contacts.functions";

export const Route = createFileRoute("/_authenticated/contacts/bulk")({
  head: () => ({ meta: [{ title: "Bulk Add Contacts · Virrat Reach" }] }),
  component: BulkAdd,
});

interface Row {
  raw: string;
  name: string;
  normalized: string | null;
  valid: boolean;
  reason?: string;
  isDuplicate?: boolean;
  isExisting?: boolean;
  wasDeleted?: boolean;
}

function BulkAdd() {
  const { activeId } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();
  const importFn = useServerFn(importContactsBulk);
  const [text, setText] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [optInSource, setOptInSource] = useState("");
  const [optInDate, setOptInDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<Row[] | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch Tags
  const { data: tags } = useQuery({
    queryKey: ["tags", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name")
        .eq("tenant_id", activeId!)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch Groups
  const { data: groups } = useQuery({
    queryKey: ["groups", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .eq("tenant_id", activeId!)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Inline Tag Creator
  async function handleCreateTag(name: string): Promise<string> {
    if (!activeId) throw new Error("No active tenant");
    const { data, error } = await supabase
      .from("tags")
      .insert({ tenant_id: activeId, name })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success(`Tag "${name}" created`);
    qc.invalidateQueries({ queryKey: ["tags"] });
    qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
    return data.id;
  }

  // Inline Group Creator
  async function handleCreateGroup(name: string): Promise<string> {
    if (!activeId || !user) throw new Error("No active tenant or user");
    const { data, error } = await supabase
      .from("groups")
      .insert({ tenant_id: activeId, name, created_by: user.id })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success(`Group "${name}" created`);
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
    return data.id;
  }

  async function validate() {
    if (!activeId) return;
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) {
      toast.error("Paste at least one contact");
      return;
    }
    const normalized: Row[] = lines.map((line) => {
      let name = "";
      let rawPhone = line;

      // Support comma or tab as separator
      const sep = line.includes("\t") ? "\t" : ",";
      const firstSep = line.indexOf(sep);

      if (firstSep !== -1) {
        const part1 = line.slice(0, firstSep).trim();
        const part2 = line.slice(firstSep + 1).trim();

        // Check which part looks like a phone number (contains mostly digits, +, spaces, dashes)
        const looksLikePhone = (s: string) => /^[\d\s\+\-\(\)]{6,}$/.test(s);

        if (looksLikePhone(part2) && !looksLikePhone(part1)) {
          // Format: Name,Phone
          name = part1;
          rawPhone = part2;
        } else if (looksLikePhone(part1) && !looksLikePhone(part2)) {
          // Format: Phone,Name
          name = part2;
          rawPhone = part1;
        } else if (looksLikePhone(part2)) {
          // Both could be phones, treat as Name,Phone
          name = part1;
          rawPhone = part2;
        }
        // else: no comma structure matched, treat whole line as phone
      }

      const normResult = normalizePhone(rawPhone, { defaultCountryCode: countryCode });
      return {
        raw: rawPhone,
        name: name,
        normalized: normResult.normalized,
        valid: normResult.valid,
        reason: normResult.reason,
      };
    });
    const { duplicates } = dedupeNormalized(normalized);
    const dupSet = new Set(duplicates.map((d) => d.normalized));

    const validNumbers = normalized
      .filter((r) => r.valid && r.normalized)
      .map((r) => r.normalized!) as string[];
    const existingActive = new Set<string>();
    const existingDeleted = new Set<string>();
    if (validNumbers.length) {
      const { data } = await supabase
        .from("contacts")
        .select("phone_number_normalized, deleted_at")
        .eq("tenant_id", activeId)
        .in("phone_number_normalized", validNumbers);
      for (const d of data ?? []) {
        if (d.deleted_at) existingDeleted.add(d.phone_number_normalized);
        else existingActive.add(d.phone_number_normalized);
      }
    }

    setPreview(
      normalized.map((r) => ({
        ...r,
        isDuplicate: r.normalized ? dupSet.has(r.normalized) : false,
        isExisting: r.normalized ? existingActive.has(r.normalized) : false,
        wasDeleted: r.normalized ? existingDeleted.has(r.normalized) : false,
      })),
    );
  }

  const summary = useMemo(() => {
    if (!preview) return null;
    const seen = new Set<string>();
    let valid = 0;
    let invalid = 0;
    let duplicate = 0;
    let willSave = 0;
    let willRestore = 0;
    for (const r of preview) {
      if (!r.valid) {
        invalid++;
        continue;
      }
      valid++;
      const dupOrExisting = r.isExisting || (r.normalized && seen.has(r.normalized));
      if (dupOrExisting) {
        duplicate++;
      } else {
        if (r.wasDeleted) willRestore++;
        else willSave++;
        if (r.normalized) seen.add(r.normalized);
      }
    }
    return { valid, invalid, duplicate, willSave, willRestore, willTotal: willSave + willRestore };
  }, [preview]);

  async function save() {
    if (!preview || !activeId || !user) return;
    setSaving(true);
    try {
      const seen = new Set<string>();
      const working = preview
        .filter((r) => r.valid && r.normalized && !r.isExisting)
        .filter((r) => {
          if (seen.has(r.normalized!)) return false;
          seen.add(r.normalized!);
          return true;
        });

      const res = await importFn({
        data: {
          tenantId: activeId,
          sourceType: "bulk_paste",
          optInSource: optInSource || null,
          optInDate: optInSource ? optInDate : null,
          tagIds,
          groupIds,
          contacts: working.map((r) => ({
            raw: r.raw,
            normalized: r.normalized!,
            name: r.name || null,
            wasDeleted: !!r.wasDeleted,
          })),
          totalRows: preview.length,
          duplicateRows: summary?.duplicate ?? 0,
          invalidRows: summary?.invalid ?? 0,
        },
      });

      if (!res.success) {
        throw new Error("Bulk import failed");
      }

      const totalProcessed = preview.length;
      const successfullyAdded = working.length;
      const duplicatesSkipped = summary?.duplicate ?? 0;
      const failedRecords = summary?.invalid ?? 0;

      toast.success("Import completed", {
        description: (
          <div className="space-y-1 mt-1 text-xs">
            <div>
              • Total Processed: <strong>{totalProcessed}</strong>
            </div>
            <div>
              • Successfully Added: <strong>{successfullyAdded}</strong> (new + restored)
            </div>
            <div>
              • Duplicates Skipped: <strong>{duplicatesSkipped}</strong>
            </div>
            <div>
              • Failed Records: <strong>{failedRecords}</strong>
            </div>
          </div>
        ),
      });
      setText("");
      setPreview(null);
      setTagIds([]);
      setGroupIds([]);
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save contacts");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Bulk Paste Import</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste contacts in "Name,Phone" or "Phone only" format, auto-deduplicate, and tag them inline.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="numbers" className="mb-2 block font-medium">
              Paste Contacts (Name, Phone or Phone only)
            </Label>
            <Textarea
              id="numbers"
              rows={8}
              placeholder={`Paste contacts here...\nSupports:\nJohn Doe,919876543210\n919876543210,John Doe\n919876543210\nJohn Doe\t919876543210`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-mono text-sm bg-background"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cc" className="mb-2 block font-medium">
                Default Country Code
              </Label>
              <Input
                id="cc"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, ""))}
                placeholder="91"
              />
            </div>
            <div>
              <Label htmlFor="opt" className="mb-2 block font-medium">
                Opt-in Source
              </Label>
              <Input
                id="opt"
                value={optInSource}
                onChange={(e) => setOptInSource(e.target.value)}
                placeholder="e.g. Website checkout, Lead form"
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Opt-in Date</Label>
              <Input type="date" value={optInDate} onChange={(e) => setOptInDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block font-medium">Add Tags/Labels</Label>
              <CreatorMultiSelect
                options={(tags ?? []).map((t) => ({ id: t.id, label: t.name }))}
                value={tagIds}
                onChange={setTagIds}
                placeholder="Select tags..."
                emptyLabel="No tags yet. Type to create one inline."
                onCreate={handleCreateTag}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block font-medium">Add to Folder Groups</Label>
              <CreatorMultiSelect
                options={(groups ?? []).map((g) => ({ id: g.id, label: g.name }))}
                value={groupIds}
                onChange={setGroupIds}
                placeholder="Select groups..."
                emptyLabel="No groups yet. Type to create one inline."
                onCreate={handleCreateGroup}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={validate} disabled={!text.trim()}>
              <ListChecks className="size-4 mr-1" /> Validate Numbers
            </Button>
          </div>
        </div>
      </Card>

      {preview && summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Valid" value={summary.valid} tone="success" icon={CheckCircle2} />
            <SummaryCard
              label="Duplicate"
              value={summary.duplicate}
              tone="warning"
              icon={AlertCircle}
            />
            <SummaryCard
              label="Invalid"
              value={summary.invalid}
              tone="destructive"
              icon={XCircle}
            />
            <SummaryCard
              label="Will Save"
              value={summary.willTotal}
              tone="primary"
              icon={ListChecks}
            />
          </div>

          <Card className="p-0 overflow-hidden border border-border">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground sticky top-0 uppercase text-[10px] font-semibold">
                  <tr className="divide-x divide-border">
                    <th className="text-left px-4 py-2 font-medium">Name</th>
                    <th className="text-left px-4 py-2 font-medium">Original Raw</th>
                    <th className="text-left px-4 py-2 font-medium">Cleaned Normal</th>
                    <th className="text-left px-4 py-2 font-medium">Import Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((r, i) => {
                    const status = !r.valid
                      ? { label: r.reason ?? "Invalid", tone: "destructive" as const }
                      : r.isExisting
                        ? { label: "Already exists", tone: "warning" as const }
                        : r.isDuplicate
                          ? { label: "Duplicate in list", tone: "warning" as const }
                          : r.wasDeleted
                            ? { label: "Restoring soft-delete", tone: "success" as const }
                            : { label: "New contact", tone: "success" as const };
                    return (
                      <tr key={i} className="divide-x divide-border hover:bg-muted/10">
                        <td className="px-4 py-2 text-foreground font-medium">{r.name || "—"}</td>
                        <td className="px-4 py-2 font-mono text-muted-foreground">{r.raw}</td>
                        <td className="px-4 py-2 font-mono font-medium text-foreground">
                          {r.normalized ? `+${r.normalized}` : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="sticky bottom-4 flex justify-end gap-2 bg-card border rounded-xl p-4 shadow-lg">
            <Button variant="outline" onClick={() => setPreview(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || summary.willTotal === 0}>
              {saving
                ? "Importing…"
                : `Save ${summary.willTotal} Contact${summary.willTotal === 1 ? "" : "s"}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "destructive" | "primary";
  icon: typeof CheckCircle2;
}) {
  const cls =
    tone === "success"
      ? "bg-primary-soft text-primary"
      : tone === "warning"
        ? "bg-warning-soft text-warning-foreground"
        : tone === "destructive"
          ? "bg-destructive-soft text-destructive"
          : "bg-info-soft text-info";
  return (
    <Card className="p-4 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            {label}
          </div>
          <div className="text-2xl font-bold mt-1 tracking-tight">{value}</div>
        </div>
        <div className={"size-9 rounded-lg grid place-items-center " + cls}>
          <Icon className="size-4.5" />
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "destructive";
  children: React.ReactNode;
}) {
  const cls =
    tone === "success"
      ? "bg-primary-soft text-primary"
      : tone === "warning"
        ? "bg-warning-soft text-warning-foreground"
        : "bg-destructive-soft text-destructive";
  return (
    <span className={"px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide " + cls}>
      {children}
    </span>
  );
}
