import type { FormEvent, ReactNode } from "react";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";

export function AdminForm({
  title,
  children,
  submitLabel = "Save",
  isSaving = false,
  error,
  onSubmit,
}: {
  title: string;
  children: ReactNode;
  submitLabel?: string;
  isSaving?: boolean;
  error?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="p-5">
      <CardHeader title={title} />
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">{children}</div>
        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-mf-red">{error}</p> : null}
        <Button className="w-fit" disabled={isSaving} type="submit">{submitLabel}</Button>
      </form>
    </Card>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-600">
      {label}
      <input className="rounded-lg border border-mf-border p-3 font-normal text-mf-ink outline-none focus:border-mf-green" name={name} type={type} required={required} defaultValue={defaultValue} />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string | number; label: string }>;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-600">
      {label}
      <select className="rounded-lg border border-mf-border p-3 font-normal text-mf-ink outline-none focus:border-mf-green" name={name} required={required} defaultValue={defaultValue ?? ""}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function formPayload(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}
