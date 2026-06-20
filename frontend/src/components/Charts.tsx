import { Card, CardHeader } from "./ui/Card";

export function BarChart({ title, values }: { title: string; values: Array<{ label: string; value: number }> }) {
  const max = Math.max(...values.map((item) => item.value), 1);
  return (
    <Card className="p-5">
      <CardHeader title={title} />
      <div className="space-y-3">
        {values.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-mf-green" style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
