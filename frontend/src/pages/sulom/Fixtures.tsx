import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { SearchInput, SelectFilter } from "../../components/FilterPanel";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { matchService } from "../../services/coreServices";
import type { Match } from "../../types";
import { dateLabel, timeLabel } from "../../utils/format";

export default function Fixtures() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [competition, setCompetition] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const rows = useMemo(() => data.matches.filter((match) =>
    match.label.toLowerCase().includes(search.toLowerCase()) && (!competition || match.competition?.name === competition)
  ), [data.matches, search, competition]);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? matchService.update(editing.id, payload) : matchService.create(payload),
    onSuccess: async () => {
      setShowForm(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
  const remove = useMutation({
    mutationFn: matchService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formPayload(event.currentTarget);
    if (payload.home_team_id === payload.away_team_id) {
      alert("Home and away teams must be different.");
      return;
    }
    save.mutate(payload);
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">SULOM module</p><h1 className="page-title">Fixtures</h1></div>
        <Button type="button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={16} /> Add Fixture</Button>
      </div>

      {showForm || editing ? (
        <AdminForm title={editing ? `Edit ${editing.label}` : "Create Fixture"} submitLabel={editing ? "Update Fixture" : "Create Fixture"} isSaving={save.isPending} error={save.error?.message} onSubmit={submit}>
          <SelectField label="Competition" name="competition_id" required defaultValue={editing?.competition?.id} options={data.competitions.map((item) => ({ value: item.id, label: item.name }))} />
          <Field label="Match Day" name="match_day" type="number" required defaultValue={editing?.match_day ?? 1} />
          <SelectField label="Home Team" name="home_team_id" required defaultValue={editing?.home_team?.id} options={data.clubs.map((item) => ({ value: item.id, label: item.organization?.name }))} />
          <SelectField label="Away Team" name="away_team_id" required defaultValue={editing?.away_team?.id} options={data.clubs.map((item) => ({ value: item.id, label: item.organization?.name }))} />
          <SelectField label="Stadium" name="stadium_id" required defaultValue={editing?.stadium?.id} options={data.stadiums.map((item) => ({ value: item.id, label: item.name }))} />
          <Field label="Date" name="date" type="date" required defaultValue={editing?.date} />
          <Field label="Kickoff Time" name="kickoff_time" type="time" required defaultValue={editing?.kickoff_time?.slice(0, 5)} />
          <SelectField label="Status" name="status" defaultValue={editing?.status ?? "SCHEDULED"} options={[
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "ONGOING", label: "Ongoing" },
            { value: "COMPLETED", label: "Completed" },
            { value: "POSTPONED", label: "Postponed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]} />
        </AdminForm>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search fixtures" />
        <SelectFilter label="Competition" value={competition} onChange={setCompetition} options={data.competitions.map((item) => item.name)} />
      </div>
      <DataTable data={rows} columns={[
        { key: "competition", header: "Competition", render: (item) => item.competition?.name },
        { key: "home", header: "Home Team", render: (item) => item.home_team_name },
        { key: "away", header: "Away Team", render: (item) => item.away_team_name },
        { key: "date", header: "Date", render: (item) => dateLabel(item.date) },
        { key: "time", header: "Time", render: (item) => timeLabel(item.kickoff_time) },
        { key: "stadium", header: "Stadium", render: (item) => item.stadium?.name },
        { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
        { key: "actions", header: "Actions", render: (item) => (
          <RowActions
            onEdit={() => { setEditing(item); setShowForm(true); }}
            onDelete={() => confirm(`Delete ${item.label}?`) && remove.mutate(item.id)}
          />
        ) },
      ]} />
    </div>
  );
}
