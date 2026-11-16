import { ArrowRight, Trophy, ShieldCheck, Activity } from "lucide-react";
import BackendStatus from "../components/common/BackendStatus";

export default function HomePage() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "var(--space-12) 0",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        {/* Top Tagline Badge */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <span className="badge badge-gold">
            <Trophy size={14} />
            Where Champions Train &amp; Play
          </span>
        </div>

        {/* Main Headings */}
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "var(--space-4)",
            lineHeight: 1.1,
          }}
        >
          Chama&apos;s <span style={{ color: "var(--color-gold)" }}>Academy</span>
        </h1>

        <h2
          style={{
            fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)",
            fontWeight: 600,
            color: "var(--color-text-light)",
            marginBottom: "var(--space-6)",
          }}
        >
          Indoor Cricket &amp; Football Stadium Management
        </h2>

        {/* Welcome Message */}
        <p
          style={{
            maxWidth: "680px",
            margin: "0 auto var(--space-8) auto",
            fontSize: "var(--font-size-base)",
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
          }}
        >
          Welcome to Chama&apos;s Academy. Experience state-of-the-art indoor sports facilities, 
          instant hourly slot reservations, and ball-by-ball live match scoring powered by our 
          enterprise Spring Boot REST API and modern React frontend.
        </p>

        {/* Backend Connection Status Section */}
        <div style={{ marginBottom: "var(--space-10)" }}>
          <BackendStatus />
        </div>

        {/* Quick Highlights / Feature Pills */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-4)",
            maxWidth: "840px",
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          <div
            style={{
              padding: "var(--space-5)",
              backgroundColor: "var(--color-secondary-navy)",
              border: "1px solid var(--color-border-navy)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div style={{ color: "var(--color-gold)", marginBottom: "var(--space-2)" }}>
              <Trophy size={20} />
            </div>
            <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-1)" }}>
              Indoor Cricket Arena
            </h3>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Professional pitch nets for limited-overs and Test match formats.
            </p>
          </div>

          <div
            style={{
              padding: "var(--space-5)",
              backgroundColor: "var(--color-secondary-navy)",
              border: "1px solid var(--color-border-navy)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div style={{ color: "var(--color-gold)", marginBottom: "var(--space-2)" }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-1)" }}>
              Indoor Football Turf
            </h3>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Modern indoor turf pitch with fast-paced league and tournament tracking.
            </p>
          </div>

          <div
            style={{
              padding: "var(--space-5)",
              backgroundColor: "var(--color-secondary-navy)",
              border: "1px solid var(--color-border-navy)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div style={{ color: "var(--color-gold)", marginBottom: "var(--space-2)" }}>
              <Activity size={20} />
            </div>
            <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-1)" }}>
              Live Scorecards
            </h3>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Real-time digital match tracking and umpire scoring engines.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "var(--space-8)" }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "0.875rem 2rem", fontSize: "var(--font-size-base)" }}
          >
            <span>Explore Stadium Booking</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
