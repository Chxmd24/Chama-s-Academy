import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Server } from "lucide-react";
import { getHealthStatus } from "../../services/api";
import { HealthResponse } from "../../types";

type ConnectionStatus = "checking" | "connected" | "unavailable";

export default function BackendStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const checkConnection = useCallback(async () => {
    setStatus("checking");
    setIsRetrying(true);
    try {
      const data = await getHealthStatus();
      if (data && data.status === "UP") {
        setHealthData(data);
        setStatus("connected");
      } else {
        setHealthData(null);
        setStatus("unavailable");
      }
    } catch {
      setHealthData(null);
      setStatus("unavailable");
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <div
      className="backend-status-card"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        backgroundColor: "var(--color-secondary-navy)",
        border: "1px solid var(--color-border-navy)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
      }}
      data-testid="backend-status-card"
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-primary-navy)",
          border: "1px solid var(--color-border-navy)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-gold)",
          flexShrink: 0,
        }}
      >
        <Server size={18} />
      </div>

      <div style={{ textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {status === "checking" && (
            <span
              className="badge badge-warning"
              data-testid="status-checking"
            >
              <span className="pulse-dot warning" />
              Checking backend...
            </span>
          )}

          {status === "connected" && (
            <span
              className="badge badge-success"
              data-testid="status-connected"
            >
              <CheckCircle2 size={13} />
              Backend connected
            </span>
          )}

          {status === "unavailable" && (
            <span
              className="badge badge-danger"
              data-testid="status-unavailable"
            >
              <AlertCircle size={13} />
              Backend unavailable
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            marginTop: "var(--space-1)",
          }}
        >
          {status === "connected" && healthData
            ? `${healthData.application} (REST API port 8080)`
            : status === "checking"
            ? "Pinging GET /api/health endpoint..."
            : "Spring Boot server offline or unreachable"}
        </p>
      </div>

      <button
        type="button"
        onClick={checkConnection}
        disabled={isRetrying}
        title="Refresh backend status"
        aria-label="Refresh backend status"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-text-light)",
          cursor: isRetrying ? "not-allowed" : "pointer",
          padding: "var(--space-2)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color var(--transition-fast)",
        }}
      >
        <RefreshCw
          size={14}
          style={{
            animation: isRetrying ? "spin 1s linear infinite" : "none",
          }}
        />
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
