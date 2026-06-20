import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { CompetitionCard } from "../../components/CompetitionCard";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { competitionService } from "../../services/coreServices";
import type { Competition } from "../../types";
import { dateLabel } from "../../utils/format";

export default function Competitions() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? competitionService.update(editing.id, payload) : competitionService.create(payload),
    onSuccess: async () => {
      setShowForm(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
  });
  const remove = useMutation({
    mutationFn: competitionService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["competitions"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(formPayload(event.currentTarget));
  }

  const organizers = data.organizations.filter((organization) => ["FAM", "SULOM", "REGIONAL_ASSOCIATION"].includes(organization.organization_type));

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">FAM module</p><h1 className="page-title">Competitions</h1></div>
        <Button type="button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={16} /> Add Competition</Button>
      </div>

      {showForm || editing ? (
        <AdminForm title={editing ? `Edit ${editing.name}` : "Create Competition"} submitLabel={editing ? "Update Competition" : "Create Competition"} isSaving={save.isPending} error={save.error?.message} onSubmit={submit}>
          <Field label="Name" name="name" required defaultValue={editing?.name} />
          <SelectField label="Organizer" name="organizer_id" required defaultValue={editing?.organizer?.id} options={organizers.map((item) => ({ value: item.id, label: item.name }))} />
          <Field label="Season" name="season" required defaultValue={editing?.season ?? "2026"} />
          <SelectField label="Type" name="competition_type" required defaultValue={editing?.competition_type} options={[
            { value: "LEAGUE", label: "League" },
            { value: "CUP", label: "Cup" },
            { value: "WOMENS_LEAGUE", label: "Women's League" },
            { value: "DIVISION", label: "Division" },
          ]} />
          <Field label="Start Date" name="start_date" type="date" required defaultValue={editing?.start_date} />
          <Field label="End Date" name="end_date" type="date" required defaultValue={editing?.end_date} />
          <SelectField label="Status" name="status" defaultValue={editing?.status ?? "ACTIVE"} options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
        </AdminForm>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.competitions.map((competition) => <CompetitionCard key={competition.id} competition={competition} clubCount={data.clubs.length} />)}
      </div>

      <DataTable
        data={data.competitions}
        columns={[
          { key: "name", header: "Competition", render: (item) => <b>{item.name}</b> },
          { key: "organizer", header: "Organizer", render: (item) => item.organizer?.name },
          { key: "season", header: "Season", render: (item) => item.season },
          { key: "dates", header: "Dates", render: (item) => `${dateLabel(item.start_date)} - ${dateLabel(item.end_date)}` },
          { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
          { key: "actions", header: "Actions", render: (item) => (
            <RowActions
              onEdit={() => { setEditing(item); setShowForm(true); }}
              onDelete={() => confirm(`Delete ${item.name}?`) && remove.mutate(item.id)}
            />
          ) },
        ]}
      />
    </div>
  );
}
