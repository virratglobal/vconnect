import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { deleteOrganization } from "./settings";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useActiveTenant, useMyTenants } from "@/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Plus, ArrowRight, Check, Shield, Globe, Clock, Palette, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/organization")({
  head: () => ({ meta: [{ title: "My Organizations · Virrat Reach" }] }),
  component: OrganizationPage,
});

const STORAGE_KEY = "wa-crm.active-tenant";

function OrganizationPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { activeId, switchTenant } = useActiveTenant();
  const { data: tenantMemberships, isLoading } = useMyTenants();

  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const deleteOrgFn = useServerFn(deleteOrganization);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingOrg, setRenamingOrg] = useState<{ id: string; name: string } | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingOrg || !newOrgName.trim()) return;
    setRenameLoading(true);

    try {
      const { error } = await supabase
        .from("tenants")
        .update({ name: newOrgName.trim() })
        .eq("id", renamingOrg.id);

      if (error) throw error;

      toast.success("Organization renamed successfully");
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      setRenameDialogOpen(false);
      setRenamingOrg(null);
      setNewOrgName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to rename organization");
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleDeleteOrganization(orgId: string, orgName: string) {
    const slug = tenantMemberships?.find(m => m.tenant_id === orgId)?.tenants.slug;
    const input = prompt(`To delete "${orgName}", please type the organization slug "/${slug}" to confirm:`);
    if (input !== `/${slug}`) {
      if (input !== null) toast.error("Slug did not match. Deletion aborted.");
      return;
    }

    if (!confirm(`Are you absolutely sure you want to permanently delete "${orgName}"? This action cannot be undone and will delete all campaigns, contacts, and WhatsApp credentials.`)) {
      return;
    }

    setDeletingOrgId(orgId);
    try {
      await deleteOrgFn({ data: { tenantId: orgId } });

      toast.success("Organization deleted successfully");
      if (activeId === orgId) {
        localStorage.removeItem("wa-crm.active-tenant");
      }
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete organization");
    } finally {
      setDeletingOrgId(null);
    }
  }

  // Form states for creating a new organization
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("India");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [logo, setLogo] = useState("");
  const [brandColor, setBrandColor] = useState("#CC1100");

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Auto-slugify name as they type
  useEffect(() => {
    if (name) {
      setSlug(`${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`);
    } else {
      setSlug("");
    }
  }, [name]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const finalSlug = slug.trim() || `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

      // 1. Create the tenant/organization
      const { data: tenantData, error: tenantErr } = await supabase
        .from("tenants")
        .insert({
          name: name.trim(),
          slug: finalSlug,
          country,
          industry: industry.trim() || null,
          timezone,
        })
        .select()
        .single();

      if (tenantErr) throw tenantErr;

      // 2. Set branding details (optional)
      if (tenantData && (logo.trim() || brandColor !== "#CC1100" || companyName.trim())) {
        const { error: brandingErr } = await supabase.from("tenant_branding").insert({
          tenant_id: tenantData.id,
          company_name: companyName.trim() || name.trim(),
          company_logo: logo.trim() || null,
          primary_color: brandColor,
          secondary_color: "#1f2937",
        });
        if (brandingErr) {
          console.error("Failed to insert branding:", brandingErr);
        }
      }

      toast.success("Organization created successfully");

      // Automatically switch to the newly created organization
      if (tenantData) {
        switchTenant(tenantData.id);
      }

      // Invalidate queries to reload workspaces list
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      setOpenModal(false);

      // Reset form states
      setName("");
      setCompanyName("");
      setIndustry("");
      setLogo("");
      setBrandColor("#CC1100");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  const handleEnterOrg = (tenantId: string) => {
    switchTenant(tenantId);
    toast.success("Switched active organization context");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Switch between or manage the organizations you belong to.
          </p>
        </div>
        <Button
          onClick={() => setOpenModal(true)}
          className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Create Organization
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse border-border/50">
              <CardHeader className="space-y-2">
                <div className="h-5 w-2/3 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </CardHeader>
              <CardContent className="h-20 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : tenantMemberships && tenantMemberships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenantMemberships.map((membership) => {
            const org = membership.tenants;
            const isActive = org.id === activeId;

            return (
              <Card
                key={org.id}
                className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                  isActive
                    ? "border-primary/50 shadow-md shadow-primary/5 bg-gradient-to-br from-card to-primary/5"
                    : "border-border/50 bg-card hover:border-border"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <Check className="size-3" /> Active
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 truncate pr-16">
                    <Building2
                      className={`size-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="truncate">{org.name}</span>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs truncate">
                    /{org.slug}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 py-2 text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-border/50 pb-2">
                    <span>Role</span>
                    <span className="capitalize font-semibold text-foreground bg-muted px-2 py-0.5 rounded-full">
                      {membership.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Domain</span>
                    <span className="truncate max-w-[150px] font-medium text-foreground">
                      {org.custom_domain || "Standard domain"}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/50 gap-2">
                  {isActive ? (
                    <Button variant="outline" disabled className="w-full rounded-xl border-dashed">
                      Currently Active
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEnterOrg(org.id)}
                      className="flex-1 bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-1.5"
                    >
                      Enter Organization <ArrowRight className="size-4" />
                    </Button>
                  )}
                  {membership.role === "owner" && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setRenamingOrg({ id: org.id, name: org.name });
                          setNewOrgName(org.name);
                          setRenameDialogOpen(true);
                        }}
                        className="border-input hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl shrink-0"
                        title="Rename Organization"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteOrganization(org.id, org.name)}
                        disabled={deletingOrgId === org.id}
                        className="border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl shrink-0"
                        title="Delete Organization"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="size-16 rounded-2xl bg-muted grid place-items-center mx-auto text-muted-foreground">
            <Building2 className="size-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">No organizations found</h3>
            <p className="text-sm text-muted-foreground">
              You are not a member of any organization yet. Create a new organization to start
              setting up your WhatsApp CRM workspace.
            </p>
          </div>
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-1.5"
          >
            <Plus className="size-4" />
            Create Organization
          </Button>
        </Card>
      )}

      {/* Create Organization Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="size-5 text-[#CC1100]" /> Create your organization
            </DialogTitle>
            <DialogDescription>
              Organizations are independent entities that own all CRM data, members, and billing
              details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            {/* Name & Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="Acme Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-slug">Slug (Unique)</Label>
                <Input
                  id="org-slug"
                  placeholder="acme-marketing"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Company & Industry (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="company-name">Company Name (Optional)</Label>
                <Input
                  id="company-name"
                  placeholder="Acme Technologies Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-industry">Industry (Optional)</Label>
                <Input
                  id="org-industry"
                  placeholder="E-commerce, Retail"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Country & Timezone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-country" className="flex items-center gap-1">
                  <Globe className="size-3.5" /> Country
                </Label>
                <Input
                  id="org-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-timezone" className="flex items-center gap-1">
                  <Clock className="size-3.5" /> Timezone
                </Label>
                <Input
                  id="org-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Logo & Color (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-logo">Logo URL (Optional)</Label>
                <Input
                  id="org-logo"
                  placeholder="https://example.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="org-color" className="flex items-center gap-1">
                  <Palette className="size-3.5" /> Brand Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="org-color-picker"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-10 p-1 rounded-xl cursor-pointer shrink-0"
                  />
                  <Input
                    id="org-color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="rounded-xl font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/50 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenModal(false)}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
              >
                {loading ? "Creating…" : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Organization Modal */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="size-5 text-primary" /> Rename Organization
            </DialogTitle>
            <DialogDescription>
              Update the name of the organization workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRename} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rename-org-name">New Name</Label>
              <Input
                id="rename-org-name"
                placeholder="Acme Marketing"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border/50 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenameDialogOpen(false)}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={renameLoading || !newOrgName.trim() || newOrgName === renamingOrg?.name}
                className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
              >
                {renameLoading ? "Saving…" : "Save Name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
