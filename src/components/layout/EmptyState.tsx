import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-16 text-center">
      <div className="size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto mb-4">
        <Icon className="size-7" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
