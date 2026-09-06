import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  MessageSquare,
  Plus,
  Building2,
  Globe,
  Clock,
  Palette,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "wa-crm.active-tenant";

export function OnboardingDialog() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal form states
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

      // 2. Set branding details (optional, if provided)
      if (tenantData && (logo.trim() || brandColor !== "#CC1100" || companyName.trim())) {
        const { error: brandingErr } = await supabase.from("tenant_branding").insert({
          tenant_id: tenantData.id,
          company_name: companyName.trim() || name.trim(),
          company_logo: logo.trim() || null,
          primary_color: brandColor,
          secondary_color: "#1f2937",
        });
        // We log branding failure but don't crash organization creation
        if (brandingErr) {
          console.error("Failed to insert branding:", brandingErr);
        }
      }

      toast.success("Organization created successfully");

      // Save active organization ID in localStorage to immediately switch context
      if (tenantData) {
        localStorage.setItem(STORAGE_KEY, tenantData.id);
      }

      // Invalidate queries to reload workspaces list and reload the route
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });
      setOpenModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* App Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="size-12 rounded-2xl bg-[#CC1100] grid place-items-center text-white shadow-lg shadow-[#CC1100]/25">
            <MessageSquare className="size-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            VCONNECT
          </span>
        </div>

        {/* Premium Welcome Onboarding Screen */}
        <Card className="p-8 md:p-12 shadow-xl border border-border/50 bg-card/80 backdrop-blur-md rounded-3xl space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome to VCONNECT
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              You're not part of any organization yet. Create your first organization to start using
              the CRM.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => setOpenModal(true)}
              className="w-full sm:w-auto bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-[#CC1100]/20 gap-2"
            >
              <Plus className="size-5" />
              Create Organization
            </Button>

            <Button
              size="lg"
              variant="outline"
              disabled
              className="w-full sm:w-auto font-semibold px-8 py-6 rounded-xl border-dashed"
            >
              Join Organization (Coming Soon)
            </Button>
          </div>

          <div className="flex justify-center items-center gap-6 pt-6 text-sm border-t border-border/50">
            <a
              href="https://vconnect.virratglobal.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
            >
              Learn More <ExternalLink className="size-3.5" />
            </a>
            <span className="text-border">|</span>
            <button
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive transition font-medium"
            >
              Sign Out
            </button>
          </div>
        </Card>
      </div>

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
    </div>
  );
}
