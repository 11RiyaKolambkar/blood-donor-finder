// PulseNet Shared Types
// Shared between backend and frontend - do not add runtime dependencies here

export enum UserRole {
  PATIENT = 'patient',
  DONOR = 'donor',
  BLOOD_BANK = 'blood_bank',
  HOSPITAL = 'hospital',
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

export enum BloodGroup {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
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

export enum BloodRequestStatus {
  PENDING = 'pending',
  DONOR_FOUND = 'donor_found',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

export enum DonorAvailability {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  ON_COOLDOWN = 'on_cooldown',
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

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

// ─── API Envelope ──────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Location ──────────────────────────────────────────────────────────────────

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface AddressInfo {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

// ─── User & Profile ────────────────────────────────────────────────────────────

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  role: UserRole;
  bloodGroup?: BloodGroup;
}

// ─── Donor ─────────────────────────────────────────────────────────────────────

export interface DonorSearchParams {
  bloodGroup: BloodGroup;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface DonorSearchResult {
  id: string;
  userId: string;
  name: string;
  bloodGroup: BloodGroup;
  availability: DonorAvailability;
  distanceKm: number;
  lastDonatedAt?: string;
}

// ─── Blood Request ─────────────────────────────────────────────────────────────

export interface BloodRequestPayload {
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  location: GeoPoint;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

// ─── Emergency SOS ─────────────────────────────────────────────────────────────

export interface EmergencyPayload {
  bloodGroup: BloodGroup;
  location: GeoPoint;
  address?: AddressInfo;
  notes?: string;
  idempotencyKey: string;
}

export interface EmergencyStateTransition {
  from: EmergencyStatus;
  to: EmergencyStatus;
  actor: string;
  reason?: string;
  timestamp: string;
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ─── Payment ───────────────────────────────────────────────────────────────────

export interface PaymentInitPayload {
  amount: number; // in smallest currency unit (paise for INR)
  currency: string;
  description: string;
  referenceId: string;
}
