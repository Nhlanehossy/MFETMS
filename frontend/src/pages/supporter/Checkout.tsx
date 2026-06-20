import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { useAuthStore } from "../../context/authStore";
import { useDashboardData } from "../../hooks/useApiData";
import { paymentService, ticketService } from "../../services/coreServices";
import { money } from "../../utils/format";

const schema = z.object({
  match_id: z.coerce.number().min(1),
  category_id: z.coerce.number().min(1),
  seat_number: z.string().optional(),
  provider: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function Checkout() {
  const data = useDashboardData();
  const session = useAuthStore((store) => store.session);
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register, watch, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      match_id: Number(params.get("match") || data.matches[0]?.id || 0),
      category_id: Number(params.get("category") || data.categories[0]?.id || 0),
      seat_number: "AUTO",
      provider: "TNM_MPAMBA",
    },
  });
  const selectedMatch = data.matches.find((match) => match.id === Number(watch("match_id")));
  const selectedPrice = selectedMatch?.ticket_prices.find((price) => price.ticket_category?.id === Number(watch("category_id")));
  const purchase = useMutation({
    mutationFn: async (values: FormValues) => {
      const ticket = await ticketService.purchase({ match_id: values.match_id, category_id: values.category_id, seat_number: values.seat_number });
      await paymentService.record({
        ticket_id: ticket.ticket_id,
        amount: selectedPrice?.price,
        provider: values.provider,
        transaction_reference: `WEB-${ticket.ticket_number}`,
        status: "SUCCESSFUL",
      });
      return ticket;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      navigate("/supporter/my-tickets");
    },
  });

  if (!session.authenticated) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <CreditCard className="mx-auto mb-3 text-mf-green" />
        <h1 className="page-title">Login Required</h1>
        <p className="mt-2 text-slate-500">You must sign in before buying a ticket.</p>
        <Link to="/login"><Button className="mt-5">Login to Continue</Button></Link>
      </Card>
    );
  }

  return (
    <div className="page-shell">
      <div><p className="page-kicker">Supporter portal</p><h1 className="page-title">Checkout</h1></div>
      <form className="grid gap-5 xl:grid-cols-[1fr_360px]" onSubmit={handleSubmit((values) => purchase.mutate(values))}>
        <Card className="grid gap-4 p-5">
          <CardHeader title="Ticket Selection" />
          <label className="grid gap-2 text-sm font-semibold text-slate-600">Match
            <select className="rounded-lg border border-mf-border p-3" {...register("match_id")}>
              {data.matches.map((match) => <option key={match.id} value={match.id}>{match.label} - {match.date}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-600">Category
            <select className="rounded-lg border border-mf-border p-3" {...register("category_id")}>
              {(selectedMatch?.ticket_prices ?? []).map((price) => <option key={price.ticket_category?.id} value={price.ticket_category?.id}>{price.ticket_category?.name} - {money.format(price.price)}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-600">Seat Number
            <input className="rounded-lg border border-mf-border p-3" {...register("seat_number")} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-600">Payment Provider
            <select className="rounded-lg border border-mf-border p-3" {...register("provider")}>
              <option value="TNM_MPAMBA">TNM Mpamba</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="FDH_BANK">FDH Bank</option>
              <option value="NBM_BANK">National Bank</option>
              <option value="NBS_BANK">NBS Bank</option>
            </select>
          </label>
        </Card>
        <Card className="h-fit p-5">
          <CardHeader title="Order Summary" />
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span>Match</span><b>{selectedMatch?.label}</b></p>
            <p className="flex justify-between"><span>Ticket</span><b>{selectedPrice?.ticket_category?.name}</b></p>
            <p className="flex justify-between"><span>Quantity</span><b>1</b></p>
            <p className="flex justify-between border-t border-mf-border pt-3 text-lg"><span>Total</span><b>{money.format(selectedPrice?.price ?? 0)}</b></p>
          </div>
          {purchase.error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-mf-red">{purchase.error.message}</p> : null}
          {formState.errors.match_id || formState.errors.category_id ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-mf-red">Select a valid match and category.</p> : null}
          <Button className="mt-5 w-full" disabled={purchase.isPending}>Confirm Purchase</Button>
        </Card>
      </form>
    </div>
  );
}
