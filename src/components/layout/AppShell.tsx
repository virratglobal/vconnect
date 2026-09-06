import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  BarChart3,
  Settings,
  MessageSquare,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronsUpDown,
  Check,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useActiveTenant, canManage } from "@/hooks/use-tenant";
import { useBranding } from "@/hooks/use-branding";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeId, tenants } = useActiveTenant();
  const qc = useQueryClient();
  const [stopping, setStopping] = useState(false);

  const isImpersonating =
    typeof window !== "undefined" && localStorage.getItem("wa-crm.impersonator") === "true";
  const activeOrganizationName =
    tenants.find((t) => t.tenant_id === activeId)?.tenants.name ?? "Organization";

  async function handleStopImpersonation() {
    if (!activeId) return;
    setStopping(true);
    try {
      const { error } = await supabase.rpc("stop_impersonating_tenant", { _tenant_id: activeId });
      if (error) throw error;

      // Clear flags
      localStorage.removeItem("wa-crm.impersonator");

      // Invalidate queries to reload original organizations list
      await qc.invalidateQueries({ queryKey: ["my-tenants"] });

      toast.success("Impersonation ended.");

      // Redirect back to super-admin dashboard
      window.location.href = "/super-admin";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to stop impersonation");
    } finally {
      setStopping(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-amber-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between gap-4 z-50 sticky top-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="truncate">
              Impersonating Organization: <strong>{activeOrganizationName}</strong> (Super Admin
              Mode)
            </span>
          </div>
          <button
            onClick={handleStopImpersonation}
            disabled={stopping}
            className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition border border-white/25 shrink-0 disabled:opacity-50"
          >
            {stopping ? "Stopping…" : "Return to Super Admin"}
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex w-[260px] flex-col border-r border-sidebar-border bg-sidebar">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopNav onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const { tenants, activeId, switchTenant, membership } = useActiveTenant();
  const active = tenants.find((t) => t.tenant_id === activeId);
  const { branding } = useBranding();

  const { data: profile } = useQuery({
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
  const isSuper = profile?.is_super_admin;

  const hasAccessToTemplates = canManage(membership?.role, "manager") || isSuper;

  const dynamicNav: NavItem[] = activeId
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { to: "/contacts", label: "Contacts", icon: Users },
        ...(hasAccessToTemplates ? [{ to: "/templates", label: "Templates", icon: FileText }] : []),
        { to: "/campaigns", label: "Campaigns", icon: Send },
        { to: "/conversations", label: "Conversations", icon: MessageSquare },
        { to: "/reports", label: "Reports", icon: BarChart3 },
        ...(canManage(membership?.role, "manager") || isSuper ? [{ to: "/settings", label: "Settings", icon: Settings }] : []),
      ]
    : [
        { to: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
        { to: "/organization", label: "Organization", icon: Users },
        { to: "/account-settings", label: "Account Settings", icon: Settings },
        { to: "/help", label: "Help", icon: HelpCircle },
      ];

  return (
    <>
      <div className="h-16 px-4 flex items-center border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          {branding?.company_logo ? (
            <img
               src={branding.company_logo}
               alt={branding.company_name || "VCONNECT"}
               className="h-11 max-w-[180px] object-contain"
               fetchPriority="high"
             />
           ) : (
             <img
               src="/logo.png"
               alt="VCONNECT"
               className="h-11 max-w-[180px] object-contain"
               fetchPriority="high"
             />
           )}
        </Link>
      </div>

      {activeId && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{active?.tenants.name ?? "Organization"}</div>
                <div className="text-xs text-muted-foreground capitalize">{membership?.role}</div>
              </div>
              <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[230px]">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {tenants.map((t) => (
                <DropdownMenuItem key={t.tenant_id} onClick={() => switchTenant(t.tenant_id)}>
                  <span className="flex-1 truncate">{t.tenants.name}</span>
                  {t.tenant_id === activeId && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {dynamicNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              viewTransition
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {isSuper && (
          <Link
            to="/super-admin"
            onClick={onNavigate}
            viewTransition
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-4 pt-4 border-t border-sidebar-border",
              location.pathname === "/super-admin" || location.pathname.startsWith("/super-admin/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <Shield className="size-[18px] shrink-0" />
            <span>Super Admin</span>
          </Link>
        )}
      </nav>
    </>
  );
}

function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  // Realtime: get notified when a conversation is assigned to you
  // or when you are @mentioned in an internal note
  useEffect(() => {
    if (!user?.id) return;

    // 1. Assignment notifications — listen for any conversation updates
    //    where assigned_to changes to the current user
    const assignChannel = supabase
      .channel(`assign-notif:${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        (payload) => {
          const newRow = payload.new as Record<string, any>;
          const oldRow = payload.old as Record<string, any>;
          // Only fire if assigned_to changed TO this user (not FROM this user)
          if (newRow?.assigned_to === user.id && oldRow?.assigned_to !== user.id) {
            toast.success("📩 A conversation has been assigned to you.", {
              description: "Open Conversations to view it.",
              duration: 6000,
            });
            setNotifCount((c) => c + 1);
          }
        },
      )
      .subscribe();

    // 2. Mention notifications — listen for new internal notes mentioning the user
    const mentionChannel = supabase
      .channel(`mention-notif:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_internal_notes" },
        (payload) => {
          const note = payload.new as Record<string, any>;
          const mentions: string[] = Array.isArray(note?.mentions) ? note.mentions : [];
          if (mentions.includes(user.id) && note?.author_id !== user.id) {
            toast.info("💬 You were mentioned in an internal note.", {
              description: "Open the conversation to view it.",
              duration: 6000,
            });
            setNotifCount((c) => c + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignChannel);
      supabase.removeChannel(mentionChannel);
    };
  }, [user?.id]);

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
      <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted">
        <Menu className="size-5" />
      </button>
      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input placeholder="Search contacts, campaigns…" className="pl-9 bg-background" />
      </div>
      <div className="flex-1" />
      <button
        className="p-2 rounded-lg hover:bg-muted relative"
        aria-label="Notifications"
        onClick={() => setNotifCount(0)}
      >
        <Bell className="size-5 text-muted-foreground" />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 size-4 min-w-[1rem] rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center leading-none">
            {notifCount > 9 ? "9+" : notifCount}
          </span>
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-medium">
          {(user?.email?.[0] ?? "U").toUpperCase()}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-sm font-medium truncate">{user?.email}</div>
            <div className="text-xs text-muted-foreground">Signed in</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/account-settings" className="w-full cursor-pointer flex items-center">
              <Settings className="size-4 mr-2" /> Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            <LogOut className="size-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
