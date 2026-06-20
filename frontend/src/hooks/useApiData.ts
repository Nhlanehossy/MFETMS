import { useQueries, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../context/authStore";
import {
  clubService,
  competitionService,
  matchService,
  notificationService,
  organizationService,
  paymentService,
  reportService,
  stadiumService,
  ticketService,
  userService,
  verificationService,
} from "../services/coreServices";

export function useDashboardData() {
  const role = useAuthStore((store) => store.session.user?.role);
  const isFam = role === "SUPER_ADMIN";
  const isSulom = role === "SULOM_ADMIN";
  const isClub = role === "CLUB_ADMIN";
  const isOfficer = role === "TICKET_OFFICER";
  const isSupporter = role === "SUPPORTER";
  const canSeeAdminReports = isFam || isSulom || isClub;
  const canSeeTickets = isFam || isSulom || isClub || isOfficer || isSupporter;
  const canSeePayments = isFam || isSulom || isClub || isSupporter;
  const canSeeVerification = isFam || isSulom || isOfficer;
  const results = useQueries({
    queries: [
      { queryKey: ["organizations"], queryFn: organizationService.list, enabled: isFam },
      { queryKey: ["competitions"], queryFn: competitionService.list },
      { queryKey: ["clubs"], queryFn: clubService.list },
      { queryKey: ["stadiums"], queryFn: stadiumService.list },
      { queryKey: ["matches"], queryFn: matchService.list },
      { queryKey: ["tickets"], queryFn: ticketService.list, enabled: canSeeTickets },
      { queryKey: ["payments"], queryFn: paymentService.list, enabled: canSeePayments },
      { queryKey: ["revenue"], queryFn: reportService.revenue, enabled: canSeeAdminReports },
      { queryKey: ["revenue-rules"], queryFn: reportService.rules, enabled: isFam },
      { queryKey: ["reports"], queryFn: reportService.summary, enabled: canSeeAdminReports },
      { queryKey: ["users"], queryFn: userService.list, enabled: isFam },
      { queryKey: ["verification"], queryFn: verificationService.logs, enabled: canSeeVerification },
      { queryKey: ["categories"], queryFn: ticketService.categories },
      { queryKey: ["prices"], queryFn: ticketService.prices },
      { queryKey: ["notifications"], queryFn: notificationService.list },
    ],
  });

  const [organizations, competitions, clubs, stadiums, matches, tickets, payments, revenue, revenueRules, reports, users, verification, categories, prices, notifications] =
    results;

  return {
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    refetchAll: () => results.forEach((result) => result.refetch()),
    organizations: organizations.data ?? [],
    competitions: competitions.data ?? [],
    clubs: clubs.data ?? [],
    stadiums: stadiums.data ?? [],
    matches: matches.data ?? [],
    tickets: tickets.data ?? [],
    payments: payments.data ?? [],
    revenue: revenue.data ?? [],
    revenueRules: revenueRules.data ?? [],
    reports: reports.data,
    users: users.data ?? [],
    verification: verification.data ?? [],
    categories: categories.data ?? [],
    prices: prices.data ?? [],
    notifications: notifications.data ?? [],
  };
}

export function useMatchList() {
  return useQuery({ queryKey: ["matches"], queryFn: matchService.list });
}
