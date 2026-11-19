import {
  HealthResponse,
  RegistrationRequest,
  RegistrationResponse,
  LoginRequest,
  LoginResponse,
  UserProfileResponse,
  ApiErrorResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string>;
  details?: string;

  constructor(
    message: string,
    status?: number,
    fieldErrors?: Record<string, string>,
    details?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}

/**
 * Parses and maps server error responses into a typed ApiError.
 * Ensures internal technical stack traces or database errors are not exposed.
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `Request failed with status ${response.status}`;
  let fieldErrors: Record<string, string> | undefined;

  try {
    const errorBody: ApiErrorResponse = await response.json();
    if (errorBody && typeof errorBody === "object") {
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
      if (errorBody.fieldErrors) {
        fieldErrors = errorBody.fieldErrors;
      }
    }
  } catch {
    // Response was not JSON (e.g. proxy timeout or gateway error)
    if (response.status === 404) {
      errorMessage = "Resource not found.";
    } else if (response.status >= 500) {
      errorMessage = "A server error occurred. Please try again later.";
    }
  }

  throw new ApiError(errorMessage, response.status, fieldErrors);
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
      return await handleApiError(response);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(`Unable to connect to backend: ${message}`);
  }
}

/**
 * Registers a new customer account.
 * Calls POST /api/auth/register
 */
export async function registerCustomer(
  data: RegistrationRequest
): Promise<RegistrationResponse> {
  const url = `${API_BASE_URL}/auth/register`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return await handleApiError(response);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(`Registration request failed: ${message}`);
  }
}

/**
 * Authenticates user credentials and retrieves JWT access token.
 * Calls POST /api/auth/login
 */
export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const url = `${API_BASE_URL}/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return await handleApiError(response);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(`Login request failed: ${message}`);
  }
}

/**
 * Retrieves the currently authenticated user's profile.
 * Calls GET /api/auth/me with Bearer token
 */
export async function getCurrentUserProfile(
  token: string
): Promise<UserProfileResponse> {
  const url = `${API_BASE_URL}/auth/me`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return await handleApiError(response);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(`Profile retrieval failed: ${message}`);
  }
}
