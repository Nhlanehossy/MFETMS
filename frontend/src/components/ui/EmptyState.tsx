import { SearchX } from "lucide-react";
import { Card } from "./Card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="grid place-items-center p-10 text-center">
      <SearchX className="mb-3 text-slate-400" />
      <strong className="text-mf-ink">{title}</strong>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
    </Card>
  );
}
