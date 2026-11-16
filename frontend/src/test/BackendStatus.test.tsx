import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BackendStatus from "../components/common/BackendStatus";

describe("BackendStatus Component", () => {
  it("displays 'Backend connected' when the health endpoint returns UP", async () => {
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

    render(<BackendStatus />);

    await waitFor(() => {
      expect(screen.getByTestId("status-connected")).toBeInTheDocument();
      expect(screen.getByText(/Backend connected/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Chama's Academy Backend/i)
      ).toBeInTheDocument();
    });
  });

  it("displays 'Backend unavailable' when fetch rejects or server is offline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Failed to fetch"))
    );

    render(<BackendStatus />);

    await waitFor(() => {
      expect(screen.getByTestId("status-unavailable")).toBeInTheDocument();
      expect(screen.getByText(/Backend unavailable/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Spring Boot server offline or unreachable/i)
      ).toBeInTheDocument();
    });
  });

  it("displays 'Backend unavailable' when health endpoint returns non-UP status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "DOWN",
          application: "Chama's Academy Backend",
          message: "Service unavailable",
        }),
      })
    );

    render(<BackendStatus />);

    await waitFor(() => {
      expect(screen.getByTestId("status-unavailable")).toBeInTheDocument();
      expect(screen.getByText(/Backend unavailable/i)).toBeInTheDocument();
    });
  });

  it("displays 'Backend unavailable' when response is not ok (e.g. HTTP 500)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      })
    );

    render(<BackendStatus />);

    await waitFor(() => {
      expect(screen.getByTestId("status-unavailable")).toBeInTheDocument();
      expect(screen.getByText(/Backend unavailable/i)).toBeInTheDocument();
    });
  });
});
