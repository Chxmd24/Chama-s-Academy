import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-16) var(--space-4)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          padding: "var(--space-8)",
          backgroundColor: "var(--color-secondary-navy)",
          border: "1px solid var(--color-border-navy)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto var(--space-4) auto",
            borderRadius: "var(--radius-xl)",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-danger)",
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h1
          style={{
            fontSize: "var(--font-size-3xl)",
            fontWeight: 800,
            marginBottom: "var(--space-2)",
          }}
        >
          404 - Page Not Found
        </h1>

        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-6)",
            lineHeight: 1.6,
          }}
        >
          The page you requested could not be found or has been moved. 
          Please return to the Chama&apos;s Academy homepage.
        </p>

        <Link
          to="/"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
