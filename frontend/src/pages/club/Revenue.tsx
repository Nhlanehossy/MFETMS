import { Download, Wallet } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { useDashboardData } from "../../hooks/useApiData";
import { money } from "../../utils/format";

export default function Revenue() {
  const data = useDashboardData();
  const home = data.revenue.reduce((sum, item) => sum + Number(item.home_team_share), 0);
  const away = data.revenue.reduce((sum, item) => sum + Number(item.away_team_share), 0);
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-kicker">Club module</p>
          <h1 className="page-title">Match Revenue</h1>
        </div>
        <Button variant="secondary">
          <Download size={16} /> Export
        </Button>
      </div>
      <div className="dashboard-grid">
        <StatCard icon={Wallet} label="Home Share" value={money.format(home)} />
        <StatCard icon={Wallet} label="Away Share" value={money.format(away)} />
        <StatCard icon={Wallet} label="Total Club Share" value={money.format(home + away)} />
        <StatCard icon={Wallet} label="Distributions" value={data.revenue.length} />
      </div>
      <DataTable
        data={data.revenue}
        columns={[
          { key: "match", header: "Match", render: (item) => item.match?.name },
          { key: "total", header: "Total Revenue", render: (item) => money.format(item.total_revenue) },
          { key: "home", header: "Home Club", render: (item) => money.format(item.home_team_share) },
          { key: "away", header: "Away Club", render: (item) => money.format(item.away_team_share) },
          { key: "date", header: "Distribution Date", render: (item) => new Date(item.distribution_date).toLocaleString() },
        ]}
      />
    </div>
  );
}
