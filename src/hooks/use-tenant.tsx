import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

const STORAGE_KEY = "wa-crm.active-tenant";

export interface TenantMembership {
  tenant_id: string;
  role: "owner" | "admin" | "manager" | "agent";
  tenants: {
    id: string;
    name: string;
    slug: string;
    suspended: boolean;
    branding_level: string;
    custom_domain: string | null;
  };
}

export function useMyTenants() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-tenants", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantMembership[]> => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select(
          "tenant_id, role, tenants:tenant_id(id, name, slug, suspended, branding_level, custom_domain)",
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TenantMembership[];
    },
  });
}

export function useActiveTenant() {
  const { data: tenants, isLoading } = useMyTenants();
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (!tenants?.length) return;
    if (!activeId || !tenants.find((t) => t.tenant_id === activeId)) {
      const first = tenants[0].tenant_id;
      setActiveId(first);
      localStorage.setItem(STORAGE_KEY, first);
    }
  }, [tenants, activeId]);

  const membership = tenants?.find((t) => t.tenant_id === activeId) ?? null;

  return {
    tenants: tenants ?? [],
    activeId,
    membership,
    isLoading,
    switchTenant: (id: string) => {
      setActiveId(id);
      localStorage.setItem(STORAGE_KEY, id);
    },
  };
}

export function canManage(
  role: TenantMembership["role"] | undefined,
  level: "owner" | "admin" | "manager" | "agent",
) {
  if (!role) return false;
  const order = { owner: 4, admin: 3, manager: 2, agent: 1 } as const;
  return order[role] >= order[level];
}
