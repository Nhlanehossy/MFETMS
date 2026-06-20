import { Ticket, Trophy, Wallet, CalendarDays } from "lucide-react";
import { MatchCard } from "../../components/MatchCard";
import { StatCard } from "../../components/ui/StatCard";
import { useAuthStore } from "../../context/authStore";
import { useDashboardData } from "../../hooks/useApiData";
import { money } from "../../utils/format";

export default function Home() {
  const data = useDashboardData();
  const user = useAuthStore((store) => store.session.user);
  const myTickets = user ? data.tickets.filter((ticket) => ticket.user?.id === user.id) : [];
  const ticketValue = myTickets.reduce((sum, ticket) => sum + Number(ticket.purchase_price), 0);
  return (
    <div className="page-shell">
      <div>
        <p className="page-kicker">Supporter portal</p>
        <h1 className="page-title">Welcome{user ? `, ${user.username}` : ""}</h1>
      </div>
      <div className="dashboard-grid">
        <StatCard icon={CalendarDays} label="Available Matches" value={data.matches.length} />
        <StatCard icon={Ticket} label="My Tickets" value={myTickets.length} detail="Login to see your wallet" />
        <StatCard icon={Wallet} label="Ticket Value" value={money.format(ticketValue)} />
        <StatCard icon={Trophy} label="Competitions" value={data.competitions.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {data.matches.map((match) => <MatchCard key={match.id} match={match} />)}
      </div>
    </div>
  );
}
