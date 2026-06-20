import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../context/authStore";
import { authService } from "../../services/authService";

const schema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const setSession = useAuthStore((store) => store.setSession);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      const session = await authService.register(values);
      setSession(session);
      navigate(session.user?.default_path || "/supporter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <Card className="w-full max-w-2xl p-8">
        <p className="page-kicker">Supporter registration</p>
        <h1 className="page-title">Create Account</h1>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-slate-600">
              First name
              <input className="rounded-lg border border-mf-border p-3" {...register("first_name")} />
              {formState.errors.first_name ? <small className="text-mf-red">{formState.errors.first_name.message}</small> : null}
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-600">
              Last name
              <input className="rounded-lg border border-mf-border p-3" {...register("last_name")} />
              {formState.errors.last_name ? <small className="text-mf-red">{formState.errors.last_name.message}</small> : null}
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-600 md:col-span-2">
              Email address
              <input className="rounded-lg border border-mf-border p-3" {...register("email")} />
              {formState.errors.email ? <small className="text-mf-red">{formState.errors.email.message}</small> : null}
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-600">
              Phone number
              <input className="rounded-lg border border-mf-border p-3" {...register("phone")} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-600">
              Password
              <input className="rounded-lg border border-mf-border p-3" type="password" {...register("password")} />
              {formState.errors.password ? <small className="text-mf-red">{formState.errors.password.message}</small> : null}
            </label>
          </div>
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-mf-red">{error}</p> : null}
          <Button className="w-fit" disabled={formState.isSubmitting}>Create Account</Button>
        </form>
        <p className="mt-5 text-sm text-slate-500">Already registered? <Link className="font-semibold text-mf-green" to="/login">Sign in</Link></p>
      </Card>
    </div>
  );
}
