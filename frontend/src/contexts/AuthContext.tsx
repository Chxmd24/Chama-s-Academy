import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  UserProfileResponse,
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  RegistrationResponse,
} from "../types";
import { loginUser, registerCustomer, getCurrentUserProfile } from "../services/api";

export interface AuthContextType {
  user: UserProfileResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegistrationRequest) => Promise<RegistrationResponse>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfileResponse | null>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
  initialToken?: string | null;
  initialUser?: UserProfileResponse | null;
}

/**
 * Authentication Provider for Chama's Academy.
 *
 * Security Architecture Decision:
 * Access tokens are retained strictly in-memory (React component state).
 * In accordance with Phase 1 security guidelines, tokens are NEVER persisted
 * in localStorage or sessionStorage to mitigate cross-site scripting (XSS) token exfiltration risks.
 * A full page reload will require re-authentication until refresh tokens with secure HttpOnly
 * cookies are introduced in a subsequent milestone.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialToken = null,
  initialUser = null,
}) => {
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<UserProfileResponse | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAuthenticated = Boolean(token && user);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      setToken(response.accessToken);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: RegistrationRequest): Promise<RegistrationResponse> => {
      setIsLoading(true);
      try {
        const response = await registerCustomer(data);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshProfile = useCallback(async (): Promise<UserProfileResponse | null> => {
    if (!token) {
      logout();
      return null;
    }
    setIsLoading(true);
    try {
      const profile = await getCurrentUserProfile(token);
      setUser(profile);
      return profile;
    } catch {
      // If token is expired or rejected by backend, clear in-memory auth state
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  /**
   * Evaluates if the authenticated user has a specific role.
   * Matches both "ADMIN" and "ROLE_ADMIN".
   */
  const hasRole = useCallback(
    (targetRole: string): boolean => {
      if (!user || !user.roles || user.roles.length === 0) {
        return false;
      }
      const normalizedTarget = targetRole.startsWith("ROLE_")
        ? targetRole.toUpperCase()
        : `ROLE_${targetRole.toUpperCase()}`;

      return user.roles.some((r) => {
        const normalizedUserRole = r.startsWith("ROLE_")
          ? r.toUpperCase()
          : `ROLE_${r.toUpperCase()}`;
        return normalizedUserRole === normalizedTarget;
      });
    },
    [user]
  );

  /**
   * Evaluates if the authenticated user has at least one of the specified roles.
   */
  const hasAnyRole = useCallback(
    (targetRoles: string[]): boolean => {
      return targetRoles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      hasRole,
      hasAnyRole,
    }),
    [user, token, isAuthenticated, isLoading, login, register, logout, refreshProfile, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
