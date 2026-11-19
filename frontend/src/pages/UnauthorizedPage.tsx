import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function UnauthorizedPage(): React.ReactElement {
  const { user, isAuthenticated } = useAuth();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "var(--space-12) var(--space-4)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-danger-bg)",
          border: "1px solid var(--color-danger-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-6)",
          color: "var(--color-danger)",
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h1
        style={{
          fontSize: "var(--font-size-3xl)",
          fontWeight: 800,
          color: "var(--color-text-white)",
          marginBottom: "var(--space-3)",
        }}
      >
        403 - Access Denied
      </h1>

      <p
        style={{
          maxWidth: "520px",
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-4)",
          lineHeight: 1.6,
        }}
      >
        You do not possess the required administrative or staff permissions to access this protected area.
      </p>

      {isAuthenticated && user && (
        <div
          style={{
            marginBottom: "var(--space-6)",
            padding: "var(--space-3) var(--space-5)",
            backgroundColor: "var(--color-secondary-navy)",
            border: "1px solid var(--color-border-navy)",
            borderRadius: "var(--radius-lg)",
            display: "inline-block",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <span style={{ color: "var(--color-text-muted)" }}>Current role(s): </span>
          <span style={{ color: "var(--color-gold)", fontWeight: 600 }}>
            {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "None"}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Go to My Dashboard</span>
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            <span>Sign In</span>
          </Link>
        )}
        <Link to="/" className="btn btn-secondary">
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
