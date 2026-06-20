import { Building2, CalendarDays, Ticket, Wallet } from "lucide-react";
import { BarChart } from "../../components/Charts";
import { DataTable } from "../../components/ui/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/Badge";
import { SkeletonGrid } from "../../components/ui/Skeleton";
import { useDashboardData } from "../../hooks/useApiData";
import { money } from "../../utils/format";

export default function Dashboard() {
  const data = useDashboardData();
  if (data.isLoading) return <SkeletonGrid />;
  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">FAM dashboard</p><h1 className="page-title">National Football Overview</h1></div>
      </div>
      <div className="dashboard-grid">
        <StatCard icon={Building2} label="Organizations" value={data.organizations.length} detail="Registered football bodies" />
        <StatCard icon={CalendarDays} label="Matches" value={data.matches.length} detail="Across competitions" />
        <StatCard icon={Ticket} label="Tickets Sold" value={data.reports?.national.tickets_sold ?? 0} detail="Paid or used" />
        <StatCard icon={Wallet} label="Revenue" value={money.format(data.reports?.national.total_revenue ?? 0)} detail="Successful payments" />
      </div>
      <div className="content-grid">
        <BarChart title="Attendance by Competition" values={data.competitions.map((competition) => ({ label: competition.name, value: data.matches.filter((match) => match.competition?.id === competition.id).length }))} />
        <DataTable
          data={data.matches.slice(0, 6)}
          columns={[
            { key: "match", header: "Match", render: (item) => item.label },
            { key: "competition", header: "Competition", render: (item) => item.competition?.name },
            { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
