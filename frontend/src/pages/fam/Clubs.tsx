import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { clubService } from "../../services/coreServices";
import type { Club } from "../../types";

export default function Clubs() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Club | null>(null);
  const clubOrganizations = data.organizations.filter((organization) => organization.organization_type === "CLUB");

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? clubService.update(editing.id, payload) : clubService.create(payload),
    onSuccess: async () => {
      setShowForm(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
  const remove = useMutation({
    mutationFn: clubService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clubs"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(formPayload(event.currentTarget));
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">FAM module</p><h1 className="page-title">Clubs</h1></div>
        <Button type="button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={16} /> Add Club</Button>
      </div>

      {showForm || editing ? (
        <AdminForm title={editing ? `Edit ${editing.organization?.name}` : "Create Club"} submitLabel={editing ? "Update Club" : "Create Club"} isSaving={save.isPending} error={save.error?.message} onSubmit={submit}>
          <SelectField label="Organization" name="organization_id" required defaultValue={editing?.organization?.id} options={clubOrganizations.map((item) => ({ value: item.id, label: item.name }))} />
          <Field label="Short Name" name="short_name" required defaultValue={editing?.short_name} />
          <Field label="City" name="city" required defaultValue={editing?.city} />
          <Field label="Founded Year" name="founded_year" type="number" defaultValue={editing?.founded_year} />
          <SelectField label="Stadium" name="stadium_id" defaultValue={editing?.stadium?.id} options={data.stadiums.map((item) => ({ value: item.id, label: item.name }))} />
          <Field label="Coach" name="coach" defaultValue={editing?.coach} />
          <SelectField label="Status" name="status" defaultValue={editing?.status ?? "ACTIVE"} options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
        </AdminForm>
      ) : null}

      <DataTable
        data={data.clubs}
        columns={[
          { key: "club", header: "Club", render: (item) => <b>{item.organization?.name}</b> },
          { key: "city", header: "City", render: (item) => item.city },
          { key: "stadium", header: "Stadium", render: (item) => item.stadium?.name },
          { key: "coach", header: "Coach", render: (item) => item.coach },
          { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
          { key: "actions", header: "Actions", render: (item) => (
            <RowActions
              onEdit={() => { setEditing(item); setShowForm(true); }}
              onDelete={() => confirm(`Delete ${item.organization?.name}?`) && remove.mutate(item.id)}
            />
          ) },
        ]}
      />
    </div>
  );
}
