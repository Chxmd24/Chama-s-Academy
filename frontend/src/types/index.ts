/**
 * Chama's Academy - Core Domain Types
 */

export interface HealthResponse {
  status: string;
  application: string;
  message: string;
}

export type UserRole = "ADMIN" | "UMPIRE" | "USER";

export type SportType = "CRICKET" | "FOOTBALL";

export type CricketFormat = "LIMITED_OVERS" | "TEST";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: string;
}

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
