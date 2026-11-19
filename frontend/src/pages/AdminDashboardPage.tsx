import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ShieldAlert, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboardPage(): React.ReactElement {
  const { token } = useAuth();
  const [adminApiResult, setAdminApiResult] = useState<string | null>(null);
  const [loadingApi, setLoadingApi] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const testAdminApi = async () => {
    if (!token) return;
    setLoadingApi(true);
    setApiError(null);
    setAdminApiResult(null);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    try {
      const response = await fetch(`${baseUrl}/admin/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Admin API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAdminApiResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to query admin endpoint");
    } finally {
      setLoadingApi(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        flex: 1,
        paddingTop: "var(--space-8)",
        paddingBottom: "var(--space-12)",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--color-card-navy)",
          border: "1px solid var(--color-border-navy)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8)",
          marginBottom: "var(--space-8)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span className="badge badge-gold">
            <Shield size={14} />
            Administrator Console
          </span>
          <span className="badge badge-success">
            <CheckCircle size={14} />
            ROLE_ADMIN Active
          </span>
        </div>

        <div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--color-text-white)",
              marginBottom: "var(--space-2)",
            }}
          >
            Stadium Administration Center
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" }}>
            Privileged management console for pitch reservations, tournament schedules, referee assignments, and audit trails.
          </p>
        </div>

        <div>
          <Link to="/dashboard" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to User Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Admin Verification Card */}
      <div
        style={{
          backgroundColor: "var(--color-card-navy)",
          border: "1px solid var(--color-border-navy)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          marginBottom: "var(--space-8)",
        }}
      >
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-white)", marginBottom: "var(--space-3)" }}>
          Backend RBAC Verification
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-4)" }}>
          Test the Spring Boot <code>/api/admin/dashboard</code> endpoint with your active bearer token to verify backend role enforcement.
        </p>

        <button
          type="button"
          onClick={testAdminApi}
          disabled={loadingApi}
          className="btn btn-primary"
          style={{ marginBottom: "var(--space-4)" }}
        >
          {loadingApi ? (
            <span>Querying Backend...</span>
          ) : (
            <>
              <RefreshCw size={16} />
              <span>Verify GET /api/admin/dashboard</span>
            </>
          )}
        </button>

        {apiError && (
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-danger)",
              fontSize: "var(--font-size-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <ShieldAlert size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {adminApiResult && (
          <div
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-4)",
              backgroundColor: "var(--color-secondary-navy)",
              border: "1px solid var(--color-border-navy)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-gold)", fontWeight: 600, display: "block", marginBottom: "var(--space-2)" }}>
              Backend Response (HTTP 200 OK):
            </span>
            <pre style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-light)", overflowX: "auto" }}>
              {adminApiResult}
            </pre>
          </div>
        )}
      </div>

      {/* Admin Modules Placeholder */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        <div style={{ backgroundColor: "var(--color-card-navy)", border: "1px solid var(--color-border-navy)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-text-white)", marginBottom: "var(--space-2)" }}>
            Slot Booking Approval
          </h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Review manual payment slips, verify bank transfers, and confirm reservations.
          </p>
        </div>

        <div style={{ backgroundColor: "var(--color-card-navy)", border: "1px solid var(--color-border-navy)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-text-white)", marginBottom: "var(--space-2)" }}>
            Officials Assignment
          </h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Assign accredited umpires and referees to upcoming stadium matches.
          </p>
        </div>

        <div style={{ backgroundColor: "var(--color-card-navy)", border: "1px solid var(--color-border-navy)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-text-white)", marginBottom: "var(--space-2)" }}>
            System Audit Log
          </h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Inspect security events, login history, and stadium administrative audits.
          </p>
        </div>
      </div>
    </div>
  );
}
