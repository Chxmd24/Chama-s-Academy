import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../routes";

describe("Registration Page Component and Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all required registration fields and brand heading", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Create Your Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Customer Account/i })).toBeInTheDocument();

    // Verify NO public role selection input exists
    expect(screen.queryByLabelText(/Role/i)).not.toBeInTheDocument();
  });

  it("enforces client-side validation on empty inputs and displays errors", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole("button", { name: /Create Customer Account/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/First name is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/Last name is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/Email address is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/Please confirm your password\./i)).toBeInTheDocument();
  });

  it("validates password complexity and confirm-password mismatch", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/First Name \*/i), "Saman");
    await user.type(screen.getByLabelText(/Last Name \*/i), "Perera");
    await user.type(screen.getByLabelText(/Email Address \*/i), "saman@example.com");
    await user.type(screen.getByLabelText(/^Password \*/i), "weakpass");
    await user.type(screen.getByLabelText(/Confirm Password \*/i), "differentpass");

    const submitBtn = screen.getByRole("button", { name: /Create Customer Account/i });
    await user.click(submitBtn);

    // Password complexity failure
    expect(await screen.findByText(/Password must contain at least one uppercase letter\./i)).toBeInTheDocument();
    // Mismatch failure
    expect(screen.getByText(/Passwords do not match\./i)).toBeInTheDocument();
  });

  it("submits valid registration and renders success confirmation screen", async () => {
    const user = userEvent.setup();

    // Mock successful backend registration API
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url, options) => {
        if (url.toString().includes("/api/auth/register")) {
          // Verify role is NOT in request body
          const body = JSON.parse(options.body as string);
          expect(body.role).toBeUndefined();
          expect(body.roles).toBeUndefined();
          expect(body.email).toBe("saman.perera@example.com");

          return Promise.resolve({
            ok: true,
            status: 201,
            json: async () => ({
              id: 101,
              firstName: "Saman",
              lastName: "Perera",
              email: "saman.perera@example.com",
              phoneNumber: "0771234567",
              roles: ["ROLE_CUSTOMER"],
              status: "ACTIVE",
              createdAt: "2026-11-19T08:00:00Z",
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
      <MemoryRouter initialEntries={["/register"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/First Name \*/i), "Saman");
    await user.type(screen.getByLabelText(/Last Name \*/i), "Perera");
    await user.type(screen.getByLabelText(/Email Address \*/i), "saman.perera@example.com");
    await user.type(screen.getByLabelText(/^Password \*/i), "StrongPass123!");
    await user.type(screen.getByLabelText(/Confirm Password \*/i), "StrongPass123!");
    await user.type(screen.getByLabelText(/Phone Number \(Optional\)/i), "0771234567");

    const submitBtn = screen.getByRole("button", { name: /Create Customer Account/i });
    await user.click(submitBtn);

    // Confirmation screen rendered
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Account Created!/i })).toBeInTheDocument();
      expect(screen.getByText(/saman\.perera@example\.com/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Proceed to Sign In/i })).toBeInTheDocument();
    });
  });

  it("handles duplicate email 409 Conflict response gracefully with clear banner", async () => {
    const user = userEvent.setup();

    // Mock 409 Conflict from backend
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url) => {
        if (url.toString().includes("/api/auth/register")) {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: async () => ({
              timestamp: "2026-11-19T08:00:00Z",
              status: 409,
              error: "Conflict",
              message: "An account with this email address already exists.",
              path: "/api/auth/register",
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
      <MemoryRouter initialEntries={["/register"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/First Name \*/i), "Existing");
    await user.type(screen.getByLabelText(/Last Name \*/i), "User");
    await user.type(screen.getByLabelText(/Email Address \*/i), "existing@example.com");
    await user.type(screen.getByLabelText(/^Password \*/i), "StrongPass123!");
    await user.type(screen.getByLabelText(/Confirm Password \*/i), "StrongPass123!");

    const submitBtn = screen.getByRole("button", { name: /Create Customer Account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("register-error-banner")).toBeInTheDocument();
      expect(
        screen.getByText(/An account with this email address already exists\. Please sign in or use a different email\./i)
      ).toBeInTheDocument();
    });
  });
});
