import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { useDashboardData } from "../../hooks/useApiData";
import { stadiumService } from "../../services/coreServices";
import type { Stadium } from "../../types";

export default function Stadiums() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Stadium | null>(null);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? stadiumService.update(editing.id, payload) : stadiumService.create(payload),
    onSuccess: async () => {
      setShowForm(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["stadiums"] });
    },
  });
  const remove = useMutation({
    mutationFn: stadiumService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stadiums"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(formPayload(event.currentTarget));
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">FAM module</p><h1 className="page-title">Stadiums</h1></div>
        <Button type="button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={16} /> Add Stadium</Button>
      </div>

      {showForm || editing ? (
        <AdminForm title={editing ? `Edit ${editing.name}` : "Create Stadium"} submitLabel={editing ? "Update Stadium" : "Create Stadium"} isSaving={save.isPending} error={save.error?.message} onSubmit={submit}>
          <Field label="Name" name="name" required defaultValue={editing?.name} />
          <Field label="City" name="city" required defaultValue={editing?.city} />
          <Field label="District" name="district" required defaultValue={editing?.district} />
          <Field label="Capacity" name="capacity" type="number" required defaultValue={editing?.capacity} />
          <Field label="Number of Gates" name="number_of_gates" type="number" required defaultValue={editing?.number_of_gates} />
          <SelectField label="Owner" name="owner_id" defaultValue={editing?.owner?.id} options={data.organizations.map((item) => ({ value: item.id, label: item.name }))} />
        </AdminForm>
      ) : null}

      <DataTable
        data={data.stadiums}
        columns={[
          { key: "name", header: "Stadium", render: (item) => <b>{item.name}</b> },
          { key: "city", header: "City", render: (item) => item.city },
          { key: "district", header: "District", render: (item) => item.district },
          { key: "capacity", header: "Capacity", render: (item) => item.capacity.toLocaleString() },
          { key: "gates", header: "Gates", render: (item) => item.number_of_gates },
          { key: "owner", header: "Owner", render: (item) => item.owner?.name ?? "-" },
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
