import { Request } from 'express';
import { Document, Types } from 'mongoose';

export enum UserRole {
  PATIENT = 'patient',
  DONOR = 'donor',
  BLOOD_BANK = 'blood_bank',
  HOSPITAL = 'hospital',
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

export enum BloodGroup {
  A_POS = 'A+', A_NEG = 'A-',
  B_POS = 'B+', B_NEG = 'B-',
  AB_POS = 'AB+', AB_NEG = 'AB-',
  O_POS = 'O+', O_NEG = 'O-',
}

export enum EmergencyStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  NOTIFICATION_PENDING = 'notification_pending',
  ACKNOWLEDGED = 'acknowledged',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum ConsentPurpose {
  ACCOUNT = 'account',
  LOCATION_PRECISE = 'location_precise',
  LOCATION_LIVE = 'location_live',
  NOTIFICATIONS = 'notifications',
  DATA_SHARING = 'data_sharing',
  PAYMENTS = 'payments',
  ANALYTICS = 'analytics',
  AI_ASSISTANCE = 'ai_assistance',
  EMERGENCY_CONTACTS = 'emergency_contacts',
}

export interface AuthUser {
  _id: string;
  email: string;
  phone: string;
  roles: UserRole[];
  isActive: boolean;
  isVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: { page?: number; limit?: number; total?: number; hasNextPage?: boolean };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
