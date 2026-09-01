import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Users,
  Tag as TagIcon,
  HelpCircle,
  Building,
  Mail,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { normalizePhone } from "@/lib/phone";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { importContactsBulk } from "@/lib/contacts.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/contacts/import")({
  head: () => ({ meta: [{ title: "Import CSV Contacts · Virrat Reach" }] }),
  component: ImportPage,
});

interface ParsedRow {
  [key: string]: string;
}

function ImportPage() {
  const { activeId } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();
  const importFn = useServerFn(importContactsBulk);
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ParsedRow[] | null>(null);
  const [countryCode, setCountryCode] = useState("91");
  const [importing, setImporting] = useState(false);
  const [autoCreate, setAutoCreate] = useState(true);

  // Column Mappings state
  const [mappings, setMappings] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    tags: "",
    groups: "",
  });

  function detectAndSetMappings(headers: string[]) {
    const nextMappings = { name: "", phone: "", email: "", company: "", tags: "", groups: "" };

    // Find best match for each
    const normalized = headers.map((h) => h.toLowerCase().trim());

    const nameIdx = normalized.findIndex((h) =>
      ["name", "full name", "contact name", "customer name"].includes(h),
    );
    if (nameIdx !== -1) nextMappings.name = headers[nameIdx];

    const phoneIdx = normalized.findIndex((h) =>
      ["phone", "mobile", "number", "whatsapp", "phone number", "normalized phone"].some((p) =>
        h.includes(p),
      ),
    );
    if (phoneIdx !== -1) nextMappings.phone = headers[phoneIdx];

    const emailIdx = normalized.findIndex((h) => ["email", "mail", "email address"].includes(h));
    if (emailIdx !== -1) nextMappings.email = headers[emailIdx];

    const companyIdx = normalized.findIndex((h) =>
      ["company", "org", "organization", "firm", "business"].includes(h),
    );
    if (companyIdx !== -1) nextMappings.company = headers[companyIdx];

    const tagsIdx = normalized.findIndex((h) => ["tags", "tag", "labels", "label"].includes(h));
    if (tagsIdx !== -1) nextMappings.tags = headers[tagsIdx];

    const groupsIdx = normalized.findIndex((h) => ["groups", "group", "lists", "list"].includes(h));
    if (groupsIdx !== -1) nextMappings.groups = headers[groupsIdx];

    setMappings(nextMappings);
  }

  function handleFile(f: File) {
    setFile(f);
    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as ParsedRow[];
        if (!data.length) {
          toast.error("CSV file is empty");
          return;
        }
        const headers = Object.keys(data[0]);
        setCsvHeaders(headers);
        setCsvData(data);
        detectAndSetMappings(headers);
      },
      error: (err) => toast.error(err.message),
    });
  }

  async function runImport() {
    if (!csvData || !activeId || !user) return;
    if (!mappings.phone) {
      toast.error("Please map the required Phone column.");
      return;
    }

    setImporting(true);
    try {
      // 1. Gather all tags & groups that need lookup/creation
      const parsedRows = csvData.map((row) => {
        const rowTags =
          mappings.tags && row[mappings.tags]
            ? row[mappings.tags]
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [];
        const rowGroups =
          mappings.groups && row[mappings.groups]
            ? row[mappings.groups]
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean)
            : [];
        return {
          row,
          tags: rowTags,
          groups: rowGroups,
        };
      });

      // Fetch existing tags and groups
      const [existingTagsRes, existingGroupsRes] = await Promise.all([
        supabase.from("tags").select("id, name").eq("tenant_id", activeId),
        supabase.from("groups").select("id, name").eq("tenant_id", activeId),
      ]);

      const tagsMap = new Map<string, string>(); // name lower -> id
      const groupsMap = new Map<string, string>(); // name lower -> id

      existingTagsRes.data?.forEach((t) => tagsMap.set(t.name.toLowerCase(), t.id));
      existingGroupsRes.data?.forEach((g) => groupsMap.set(g.name.toLowerCase(), g.id));

      // Resolve tag names
      const allTagNames = Array.from(new Set(parsedRows.flatMap((r) => r.tags)));
      const allGroupNames = Array.from(new Set(parsedRows.flatMap((r) => r.groups)));

      if (autoCreate) {
        // Find missing tags
        const missingTags = allTagNames.filter((t) => !tagsMap.has(t.toLowerCase()));
        if (missingTags.length) {
          const { data: newTags, error: tagErr } = await supabase
            .from("tags")
            .insert(missingTags.map((name) => ({ tenant_id: activeId, name })))
            .select("id, name");
          if (tagErr) throw tagErr;
          newTags?.forEach((t) => tagsMap.set(t.name.toLowerCase(), t.id));
        }

        // Find missing groups
        const missingGroups = allGroupNames.filter((g) => !groupsMap.has(g.toLowerCase()));
        if (missingGroups.length) {
          const { data: newGroups, error: groupErr } = await supabase
            .from("groups")
            .insert(
              missingGroups.map((name) => ({
                tenant_id: activeId,
                name,
                created_by: user.id,
              })),
            )
            .select("id, name");
          if (groupErr) throw groupErr;
          newGroups?.forEach((g) => groupsMap.set(g.name.toLowerCase(), g.id));
        }
      }

      // 2. Validate and deduplicate phone numbers
      const seen = new Set<string>();
      const valid: {
        raw: string;
        normalized: string;
        name?: string;
        email?: string;
        company?: string;
        tags: string[]; // tagIds
        groups: string[]; // groupIds
      }[] = [];

      let invalid = 0;
      let duplicate = 0;

      for (const item of parsedRows) {
        const rawPhone = item.row[mappings.phone];
        if (!rawPhone) {
          invalid++;
          continue;
        }

        const n = normalizePhone(rawPhone, { defaultCountryCode: countryCode });
        if (!n.valid || !n.normalized) {
          invalid++;
          continue;
        }

        if (seen.has(n.normalized)) {
          duplicate++;
          continue;
        }
        seen.add(n.normalized);

        const mappedTags = item.tags
          .map((name) => tagsMap.get(name.toLowerCase()))
          .filter(Boolean) as string[];
        const mappedGroups = item.groups
          .map((name) => groupsMap.get(name.toLowerCase()))
          .filter(Boolean) as string[];

        valid.push({
          raw: n.raw,
          normalized: n.normalized,
          name: mappings.name ? item.row[mappings.name]?.trim() : undefined,
          email: mappings.email ? item.row[mappings.email]?.trim() : undefined,
          company: mappings.company ? item.row[mappings.company]?.trim() : undefined,
          tags: mappedTags,
          groups: mappedGroups,
        });
      }

      // Fetch existing contacts database check
      const existingActive = new Set<string>();
      const existingDeleted = new Map<string, string>(); // normalized -> id

      if (valid.length) {
        const { data } = await supabase
          .from("contacts")
          .select("id, phone_number_normalized, deleted_at")
          .eq("tenant_id", activeId)
          .in(
            "phone_number_normalized",
            valid.map((v) => v.normalized),
          );
        for (const d of data ?? []) {
          if (d.deleted_at) existingDeleted.set(d.phone_number_normalized, d.id);
          else existingActive.add(d.phone_number_normalized);
        }
      }

      const toInsert = valid.filter(
        (v) => !existingActive.has(v.normalized) && !existingDeleted.has(v.normalized),
      );
      const toRestore = valid.filter((v) => existingDeleted.has(v.normalized));
      duplicate += valid.length - toInsert.length - toRestore.length;

      // Register import tracking via server function
      const res = await importFn({
        data: {
          tenantId: activeId,
          sourceType: "csv",
          optInSource: null,
          optInDate: null,
          tagIds: [],
          groupIds: [],
          contacts: valid.map((v) => ({
            raw: v.raw,
            normalized: v.normalized,
            name: v.name ?? null,
            email: v.email ?? null,
            company: v.company ?? null,
            wasDeleted: existingDeleted.has(v.normalized),
            tags: v.tags,
            groups: v.groups,
          })),
          totalRows: csvData.length,
          duplicateRows: duplicate,
          invalidRows: invalid,
        },
      });

      if (!res.success) {
        throw new Error("CSV import failed");
      }

      // Success callback
      const successfullyAdded = toInsert.length + toRestore.length;
      toast.success("Import completed", {
        description: (
          <div className="space-y-1 mt-1 text-xs">
            <div>
              • Total Processed: <strong>{csvData.length}</strong>
            </div>
            <div>
              • Successfully Added: <strong>{successfullyAdded}</strong>
            </div>
            <div>
              • Duplicates Skipped: <strong>{duplicate}</strong>
            </div>
            <div>
              • Invalid Records: <strong>{invalid}</strong>
            </div>
          </div>
        ),
      });

      // Reset
      setFile(null);
      setCsvData(null);
      setCsvHeaders([]);
      setMappings({ name: "", phone: "", email: "", company: "", tags: "", groups: "" });

      // Refresh cache
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const csvContent = "name,phone\nJohn Doe,919876543210\nJane Smith,918888888888\nRahul Patil,917777777777\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contacts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Import Contacts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload bulk lists via CSV. Maps columns directly to contact fields.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Pane */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block font-medium">CSV Upload File</Label>
                <label className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary block transition hover:bg-muted/10">
                  <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                  <div className="font-semibold text-sm">
                    {file ? file.name : "Click to select CSV file"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">
                    Select a comma-separated file to map headers. Name and Phone columns are recommended.
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-primary hover:text-primary/80 font-medium h-auto p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      downloadTemplate();
                    }}
                  >
                    Download CSV Template (name, phone)
                  </Button>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cc" className="font-medium text-xs">
                    Default Country Code
                  </Label>
                  <Input
                    id="cc"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="91"
                  />
                </div>
                <div className="flex flex-col justify-end pb-1.5">
                  <div className="flex items-center space-x-2">
                    <Switch id="autoCreate" checked={autoCreate} onCheckedChange={setAutoCreate} />
                    <Label htmlFor="autoCreate" className="cursor-pointer text-xs">
                      Auto-create tags & groups
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Mapped Data Preview */}
          {csvData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="size-4 text-primary" /> Map Preview (First 5 Rows)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verifying {csvData.length} records. Inspect mapped values below.
                  </p>
                </div>
                <Button onClick={runImport} disabled={importing || !mappings.phone}>
                  {importing ? "Processing…" : `Run Import (${csvData.length} rows)`}
                </Button>
              </div>

              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted text-muted-foreground sticky top-0 text-[10px] uppercase font-semibold">
                    <tr className="divide-x divide-border">
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Phone (Req)</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Company</th>
                      <th className="px-3 py-2 text-left">Tags</th>
                      <th className="px-3 py-2 text-left">Groups</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {csvData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="divide-x divide-border hover:bg-muted/10">
                        <td className="px-3 py-2">
                          {mappings.name ? row[mappings.name] || "—" : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-primary font-medium">
                          {mappings.phone ? row[mappings.phone] || "—" : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {mappings.email ? row[mappings.email] || "—" : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {mappings.company ? row[mappings.company] || "—" : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] max-w-[150px] truncate">
                          {mappings.tags ? row[mappings.tags] || "—" : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] max-w-[150px] truncate">
                          {mappings.groups ? row[mappings.groups] || "—" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* MAPPING CONFIGURATION PANEL */}
        <div>
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <Database className="size-4 text-primary" /> Column Mappings
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Link spreadsheet headers to your CRM fields.
              </p>
            </div>

            {!csvHeaders.length ? (
              <div className="text-xs text-muted-foreground py-6 text-center">
                Upload a CSV file to configure header mapping.
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                {/* Phone Mapping */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="size-3 text-primary" /> Phone Number{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={mappings.phone}
                    onValueChange={(val) => setMappings((prev) => ({ ...prev, phone: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select column…" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Mapping */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <User className="size-3" /> Full Name
                  </Label>
                  <Select
                    value={mappings.name}
                    onValueChange={(val) => setMappings((prev) => ({ ...prev, name: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Skip mapping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-xs">
                        Skip mapping
                      </SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Mapping */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Mail className="size-3" /> Email Address
                  </Label>
                  <Select
                    value={mappings.email}
                    onValueChange={(val) => setMappings((prev) => ({ ...prev, email: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Skip mapping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-xs">
                        Skip mapping
                      </SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Mapping */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Building className="size-3" /> Company
                  </Label>
                  <Select
                    value={mappings.company}
                    onValueChange={(val) => setMappings((prev) => ({ ...prev, company: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Skip mapping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-xs">
                        Skip mapping
                      </SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Mapping */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <TagIcon className="size-3" /> Labels/Tags (Comma list)
                  </Label>
                  <Select
                    value={mappings.tags}
                    onValueChange={(val) => setMappings((prev) => ({ ...prev, tags: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Skip mapping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-xs">
                        Skip mapping
                      </SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Groups Mapping */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="size-3" /> Groups/Folders (Comma list)
                  </Label>
                  <Select
                    value={mappings.groups}
                    onValueChange={(val) => setMappings((prev) => ({ ...prev, groups: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Skip mapping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-xs">
                        Skip mapping
                      </SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
