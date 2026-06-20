import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-mf-border bg-white shadow-sm", className)} {...props} />;
}

export function CardHeader({ title, action, eyebrow }: { title: string; action?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="page-kicker">{eyebrow}</p> : null}
        <h2 className="text-lg font-bold text-mf-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
