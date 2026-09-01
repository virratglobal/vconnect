import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({ meta: [{ title: "Contacts · Virrat Reach" }] }),
  component: ContactsLayout,
});

const tabs = [
  { to: "/contacts", label: "All Contacts", exact: true },
  { to: "/contacts/bulk", label: "Bulk Add" },
  { to: "/contacts/import", label: "CSV Import" },
  { to: "/contacts/tags", label: "Tags & Groups" },
];

function ContactsLayout() {
  const location = useLocation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your WhatsApp audience — add, import, tag, and group.
        </p>
      </div>
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((t) => {
            const isActive = t.exact
              ? location.pathname === t.to
              : location.pathname === t.to || location.pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
