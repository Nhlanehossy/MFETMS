import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  const tones = {
    success: "bg-green-50 text-mf-green ring-green-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    danger: "bg-red-50 text-mf-red ring-red-100",
    info: "bg-blue-50 text-mf-blue ring-blue-100",
    neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1", tones[tone])}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone = ["PAID", "VALID", "ACTIVE", "SUCCESSFUL", "COMPLETED"].includes(status)
    ? "success"
    : ["PENDING", "SCHEDULED"].includes(status)
      ? "warning"
      : ["FAILED", "INVALID", "CANCELLED"].includes(status)
        ? "danger"
        : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}
