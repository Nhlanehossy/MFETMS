import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { userService } from "../../services/coreServices";
import type { User } from "../../types";

export default function Users() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? userService.update(editing.id, payload) : userService.create(payload),
    onSuccess: async () => {
      setShowForm(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
  const remove = useMutation({
    mutationFn: userService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(formPayload(event.currentTarget));
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">FAM module</p><h1 className="page-title">Users and Roles</h1></div>
        <Button type="button" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={16} /> Add User</Button>
      </div>

      {showForm || editing ? (
        <AdminForm title={editing ? `Edit ${editing.username}` : "Create User"} submitLabel={editing ? "Update User" : "Create User"} isSaving={save.isPending} error={save.error?.message} onSubmit={submit}>
          <Field label="Username" name="username" required defaultValue={editing?.username} />
          <Field label="Email" name="email" type="email" defaultValue={editing?.email} />
          <Field label="First Name" name="first_name" defaultValue={editing?.first_name} />
          <Field label="Last Name" name="last_name" defaultValue={editing?.last_name} />
          <Field label="Phone" name="phone" defaultValue={editing?.phone} />
          <Field label={editing ? "New Password" : "Password"} name="password" type="password" defaultValue={editing ? "" : "Password123!"} />
          <SelectField label="Role" name="role" required defaultValue={editing?.role ?? "SUPPORTER"} options={[
            { value: "SUPER_ADMIN", label: "Super Administrator" },
            { value: "SULOM_ADMIN", label: "SULOM Administrator" },
            { value: "CLUB_ADMIN", label: "Club Administrator" },
            { value: "TICKET_OFFICER", label: "Ticket Officer" },
            { value: "SUPPORTER", label: "Supporter" },
          ]} />
          <SelectField label="Organization" name="organization_id" defaultValue={editing?.organization_id ?? ""} options={data.organizations.map((item) => ({ value: item.id, label: item.name }))} />
          <SelectField label="Account Active" name="is_active" defaultValue={editing?.is_active === false ? "false" : "true"} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} />
          <SelectField label="Profile Status" name="status" defaultValue={editing?.status ?? "ACTIVE"} options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
        </AdminForm>
      ) : null}

      <DataTable
        data={data.users}
        columns={[
          { key: "username", header: "User", render: (item) => <b>{item.username}</b> },
          { key: "email", header: "Email", render: (item) => item.email },
          { key: "role", header: "Role", render: (item) => item.role },
          { key: "organization", header: "Organization", render: (item) => item.organization || "-" },
          { key: "status", header: "Status", render: (item) => <StatusBadge status={item.is_active === false ? "INACTIVE" : "ACTIVE"} /> },
          { key: "actions", header: "Actions", render: (item) => (
            <RowActions
              onEdit={() => { setEditing(item); setShowForm(true); }}
              onDelete={() => confirm(`Delete ${item.username}?`) && remove.mutate(item.id)}
            />
          ) },
        ]}
      />
    </div>
  );
}
