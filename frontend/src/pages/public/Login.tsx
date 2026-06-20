import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../context/authStore";
import { authService } from "../../services/authService";

const schema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password is required"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((store) => store.session);
  const setSession = useAuthStore((store) => store.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "supporter", password: "Password123!", remember: true },
  });

  useEffect(() => {
    if (session.authenticated && session.user?.default_path) {
      navigate(session.user.default_path, { replace: true });
    }
  }, [navigate, session]);

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      const session = await authService.login(values);
      setSession(session);
      const requestedPath = typeof location.state === "object" && location.state && "from" in location.state ? String(location.state.from) : "";
      const target = requestedPath && session.user?.allowed_portals.some((portal) => requestedPath.startsWith(`/${portal}`))
        ? requestedPath
        : session.user?.default_path || "/supporter";
      navigate(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <Card className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1fr_.9fr]">
        <div className="hero-pattern hidden p-10 text-white lg:block">
          <p className="text-sm font-bold uppercase tracking-normal text-mf-gold">Secure system access</p>
          <h1 className="mt-4 text-4xl font-black">One login for supporters and football administrators.</h1>
          <p className="mt-4 text-white/75">Use seeded accounts such as supporter, fam.admin, sulom.admin, bullets.admin, or gate.officer.</p>
        </div>
        <form className="grid gap-5 p-8" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <p className="page-kicker">MFETMS Login</p>
            <h2 className="page-title">Sign in</h2>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-slate-600">
            Username
            <span className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className="w-full rounded-lg border border-mf-border py-3 pl-10 pr-3 outline-none focus:border-mf-green" {...register("username")} />
            </span>
            {formState.errors.username ? <small className="text-mf-red">{formState.errors.username.message}</small> : null}
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-600">
            Password
            <span className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type={showPassword ? "text" : "password"} className="w-full rounded-lg border border-mf-border py-3 pl-10 pr-11 outline-none focus:border-mf-green" {...register("password")} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((current) => !current)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
            {formState.errors.password ? <small className="text-mf-red">{formState.errors.password.message}</small> : null}
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" {...register("remember")} /> Remember me</label>
            <Link className="font-semibold text-mf-green" to="/forgot-password">Forgot password?</Link>
          </div>
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-mf-red">{error}</p> : null}
          <Button disabled={formState.isSubmitting} type="submit">Sign in</Button>
          <div className="grid gap-2">
            <Button variant="secondary" type="button">Continue with Google</Button>
            <Button variant="secondary" type="button">Continue with Microsoft</Button>
          </div>
          <p className="text-center text-sm text-slate-500">No account? <Link className="font-semibold text-mf-green" to="/register">Create supporter account</Link></p>
        </form>
      </Card>
    </div>
  );
}
