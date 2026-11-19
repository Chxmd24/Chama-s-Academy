import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, CheckCircle2, AlertCircle, ArrowRight, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

export default function RegisterPage(): React.ReactElement {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = (name: keyof FormState, value: string): string | undefined => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required.";
        if (value.trim().length > 100) return "First name cannot exceed 100 characters.";
        return undefined;
      case "lastName":
        if (!value.trim()) return "Last name is required.";
        if (value.trim().length > 100) return "Last name cannot exceed 100 characters.";
        return undefined;
      case "email": {
        if (!value.trim()) return "Email address is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
        if (value.length > 255) return "Email address cannot exceed 255 characters.";
        return undefined;
      }
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        if (value.length > 100) return "Password cannot exceed 100 characters.";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter.";
        if (!/[0-9]/.test(value)) return "Password must contain at least one digit.";
        if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain at least one special character.";
        return undefined;
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== form.password) return "Passwords do not match.";
        return undefined;
      case "phoneNumber":
        if (value.trim()) {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,26}$/;
          if (!phoneRegex.test(value.trim())) return "Please enter a valid phone number format.";
          if (value.trim().length < 7 || value.trim().length > 30) {
            return "Phone number must be between 7 and 30 characters.";
          }
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {};
    (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) {
        newErrors[key] = err;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim() || undefined,
      };

      const res = await register(payload);
      setRegisteredEmail(res.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError("An account with this email address already exists. Please sign in or use a different email.");
        } else if (err.fieldErrors) {
          setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
          setServerError("Please correct the errors in the highlighted fields below.");
        } else {
          setServerError(err.message || "Registration failed. Please check your information and try again.");
        }
      } else {
        setServerError("A network error occurred. Please verify your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
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
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "var(--color-card-navy)",
            border: "1px solid var(--color-border-navy)",
            borderRadius: "var(--radius-2xl)",
            padding: "var(--space-8)",
            textAlign: "center",
            boxShadow: "var(--shadow-gold)",
          }}
          data-testid="registration-success-card"
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-4) auto",
              color: "var(--color-success)",
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 800,
              color: "var(--color-text-white)",
              marginBottom: "var(--space-2)",
            }}
          >
            Account Created!
          </h2>

          <p
            style={{
              color: "var(--color-text-light)",
              fontSize: "var(--font-size-sm)",
              lineHeight: 1.6,
              marginBottom: "var(--space-6)",
            }}
          >
            Welcome to Chama&apos;s Academy. Your customer account for{" "}
            <strong style={{ color: "var(--color-gold)" }}>{registeredEmail}</strong> has been registered successfully.
          </p>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem" }}
            state={{ prefillEmail: registeredEmail }}
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-10) var(--space-4)",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
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
            Create Your Account
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Register to book indoor pitches, join competitive tournaments, and track match scores.
          </p>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
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
            data-testid="register-error-banner"
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <label
                htmlFor="firstName"
                style={{
                  display: "block",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  color: "var(--color-text-light)",
                  marginBottom: "var(--space-1)",
                }}
              >
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. Saman"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  backgroundColor: "var(--color-secondary-navy)",
                  border: `1px solid ${errors.firstName ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-white)",
                  fontSize: "var(--font-size-sm)",
                  outline: "none",
                }}
              />
              {errors.firstName && (
                <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                  {errors.firstName}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                style={{
                  display: "block",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  color: "var(--color-text-light)",
                  marginBottom: "var(--space-1)",
                }}
              >
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. Perera"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  backgroundColor: "var(--color-secondary-navy)",
                  border: `1px solid ${errors.lastName ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-white)",
                  fontSize: "var(--font-size-sm)",
                  outline: "none",
                }}
              />
              {errors.lastName && (
                <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

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
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="saman.perera@example.com"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                backgroundColor: "var(--color-secondary-navy)",
                border: `1px solid ${errors.email ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-white)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
              }}
            />
            {errors.email && (
              <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                {errors.email}
              </div>
            )}
          </div>

          {/* Optional Phone Number */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label
              htmlFor="phoneNumber"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                color: "var(--color-text-light)",
                marginBottom: "var(--space-1)",
              }}
            >
              Phone Number (Optional)
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="0771234567"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                backgroundColor: "var(--color-secondary-navy)",
                border: `1px solid ${errors.phoneNumber ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-white)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
              }}
            />
            {errors.phoneNumber && (
              <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                {errors.phoneNumber}
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "var(--space-4)" }}>
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
              Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="At least 8 characters"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                  backgroundColor: "var(--color-secondary-navy)",
                  border: `1px solid ${errors.password ? "var(--color-danger)" : "var(--color-border-navy)"}`,
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
            {errors.password && (
              <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                {errors.password}
              </div>
            )}
            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                marginTop: "4px",
                lineHeight: 1.4,
              }}
            >
              Must include uppercase, lowercase, digit, and special character.
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                color: "var(--color-text-light)",
                marginBottom: "var(--space-1)",
              }}
            >
              Confirm Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Re-enter password"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                  backgroundColor: "var(--color-secondary-navy)",
                  border: `1px solid ${errors.confirmPassword ? "var(--color-danger)" : "var(--color-border-navy)"}`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-white)",
                  fontSize: "var(--font-size-sm)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "4px" }}>
                {errors.confirmPassword}
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
              <span>Creating account...</span>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Customer Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--font-size-sm)" }}>
          <span style={{ color: "var(--color-text-muted)" }}>Already have an account? </span>
          <Link
            to="/login"
            style={{ color: "var(--color-gold)", fontWeight: 600 }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
