import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

/**
 * Route protection wrapper verifying authentication and role-based permissions.
 * Redirects unauthenticated users to /login preserving the requested location.
 * Redirects authenticated users with insufficient permissions to /unauthorized.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: "var(--color-gold)",
          fontWeight: 600,
        }}
        data-testid="protected-route-loading"
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="pulse-dot warning"
            style={{ width: "16px", height: "16px", margin: "0 auto var(--space-3) auto" }}
          />
          <p style={{ color: "var(--color-text-muted)" }}>Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
