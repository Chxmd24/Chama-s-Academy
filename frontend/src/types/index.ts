/**
 * Chama's Academy - Core Domain Types & DTO Contracts
 */

export interface HealthResponse {
  status: string;
  application: string;
  message: string;
}

export type RoleName =
  | "ROLE_CUSTOMER"
  | "ROLE_ADMIN"
  | "ROLE_UMPIRE"
  | "ROLE_REFEREE"
  | "ROLE_STAFF";

export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RegistrationResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
  status: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
  status: string;
  createdAt: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user: UserProfileResponse;
  roles: string[];
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export type SportType = "CRICKET" | "FOOTBALL";
export type CricketFormat = "LIMITED_OVERS" | "TEST";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface BookingSlot {
  id: string;
  userId: string;
  sport: SportType;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: BookingStatus;
  receiptUrl?: string;
  createdAt: string;
}
