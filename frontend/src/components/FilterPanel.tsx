import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

export function SearchInput({ value, onChange, placeholder = "Search" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        className="w-full rounded-lg border border-mf-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-mf-green focus:ring-2 focus:ring-green-100"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectFilter({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return (
    <label className="grid gap-1 text-xs font-bold uppercase tracking-normal text-slate-500">
      {label}
      <select className="rounded-lg border border-mf-border bg-white px-3 py-2 text-sm font-normal normal-case text-mf-ink" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
