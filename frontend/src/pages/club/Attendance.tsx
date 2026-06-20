import { Users } from "lucide-react";
import { BarChart } from "../../components/Charts";
import { DataTable } from "../../components/ui/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { useDashboardData } from "../../hooks/useApiData";

export default function Attendance() {
  const data = useDashboardData();
  const rows = data.matches.map((match) => ({
    match: match.label,
    stadium: match.stadium?.name,
    tickets: data.tickets.filter((ticket) => ticket.match?.id === match.id).length,
    used: data.tickets.filter((ticket) => ticket.match?.id === match.id && ticket.status === "USED").length,
  }));
  return (
    <div className="page-shell">
      <div>
        <p className="page-kicker">Club module</p>
        <h1 className="page-title">Attendance Statistics</h1>
      </div>
      <div className="dashboard-grid">
        <StatCard icon={Users} label="Tickets Issued" value={data.tickets.length} />
        <StatCard icon={Users} label="Used Tickets" value={data.tickets.filter((ticket) => ticket.status === "USED").length} />
        <StatCard icon={Users} label="Matches" value={data.matches.length} />
        <StatCard icon={Users} label="Clubs" value={data.clubs.length} />
      </div>
      <div className="content-grid">
        <BarChart title="Attendance Trend" values={rows.map((row) => ({ label: row.match, value: row.tickets }))} />
        <DataTable
          data={rows}
          columns={[
            { key: "match", header: "Match", render: (item) => item.match },
            { key: "stadium", header: "Stadium", render: (item) => item.stadium },
            { key: "tickets", header: "Tickets", render: (item) => item.tickets },
            { key: "used", header: "Used", render: (item) => item.used },
          ]}
        />
      </div>
    </div>
  );
}
