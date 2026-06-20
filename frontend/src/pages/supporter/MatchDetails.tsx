import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useDashboardData } from "../../hooks/useApiData";
import { dateLabel, money, timeLabel } from "../../utils/format";

export default function MatchDetails() {
  const { id } = useParams();
  const data = useDashboardData();
  const match = data.matches.find((item) => item.id === Number(id));
  if (!match) return <EmptyState title="Match not found" message="The selected match is not available." />;
  return (
    <div className="page-shell">
      <section className="hero-pattern rounded-2xl p-8 text-white shadow-xl">
        <StatusBadge status={match.status} />
        <h1 className="mt-5 text-4xl font-black">{match.home_team_name} vs {match.away_team_name}</h1>
        <div className="mt-5 grid gap-3 text-white/85 md:grid-cols-3">
          <span className="flex items-center gap-2"><CalendarDays size={18} /> {dateLabel(match.date)} at {timeLabel(match.kickoff_time)}</span>
          <span className="flex items-center gap-2"><MapPin size={18} /> {match.stadium?.name}</span>
          <span className="flex items-center gap-2"><Ticket size={18} /> {match.competition?.name}</span>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {match.ticket_prices.map((price) => (
          <Card key={price.id} className="p-5">
            <p className="page-kicker">{price.ticket_category?.name}</p>
            <strong className="mt-2 block text-2xl">{money.format(price.price)}</strong>
            <p className="mt-2 text-sm text-slate-500">{price.available_quantity} seats available</p>
            <Link to={`/supporter/checkout?match=${match.id}&category=${price.ticket_category?.id}`}>
              <Button className="mt-4 w-full">Purchase</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
