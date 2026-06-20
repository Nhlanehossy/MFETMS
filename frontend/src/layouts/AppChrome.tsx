import {
  Bell,
  Building2,
  CalendarDays,
  ChartColumn,
  CreditCard,
  Home,
  Landmark,
  LogOut,
  Menu,
  QrCode,
  ShieldCheck,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, type ElementType } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../context/authStore";
import { Button } from "../components/ui/Button";

type NavItem = { to: string; label: string; icon: ElementType };

const navByRole: Record<string, NavItem[]> = {
  fam: [
    { to: "/fam", label: "Dashboard", icon: Home },
    { to: "/fam/organizations", label: "Organizations", icon: Building2 },
    { to: "/fam/competitions", label: "Competitions", icon: Trophy },
    { to: "/fam/clubs", label: "Clubs", icon: Users },
    { to: "/fam/stadiums", label: "Stadiums", icon: Landmark },
    { to: "/fam/users", label: "Users", icon: ShieldCheck },
    { to: "/fam/revenue-reports", label: "Revenue Reports", icon: ChartColumn },
  ],
  sulom: [
    { to: "/sulom", label: "Dashboard", icon: Home },
    { to: "/sulom/fixtures", label: "Fixtures", icon: CalendarDays },
    { to: "/sulom/ticket-sales", label: "Ticket Sales", icon: Ticket },
  ],
  club: [
    { to: "/club", label: "Dashboard", icon: Home },
    { to: "/club/revenue", label: "Revenue", icon: CreditCard },
    { to: "/club/attendance", label: "Attendance", icon: Users },
  ],
  supporter: [
    { to: "/supporter", label: "Home", icon: Home },
    { to: "/supporter/checkout", label: "Checkout", icon: CreditCard },
    { to: "/supporter/my-tickets", label: "My Tickets", icon: Ticket },
  ],
  officer: [
    { to: "/officer/scanner", label: "Scanner", icon: QrCode },
    { to: "/officer/verification-history", label: "History", icon: ShieldCheck },
  ],
};

const roleLabel: Record<string, string> = {
  fam: "FAM Administration",
  sulom: "SULOM Operations",
  club: "Club Administration",
  supporter: "Supporter Portal",
  officer: "Ticket Officer",
};

export function AppChrome({ role }: { role: keyof typeof navByRole }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { session, setSession } = useAuthStore();
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: authService.me,
  });
  useEffect(() => {
    if (sessionQuery.data) setSession(sessionQuery.data);
  }, [sessionQuery.data, setSession]);
  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: (nextSession) => {
      setSession(nextSession);
      queryClient.invalidateQueries();
      navigate("/login");
    },
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-green-900/20 bg-mf-green text-white lg:block">
        <div className="flex h-full flex-col p-5">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-mf-gold font-black text-mf-ink">M</span>
            <span>
              <strong className="block">MFETMS</strong>
              <small className="text-white/70">{roleLabel[role]}</small>
            </span>
          </Link>
          <nav className="grid gap-2">
            {navByRole[role].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split("/").length <= 2}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-white text-mf-green" : "text-white/80 hover:bg-white/10 hover:text-white"}`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-white/15 p-4 text-sm text-white/75">
            <Landmark className="mb-2" size={18} />
            Football Association of Malawi, SULOM, clubs, officers, and supporters.
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-mf-border bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="lg:hidden">
              <Menu size={18} />
            </Button>
            <div>
              <p className="page-kicker">{roleLabel[role]}</p>
              <strong className="text-mf-ink">Malawi Football E-Ticketing</strong>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full border border-mf-border p-2 text-slate-600">
              <Bell size={18} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-mf-red" />
            </button>
            <div className="hidden text-right text-sm md:block">
              <strong className="block text-mf-ink">{session.user?.username ?? "Guest"}</strong>
              <span className="text-slate-500">{session.user?.role || "Not signed in"}</span>
            </div>
            {session.authenticated ? (
              <Button variant="secondary" onClick={() => logout.mutate()}>
                <LogOut size={16} /> Sign out
              </Button>
            ) : (
              <Link className="rounded-lg bg-mf-green px-4 py-2 text-sm font-semibold text-white" to="/login">
                Login
              </Link>
            )}
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-mf-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mf-green font-black text-white">M</span>
            <span>
              <strong className="block leading-none text-mf-ink">MFETMS</strong>
              <small className="text-xs text-slate-500">Malawi football tickets</small>
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold text-slate-600 md:gap-5">
            <Link className="hover:text-mf-green" to="/matches">Matches</Link>
            <Link className="hover:text-mf-green" to="/#calendar">Football Calendar</Link>
            <Link className="rounded-lg bg-mf-green px-4 py-2 text-white" to="/login">Login</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-mf-border bg-white px-4 py-8 text-center text-sm text-slate-500">
        MFETMS - Malawi Football E-Ticketing and Match Management System
      </footer>
    </div>
  );
}
