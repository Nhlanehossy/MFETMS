import { Download, QrCode } from "lucide-react";
import type { Ticket } from "../types";
import { money } from "../utils/format";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/Badge";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-mf-green p-4 text-white">
        <div className="flex items-center justify-between">
          <strong>{ticket.ticket_number}</strong>
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="grid gap-4 p-5">
        <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-mf-green">
          <QrCode size={92} />
          <span className="sr-only">{ticket.qr_code}</span>
        </div>
        <div>
          <h3 className="font-bold text-mf-ink">{ticket.match?.name}</h3>
          <p className="text-sm text-slate-500">
            {ticket.category?.name} - Seat {ticket.seat_number || "Open"} - {money.format(ticket.purchase_price)}
          </p>
        </div>
        <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2 text-sm font-semibold text-mf-ink shadow-sm hover:bg-slate-50" href={`/api/tickets/${ticket.id}/download/`} target="_blank" rel="noreferrer">
          <Download size={16} /> Download E-ticket
        </a>
      </div>
    </Card>
  );
}
