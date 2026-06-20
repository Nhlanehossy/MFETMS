import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../context/authStore";
import { SkeletonGrid } from "./ui/Skeleton";

export function ProtectedRoute({ portal }: { portal: string }) {
  const location = useLocation();
  const setSession = useAuthStore((store) => store.setSession);
  const storedSession = useAuthStore((store) => store.session);
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: authService.me,
  });

  const session = sessionQuery.data ?? storedSession;
  useEffect(() => {
    if (sessionQuery.data) {
      setSession(sessionQuery.data);
    }
  }, [sessionQuery.data, setSession]);

  if (sessionQuery.isLoading && !storedSession.authenticated) {
    return <div className="p-8"><SkeletonGrid /></div>;
  }

  if (!session.authenticated || !session.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!session.user.allowed_portals.includes(portal)) {
    return <Navigate to={session.user.default_path || "/"} replace />;
  }

  return <Outlet />;
}
