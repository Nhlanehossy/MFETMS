import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import type { Match } from "../types";
import { dateLabel, initials, money, timeLabel } from "../utils/format";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/Badge";

export function MatchCard({ match, publicLinks = false }: { match: Match; publicLinks?: boolean }) {
  const minPrice = match.ticket_prices?.length ? Math.min(...match.ticket_prices.map((price) => Number(price.price))) : 0;
  const detailsPath = publicLinks ? `/matches/${match.id}` : `/supporter/matches/${match.id}`;
  const checkoutPath = publicLinks ? "/login" : `/supporter/checkout?match=${match.id}`;
  const checkoutState = publicLinks ? { from: `/supporter/checkout?match=${match.id}` } : undefined;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <StatusBadge status={match.status} />
        <span className="text-xs font-bold text-slate-500">{match.competition?.name}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <TeamBadge name={match.home_team_name} />
        <strong className="rounded-full bg-slate-100 px-3 py-1 text-sm">VS</strong>
        <TeamBadge name={match.away_team_name} />
      </div>
      <div className="mt-5 grid gap-2 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <CalendarDays size={16} /> {dateLabel(match.date)} at {timeLabel(match.kickoff_time)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={16} /> {match.stadium?.name}
        </span>
        <span className="flex items-center gap-2">
          <Ticket size={16} /> From {money.format(minPrice)}
        </span>
      </div>
      <div className="mt-5 flex gap-2">
        <Link className="flex-1 rounded-lg bg-mf-green px-4 py-2 text-center text-sm font-semibold text-white shadow-sm" to={detailsPath}>
          View Details
        </Link>
        <Link className="flex-1 rounded-lg border border-mf-border px-4 py-2 text-center text-sm font-semibold text-mf-green" to={checkoutPath} state={checkoutState}>
          Buy
        </Link>
      </div>
    </Card>
  );
}

function TeamBadge({ name }: { name: string }) {
  return (
    <div className="grid place-items-center gap-2">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-mf-green text-sm font-black text-white shadow-sm">{initials(name)}</span>
      <strong className="text-sm text-mf-ink">{name}</strong>
    </div>
  );
}
