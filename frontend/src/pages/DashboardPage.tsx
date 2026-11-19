import React from "react";
import { Link } from "react-router-dom";
import {
  User as UserIcon,
  Calendar,
  Users,
  Trophy,
  Shield,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage(): React.ReactElement {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      <div className="container" style={{ padding: "var(--space-12) 0", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Loading user profile...</p>
      </div>
    );
  }

  const isAdmin = hasRole("ADMIN");

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <div
      className="container"
      style={{
        flex: 1,
        paddingTop: "var(--space-8)",
        paddingBottom: "var(--space-12)",
      }}
    >
      {/* Welcome Banner */}
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
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            background: "radial-gradient(circle at top right, rgba(212, 175, 55, 0.12), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <span className="badge badge-gold">
            <Sparkles size={14} />
            Player Dashboard
          </span>
          <span className="badge badge-success">
            <span className="pulse-dot success" />
            {user.status}
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
            Welcome back, <span style={{ color: "var(--color-gold)" }}>{user.firstName}</span>!
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" }}>
            Manage your indoor cricket and football stadium reservations, teams, and tournament activities.
          </p>
        </div>

        {isAdmin && (
          <div style={{ marginTop: "var(--space-2)" }}>
            <Link
              to="/admin"
              className="btn btn-secondary"
              style={{
                display: "inline-flex",
                borderColor: "rgba(212, 175, 55, 0.5)",
                color: "var(--color-gold)",
              }}
            >
              <Shield size={16} />
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-6)",
          marginBottom: "var(--space-8)",
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: "var(--color-card-navy)",
            border: "1px solid var(--color-border-navy)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
          }}
          data-testid="profile-card"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              marginBottom: "var(--space-5)",
              borderBottom: "1px solid var(--color-border-navy)",
              paddingBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-secondary-navy)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-gold)",
              }}
            >
              <UserIcon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-white)" }}>
                User Profile
              </h2>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Account Details &amp; Roles
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Full Name:</span>
              <span style={{ color: "var(--color-text-white)", fontWeight: 600 }}>
                {user.firstName} {user.lastName}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                <Mail size={14} /> Email:
              </span>
              <span style={{ color: "var(--color-text-light)", fontSize: "var(--font-size-sm)" }}>
                {user.email}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                <Phone size={14} /> Phone:
              </span>
              <span style={{ color: "var(--color-text-light)", fontSize: "var(--font-size-sm)" }}>
                {user.phoneNumber || "Not provided"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                <Clock size={14} /> Member Since:
              </span>
              <span style={{ color: "var(--color-text-light)", fontSize: "var(--font-size-sm)" }}>
                {formattedDate}
              </span>
            </div>

            <div style={{ marginTop: "var(--space-3)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-navy)" }}>
              <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Assigned Roles:
              </span>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span key={role} className="badge badge-gold" style={{ fontSize: "11px" }}>
                      <Shield size={12} />
                      {role}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Placeholder: Bookings */}
        <div
          style={{
            backgroundColor: "var(--color-card-navy)",
            border: "1px solid var(--color-border-navy)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-secondary-navy)",
                border: "1px solid var(--color-border-navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-gold)",
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-white)" }}>
                My Slot Bookings
              </h2>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Cricket Nets &amp; Football Turf
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "var(--space-6) var(--space-4)",
              backgroundColor: "var(--color-secondary-navy)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--color-border-navy)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-3)" }}>
              No active reservations found.
            </p>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-gold)",
                fontWeight: 600,
              }}
            >
              Hourly slot reservation engine opens in the next milestone.
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Teams and Tournaments Placeholders */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {/* Teams Placeholder */}
        <div
          style={{
            backgroundColor: "var(--color-card-navy)",
            border: "1px solid var(--color-border-navy)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-secondary-navy)",
                border: "1px solid var(--color-border-navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-gold)",
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-white)" }}>
                My Teams &amp; Squads
              </h2>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Cricket &amp; Football Roster
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-6) var(--space-4)",
              backgroundColor: "var(--color-secondary-navy)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--color-border-navy)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Team roster creation, player invitations, and squad management will be enabled in upcoming releases.
            </p>
          </div>
        </div>

        {/* Tournaments Placeholder */}
        <div
          style={{
            backgroundColor: "var(--color-card-navy)",
            border: "1px solid var(--color-border-navy)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-secondary-navy)",
                border: "1px solid var(--color-border-navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-gold)",
              }}
            >
              <Trophy size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-white)" }}>
                Tournaments &amp; Leagues
              </h2>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Competitive Championships
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-6) var(--space-4)",
              backgroundColor: "var(--color-secondary-navy)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--color-border-navy)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Tournament entry, knockouts, round-robin brackets, and live scoring integration coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
