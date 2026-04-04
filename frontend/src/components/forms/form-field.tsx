import { ReactNode } from "react";

import { Label } from "@/components/ui/label";

export function FormField({
  label,
  error,
  description,
  children
}: {
  label: string;
  error?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground">{label}</Label>
        {description ? <p className="text-xs leading-5 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
      {error ? <p className="text-xs font-medium text-rose-300">{error}</p> : null}
    </div>
  );
}
