import { CalendarDays, Ticket, Users, Wallet } from "lucide-react";
import { BarChart } from "../../components/Charts";
import { DataTable } from "../../components/ui/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { useDashboardData } from "../../hooks/useApiData";
import { money } from "../../utils/format";

export default function Dashboard() {
  const data = useDashboardData();
  const clubRevenue = data.revenue.reduce((sum, item) => sum + Number(item.home_team_share) + Number(item.away_team_share), 0);
  return (
    <div className="page-shell">
      <div>
        <p className="page-kicker">Club dashboard</p>
        <h1 className="page-title">Club Performance Overview</h1>
      </div>
      <div className="dashboard-grid">
        <StatCard icon={Users} label="Clubs" value={data.clubs.length} detail="Registered clubs" />
        <StatCard icon={CalendarDays} label="Fixtures" value={data.matches.length} detail="Current calendar" />
        <StatCard icon={Ticket} label="Tickets" value={data.tickets.length} detail="Sold and issued" />
        <StatCard icon={Wallet} label="Club Revenue" value={money.format(clubRevenue)} detail="Home and away shares" />
      </div>
      <div className="content-grid">
        <BarChart title="Home Match Ticket Count" values={data.matches.map((match) => ({ label: match.home_team_name, value: data.tickets.filter((ticket) => ticket.match?.id === match.id).length }))} />
        <DataTable
          data={data.clubs}
          columns={[
            { key: "club", header: "Club", render: (item) => <b>{item.organization?.name}</b> },
            { key: "city", header: "City", render: (item) => item.city },
            { key: "stadium", header: "Stadium", render: (item) => item.stadium?.name },
            { key: "coach", header: "Coach", render: (item) => item.coach },
          ]}
        />
      </div>
    </div>
  );
}
