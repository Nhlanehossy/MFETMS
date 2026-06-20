import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Plus, Ticket, Users, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminForm, Field, SelectField, formPayload } from "../../components/admin/AdminForm";
import { RowActions } from "../../components/admin/RowActions";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { useDashboardData } from "../../hooks/useApiData";
import { ticketService } from "../../services/coreServices";
import { money } from "../../utils/format";

export default function TicketSales() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<"category" | "price" | null>(null);
  const total = data.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  const createCategory = useMutation({
    mutationFn: ticketService.createCategory,
    onSuccess: () => {
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  const createPrice = useMutation({
    mutationFn: ticketService.createPrice,
    onSuccess: () => {
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ["prices"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
  const removePrice = useMutation({
    mutationFn: ticketService.removePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prices"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createCategory.mutate(formPayload(event.currentTarget));
  }

  function submitPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formPayload(event.currentTarget);
    payload.available_quantity = payload.quantity;
    createPrice.mutate(payload);
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><p className="page-kicker">SULOM module</p><h1 className="page-title">Ticket Sales</h1></div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setForm(form === "category" ? null : "category")}><Plus size={16} /> Category</Button>
          <Button type="button" onClick={() => setForm(form === "price" ? null : "price")}><Plus size={16} /> Match Price</Button>
        </div>
      </div>
      <div className="dashboard-grid">
        <StatCard icon={Ticket} label="Tickets" value={data.tickets.length} />
        <StatCard icon={Wallet} label="Revenue" value={money.format(total)} />
        <StatCard icon={CreditCard} label="Payments" value={data.payments.length} />
        <StatCard icon={Users} label="Supporters" value={new Set(data.tickets.map((ticket) => ticket.user?.id)).size} />
      </div>

      {form === "category" ? (
        <AdminForm title="Create Ticket Category" submitLabel="Create Category" isSaving={createCategory.isPending} error={createCategory.error?.message} onSubmit={submitCategory}>
          <Field label="Name" name="name" required />
          <Field label="Description" name="description" />
        </AdminForm>
      ) : null}

      {form === "price" ? (
        <AdminForm title="Create Match Ticket Price" submitLabel="Create Price" isSaving={createPrice.isPending} error={createPrice.error?.message} onSubmit={submitPrice}>
          <SelectField label="Match" name="match_id" required options={data.matches.map((item) => ({ value: item.id, label: item.label }))} />
          <SelectField label="Category" name="ticket_category_id" required options={data.categories.map((item) => ({ value: item.id, label: item.name }))} />
          <Field label="Price" name="price" type="number" required />
          <Field label="Quantity" name="quantity" type="number" required />
        </AdminForm>
      ) : null}

      <DataTable data={data.prices} columns={[
        { key: "match", header: "Match", render: (item) => item.match?.name },
        { key: "category", header: "Category", render: (item) => item.ticket_category?.name },
        { key: "price", header: "Price", render: (item) => money.format(item.price) },
        { key: "quantity", header: "Quantity", render: (item) => item.quantity },
        { key: "available", header: "Available", render: (item) => item.available_quantity },
        { key: "actions", header: "Actions", render: (item) => <RowActions onDelete={() => confirm("Delete this price?") && removePrice.mutate(item.id)} /> },
      ]} />

      <DataTable data={data.tickets} columns={[
        { key: "ticket", header: "Ticket", render: (item) => item.ticket_number },
        { key: "supporter", header: "Supporter", render: (item) => item.user?.name },
        { key: "match", header: "Match", render: (item) => item.match?.name },
        { key: "category", header: "Category", render: (item) => item.category?.name },
        { key: "price", header: "Price", render: (item) => money.format(item.purchase_price) },
        { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
      ]} />
    </div>
  );
}
