import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { useDashboardData } from "../../hooks/useApiData";
import { verificationService } from "../../services/coreServices";

const schema = z.object({
  qr_code: z.string().min(3),
  verified_by_id: z.number().optional(),
  gate_number: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function Scanner() {
  const data = useDashboardData();
  const queryClient = useQueryClient();
  const officer = data.users.find((user) => user.username.includes("officer"));
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { qr_code: data.tickets[0]?.qr_code ?? "", verified_by_id: officer?.id, gate_number: 1 },
  });
  const scan = useMutation({
    mutationFn: verificationService.scan,
    onSuccess: () => queryClient.invalidateQueries(),
  });
  return (
    <div className="page-shell">
      <div><p className="page-kicker">Ticket officer</p><h1 className="page-title">QR Scanner</h1></div>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="grid min-h-[420px] place-items-center border-dashed p-8 text-center">
          <QrCode className="mb-4 text-mf-green" size={150} />
          <h2 className="text-2xl font-black">Scanner Area</h2>
          <p className="mt-2 max-w-md text-slate-500">Select a seeded QR code or paste a scanned code to verify entry at the gate.</p>
        </Card>
        <Card className="h-fit p-5">
          <form className="grid gap-4" onSubmit={handleSubmit((values) => scan.mutate(values))}>
            <label className="grid gap-2 text-sm font-semibold text-slate-600">QR Code
              <select className="rounded-lg border border-mf-border p-3" {...register("qr_code")}>
                {data.tickets.map((ticket) => <option key={ticket.id} value={ticket.qr_code}>{ticket.ticket_number} - {ticket.status}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-600">Gate Number
            <input className="rounded-lg border border-mf-border p-3" type="number" {...register("gate_number", { valueAsNumber: true })} />
            </label>
            <input type="hidden" {...register("verified_by_id", { valueAsNumber: true })} />
            <Button disabled={scan.isPending}>Verify Ticket</Button>
          </form>
          {scan.data ? <div className="mt-5 rounded-xl bg-slate-50 p-4"><StatusBadge status={scan.data.status} /><p className="mt-2 text-sm text-slate-600">{scan.data.message}</p></div> : null}
          {scan.error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-mf-red">{scan.error.message}</p> : null}
        </Card>
      </div>
    </div>
  );
}
