import { CalendarDays, CreditCard, Ticket, Wallet } from "lucide-react";
import { BarChart } from "../../components/Charts";
import { StatCard } from "../../components/ui/StatCard";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { money } from "../../utils/format";

export default function Dashboard() {
  const data = useDashboardData();
  const revenue = data.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  return (
    <div className="page-shell">
      <div><p className="page-kicker">SULOM dashboard</p><h1 className="page-title">League Operations</h1></div>
      <div className="dashboard-grid">
        <StatCard icon={CalendarDays} label="Fixtures" value={data.matches.length} />
        <StatCard icon={Ticket} label="Tickets" value={data.tickets.length} />
        <StatCard icon={CreditCard} label="Payments" value={data.payments.length} />
        <StatCard icon={Wallet} label="Sales" value={money.format(revenue)} />
      </div>
      <div className="content-grid">
        <BarChart title="Ticket Category Distribution" values={data.categories.map((category) => ({ label: category.name, value: data.tickets.filter((ticket) => ticket.category?.id === category.id).length }))} />
        <DataTable data={data.matches} columns={[
          { key: "match", header: "Match", render: (item) => item.label },
          { key: "stadium", header: "Stadium", render: (item) => item.stadium?.name },
          { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
        ]} />
      </div>
    </div>
  );
}
