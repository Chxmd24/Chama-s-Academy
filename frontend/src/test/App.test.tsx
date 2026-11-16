import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import AppRoutes from "../routes";

describe("Application Rendering and Routing", () => {
  beforeEach(() => {
    // Mock global fetch so backend status does not perform real network calls
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "UP",
          application: "Chama's Academy Backend",
          message: "Backend is running successfully",
        }),
      })
    );
  });

  it("renders the application without crashing", async () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("status-connected")).toBeInTheDocument();
    });
  });

  it("displays Chama's Academy branding in the header and page", async () => {
    render(<App />);
    const brandingElements = screen.getAllByText(/Chama's/i);
    expect(brandingElements.length).toBeGreaterThan(0);
    const taglines = screen.getAllByText(/Where Champions Train & Play/i);
    expect(taglines.length).toBeGreaterThanOrEqual(1);
    await waitFor(() => {
      expect(screen.getByTestId("status-connected")).toBeInTheDocument();
    });
  });

  it("renders the Home route content correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: /Indoor Cricket & Football Stadium Management/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Welcome to Chama's Academy/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("status-connected")).toBeInTheDocument();
    });
  });

  it("renders the 404 Not Found page for unknown routes", () => {
    render(
      <MemoryRouter initialEntries={["/some/non-existent/route"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The page you requested could not be found/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Home/i })).toBeInTheDocument();
  });
});
