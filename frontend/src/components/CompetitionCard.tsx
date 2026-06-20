import { Trophy } from "lucide-react";
import type { Competition } from "../types";
import { dateLabel } from "../utils/format";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/Badge";

export function CompetitionCard({ competition, clubCount }: { competition: Competition; clubCount: number }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-mf-gold">
          <Trophy />
        </span>
        <StatusBadge status={competition.status} />
      </div>
      <h3 className="mt-4 text-lg font-black text-mf-ink">{competition.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{competition.organizer?.name}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <span className="rounded-lg bg-slate-50 p-3">
          <b className="block text-mf-ink">{competition.season}</b>
          Season
        </span>
        <span className="rounded-lg bg-slate-50 p-3">
          <b className="block text-mf-ink">{clubCount}</b>
          Clubs
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        {dateLabel(competition.start_date)} - {dateLabel(competition.end_date)}
      </p>
    </Card>
  );
}
