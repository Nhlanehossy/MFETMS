import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function ForgotPassword() {
  return <PasswordCard title="Forgot Password" button="Send Reset Link" />;
}

export function ResetPassword() {
  return <PasswordCard title="Reset Password" button="Update Password" reset />;
}

function PasswordCard({ title, button, reset = false }: { title: string; button: string; reset?: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <Card className="w-full max-w-lg p-8">
        <p className="page-kicker">Account recovery</p>
        <h1 className="page-title">{title}</h1>
        <div className="mt-6 grid gap-4">
          <input className="rounded-lg border border-mf-border p-3" placeholder="Email address" />
          {reset ? <input className="rounded-lg border border-mf-border p-3" placeholder="New password" type="password" /> : null}
        </div>
        <Button className="mt-6">{button}</Button>
      </Card>
    </div>
  );
}
