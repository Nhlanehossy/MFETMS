import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";

export default function VerificationHistory() {
  const data = useDashboardData();
  return (
    <div className="page-shell">
      <div><p className="page-kicker">Ticket officer</p><h1 className="page-title">Verification History</h1></div>
      <DataTable
        data={data.verification}
        columns={[
          { key: "ticket", header: "Ticket", render: (item) => item.ticket?.name ?? "Unknown" },
          { key: "officer", header: "Officer", render: (item) => item.verified_by?.name ?? "-" },
          { key: "gate", header: "Gate", render: (item) => item.gate_number },
          { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
          { key: "time", header: "Time", render: (item) => new Date(item.verification_time).toLocaleString() },
        ]}
      />
    </div>
  );
}
