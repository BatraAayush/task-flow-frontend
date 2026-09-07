import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitialAuthChecking } = useAppSelector(
    (state) => state.auth,
  );

  // Show a full-screen loading spinner while verifying session via refresh cookie
  if (isInitialAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm font-medium">Authenticating session...</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
