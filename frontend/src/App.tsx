import { Navigate, Route, Routes } from "react-router-dom";
import { AppChrome, PublicLayout } from "./layouts/AppChrome";
import PublicHome from "./pages/public/Home";
import PublicMatches from "./pages/public/Matches";
import PublicMatchDetails from "./pages/public/PublicMatchDetails";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import { ForgotPassword, ResetPassword } from "./pages/public/PasswordPages";
import FamDashboard from "./pages/fam/Dashboard";
import Organizations from "./pages/fam/Organizations";
import Competitions from "./pages/fam/Competitions";
import RevenueReports from "./pages/fam/RevenueReports";
import FamClubs from "./pages/fam/Clubs";
import Stadiums from "./pages/fam/Stadiums";
import Users from "./pages/fam/Users";
import SulomDashboard from "./pages/sulom/Dashboard";
import Fixtures from "./pages/sulom/Fixtures";
import TicketSales from "./pages/sulom/TicketSales";
import ClubDashboard from "./pages/club/Dashboard";
import ClubRevenue from "./pages/club/Revenue";
import Attendance from "./pages/club/Attendance";
import SupporterHome from "./pages/supporter/Home";
import MatchDetails from "./pages/supporter/MatchDetails";
import Checkout from "./pages/supporter/Checkout";
import MyTickets from "./pages/supporter/MyTickets";
import Scanner from "./pages/officer/Scanner";
import VerificationHistory from "./pages/officer/VerificationHistory";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicHome />} />
        <Route path="/matches" element={<PublicMatches />} />
        <Route path="/matches/:id" element={<PublicMatchDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute portal="fam" />}>
        <Route path="/fam" element={<AppChrome role="fam" />}>
          <Route index element={<FamDashboard />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="clubs" element={<FamClubs />} />
          <Route path="stadiums" element={<Stadiums />} />
          <Route path="users" element={<Users />} />
          <Route path="revenue-reports" element={<RevenueReports />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute portal="sulom" />}>
        <Route path="/sulom" element={<AppChrome role="sulom" />}>
          <Route index element={<SulomDashboard />} />
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="ticket-sales" element={<TicketSales />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute portal="club" />}>
        <Route path="/club" element={<AppChrome role="club" />}>
          <Route index element={<ClubDashboard />} />
          <Route path="revenue" element={<ClubRevenue />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute portal="supporter" />}>
        <Route path="/supporter" element={<AppChrome role="supporter" />}>
          <Route index element={<SupporterHome />} />
          <Route path="matches/:id" element={<MatchDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="my-tickets" element={<MyTickets />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute portal="officer" />}>
        <Route path="/officer" element={<AppChrome role="officer" />}>
          <Route index element={<Navigate to="/officer/scanner" replace />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="verification-history" element={<VerificationHistory />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
