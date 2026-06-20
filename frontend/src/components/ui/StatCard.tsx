import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail?: string; icon: LucideIcon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
          <strong className="mt-2 block text-2xl font-black text-mf-ink">{value}</strong>
          {detail ? <span className="mt-1 block text-sm text-slate-500">{detail}</span> : null}
        </div>
        <span className="rounded-xl bg-green-50 p-3 text-mf-green">
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
}
