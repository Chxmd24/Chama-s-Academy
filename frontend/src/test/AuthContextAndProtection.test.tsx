import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import LoginPage from "../pages/LoginPage";
import Header from "../components/layout/Header";

// Helper component for testing AuthContext actions directly
const AuthTestHelper = () => {
  const { user, token, isAuthenticated, login, logout, refreshProfile, hasRole } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "AUTHENTICATED" : "ANONYMOUS"}</div>
      <div data-testid="user-email">{user ? user.email : "NO_USER"}</div>
      <div data-testid="token-value">{token ? "HAS_TOKEN" : "NO_TOKEN"}</div>
      <div data-testid="has-admin-role">{hasRole("ADMIN") ? "IS_ADMIN" : "NOT_ADMIN"}</div>
      <button
        data-testid="test-login-btn"
        onClick={() =>
          login({
            email: "admin@example.com",
            password: "AdminPassword123!",
          })
        }
      >
        Test Login
      </button>
      <button data-testid="test-logout-btn" onClick={logout}>
        Test Logout
      </button>
      <button data-testid="test-refresh-btn" onClick={refreshProfile}>
        Test Refresh
      </button>
    </div>
  );
};

describe("Authentication Context, Protected Routes, and Role-Based Authorization", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects unauthenticated users attempting to access /dashboard to /login", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should have redirected to /login
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByText(/Player Dashboard/i)).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users attempting to access /admin to /login", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByText(/Administrator Console/i)).not.toBeInTheDocument();
  });

  it("denies access and redirects customer to /unauthorized when attempting to access /admin", () => {
    const customerUser = {
      id: 2,
      firstName: "Customer",
      lastName: "User",
      email: "customer@example.com",
      phoneNumber: null,
      roles: ["ROLE_CUSTOMER"],
      status: "ACTIVE",
      createdAt: "2026-11-19T08:00:00Z",
    };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider initialToken="valid.customer.token" initialUser={customerUser}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should be redirected to /unauthorized
    expect(screen.getByRole("heading", { name: /403 - Access Denied/i })).toBeInTheDocument();
    expect(screen.getByText(/ROLE_CUSTOMER/i)).toBeInTheDocument();
    expect(screen.queryByText(/Stadium Administration Center/i)).not.toBeInTheDocument();
  });

  it("allows access to /admin when authenticated user has ROLE_ADMIN", () => {
    const adminUser = {
      id: 1,
      firstName: "Admin",
      lastName: "Master",
      email: "admin@example.com",
      phoneNumber: "0779998877",
      roles: ["ROLE_ADMIN"],
      status: "ACTIVE",
      createdAt: "2026-11-19T08:00:00Z",
    };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider initialToken="valid.admin.token" initialUser={adminUser}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Admin console should render successfully
    expect(screen.getByRole("heading", { name: /Stadium Administration Center/i })).toBeInTheDocument();
    expect(screen.getByText(/ROLE_ADMIN Active/i)).toBeInTheDocument();
  });

  it("displays guest navigation for unauthenticated users and member navigation for authenticated users", () => {
    const customerUser = {
      id: 5,
      firstName: "Chama",
      lastName: "Coach",
      email: "chama@example.com",
      phoneNumber: null,
      roles: ["ROLE_CUSTOMER"],
      status: "ACTIVE",
      createdAt: "2026-11-19T08:00:00Z",
    };

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider initialToken={null} initialUser={null}>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    // Guest view
    expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
    expect(screen.queryByTestId("header-user-badge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("header-logout-btn")).not.toBeInTheDocument();

    // Authenticated view
    rerender(
      <MemoryRouter>
        <AuthProvider key="auth-authenticated" initialToken="sample.jwt.token" initialUser={customerUser}>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("header-user-badge")).toHaveTextContent("Chama");
    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByTestId("header-logout-btn")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Sign In/i })).not.toBeInTheDocument();
  });

  it("clears authentication state upon logout", async () => {
    const user = userEvent.setup();
    const customerUser = {
      id: 5,
      firstName: "Chama",
      lastName: "Coach",
      email: "chama@example.com",
      phoneNumber: null,
      roles: ["ROLE_CUSTOMER"],
      status: "ACTIVE",
      createdAt: "2026-11-19T08:00:00Z",
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider initialToken="sample.jwt.token" initialUser={customerUser}>
          <Header />
          <AuthTestHelper />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("AUTHENTICATED");
    expect(screen.getByTestId("user-email")).toHaveTextContent("chama@example.com");

    const logoutBtn = screen.getByTestId("header-logout-btn");
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("ANONYMOUS");
      expect(screen.getByTestId("user-email")).toHaveTextContent("NO_USER");
      expect(screen.getByTestId("token-value")).toHaveTextContent("NO_TOKEN");
      expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it("handles expired or invalid token on profile refresh by logging out", async () => {
    const user = userEvent.setup();

    // Mock GET /api/auth/me returning 401 Unauthorized
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url) => {
        if (url.toString().includes("/api/auth/me")) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({
              status: 401,
              message: "Full authentication is required to access this resource",
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "UP" }),
        });
      })
    );

    const initialUser = {
      id: 10,
      firstName: "Expired",
      lastName: "User",
      email: "expired@example.com",
      phoneNumber: null,
      roles: ["ROLE_CUSTOMER"],
      status: "ACTIVE",
      createdAt: "2026-11-19T08:00:00Z",
    };

    render(
      <MemoryRouter>
        <AuthProvider initialToken="expired.jwt.token" initialUser={initialUser}>
          <AuthTestHelper />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("AUTHENTICATED");

    const refreshBtn = screen.getByTestId("test-refresh-btn");
    await user.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("ANONYMOUS");
      expect(screen.getByTestId("token-value")).toHaveTextContent("NO_TOKEN");
      expect(screen.getByTestId("user-email")).toHaveTextContent("NO_USER");
    });
  });
});
