import { api } from "./api";
import type {
  Club,
  Competition,
  Match,
  MatchTicketPrice,
  Organization,
  Payment,
  ReportSummary,
  RevenueDistribution,
  RevenueShareRule,
  Stadium,
  Ticket,
  TicketCategory,
  User,
  VerificationLog,
} from "../types";

async function get<T>(url: string) {
  const { data } = await api.get<T>(url);
  return data;
}

async function post<T, P>(url: string, payload: P) {
  const { data } = await api.post<T>(url, payload);
  return data;
}

async function patch<T, P>(url: string, payload: P) {
  const { data } = await api.patch<T>(url, payload);
  return data;
}

async function remove(url: string) {
  const { data } = await api.delete<{ deleted: boolean }>(url);
  return data;
}

export const organizationService = {
  list: () => get<Organization[]>("/organizations/"),
  create: (payload: Record<string, unknown>) => post<Organization, Record<string, unknown>>("/organizations/", payload),
  update: (id: number, payload: Record<string, unknown>) => patch<Organization, Record<string, unknown>>(`/organizations/${id}/`, payload),
  remove: (id: number) => remove(`/organizations/${id}/`),
};

export const competitionService = {
  list: () => get<Competition[]>("/competitions/"),
  create: (payload: Record<string, unknown>) => post<Competition, Record<string, unknown>>("/competitions/", payload),
  update: (id: number, payload: Record<string, unknown>) => patch<Competition, Record<string, unknown>>(`/competitions/${id}/`, payload),
  remove: (id: number) => remove(`/competitions/${id}/`),
};

export const clubService = {
  list: () => get<Club[]>("/clubs/"),
  create: (payload: Record<string, unknown>) => post<Club, Record<string, unknown>>("/clubs/", payload),
  update: (id: number, payload: Record<string, unknown>) => patch<Club, Record<string, unknown>>(`/clubs/${id}/`, payload),
  remove: (id: number) => remove(`/clubs/${id}/`),
};

export const stadiumService = {
  list: () => get<Stadium[]>("/stadiums/"),
  create: (payload: Record<string, unknown>) => post<Stadium, Record<string, unknown>>("/stadiums/", payload),
  update: (id: number, payload: Record<string, unknown>) => patch<Stadium, Record<string, unknown>>(`/stadiums/${id}/`, payload),
  remove: (id: number) => remove(`/stadiums/${id}/`),
};

export const matchService = {
  list: () => get<Match[]>("/matches/"),
  create: (payload: Record<string, unknown>) => post<Match, Record<string, unknown>>("/matches/", payload),
  update: (id: number, payload: Record<string, unknown>) => patch<Match, Record<string, unknown>>(`/matches/${id}/`, payload),
  remove: (id: number) => remove(`/matches/${id}/`),
};

export const ticketService = {
  list: () => get<Ticket[]>("/tickets/"),
  categories: () => get<TicketCategory[]>("/ticket-categories/"),
  prices: () => get<MatchTicketPrice[]>("/match-ticket-prices/"),
  createCategory: (payload: Record<string, unknown>) => post<TicketCategory, Record<string, unknown>>("/ticket-categories/", payload),
  updateCategory: (id: number, payload: Record<string, unknown>) => patch<TicketCategory, Record<string, unknown>>(`/ticket-categories/${id}/`, payload),
  removeCategory: (id: number) => remove(`/ticket-categories/${id}/`),
  createPrice: (payload: Record<string, unknown>) => post<MatchTicketPrice, Record<string, unknown>>("/match-ticket-prices/", payload),
  updatePrice: (id: number, payload: Record<string, unknown>) => patch<MatchTicketPrice, Record<string, unknown>>(`/match-ticket-prices/${id}/`, payload),
  removePrice: (id: number) => remove(`/match-ticket-prices/${id}/`),
  async purchase(payload: { match_id: number; category_id: number; seat_number?: string }) {
    const { data } = await api.post<{ ticket_id: number; ticket_number: string; qr_code: string }>("/tickets/purchase/", payload);
    return data;
  },
};

export const paymentService = {
  list: () => get<Payment[]>("/payments/"),
  async record(payload: { ticket_id: number; amount?: number; provider: string; transaction_reference: string; status?: string }) {
    const { data } = await api.post<{ payment_id: number; ticket_status: string }>("/payments/record/", payload);
    return data;
  },
};

export const reportService = {
  summary: () => get<ReportSummary>("/reports/summary/"),
  revenue: () => get<RevenueDistribution[]>("/revenue-distributions/"),
  rules: () => get<RevenueShareRule[]>("/revenue-share-rules/"),
  createRule: (payload: Record<string, unknown>) => post<RevenueShareRule, Record<string, unknown>>("/revenue-share-rules/", payload),
  updateRule: (id: number, payload: Record<string, unknown>) => patch<RevenueShareRule, Record<string, unknown>>(`/revenue-share-rules/${id}/`, payload),
  async calculateRevenue(match_id: number) {
    const { data } = await api.post<{ distribution_id: number; total_revenue: number }>("/revenue-distributions/calculate/", { match_id });
    return data;
  },
};

export const userService = {
  list: () => get<User[]>("/users/"),
  create: (payload: Record<string, unknown>) => post<User, Record<string, unknown>>("/users/", payload),
  update: (id: number, payload: Record<string, unknown>) => patch<User, Record<string, unknown>>(`/users/${id}/`, payload),
  remove: (id: number) => remove(`/users/${id}/`),
};

export const notificationService = {
  list: async () => [
    { id: 1, title: "Ticket purchased", body: "Your e-ticket is available in My Tickets.", unread: true },
    { id: 2, title: "Match reminder", body: "Arrive early for gate verification.", unread: false },
    { id: 3, title: "Payment success", body: "Mobile money confirmation was received.", unread: false },
  ],
};

export const verificationService = {
  logs: () => get<VerificationLog[]>("/verification-logs/"),
  async scan(payload: { qr_code: string; verified_by_id?: number; gate_number: number }) {
    const { data } = await api.post<{ verification_id: number; status: string; message: string }>("/verification/scan/", payload);
    return data;
  },
};
