import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, LayoutDashboard, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Header(): React.ReactElement {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isAdmin = hasRole("ADMIN");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(11, 20, 38, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-border-navy)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          gap: "var(--space-4)",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            textDecoration: "none",
            flexShrink: 0,
          }}
          aria-label="Chama's Academy Home"
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(135deg, var(--color-border-navy), var(--color-secondary-navy))",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            <span
              style={{
                color: "var(--color-gold)",
                fontWeight: 800,
                fontSize: "var(--font-size-base)",
                letterSpacing: "0.05em",
              }}
            >
              CA
            </span>
          </div>

          <div>
            <div
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 800,
                color: "var(--color-text-white)",
                lineHeight: 1.1,
              }}
            >
              Chama&apos;s <span style={{ color: "var(--color-gold)" }}>Academy</span>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              Indoor Stadium
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6)",
          }}
          aria-label="Main Navigation"
        >
          <Link
            to="/"
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              color: "var(--color-text-light)",
            }}
          >
            Home
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--color-gold)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--color-gold)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <Shield size={14} />
              <span>Admin</span>
            </Link>
          )}

          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-text-light)",
              cursor: "default",
            }}
          >
            Facilities
          </span>

          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-text-light)",
              cursor: "default",
            }}
          >
            Live Scores
          </span>
        </nav>

        {/* CTA Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
          {isAuthenticated && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              {/* User Chip */}
              <Link
                to="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "0.4rem 0.85rem",
                  backgroundColor: "var(--color-secondary-navy)",
                  border: "1px solid var(--color-border-navy)",
                  borderRadius: "var(--radius-full)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-white)",
                }}
                data-testid="header-user-badge"
              >
                <UserIcon size={14} style={{ color: "var(--color-gold)" }} />
                <span style={{ fontWeight: 600 }}>{user.firstName}</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: "0.45rem 0.85rem", fontSize: "var(--font-size-xs)" }}
                data-testid="header-logout-btn"
                title="Sign out of Chama's Academy"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem" }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ padding: "0.5rem 1.25rem" }}
              >
                <span>Register</span>
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
