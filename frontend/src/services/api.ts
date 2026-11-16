import { HealthResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Checks the operational health of the Spring Boot backend REST API.
 * Calls GET /api/health
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/health`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `Backend returned HTTP status ${response.status}`,
        response.status
      );
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(`Unable to connect to backend: ${message}`);
  }
}
