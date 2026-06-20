import { TicketCard } from "../../components/TicketCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuthStore } from "../../context/authStore";
import { useDashboardData } from "../../hooks/useApiData";

export default function MyTickets() {
  const data = useDashboardData();
  const user = useAuthStore((store) => store.session.user);
  const tickets = user ? data.tickets.filter((ticket) => ticket.user?.id === user.id) : [];
  return (
    <div className="page-shell">
      <div><p className="page-kicker">Supporter portal</p><h1 className="page-title">My Tickets</h1></div>
      {tickets.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </div>
      ) : (
        <EmptyState title="No tickets yet" message="Buy a match ticket and it will appear in this wallet." />
      )}
    </div>
  );
}
