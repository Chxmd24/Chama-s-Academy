/**
 * Chama's Academy - Core Domain Types
 */

export type UserRole = "admin" | "umpire" | "user";

export type SportType = "cricket" | "football";

export type CricketFormat = "limited_overs" | "test";

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

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
