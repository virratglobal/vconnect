import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useActiveTenant } from "@/hooks/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNotificationSound } from "@/hooks/use-notification-sound";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: () => (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  ),
});

function AuthGate() {
  const { user, loading } = useAuth();
  const { tenants, activeId, isLoading: tenantLoading } = useActiveTenant();

  // Mount notification sound globally for the authenticated session
  useNotificationSound(activeId);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, navigate]);

  // Query profile to check if user is a super admin
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  // Query to get the owner's email for active tenant
  const { data: ownerEmail, isLoading: ownerEmailLoading } = useQuery({
    queryKey: ["active-tenant-owner-email", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data: tm } = await supabase
        .from("tenant_members")
        .select("user_id")
        .eq("tenant_id", activeId!)
        .eq("role", "owner")
        .maybeSingle();
      if (!tm?.user_id) return null;
      const { data: p } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", tm.user_id)
        .maybeSingle();
      return p?.email ?? null;
    },
  });

  // Guard routing: check if user has no active organization
  useEffect(() => {
    if (!loading && !tenantLoading && user && !activeId) {
      const allowedPaths = ["/dashboard", "/organization", "/account-settings", "/help"];
      const isAllowed = allowedPaths.some(
        (path) => location.pathname === path || location.pathname.startsWith(path + "/"),
      );
      if (!isAllowed) {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [activeId, location.pathname, loading, tenantLoading, user, navigate]);

  if (loading || tenantLoading || profileLoading || ownerEmailLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading organization…
      </div>
    );
  }

  if (!user) return null;

  // Render onboarding screen inline inside dashboard component if no organization context exists
  const hasActiveOrg = !!activeId;

  const activeTenant = tenants.find((t) => t.tenant_id === activeId)?.tenants;
  const isSuspended = activeTenant?.suspended && ownerEmail !== "mail@virratglobal.com";
  const isSuper = profile?.is_super_admin;

  if (hasActiveOrg && isSuspended && !isSuper) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="size-16 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto">
            <AlertTriangle className="size-8" />
          </div>
          <h2 className="text-2xl font-bold">Organization Suspended</h2>
          <p className="text-muted-foreground text-sm">
            This organization has been suspended by a platform administrator. If you believe this is
            an error, please contact your administrator or support.
          </p>
          <Button onClick={() => supabase.auth.signOut()}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
