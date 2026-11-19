import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Trophy, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";

interface LocationState {
  from?: {
    pathname: string;
  };
  prefillEmail?: string;
}

export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>(state?.prefillEmail || "");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If already authenticated, redirect to destination or dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, state]);

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = "Please enter a valid email address.";
      }
    }

    if (!password) {
      errs.password = "Password is required.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({
        email: email.trim(),
        password: password,
      });

      const destination = state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Invalid email or password.");
        } else if (err.status === 403) {
          setError("Account is inactive or suspended. Please contact stadium administration.");
        } else {
          setError(err.message || "Authentication failed. Please check your credentials.");
        }
      } else {
        setError("Unable to connect to the authentication service. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-12) var(--space-4)",
      }}
    >
      <div
        style={{
          maxWidth: "440px",
          width: "100%",
          backgroundColor: "var(--color-card-navy)",
          border: "1px solid var(--color-border-navy)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ display: "inline-flex", marginBottom: "var(--space-3)" }}>
            <span className="badge badge-gold">
              <Trophy size={14} />
              Chama&apos;s Academy
            </span>
          </div>
          <h1
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 800,
              color: "var(--color-text-white)",
              marginBottom: "var(--space-2)",
            }}
          >
            Sign In
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Enter your email and password to access your stadium account.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--space-5)",
              color: "var(--color-danger)",
              fontSize: "var(--font-size-sm)",
            }}
            role="alert"
            data-testid="login-error-banner"
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                color: "var(--color-text-light)",
                marginBottom: "var(--space-1)",
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              placeholder="name@example.com"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                backgroundColor: "var(--color-secondary-navy)",
                border: `1px solid ${fieldErrors.email ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-white)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
              }}
            />
            {fieldErrors.email && (
              <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                {fieldErrors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                color: "var(--color-text-light)",
                marginBottom: "var(--space-1)",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                  backgroundColor: "var(--color-secondary-navy)",
                  border: `1px solid ${fieldErrors.password ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-white)",
                  fontSize: "var(--font-size-sm)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                {fieldErrors.password}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "0.75rem",
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--font-size-sm)" }}>
          <span style={{ color: "var(--color-text-muted)" }}>Don&apos;t have an account? </span>
          <Link
            to="/register"
            style={{ color: "var(--color-gold)", fontWeight: 600 }}
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
