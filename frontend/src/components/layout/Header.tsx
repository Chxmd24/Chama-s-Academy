import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function Header() {
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
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
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
              color: "var(--color-gold)",
            }}
          >
            Home
          </Link>
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-text-light)",
            }}
          >
            Facilities
          </span>
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-text-light)",
            }}
          >
            Book Now
          </span>
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--color-text-light)",
            }}
          >
            Live Scores
          </span>
        </nav>

        {/* CTA Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem" }}
          >
            Login
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "0.5rem 1.25rem" }}
          >
            <span>Register</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
