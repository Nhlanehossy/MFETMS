import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, formPayload } from "../../components/admin/AdminForm";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { useDashboardData } from "../../hooks/useApiData";
import { reportService } from "../../services/coreServices";
import { cn } from "../../utils/cn";
import { money } from "../../utils/format";

type RevenueTab = "matches" | "rules" | "exports";

const tabs: Array<{ id: RevenueTab; label: string; description: string }> = [
  { id: "matches", label: "Match Distributions", description: "Revenue split per match." },
  { id: "rules", label: "Sharing Rules", description: "Configure stakeholder percentages." },
  { id: "exports", label: "Exports", description: "Prepare report outputs." },
];

export default function RevenueReports() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<RevenueTab>("matches");
  const calculate = useMutation({
    mutationFn: reportService.calculateRevenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
  const createRule = useMutation({
    mutationFn: reportService.createRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["revenue-rules"] }),
  });

  function submitRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createRule.mutate(formPayload(event.currentTarget));
  }

  const totals = data.revenue.reduce((acc, item) => ({
    total: acc.total + Number(item.total_revenue),
    fam: acc.fam + Number(item.fam_share),
    sulom: acc.sulom + Number(item.sulom_share),
    club: acc.club + Number(item.home_team_share) + Number(item.away_team_share),
    stadium: acc.stadium + Number(item.stadium_share),
    security: acc.security + Number(item.security_share),
  }), { total: 0, fam: 0, sulom: 0, club: 0, stadium: 0, security: 0 });

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-kicker">FAM module</p>
          <h1 className="page-title">Revenue Reports</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary"><FileText size={16} /> PDF</Button>
          <Button variant="secondary"><FileSpreadsheet size={16} /> Excel</Button>
          <Button variant="secondary"><Download size={16} /> CSV</Button>
        </div>
      </div>

      <div className="dashboard-grid">
        <StatCard icon={Download} label="Total Revenue" value={money.format(totals.total)} />
        <StatCard icon={Download} label="FAM Share" value={money.format(totals.fam)} />
        <StatCard icon={Download} label="SULOM Share" value={money.format(totals.sulom)} />
        <StatCard icon={Download} label="Club Share" value={money.format(totals.club)} />
      </div>

      <Card className="p-2">
        <div className="grid gap-2 md:grid-cols-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "rounded-lg px-4 py-3 text-left transition",
                activeTab === tab.id ? "bg-mf-green text-white shadow-sm" : "text-slate-600 hover:bg-slate-50",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <strong className="block text-sm">{tab.label}</strong>
              <span className={cn("mt-1 block text-xs", activeTab === tab.id ? "text-white/75" : "text-slate-500")}>{tab.description}</span>
            </button>
          ))}
        </div>
      </Card>

      {activeTab === "matches" ? (
        <section className="grid gap-4">
          <Card className="p-5">
            <CardHeader title="Match Revenue Distributions" eyebrow="Match reports" />
            <p className="text-sm text-slate-500">
              Recalculate a match after payment changes to refresh FAM, SULOM, club, stadium, and security shares.
            </p>
          </Card>
          <DataTable
            data={data.revenue}
            columns={[
              { key: "match", header: "Match", render: (item) => item.match?.name },
              { key: "total", header: "Total", render: (item) => money.format(item.total_revenue) },
              { key: "fam", header: "FAM", render: (item) => money.format(item.fam_share) },
              { key: "sulom", header: "SULOM", render: (item) => money.format(item.sulom_share) },
              { key: "club", header: "Clubs", render: (item) => money.format(Number(item.home_team_share) + Number(item.away_team_share)) },
              { key: "stadium", header: "Stadium", render: (item) => money.format(item.stadium_share) },
              { key: "security", header: "Security", render: (item) => money.format(item.security_share) },
              { key: "actions", header: "Actions", render: (item) => <Button type="button" variant="secondary" onClick={() => calculate.mutate(item.match.id)}>Recalculate</Button> },
            ]}
          />
        </section>
      ) : null}

      {activeTab === "rules" ? (
        <section className="grid gap-4">
          <AdminForm title="Create Active Revenue Share Rule" submitLabel="Save Rule" isSaving={createRule.isPending} error={createRule.error?.message} onSubmit={submitRule}>
            <Field label="Rule Name" name="name" required defaultValue="Gate collection sharing" />
            <Field label="FAM %" name="fam_percentage" type="number" required defaultValue={5} />
            <Field label="SULOM %" name="sulom_percentage" type="number" required defaultValue={10} />
            <Field label="Home Club %" name="home_team_percentage" type="number" required defaultValue={45} />
            <Field label="Away Club %" name="away_team_percentage" type="number" required defaultValue={30} />
            <Field label="Stadium %" name="stadium_percentage" type="number" required defaultValue={5} />
            <Field label="Security %" name="security_percentage" type="number" required defaultValue={5} />
          </AdminForm>
          <DataTable
            data={data.revenueRules}
            columns={[
              { key: "name", header: "Rule", render: (item) => <b>{item.name}</b> },
              { key: "fam", header: "FAM", render: (item) => `${item.fam_percentage}%` },
              { key: "sulom", header: "SULOM", render: (item) => `${item.sulom_percentage}%` },
              { key: "home", header: "Home", render: (item) => `${item.home_team_percentage}%` },
              { key: "away", header: "Away", render: (item) => `${item.away_team_percentage}%` },
              { key: "stadium", header: "Stadium", render: (item) => `${item.stadium_percentage}%` },
              { key: "security", header: "Security", render: (item) => `${item.security_percentage}%` },
              { key: "active", header: "Active", render: (item) => item.active ? "Yes" : "No" },
            ]}
          />
        </section>
      ) : null}

      {activeTab === "exports" ? (
        <section className="grid gap-4 md:grid-cols-3">
          <ExportCard icon={<FileText size={22} />} title="PDF Report" description="Board-ready revenue report for meetings and approvals." />
          <ExportCard icon={<FileSpreadsheet size={22} />} title="Excel Workbook" description="Detailed match revenue data for finance teams." />
          <ExportCard icon={<Download size={22} />} title="CSV Data" description="Raw distribution data for external analysis tools." />
        </section>
      ) : null}
    </div>
  );
}

function ExportCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="grid gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-mf-green">{icon}</span>
      <div>
        <h2 className="font-bold text-mf-ink">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <Button type="button" variant="secondary">Generate</Button>
    </Card>
  );
}
