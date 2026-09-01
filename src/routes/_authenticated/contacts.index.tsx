import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  ArrowUpDown,
  Loader2,
  Calendar,
  Building,
  Mail,
  Phone as PhoneIcon,
  Tag as TagIcon,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { normalizePhone } from "@/lib/phone";
import { CreatorMultiSelect } from "@/components/CreatorMultiSelect";
import { MultiSelect } from "@/components/MultiSelect";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import {
  getContactsList,
  saveContact,
  bulkUpdateContacts,
  getContactDetails,
} from "@/lib/contacts.functions";

export const Route = createFileRoute("/_authenticated/contacts/")({
  component: ContactsList,
});

function ContactsList() {
  const { activeId, membership } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();

  const getContactsFn = useServerFn(getContactsList);
  const saveContactFn = useServerFn(saveContact);
  const bulkUpdateFn = useServerFn(bulkUpdateContacts);
  const getDetailsFn = useServerFn(getContactDetails);

  const canEdit = canManage(membership?.role, "agent");
  const isManager = canManage(membership?.role, "manager");
  const defaultTab = isManager ? "all_contacts" : "my_contacts";

  // State: Search & Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterCreatedStart, setFilterCreatedStart] = useState("");
  const [filterCreatedEnd, setFilterCreatedEnd] = useState("");
  const [filterCampaignId, setFilterCampaignId] = useState("");
  const [filterConvStatus, setFilterConvStatus] = useState("");
  const [filterAgentId, setFilterAgentId] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterSource, setFilterSource] = useState("");

  // Update active tab when default tab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Reset active contact selection when active tenant changes
  useEffect(() => {
    setDetailContactId(null);
    setSelected(new Set());
  }, [activeId]);

  // State: Pagination & Sorting
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // State: Selection & Modals
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; label: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [detailContactId, setDetailContactId] = useState<string | null>(null);
  const [targetAgentId, setTargetAgentId] = useState("");

  // State: Duplicate Choices Modal
  const [duplicateChoice, setDuplicateChoice] = useState<{
    contactId: string;
    name: string;
    payload: any;
  } | null>(null);

  // State: Bulk Edit Modal
  const [bulkAction, setBulkAction] = useState<
    "add_tags" | "remove_tags" | "add_groups" | "remove_groups" | "transfer_ownership" | null
  >(null);
  const [bulkTargetIds, setBulkTargetIds] = useState<string[]>([]);
  const [bulkTagIds, setBulkTagIds] = useState<string[]>([]);
  const [bulkGroupIds, setBulkGroupIds] = useState<string[]>([]);
  const [applyingBulk, setApplyingBulk] = useState(false);

  // Reset page on filter changes
  useEffect(() => {
    setPage(0);
  }, [
    search,
    filterTags,
    filterGroups,
    filterCreatedStart,
    filterCreatedEnd,
    filterCampaignId,
    filterConvStatus,
    filterAgentId,
    filterCountry,
    filterSource,
    activeTab,
  ]);

  // Fetch Filters references list
  const { data: allTags } = useQuery({
    queryKey: ["tags", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("tags")
        .select("id, name")
        .eq("tenant_id", activeId!)
        .order("name");
      return data ?? [];
    },
  });

  const { data: allGroups } = useQuery({
    queryKey: ["groups", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("groups")
        .select("id, name")
        .eq("tenant_id", activeId!)
        .order("name");
      return data ?? [];
    },
  });

  const { data: allCampaigns } = useQuery({
    queryKey: ["campaigns-list", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("tenant_id", activeId!)
        .is("deleted_at", null)
        .order("name");
      return data ?? [];
    },
  });

  const { data: allAgents } = useQuery({
    queryKey: ["agents-list", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_members")
        .select("user_id, profiles!tenant_members_user_id_profiles_fkey(full_name, email)")
        .eq("tenant_id", activeId!);
      return (data ?? []).map((m: any) => ({
        id: m.user_id,
        name: m.profiles?.full_name || m.profiles?.email || "Agent",
      }));
    },
  });

  // Query: Fetch Contacts list
  const { data, isLoading } = useQuery({
    queryKey: [
      "contacts",
      activeId,
      search,
      page,
      pageSize,
      sortBy,
      sortOrder,
      filterTags,
      filterGroups,
      filterCreatedStart,
      filterCreatedEnd,
      filterCampaignId,
      filterConvStatus,
      filterAgentId,
      filterCountry,
      filterSource,
      activeTab,
    ],
    enabled: !!activeId,
    queryFn: async () => {
      return getContactsFn({
        data: {
          tenantId: activeId!,
          search,
          page,
          pageSize,
          sortBy,
          sortOrder,
          filters: {
            tagIds: filterTags.length ? filterTags : undefined,
            groupIds: filterGroups.length ? filterGroups : undefined,
            createdStart: filterCreatedStart || undefined,
            createdEnd: filterCreatedEnd || undefined,
            campaignId: filterCampaignId || undefined,
            conversationStatus: filterConvStatus || undefined,
            assignedAgentId: filterAgentId || undefined,
            country: filterCountry || undefined,
            creatorId: activeTab === "my_contacts" || activeTab === "imported_by_me" ? user?.id : undefined,
            source: activeTab === "imported" || activeTab === "imported_by_me" ? "csv_import" : (filterSource || undefined),
            recentlyAdded: activeTab === "recently_added" ? true : undefined,
          },
        },
      });
    },
  });

  // Query: Contact Details
  const { data: detailsData, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["contact-details", detailContactId, activeId],
    enabled: !!detailContactId && !!activeId,
    queryFn: async () => {
      return getDetailsFn({
        data: {
          contactId: detailContactId!,
          tenantId: activeId!,
        },
      });
    },
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Sorting Handler
  function toggleSort(col: string) {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  }

  // Soft Delete Handler
  async function handleSoftDelete(ids: string[]) {
    if (!ids.length) return;
    try {
      await bulkUpdateFn({
        data: {
          tenantId: activeId!,
          action: "delete",
          contactIds: ids,
        },
      });
      toast.success(`Deleted ${ids.length} contact(s) successfully`);
      setSelected(new Set());
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  // Bulk Tags/Groups Application
  async function handleApplyBulk() {
    if (!bulkAction) return;
    setApplyingBulk(true);
    try {
      await bulkUpdateFn({
        data: {
          tenantId: activeId!,
          action: bulkAction,
          contactIds: bulkTargetIds,
          tagIds: bulkTagIds,
          groupIds: bulkGroupIds,
          targetAgentId: bulkAction === "transfer_ownership" ? targetAgentId : undefined,
        },
      });
      toast.success("Bulk update applied successfully");
      setBulkAction(null);
      setSelected(new Set());
      setBulkTagIds([]);
      setBulkGroupIds([]);
      setTargetAgentId("");
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
      qc.invalidateQueries({ queryKey: ["contact-details"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setApplyingBulk(false);
    }
  }

  // Selection helpers
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  function toggleAll() {
    if (allSelected) {
      const next = new Set(selected);
      rows.forEach((r) => next.delete(r.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      rows.forEach((r) => next.add(r.id));
      setSelected(next);
    }
  }
  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  // CSV Export
  function exportCsv() {
    if (!rows.length) return;
    const csvRows = [
      ["Name", "Phone", "Email", "Company", "Tags", "Groups", "Created Date"],
      ...rows.map((c) => [
        c.name ?? "",
        `+${c.phone_number_normalized}`,
        c.email ?? "",
        c.company ?? "",
        c.tags.map((t) => t.name).join("; "),
        c.groups.map((g) => g.name).join("; "),
        new Date(c.created_at).toLocaleString(),
      ]),
    ];
    const csv = csvRows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Sub-navigation tabs for Ownership & Recency Filters */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {isManager ? (
          <>
            <button
              onClick={() => setActiveTab("all_contacts")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "all_contacts"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              All Contacts
            </button>
            <button
              onClick={() => setActiveTab("my_contacts")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "my_contacts"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              My Contacts
            </button>
            <button
              onClick={() => setActiveTab("recently_added")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "recently_added"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Recently Added
            </button>
            <button
              onClick={() => setActiveTab("imported")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "imported"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Imported
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("my_contacts")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "my_contacts"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              My Contacts
            </button>
            <button
              onClick={() => setActiveTab("recently_added")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "recently_added"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Recently Added
            </button>
            <button
              onClick={() => setActiveTab("imported_by_me")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "imported_by_me"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Imported By Me
            </button>
          </>
        )}
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts, tags, groups, or notes…"
            className="pl-9 bg-card"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-primary text-primary" : ""}
        >
          <Filter className="size-4" /> Filters
        </Button>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
            <Download className="size-4" /> Export
          </Button>
          {canEdit && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add Contact
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-4 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Filter Groups</Label>
            <MultiSelect
              options={(allGroups ?? []).map((g) => ({ id: g.id, label: g.name }))}
              value={filterGroups}
              onChange={setFilterGroups}
              placeholder="All Groups"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Filter Tags</Label>
            <MultiSelect
              options={(allTags ?? []).map((t) => ({ id: t.id, label: t.name }))}
              value={filterTags}
              onChange={setFilterTags}
              placeholder="All Tags"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Campaign</Label>
            <Select
              value={filterCampaignId || "all"}
              onValueChange={(val) => setFilterCampaignId(val === "all" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {(allCampaigns ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isManager && (
            <div className="space-y-1">
              <Label className="text-muted-foreground font-semibold">Assigned Agent</Label>
              <Select
                value={filterAgentId || "all"}
                onValueChange={(val) => setFilterAgentId(val === "all" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {(allAgents ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {isManager && (
            <div className="space-y-1">
              <Label className="text-muted-foreground font-semibold">Source</Label>
              <Select
                value={filterSource || "all"}
                onValueChange={(val) => setFilterSource(val === "all" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="csv_import">CSV Import</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="campaign_reply">Campaign Reply</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="future">Future</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Conversation Status</Label>
            <Select
              value={filterConvStatus || "all"}
              onValueChange={(val) => setFilterConvStatus(val === "all" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Created Start</Label>
            <Input
              type="date"
              value={filterCreatedStart}
              onChange={(e) => setFilterCreatedStart(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Created End</Label>
            <Input
              type="date"
              value={filterCreatedEnd}
              onChange={(e) => setFilterCreatedEnd(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground font-semibold">Country Code</Label>
            <Input
              placeholder="e.g. 91, 1"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterGroups([]);
                setFilterTags([]);
                setFilterCampaignId("");
                setFilterAgentId("");
                setFilterConvStatus("");
                setFilterCreatedStart("");
                setFilterCreatedEnd("");
                setFilterCountry("");
                setFilterSource("");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Main Table Grid */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !rows.length ? (
          <div className="p-16 text-center">
            <Users className="size-10 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold">No contacts matched your criteria</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try relaxing filters or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b">
                  <th className="px-4 py-3 w-12 text-center">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium w-48 cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name <ArrowUpDown className="size-3 shrink-0" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium w-40 cursor-pointer"
                    onClick={() => toggleSort("phone_number_normalized")}
                  >
                    <div className="flex items-center gap-1">
                      Phone <ArrowUpDown className="size-3 shrink-0" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium w-36 cursor-pointer"
                    onClick={() => toggleSort("company")}
                  >
                    <div className="flex items-center gap-1">
                      Company <ArrowUpDown className="size-3 shrink-0" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium w-36 cursor-pointer"
                    onClick={() => toggleSort("source")}
                  >
                    <div className="flex items-center gap-1">
                      Source <ArrowUpDown className="size-3 shrink-0" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-44">Tags</th>
                  <th className="text-left px-4 py-3 font-medium w-44">Groups</th>
                  <th className="text-left px-4 py-3 font-medium w-40">Last Campaign</th>
                  <th className="text-left px-4 py-3 font-medium w-44">Last Message</th>
                  <th
                    className="text-left px-4 py-3 font-medium w-28 cursor-pointer"
                    onClick={() => toggleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Created <ArrowUpDown className="size-3 shrink-0" />
                    </div>
                  </th>
                  <th className="px-4 py-3 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((c) => {
                  const initials =
                    (c.name || "")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "+";
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => setDetailContactId(c.id)}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(c.id)}
                          onCheckedChange={() => toggleOne(c.id)}
                          aria-label={`Select ${c.name || c.phone_number_normalized}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2 truncate">
                          <div className="size-8 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                          <span className="truncate">{c.name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs truncate">
                        +{c.phone_number_normalized}
                      </td>
                      <td className="px-4 py-3 truncate">{c.company || "—"}</td>
                      <td className="px-4 py-3 truncate">
                        {c.source ? (
                          <Badge variant="outline" className="capitalize">
                            {c.source.replace(/_/g, " ")}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[10px] font-medium max-w-[80px] truncate"
                            >
                              {t.name}
                            </span>
                          ))}
                          {c.tags.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{c.tags.length - 2}
                            </span>
                          )}
                          {!c.tags.length && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.groups.slice(0, 2).map((g) => (
                            <span
                              key={g.id}
                              className="px-2 py-0.5 rounded-full bg-info-soft text-info text-[10px] font-medium max-w-[80px] truncate"
                            >
                              {g.name}
                            </span>
                          ))}
                          {c.groups.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{c.groups.length - 2}
                            </span>
                          )}
                          {!c.groups.length && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 truncate">
                        {c.lastCampaign ? (
                          <div className="truncate text-xs">
                            <span className="font-semibold">{c.lastCampaign.name}</span>
                            <span className="text-[10px] text-muted-foreground block capitalize">
                              {c.lastCampaign.status}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 truncate">
                        {c.lastConversation ? (
                          <div className="truncate text-xs">
                            <span className="block truncate text-muted-foreground italic">
                              {`"${c.lastConversation.lastMessage}"`}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {c.lastConversation.lastMessageAt
                                ? new Date(c.lastConversation.lastMessageAt).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEdit && (
                              <>
                                <DropdownMenuItem onClick={() => setEditingContact(c)}>
                                  Modify Info
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setConfirmDelete({
                                      ids: [c.id],
                                      label: c.name || `+${c.phone_number_normalized}`,
                                    })
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <div>
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="bg-background border rounded px-1.5 py-0.5"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="size-4" /> Prev
                </Button>
                <span>
                  Page {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Floating Bulk Actions Bar */}
      {selected.size > 0 && canEdit && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-primary-soft text-primary">
            {selected.size} selected
          </span>
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkTargetIds(Array.from(selected));
                setBulkAction("transfer_ownership");
              }}
            >
              Transfer Ownership
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkTargetIds(Array.from(selected));
              setBulkAction("add_groups");
            }}
          >
            Add Groups
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkTargetIds(Array.from(selected));
              setBulkAction("add_tags");
            }}
          >
            Add Tags
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkTargetIds(Array.from(selected));
              setBulkAction("remove_tags");
            }}
          >
            Remove Tags
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive-soft hover:text-destructive border-destructive"
            onClick={() =>
              setConfirmDelete({ ids: Array.from(selected), label: `${selected.size} contacts` })
            }
          >
            Delete
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Slide-out Sheet Drawer: Contact Profile & Timeline */}
      <Sheet open={!!detailContactId} onOpenChange={(o) => !o && setDetailContactId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {isDetailsLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : detailsData ? (
            <div className="space-y-6">
              <SheetHeader className="text-left border-b pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                      {detailsData.contact.name || "Unnamed"}
                      {detailsData.contact.company && (
                        <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                          <Building className="size-3.5" /> {detailsData.contact.company}
                        </span>
                      )}
                    </SheetTitle>
                    <SheetDescription className="font-mono text-xs mt-1 text-primary">
                      +{detailsData.contact.phone_number_normalized}
                    </SheetDescription>
                  </div>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingContact(detailsData.contact);
                        setDetailContactId(null);
                      }}
                    >
                      Modify Info
                    </Button>
                  )}
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 text-xs">
                  <TabsTrigger value="overview">Profile</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                {/* Tab: Overview */}
                <TabsContent value="overview" className="space-y-4 pt-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg">
                    <div>
                      <span className="text-muted-foreground block">Email</span>
                      <strong className="text-sm font-semibold">
                        {detailsData.contact.email || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Opt-in Source</span>
                      <strong className="text-sm font-semibold">
                        {detailsData.contact.opt_in_source || "Manual creation"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Opt-in Date</span>
                      <strong className="text-sm font-semibold">
                        {detailsData.contact.opt_in_date
                          ? new Date(detailsData.contact.opt_in_date).toLocaleString()
                          : "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Created At</span>
                      <strong className="text-sm font-semibold">
                        {new Date(detailsData.contact.created_at).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground">Groups Assigned</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {detailsData.groups.map((g: any) => (
                        <span
                          key={g.id}
                          className="px-2.5 py-0.5 rounded-full bg-info-soft text-info font-medium text-xs"
                        >
                          {g.name}
                        </span>
                      ))}
                      {!detailsData.groups.length && (
                        <span className="text-muted-foreground italic text-xs">
                          No groups assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground">Tags Assigned</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {detailsData.tags.map((t: any) => (
                        <span
                          key={t.id}
                          className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-medium text-xs"
                        >
                          {t.name}
                        </span>
                      ))}
                      {!detailsData.tags.length && (
                        <span className="text-muted-foreground italic text-xs">
                          No tags assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Future Placeholders */}
                  <div className="border-t pt-3 space-y-2 text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Assigned Agent</span>
                      <span className="text-[10px] italic bg-muted px-1.5 py-0.5 rounded">
                        Future feature
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Timeline Scoring</span>
                      <span className="text-[10px] italic bg-muted px-1.5 py-0.5 rounded">
                        Future feature
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Timeline */}
                <TabsContent value="timeline" className="space-y-4 pt-3">
                  <div className="relative pl-6 border-l border-border space-y-4">
                    {detailsData.timeline.map((act: any) => {
                      let typeLabel = "Activity";
                      let color = "bg-muted text-muted-foreground";

                      if (act.activity_type === "imported") {
                        if (act.metadata?.action === "ownership_transferred") {
                          typeLabel = "Ownership Transferred";
                          color = "bg-amber-50 text-amber-600 border border-amber-200";
                        } else {
                          typeLabel = "Imported / Created";
                          color = "bg-emerald-50 text-emerald-600 border border-emerald-200";
                        }
                      } else if (act.activity_type === "tag_added") {
                        typeLabel = `Tag Added: "${act.label}"`;
                        color = "bg-sky-50 text-sky-600 border border-sky-200";
                      } else if (act.activity_type === "tag_removed") {
                        typeLabel = `Tag Removed: "${act.label}"`;
                        color = "bg-muted text-muted-foreground border border-border";
                      } else if (act.activity_type === "group_added") {
                        typeLabel = `Group Added: "${act.label}"`;
                        color = "bg-indigo-50 text-indigo-600 border border-indigo-200";
                      } else if (act.activity_type === "group_removed") {
                        typeLabel = `Group Removed: "${act.label}"`;
                        color = "bg-muted text-muted-foreground border border-border";
                      }

                      return (
                        <div key={act.id} className="relative space-y-1">
                          <span className="absolute -left-[30px] top-0.5 size-4 rounded-full bg-background border flex items-center justify-center">
                            <span className="size-1.5 rounded-full bg-primary" />
                          </span>
                          <div className="text-xs text-muted-foreground flex justify-between items-center">
                            <span>{new Date(act.created_at).toLocaleString()}</span>
                          </div>
                          <div className={`p-2.5 rounded-lg text-xs font-semibold ${color}`}>
                            {typeLabel}
                          </div>
                        </div>
                      );
                    })}
                    {!detailsData.timeline.length && (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        No activity timeline recorded yet.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Campaigns History */}
                <TabsContent value="campaigns" className="space-y-3 pt-3">
                  <div className="border rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-muted-foreground font-semibold">
                        <tr className="border-b">
                          <th className="p-2">Campaign Name</th>
                          <th className="p-2">Template</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Sent Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {detailsData.campaigns.map((c: any) => (
                          <tr key={c.id} className="hover:bg-muted/10">
                            <td className="p-2 font-medium">{c.campaignName}</td>
                            <td className="p-2 uppercase font-mono text-[10px]">
                              {c.templateName}
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                {c.status}
                              </span>
                            </td>
                            <td className="p-2 text-muted-foreground">
                              {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "Pending"}
                            </td>
                          </tr>
                        ))}
                        {!detailsData.campaigns.length && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                              This contact has not been targeted in any campaigns yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* Tab: Message History */}
                <TabsContent value="chats" className="space-y-3 pt-3">
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {detailsData.messages.map((m: any) => {
                      const isIn = m.direction === "in";
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isIn ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`p-2.5 rounded-xl text-xs max-w-[80%] whitespace-pre-wrap ${isIn ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
                          >
                            <div>{m.body}</div>
                            <span className="text-[9px] block text-right mt-1 opacity-70">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {!detailsData.messages.length && (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No messages exchanged with this contact yet.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Internal Notes */}
                <TabsContent value="notes" className="space-y-3 pt-3 text-xs">
                  <div className="p-4 bg-muted/20 border rounded-lg text-center text-muted-foreground italic">
                    Internal notes are thread-bound. Go to the Conversations page to write, view,
                    and assign notes for this contact.
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Add / Edit Contact Dialog */}
      {(addOpen || editingContact) && (
        <AddEditContactDialog
          contact={editingContact}
          open={addOpen || !!editingContact}
          onOpenChange={(op) => {
            if (!op) {
              setAddOpen(false);
              setEditingContact(null);
            }
          }}
          activeId={activeId || ""}
          userId={user?.id || ""}
          allTags={allTags ?? []}
          allGroups={allGroups ?? []}
          qc={qc}
          saveContactFn={saveContactFn}
          onDuplicate={(dupDetails) => {
            setDuplicateChoice(dupDetails);
          }}
        />
      )}

      {/* Duplicate Choice Dialog */}
      <Dialog open={!!duplicateChoice} onOpenChange={(o) => !o && setDuplicateChoice(null)}>
        <DialogContent className="max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-destructive font-semibold">
              <AlertCircle className="size-4" /> Duplicate Contact Detected
            </DialogTitle>
            <DialogDescription>
              A contact already exists with the phone number (+{duplicateChoice?.payload.phone}).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-1">
            <p>
              Existing Contact: <strong>{duplicateChoice?.name}</strong>
            </p>
            <p>What action would you like to perform?</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const cid = duplicateChoice?.contactId;
                setDuplicateChoice(null);
                setAddOpen(false);
                setEditingContact(null);
                if (cid) setDetailContactId(cid);
              }}
            >
              View Existing Contact
            </Button>
            <Button
              onClick={async () => {
                if (!duplicateChoice) return;
                try {
                  await saveContactFn({
                    data: {
                      ...duplicateChoice.payload,
                      forceUpdate: true,
                    },
                  });
                  toast.success("Contact updated successfully.");
                  setDuplicateChoice(null);
                  setAddOpen(false);
                  setEditingContact(null);
                  qc.invalidateQueries({ queryKey: ["contacts"] });
                  qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
                  qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
                  qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
                  qc.invalidateQueries({ queryKey: ["groups"] });
                  qc.invalidateQueries({ queryKey: ["tags"] });
                } catch (err) {
                  toast.error((err as Error).message);
                }
              }}
            >
              Update Existing Info
            </Button>
            <Button variant="ghost" onClick={() => setDuplicateChoice(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Modify dialog */}
      <Dialog open={!!bulkAction} onOpenChange={(o) => !o && setBulkAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {bulkAction?.replace(/_/g, " ")} ({bulkTargetIds.length} contacts)
            </DialogTitle>
            <DialogDescription>
              Select the items to apply to all selected contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {bulkAction?.includes("tag") && (
              <div className="space-y-1">
                <Label>Select Tags</Label>
                <MultiSelect
                  options={(allTags ?? []).map((t) => ({ id: t.id, label: t.name }))}
                  value={bulkTagIds}
                  onChange={setBulkTagIds}
                  placeholder="Select tags…"
                />
              </div>
            )}
            {bulkAction?.includes("group") && (
              <div className="space-y-1">
                <Label>Select Groups</Label>
                <MultiSelect
                  options={(allGroups ?? []).map((g) => ({ id: g.id, label: g.name }))}
                  value={bulkGroupIds}
                  onChange={setBulkGroupIds}
                  placeholder="Select groups…"
                />
              </div>
            )}
            {bulkAction === "transfer_ownership" && (
              <div className="space-y-1">
                <Label>Select Target Agent</Label>
                <Select value={targetAgentId} onValueChange={setTargetAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(allAgents ?? []).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>
              Cancel
            </Button>
            <Button onClick={handleApplyBulk} disabled={applyingBulk}>
              {applyingBulk ? "Applying…" : "Apply Bulk Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Soft Delete Alert dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the contact to the recycle bin. Soft-deleted contacts are excluded from
              campaigns and the contact list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && handleSoftDelete(confirmDelete.ids)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Dialog Component for Add/Edit Contact
function AddEditContactDialog({
  contact,
  open,
  onOpenChange,
  activeId,
  userId,
  allTags,
  allGroups,
  qc,
  saveContactFn,
  onDuplicate,
}: {
  contact: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeId: string;
  userId: string;
  allTags: any[];
  allGroups: any[];
  qc: any;
  saveContactFn: any;
  onDuplicate: (details: { contactId: string; name: string; payload: any }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [defaultCountryCode, setDefaultCountryCode] = useState("91");
  const [optInSource, setOptInSource] = useState("");
  const [optInDate, setOptInDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  // Prepopulate if editing
  useEffect(() => {
    if (contact) {
      setName(contact.name ?? "");
      setPhone(contact.phone_number_raw ?? contact.phone_number_normalized ?? "");
      setEmail(contact.email ?? "");
      setCompany(contact.company ?? "");
      setTagIds(contact.tags?.map((t: any) => t.id) ?? []);
      setGroupIds(contact.groups?.map((g: any) => g.id) ?? []);
      setOptInSource(contact.opt_in_source ?? "");
      if (contact.opt_in_date) {
        setOptInDate(new Date(contact.opt_in_date).toISOString().slice(0, 10));
      }
    }
  }, [contact]);

  // Create Tag inline handler
  async function handleCreateTag(tagName: string) {
    const { data, error } = await supabase
      .from("tags")
      .insert({ tenant_id: activeId, name: tagName.trim() })
      .select("id, name")
      .single();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success(`Tag "${tagName}" created`);
    qc.invalidateQueries({ queryKey: ["tags"] });
    qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
    return data.id;
  }

  // Create Group inline handler
  async function handleCreateGroup(groupName: string) {
    const { data, error } = await supabase
      .from("groups")
      .insert({ tenant_id: activeId, name: groupName.trim(), created_by: userId })
      .select("id, name")
      .single();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success(`Group "${groupName}" created`);
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
    return data.id;
  }

  async function handleSave() {
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    setSaving(true);
    const payload = {
      id: contact?.id || null,
      tenantId: activeId,
      name: name.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      company: company.trim() || null,
      defaultCountryCode,
      tagIds,
      groupIds,
      optInSource: optInSource.trim() || null,
      optInDate: optInSource ? new Date(optInDate).toISOString() : null,
      forceUpdate: false,
    };

    try {
      const res = await saveContactFn({ data: payload });
      if (res.duplicate) {
        onDuplicate({
          contactId: res.contactId,
          name: res.name,
          payload,
        });
      } else {
        toast.success("Contact saved successfully.");
        qc.invalidateQueries({ queryKey: ["contacts"] });
        qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
        qc.invalidateQueries({ queryKey: ["groups"] });
        qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
        qc.invalidateQueries({ queryKey: ["tags"] });
        qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
        onOpenChange(false);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogDescription>
            {contact ? "Modify contact information." : "Create a new contact."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="add-name">Name</Label>
            <Input
              id="add-name"
              placeholder="Contact name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 col-span-1">
              <Label htmlFor="add-cc">Country Code</Label>
              <Input
                id="add-cc"
                value={defaultCountryCode}
                onChange={(e) => setDefaultCountryCode(e.target.value.replace(/\D/g, ""))}
                placeholder="91"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="add-phone">Phone number</Label>
              <Input
                id="add-phone"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="add-company">Company</Label>
            <Input
              id="add-company"
              placeholder="e.g. Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Tags</Label>
            <CreatorMultiSelect
              options={allTags.map((t) => ({ id: t.id, label: t.name }))}
              value={tagIds}
              onChange={setTagIds}
              placeholder="Select tags…"
              onCreate={handleCreateTag}
            />
          </div>

          <div className="space-y-1">
            <Label>Groups</Label>
            <CreatorMultiSelect
              options={allGroups.map((g) => ({ id: g.id, label: g.name }))}
              value={groupIds}
              onChange={setGroupIds}
              placeholder="Select groups…"
              onCreate={handleCreateGroup}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-3">
            <div className="space-y-1">
              <Label htmlFor="add-opt">Opt-in Source</Label>
              <Input
                id="add-opt"
                placeholder="Website signup…"
                value={optInSource}
                onChange={(e) => setOptInSource(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Opt-in Date</Label>
              <Input
                type="date"
                value={optInDate}
                onChange={(e) => setOptInDate(e.target.value)}
                disabled={!optInSource}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
