import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Tag as TagIcon,
  Users,
  Search,
  Folder,
  Edit2,
  Trash2,
  Lock,
  Check,
  Star,
  Award,
  Compass,
  Flame,
  Shield,
  Eye,
  Settings,
  MoreVertical,
  Activity,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { shareGroup } from "@/lib/contacts.functions";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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

export const Route = createFileRoute("/_authenticated/contacts/tags")({
  head: () => ({ meta: [{ title: "Groups & Tags · Virrat Reach" }] }),
  component: TagsGroups,
});

type Selected = { kind: "tag" | "group"; id: string; name: string } | null;

const GROUP_ICONS = [
  { name: "users", icon: Users, label: "Users" },
  { name: "folder", icon: Folder, label: "Folder" },
  { name: "star", icon: Star, label: "Star" },
  { name: "award", icon: Award, label: "Award" },
  { name: "compass", icon: Compass, label: "Compass" },
  { name: "flame", icon: Flame, label: "Flame" },
  { name: "shield", icon: Shield, label: "Shield" },
];

const CURATED_COLORS = [
  {
    value: "#ef4444",
    label: "Red",
    bg: "bg-red-500",
    text: "text-red-500",
    border: "border-red-500",
    softBg: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
  {
    value: "#f43f5e",
    label: "Rose",
    bg: "bg-rose-500",
    text: "text-rose-500",
    border: "border-rose-500",
    softBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
  },
  {
    value: "#f97316",
    label: "Orange",
    bg: "bg-orange-500",
    text: "text-orange-500",
    border: "border-orange-500",
    softBg: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  },
  {
    value: "#eab308",
    label: "Yellow",
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    border: "border-yellow-500",
    softBg: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  },
  {
    value: "#10b981",
    label: "Green",
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500",
    softBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  {
    value: "#3b82f6",
    label: "Blue",
    bg: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500",
    softBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  },
  {
    value: "#8b5cf6",
    label: "Violet",
    bg: "bg-violet-500",
    text: "text-violet-500",
    border: "border-violet-500",
    softBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
  },
  {
    value: "#71717a",
    label: "Gray",
    bg: "bg-zinc-500",
    text: "text-zinc-500",
    border: "border-zinc-500",
    softBg: "bg-zinc-50 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400",
  },
];

function getColorStyle(colorHex: string | null | undefined) {
  const found = CURATED_COLORS.find((c) => c.value === colorHex);
  if (found) return found;
  return {
    value: colorHex || "#71717a",
    label: "Custom",
    bg: "bg-zinc-500",
    text: "text-zinc-500",
    border: "border-zinc-500",
    softBg: "bg-zinc-50 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400",
  };
}

function getGroupIcon(iconName: string | null | undefined) {
  const found = GROUP_ICONS.find((i) => i.name === iconName);
  return found ? found.icon : Folder;
}

function getPermissionSummary(share: any) {
  const parts: string[] = [];
  if (share.can_view_contacts) parts.push("View");
  if (share.can_use_in_campaigns) parts.push("Target");
  if (share.can_edit_audience) parts.push("Edit");
  if (share.can_manage_contacts) parts.push("Manage");
  if (share.can_reshare_audience) parts.push("Reshare");
  return parts.length > 0 ? parts.join(", ") : "No permissions";
}

function TagsGroups() {
  const { activeId, membership } = useActiveTenant();
  const { user } = useAuth();
  const qc = useQueryClient();
  const canEdit = canManage(membership?.role, "manager");

  const [selected, setSelected] = useState<Selected>(null);
  const [activeTab, setActiveTab] = useState<string>("groups");

  // Reset active tag/group detail view when active tenant changes
  useEffect(() => {
    setSelected(null);
  }, [activeId]);

  // Search local states
  const [groupSearch, setGroupSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Dialog States
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupEditId, setGroupEditId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupColor, setGroupColor] = useState(CURATED_COLORS[0].value);
  const [groupIcon, setGroupIconState] = useState("folder");
  const [groupActive, setGroupActive] = useState(true);

  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagEditId, setTagEditId] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagDesc, setTagDesc] = useState("");
  const [tagColor, setTagColor] = useState(CURATED_COLORS[0].value);

  // Share Dialog States
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingGroup, setSharingGroup] = useState<any>(null);
  const [groupSharesList, setGroupSharesList] = useState<Array<{
    userId: string;
    email: string;
    fullName: string;
    canViewContacts: boolean;
    canUseInCampaigns: boolean;
    canEditAudience: boolean;
    canManageContacts: boolean;
    canReshareAudience: boolean;
  }>>([]);
  const [saveSharePending, setSaveSharePending] = useState(false);

  // Delete Alert States
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: "tag" | "group";
    id: string;
    name: string;
  } | null>(null);

  // Fetch workspace members for sharing
  const { data: workspaceMembers } = useQuery({
    queryKey: ["workspace-members", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_members")
        .select("id, role, user_id, profiles!tenant_members_user_id_profiles_fkey(email, full_name)")
        .eq("tenant_id", activeId!);
      return (data ?? []) as any[];
    },
  });

  // Fetch all group shares for the tenant to display sharing info
  const { data: groupShares, refetch: refetchShares } = useQuery({
    queryKey: ["group-shares", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_shares")
        .select(`
          id,
          group_id,
          shared_by,
          shared_with_user,
          can_view_contacts,
          can_use_in_campaigns,
          can_edit_audience,
          can_manage_contacts,
          can_reshare_audience
        `)
        .eq("tenant_id", activeId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  // 1. Fetch tags with membership counts
  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ["tags-with-counts", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data: tagRows } = await supabase
        .from("tags")
        .select("id, name, color, description, created_at, updated_at")
        .eq("tenant_id", activeId!)
        .order("name");
      const list = tagRows ?? [];
      if (!list.length) return [];
      const counts = await Promise.all(
        list.map((t) =>
          supabase
            .from("contact_tags")
            .select("contacts!inner(id)", { count: "exact", head: true })
            .eq("tag_id", t.id)
            .is("contacts.deleted_at", null),
        ),
      );
      return list.map((t, i) => ({ ...t, count: counts[i].count ?? 0 }));
    },
  });

  // 2. Fetch groups with membership counts
  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ["groups-with-counts", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data: gRows } = await supabase
        .from("groups")
        .select(
          "id, name, description, color, icon, created_at, updated_at, is_system_group, is_active, created_by",
        )
        .eq("tenant_id", activeId!)
        .order("name");
      
      const rawList = gRows ?? [];
      if (!rawList.length) return [];

      const createdByIds = Array.from(new Set(rawList.map((g) => g.created_by).filter((id): id is string => !!id)));
      let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (createdByIds.length > 0) {
        const { data: pRows } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", createdByIds);
        (pRows ?? []).forEach((p) => {
          profilesMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }

      const list = rawList.map((g) => ({
        ...g,
        profiles: g.created_by ? (profilesMap[g.created_by] ?? null) : null,
      }));

      const counts = await Promise.all(
        list.map((g) =>
          supabase
            .from("contact_groups")
            .select("contacts!inner(id)", { count: "exact", head: true })
            .eq("group_id", g.id)
            .is("contacts.deleted_at", null),
        ),
      );
      return list.map((g, i) => ({ ...g, count: counts[i].count ?? 0 }));
    },
  });

  // 3. Fetch campaigns to compute references
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns-for-counts", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, audience_criteria")
        .eq("tenant_id", activeId!)
        .is("deleted_at", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  // 4. Fetch saved audiences
  const { data: savedAudiences } = useQuery({
    queryKey: ["saved-audiences-for-counts", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_audiences")
        .select("id, criteria")
        .eq("tenant_id", activeId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Helper selectors
  const groupsWithCampaignCount = useMemo(() => {
    if (!groups) return [];
    const list = campaigns ?? [];
    const sa = savedAudiences ?? [];
    return groups.map((g) => {
      let count = 0;
      for (const c of list) {
        const aud: any = c.audience_criteria;
        if (!aud) continue;
        if (aud.mode === "groups" && Array.isArray(aud.ids) && aud.ids.includes(g.id)) {
          count++;
        } else if (aud.mode === "audience_builder") {
          if (
            (Array.isArray(aud.includeGroups) && aud.includeGroups.includes(g.id)) ||
            (Array.isArray(aud.excludeGroups) && aud.excludeGroups.includes(g.id))
          ) {
            count++;
          } else if (aud.savedAudienceId) {
            const matchSa = sa.find((s) => s.id === aud.savedAudienceId);
            const criteria = matchSa?.criteria as any;
            if (
              criteria &&
              ((Array.isArray(criteria.includeGroups) && criteria.includeGroups.includes(g.id)) ||
                (Array.isArray(criteria.excludeGroups) && criteria.excludeGroups.includes(g.id)))
            ) {
              count++;
            }
          }
        }
      }
      return { ...g, campaignCount: count };
    });
  }, [groups, campaigns, savedAudiences]);

  const tagsWithCampaignCount = useMemo(() => {
    if (!tags) return [];
    const list = campaigns ?? [];
    const sa = savedAudiences ?? [];
    return tags.map((t) => {
      let count = 0;
      for (const c of list) {
        const aud: any = c.audience_criteria;
        if (!aud) continue;
        if (aud.mode === "tags" && Array.isArray(aud.ids) && aud.ids.includes(t.id)) {
          count++;
        } else if (aud.mode === "audience_builder") {
          if (
            (Array.isArray(aud.includeTags) && aud.includeTags.includes(t.id)) ||
            (Array.isArray(aud.excludeTags) && aud.excludeTags.includes(t.id))
          ) {
            count++;
          } else if (aud.savedAudienceId) {
            const matchSa = sa.find((s) => s.id === aud.savedAudienceId);
            const criteria = matchSa?.criteria as any;
            if (
              criteria &&
              ((Array.isArray(criteria.includeTags) && criteria.includeTags.includes(t.id)) ||
                (Array.isArray(criteria.excludeTags) && criteria.excludeTags.includes(t.id)))
            ) {
              count++;
            }
          }
        }
      }
      return { ...t, campaignCount: count };
    });
  }, [tags, campaigns, savedAudiences]);

  // Search filters
  const filteredGroups = useMemo(() => {
    const term = groupSearch.toLowerCase().trim();
    if (!term) return groupsWithCampaignCount;
    return groupsWithCampaignCount.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        (g.description && g.description.toLowerCase().includes(term)),
    );
  }, [groupsWithCampaignCount, groupSearch]);

  const { myGroups, sharedGroups } = useMemo(() => {
    const my: any[] = [];
    const shared: any[] = [];
    const isAgent = membership?.role === "agent";
    filteredGroups.forEach((g) => {
      if (g.created_by === user?.id || g.is_system_group || !g.created_by) {
        my.push(g);
      } else {
        const isShared = groupShares?.some(
          (s: any) => s.shared_with_user === user?.id && s.group_id === g.id
        );
        if (!isAgent || isShared) {
          shared.push(g);
        }
      }
    });
    return { myGroups: my, sharedGroups: shared };
  }, [filteredGroups, user?.id, groupShares, membership?.role]);

  const filteredTags = useMemo(() => {
    const term = tagSearch.toLowerCase().trim();
    if (!term) return tagsWithCampaignCount;
    return tagsWithCampaignCount.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)),
    );
  }, [tagsWithCampaignCount, tagSearch]);

  // Mutations
  const saveGroupMutation = useMutation({
    mutationFn: async () => {
      if (!groupName.trim() || !activeId) return;
      const payload = {
        tenant_id: activeId,
        name: groupName.trim(),
        description: groupDesc.trim() || null,
        color: groupColor,
        icon: groupIcon,
        is_active: groupActive,
      };

      if (groupEditId) {
        const { error } = await supabase
          .from("groups")
          .update(payload)
          .eq("id", groupEditId)
          .eq("tenant_id", activeId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("groups").insert({
          ...payload,
          created_by: user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(groupEditId ? "Group updated" : "Group created");
      setGroupDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const saveTagMutation = useMutation({
    mutationFn: async () => {
      if (!tagName.trim() || !activeId) return;
      const payload = {
        tenant_id: activeId,
        name: tagName.trim(),
        description: tagDesc.trim() || null,
        color: tagColor,
      };

      if (tagEditId) {
        const { error } = await supabase
          .from("tags")
          .update(payload)
          .eq("id", tagEditId)
          .eq("tenant_id", activeId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tags").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(tagEditId ? "Tag updated" : "Tag created");
      setTagDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !activeId) return;
      if (deleteTarget.kind === "group") {
        // 1. Fetch contact IDs in this group
        const { data: memberRows } = await supabase
          .from("contact_groups")
          .select("contact_id")
          .eq("group_id", deleteTarget.id);

        const contactIds = (memberRows ?? []).map((r: any) => r.contact_id);

        if (contactIds.length > 0) {
          // 2. Soft-delete contacts belonging to the active tenant
          const { error: contactsErr } = await supabase
            .from("contacts")
            .update({ deleted_at: new Date().toISOString() })
            .in("id", contactIds)
            .eq("tenant_id", activeId);
          if (contactsErr) throw contactsErr;
        }

        // 3. Delete the group
        const { error } = await supabase
          .from("groups")
          .delete()
          .eq("id", deleteTarget.id)
          .eq("tenant_id", activeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tags")
          .delete()
          .eq("id", deleteTarget.id)
          .eq("tenant_id", activeId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`${deleteTarget?.kind === "group" ? "Group" : "Tag"} deleted successfully`);
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["groups-with-counts"] });
      qc.invalidateQueries({ queryKey: ["tags-with-counts"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  // Action Triggers
  function openNewGroup() {
    setGroupEditId(null);
    setGroupName("");
    setGroupDesc("");
    setGroupColor(CURATED_COLORS[0].value);
    setGroupIconState("folder");
    setGroupActive(true);
    setGroupDialogOpen(true);
  }

  function openEditGroup(g: any) {
    setGroupEditId(g.id);
    setGroupName(g.name);
    setGroupDesc(g.description || "");
    setGroupColor(g.color || CURATED_COLORS[0].value);
    setGroupIconState(g.icon || "folder");
    setGroupActive(g.is_active ?? true);
    setGroupDialogOpen(true);
  }

  async function openShareGroup(g: any) {
    setSharingGroup(g);
    const { data: shares, error } = await supabase
      .from("group_shares")
      .select("shared_with_user, can_view_contacts, can_use_in_campaigns, can_edit_audience, can_manage_contacts, can_reshare_audience")
      .eq("group_id", g.id)
      .eq("tenant_id", activeId!);

    if (error) {
      toast.error("Failed to load group shares: " + error.message);
      return;
    }

    const initialShares = (workspaceMembers ?? [])
      .filter((m) => m.user_id !== user?.id && m.user_id !== g.created_by)
      .map((m) => {
        const existing = shares?.find((s) => s.shared_with_user === m.user_id);
        return {
          userId: m.user_id,
          email: m.profiles?.email || "",
          fullName: m.profiles?.full_name || "Unnamed",
          canViewContacts: existing ? existing.can_view_contacts : false,
          canUseInCampaigns: existing ? existing.can_use_in_campaigns : false,
          canEditAudience: existing ? existing.can_edit_audience : false,
          canManageContacts: existing ? existing.can_manage_contacts : false,
          canReshareAudience: existing ? existing.can_reshare_audience : false,
        };
      });

    setGroupSharesList(initialShares);
    setShareDialogOpen(true);
  }

  function updateSharePermission(idx: number, key: string, value: boolean) {
    const copy = [...groupSharesList];
    copy[idx] = { ...copy[idx], [key]: value };
    setGroupSharesList(copy);
  }

  async function saveGroupShares() {
    if (!activeId || !sharingGroup) return;
    setSaveSharePending(true);
    try {
      const activeShares = groupSharesList
        .filter((s) => s.canViewContacts || s.canUseInCampaigns || s.canEditAudience || s.canManageContacts || s.canReshareAudience)
        .map((s) => ({
          userId: s.userId,
          canViewContacts: s.canViewContacts,
          canUseInCampaigns: s.canUseInCampaigns,
          canEditAudience: s.canEditAudience,
          canManageContacts: s.canManageContacts,
          canReshareAudience: s.canReshareAudience,
        }));

      await shareGroup({
        data: {
          tenantId: activeId!,
          groupId: sharingGroup.id,
          shares: activeShares,
        }
      });

      toast.success("Group sharing permissions updated");
      setShareDialogOpen(false);
      refetchShares();
    } catch (err: any) {
      toast.error(err.message || "Failed to update sharing");
    } finally {
      setSaveSharePending(false);
    }
  }

  function openNewTag() {
    setTagEditId(null);
    setTagName("");
    setTagDesc("");
    setTagColor(CURATED_COLORS[0].value);
    setTagDialogOpen(true);
  }

  function openEditTag(t: any) {
    setTagEditId(t.id);
    setTagName(t.name);
    setTagDesc(t.description || "");
    setTagColor(t.color || CURATED_COLORS[0].value);
    setTagDialogOpen(true);
  }

  const renderGroupCard = (g: any) => {
    const IconComponent = getGroupIcon(g.icon);
    const colorDetails = getColorStyle(g.color);
    const userShare = groupShares?.find(
      (s: any) => s.group_id === g.id && s.shared_with_user === user?.id
    );

    const isOwnerOrAdmin = membership?.role === "owner" || membership?.role === "admin";

    const hasViewAccess =
      isOwnerOrAdmin ||
      g.created_by === user?.id ||
      g.is_system_group ||
      !g.created_by ||
      userShare?.can_view_contacts ||
      userShare?.can_manage_contacts;

    const hasEditAccess =
      isOwnerOrAdmin ||
      g.created_by === user?.id ||
      canEdit ||
      userShare?.can_edit_audience;

    const canReshare =
      isOwnerOrAdmin ||
      g.created_by === user?.id ||
      canEdit ||
      userShare?.can_reshare_audience;

    const isSharedWithMe = g.created_by && g.created_by !== user?.id && !g.is_system_group;
    const shareCount = groupShares?.filter((s: any) => s.group_id === g.id).length ?? 0;

    return (
      <Card
        key={g.id}
        className="relative overflow-hidden group border border-border p-5 flex flex-col justify-between hover:shadow-md transition duration-200"
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: colorDetails.value }}
        />

        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg`}
                style={{
                  backgroundColor: `${colorDetails.value}15`,
                  color: colorDetails.value,
                }}
              >
                <IconComponent className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none flex items-center gap-1.5">
                  {g.name}
                  {g.is_system_group && (
                    <span title="System Group">
                      <Lock className="size-3 text-muted-foreground" />
                    </span>
                  )}
                </h3>
                {g.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {g.description}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 h-8 w-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasViewAccess && (
                  <DropdownMenuItem
                    onClick={() => setSelected({ kind: "group", id: g.id, name: g.name })}
                    className="cursor-pointer"
                  >
                    <Eye className="size-4 mr-2" /> View Members
                  </DropdownMenuItem>
                )}
                {canReshare && !g.is_system_group && (
                  <DropdownMenuItem
                    onClick={() => openShareGroup(g)}
                    className="cursor-pointer text-primary"
                  >
                    <Users className="size-4 mr-2" /> Share Group
                  </DropdownMenuItem>
                )}
                {hasEditAccess && !g.is_system_group && (
                  <DropdownMenuItem
                    onClick={() => openEditGroup(g)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="size-4 mr-2" /> Edit Details
                  </DropdownMenuItem>
                )}
                {(canEdit || g.created_by === user?.id) && !g.is_system_group && (
                  <DropdownMenuItem
                    onClick={() =>
                      setDeleteTarget({ kind: "group", id: g.id, name: g.name })
                    }
                    className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" /> Delete Group
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-1.5 mt-3 flex-wrap">
            {!g.is_active && (
              <span className="inline-flex items-center rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                Inactive
              </span>
            )}
            {g.is_system_group && (
              <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                System Folder
              </span>
            )}
            {isSharedWithMe && (
              <span
                className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                title={`Shared by ${g.profiles?.full_name || g.profiles?.email || 'Workspace Member'}`}
              >
                🤝 Shared (Owner: {g.profiles?.full_name || g.profiles?.email?.split("@")[0] || "Unknown"})
              </span>
            )}
            {!isSharedWithMe && shareCount > 0 && (
              <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                🤝 Shared with {shareCount} member{shareCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {isSharedWithMe && userShare && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Permissions: <span className="font-medium text-foreground">{getPermissionSummary(userShare)}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5 text-muted-foreground/75" />
            <div>
              <p className="font-semibold text-foreground">
                {hasViewAccess ? g.count : "—"}
              </p>
              <p className="text-[10px]">Contact{g.count === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Megaphone className="size-3.5 text-muted-foreground/75" />
            <div>
              <p className="font-semibold text-foreground">{g.campaignCount}</p>
              <p className="text-[10px]">Campaign{g.campaignCount === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Audiences, Groups & Tags
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Segment contacts and organize lists for targeting broadcasts.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="size-4" />
            Groups ({groups?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <TagIcon className="size-4" />
            Tags ({tags?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* GROUPS TAB CONTENT */}
        <TabsContent value="groups" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                className="pl-9"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
              />
            </div>
            {canEdit && (
              <Button onClick={openNewGroup} className="w-full sm:w-auto">
                <Plus className="size-4 mr-1" /> New Group
              </Button>
            )}
          </div>

          {loadingGroups ? (
            <div className="text-sm text-muted-foreground">Loading groups…</div>
          ) : !filteredGroups.length ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
              <Users className="size-8 mb-2 opacity-50" />
              <p className="font-medium text-sm">No groups found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {groupSearch
                  ? "Clear your search to see groups."
                  : "Create folders to organize lists."}
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* My Groups Section */}
              {myGroups.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">My Groups</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myGroups.map((g) => renderGroupCard(g))}
                  </div>
                </div>
              )}

              {/* Shared With Me Section */}
              {sharedGroups.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Shared With Me</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sharedGroups.map((g) => renderGroupCard(g))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAGS TAB CONTENT */}
        <TabsContent value="tags" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-9"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>
            {canEdit && (
              <Button onClick={openNewTag} className="w-full sm:w-auto">
                <Plus className="size-4 mr-1" /> New Tag
              </Button>
            )}
          </div>

          {loadingTags ? (
            <div className="text-sm text-muted-foreground">Loading tags…</div>
          ) : !filteredTags.length ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
              <TagIcon className="size-8 mb-2 opacity-50" />
              <p className="font-medium text-sm">No tags found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tagSearch
                  ? "Clear your search to see tags."
                  : "Add label tags to categorize contacts."}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTags.map((t) => {
                const colorDetails = getColorStyle(t.color);
                return (
                  <Card
                    key={t.id}
                    className="relative overflow-hidden group border border-border p-5 flex flex-col justify-between hover:shadow-md transition duration-200"
                  >
                    {/* Left Stripe */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: colorDetails.value }}
                    />

                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold`}
                            style={{
                              backgroundColor: `${colorDetails.value}15`,
                              color: colorDetails.value,
                            }}
                          >
                            {t.name}
                          </span>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {t.description}
                            </p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 h-8 w-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelected({ kind: "tag", id: t.id, name: t.name })}
                              className="cursor-pointer"
                            >
                              <Eye className="size-4 mr-2" /> View Members
                            </DropdownMenuItem>
                            {canEdit && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openEditTag(t)}
                                  className="cursor-pointer"
                                >
                                  <Edit2 className="size-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDeleteTarget({ kind: "tag", id: t.id, name: t.name })
                                  }
                                  className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="size-4 mr-2" /> Delete Tag
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-3.5 text-muted-foreground/75" />
                        <div>
                          <p className="font-semibold text-foreground">{t.count}</p>
                          <p className="text-[10px]">Contact{t.count === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Megaphone className="size-3.5 text-muted-foreground/75" />
                        <div>
                          <p className="font-semibold text-foreground">{t.campaignCount}</p>
                          <p className="text-[10px]">Campaign{t.campaignCount === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* GROUP CREATE/EDIT DIALOG */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{groupEditId ? "Edit Group Details" : "Create Folder Group"}</DialogTitle>
            <DialogDescription>
              {groupEditId
                ? "Modify group parameters. Changes will apply to all segmented audiences."
                : "Organize contacts in first-class folders for bulk template targeting."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Retail Customers, Leads"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="groupDesc">Description</Label>
              <Textarea
                id="groupDesc"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="Details about group segmentation..."
                rows={3}
              />
            </div>

            {/* Colors Grid */}
            <div className="space-y-1.5">
              <Label>Theme Color</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CURATED_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setGroupColor(c.value)}
                    className={`size-6 rounded-full ${c.bg} border-2 relative transition hover:scale-110`}
                    style={{
                      borderColor: groupColor === c.value ? "#000" : "transparent",
                    }}
                    title={c.label}
                  >
                    {groupColor === c.value && (
                      <Check className="size-3.5 absolute inset-0 m-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <Label>Group Icon</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {GROUP_ICONS.map((i) => {
                  const Icon = i.icon;
                  const isSelected = groupIcon === i.name;
                  return (
                    <button
                      key={i.name}
                      type="button"
                      onClick={() => setGroupIconState(i.name)}
                      className={`p-2 rounded-lg border transition hover:bg-muted ${
                        isSelected ? "bg-primary-soft text-primary border-primary" : "border-border"
                      }`}
                      title={i.label}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="groupActive">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive groups are omitted from bulk sender options.
                </p>
              </div>
              <Switch id="groupActive" checked={groupActive} onCheckedChange={setGroupActive} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveGroupMutation.mutate()}
              disabled={saveGroupMutation.isPending || !groupName.trim()}
            >
              {saveGroupMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SHARE GROUP DIALOG */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Share Group: {sharingGroup?.name}</DialogTitle>
            <DialogDescription>
              Grant specific permissions to workspace members. Users will be able to target this audience based on flags.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
              {groupSharesList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No other members in this workspace to share with.
                </p>
              ) : (
                groupSharesList.map((s, idx) => (
                  <div key={s.userId} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.canViewContacts}
                          onChange={(e) => updateSharePermission(idx, "canViewContacts", e.target.checked)}
                          className="rounded border-gray-300 size-3.5 accent-primary mr-1"
                        />
                        <span>View Contacts</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.canUseInCampaigns}
                          onChange={(e) => updateSharePermission(idx, "canUseInCampaigns", e.target.checked)}
                          className="rounded border-gray-300 size-3.5 accent-primary mr-1"
                        />
                        <span>Use in Campaigns</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.canEditAudience}
                          onChange={(e) => updateSharePermission(idx, "canEditAudience", e.target.checked)}
                          className="rounded border-gray-300 size-3.5 accent-primary mr-1"
                        />
                        <span>Edit Audience</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.canManageContacts}
                          onChange={(e) => updateSharePermission(idx, "canManageContacts", e.target.checked)}
                          className="rounded border-gray-300 size-3.5 accent-primary mr-1"
                        />
                        <span>Manage Contacts</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.canReshareAudience}
                          onChange={(e) => updateSharePermission(idx, "canReshareAudience", e.target.checked)}
                          className="rounded border-gray-300 size-3.5 accent-primary mr-1"
                        />
                        <span>Re-share Audience</span>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveGroupShares}
              disabled={saveSharePending}
            >
              {saveSharePending ? "Saving…" : "Save Sharing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TAG CREATE/EDIT DIALOG */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {tagEditId ? "Edit Tag Parameters" : "Create Categorization Tag"}
            </DialogTitle>
            <DialogDescription>
              Tags are flexible labels to categorize, highlight, and filter contacts in grids.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="tagName">Tag Label</Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="e.g. VIP, Hot Lead"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagDesc">Tag Description</Label>
              <Textarea
                id="tagDesc"
                value={tagDesc}
                onChange={(e) => setTagDesc(e.target.value)}
                placeholder="Describe when this label should be applied..."
                rows={3}
              />
            </div>

            {/* Colors Grid */}
            <div className="space-y-1.5">
              <Label>Label Badge Color</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CURATED_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setTagColor(c.value)}
                    className={`size-6 rounded-full ${c.bg} border-2 relative transition hover:scale-110`}
                    style={{
                      borderColor: tagColor === c.value ? "#000" : "transparent",
                    }}
                    title={c.label}
                  >
                    {tagColor === c.value && (
                      <Check className="size-3.5 absolute inset-0 m-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveTagMutation.mutate()}
              disabled={saveTagMutation.isPending || !tagName.trim()}
            >
              {saveTagMutation.isPending ? "Saving…" : "Save Label"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MEMBERS LIST SHEET */}
      <MembersSheet selected={selected} onClose={() => setSelected(null)} />

      {/* DELETE CONFIRM ALERT DIALOG */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.kind === "group" ? (
                <>
                  This will permanently delete the group "<strong>{deleteTarget?.name}</strong>" 
                  and <strong>all contacts inside it</strong>. This action cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete the tag "<strong>{deleteTarget?.name}</strong>". 
                  This action cannot be undone. Contacts belonging to this tag will not be deleted, 
                  but the tag mapping will be severed.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MembersSheet({ selected, onClose }: { selected: Selected; onClose: () => void }) {
  const { activeId } = useActiveTenant();
  const { data: members, isLoading } = useQuery({
    queryKey: ["members", selected?.kind, selected?.id, activeId],
    enabled: !!selected && !!activeId,
    queryFn: async () => {
      if (!selected || !activeId) return [];
      if (selected.kind === "tag") {
        const { data } = await supabase
          .from("contact_tags")
          .select("contact:contacts(id, name, phone_number_normalized, company)")
          .eq("tag_id", selected.id)
          .eq("tenant_id", activeId);
        return (data ?? []).map((r: any) => r.contact).filter(Boolean);
      }
      const { data } = await supabase
          .from("contact_groups")
          .select("contact:contacts(id, name, phone_number_normalized, company)")
          .eq("group_id", selected.id);
      return (data ?? []).map((r: any) => r.contact).filter(Boolean);
    },
  });

  return (
    <Sheet open={!!selected} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {selected?.kind === "group" ? (
              <Users className="size-5 text-primary" />
            ) : (
              <TagIcon className="size-5 text-primary" />
            )}
            {selected?.name}
          </SheetTitle>
          <SheetDescription>
            List of contacts associated with this {selected?.kind ?? "segment"}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading members…</div>
          ) : members?.length ? (
            members.map((c: any) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg border border-border flex items-center justify-between gap-3 hover:bg-muted/30 transition"
              >
                <div>
                  <div className="font-semibold text-sm">{c.name || "Unnamed"}</div>
                  {c.company && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Folder className="size-3" />
                      {c.company}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
                  +{c.phone_number_normalized}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No contacts in this {selected?.kind} yet.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
