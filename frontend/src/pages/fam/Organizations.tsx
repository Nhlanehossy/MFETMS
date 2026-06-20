import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { organizationService } from "../../services/coreServices";
import type { Organization } from "../../types";

export default function Organizations() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? organizationService.update(editing.id, payload) : organizationService.create(payload),
    onSuccess: async () => {
      setShowForm(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
  const remove = useMutation({
    mutationFn: organizationService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizations"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(formPayload(event.currentTarget));
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">FAM module</p><h1 className="page-title">Organizations</h1></div>
        <Button type="button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={16} /> Add Organization</Button>
      </div>

      {showForm || editing ? (
        <AdminForm title={editing ? `Edit ${editing.name}` : "Create Organization"} submitLabel={editing ? "Update Organization" : "Create Organization"} isSaving={save.isPending} error={save.error?.message} onSubmit={submit}>
          <Field label="Name" name="name" required defaultValue={editing?.name} />
          <Field label="Short Name" name="short_name" required defaultValue={editing?.short_name} />
          <SelectField label="Type" name="organization_type" required defaultValue={editing?.organization_type} options={[
            { value: "FAM", label: "FAM" },
            { value: "SULOM", label: "SULOM" },
            { value: "REGIONAL_ASSOCIATION", label: "Regional Association" },
            { value: "CLUB", label: "Club" },
          ]} />
          <Field label="Email" name="email" type="email" defaultValue={editing?.email} />
          <Field label="Phone" name="phone" defaultValue={editing?.phone} />
          <Field label="Address" name="address" defaultValue={editing?.address} />
          <Field label="Website" name="website" defaultValue={editing?.website} />
          <SelectField label="Status" name="status" defaultValue={editing?.status ?? "ACTIVE"} options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
        </AdminForm>
      ) : null}

      <DataTable
        data={data.organizations}
        columns={[
          { key: "name", header: "Name", render: (item) => <b>{item.name}</b> },
          { key: "short", header: "Short", render: (item) => item.short_name },
          { key: "type", header: "Type", render: (item) => item.organization_type },
          { key: "contact", header: "Contact", render: (item) => <span>{item.email}<br /><small className="text-slate-500">{item.phone}</small></span> },
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
