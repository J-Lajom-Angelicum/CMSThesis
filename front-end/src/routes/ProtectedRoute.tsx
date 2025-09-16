// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // roleId numbers (1=Doctor, 2=Staff, 3=Admin)
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, roleId } = useAuth();

  if (!user) {
    // not logged in → bounce to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!roleId || !allowedRoles.includes(roleId))) {
    // logged in but wrong role → bounce to home (or own dashboard)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
