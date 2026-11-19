import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../routes";

describe("Login Page Component and Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders login form with email, password, and sign in button", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Register Here/i })).toBeInTheDocument();
  });

  it("validates empty email and password inputs before API submission", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/Email address is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required\./i)).toBeInTheDocument();
  });

  it("authenticates valid credentials, stores in-memory token, and redirects to dashboard", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url, options) => {
        if (url.toString().includes("/api/auth/login")) {
          const body = JSON.parse(options.body as string);
          expect(body.email).toBe("player@example.com");
          expect(body.password).toBe("PlayerPass123!");

          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              tokenType: "Bearer",
              accessToken: "mock.valid.jwt.token",
              expiresIn: 86400,
              roles: ["ROLE_CUSTOMER"],
              user: {
                id: 1,
                firstName: "Kasun",
                lastName: "Rajitha",
                email: "player@example.com",
                phoneNumber: "0770001122",
                roles: ["ROLE_CUSTOMER"],
                status: "ACTIVE",
                createdAt: "2026-11-19T08:00:00Z",
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "UP" }),
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), "player@example.com");
    await user.type(screen.getByLabelText(/^Password/i), "PlayerPass123!");

    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitBtn);

    // Should redirect to /dashboard and render user welcome banner
    await waitFor(() => {
      expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Kasun/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/player@example\.com/i)).toBeInTheDocument();
      expect(screen.getByTestId("header-user-badge")).toHaveTextContent("Kasun");
    });
  });

  it("handles 401 Unauthorized invalid credentials error with clear generic message", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url) => {
        if (url.toString().includes("/api/auth/login")) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({
              timestamp: "2026-11-19T08:00:00Z",
              status: 401,
              error: "Unauthorized",
              message: "Invalid email or password.",
              path: "/api/auth/login",
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "UP" }),
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), "player@example.com");
    await user.type(screen.getByLabelText(/^Password/i), "WrongPassword123!");

    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("login-error-banner")).toBeInTheDocument();
      expect(screen.getByText(/Invalid email or password\./i)).toBeInTheDocument();
    });
  });

  it("handles 403 Forbidden inactive or suspended account with clear notice", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url) => {
        if (url.toString().includes("/api/auth/login")) {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: async () => ({
              timestamp: "2026-11-19T08:00:00Z",
              status: 403,
              error: "Forbidden",
              message: "Account is inactive or suspended.",
              path: "/api/auth/login",
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "UP" }),
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), "suspended@example.com");
    await user.type(screen.getByLabelText(/^Password/i), "ValidPass123!");

    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("login-error-banner")).toBeInTheDocument();
      expect(
        screen.getByText(/Account is inactive or suspended\. Please contact stadium administration\./i)
      ).toBeInTheDocument();
    });
  });
});
