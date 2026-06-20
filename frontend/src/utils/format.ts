export const money = new Intl.NumberFormat("en-MW", {
  style: "currency",
  currency: "MWK",
  maximumFractionDigits: 0,
});

export function dateLabel(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-MW", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function timeLabel(value?: string) {
  if (!value) return "-";
  return value.slice(0, 5);
}

export function initials(name?: string) {
  if (!name) return "MF";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
