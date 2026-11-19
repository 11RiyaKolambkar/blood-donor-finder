// PulseNet Shared Constants
// Shared between backend and frontend - no runtime dependencies

// ─── Blood Compatibility ───────────────────────────────────────────────────────
// Key = donor blood group, Value = list of blood groups the donor CAN donate to

export const BLOOD_COMPATIBILITY_MAP: Record<string, string[]> = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

/** All blood groups supported by PulseNet */
export const SUPPORTED_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export type SupportedBloodGroup = typeof SUPPORTED_BLOOD_GROUPS[number];

// ─── Safety ───────────────────────────────────────────────────────────────────

/**
 * REQUIRED disclaimer text — must be shown verbatim in any emergency-related UI.
 * Do NOT abbreviate or modify.
 */
export const EMERGENCY_DISCLAIMER =
  'PulseNet is NOT a substitute for emergency services. ' +
  'If you are in immediate danger, call 112 or 911 immediately. ' +
  'PulseNet cannot guarantee emergency response or dispatch.';

/** Seconds the user must wait on the SOS confirmation countdown before the request is sent */
export const SOS_COUNTDOWN_SECONDS = 5;

/** Maximum number of emergency contacts a user can register */
export const MAX_EMERGENCY_CONTACTS = 5;

// ─── Search & Defaults ────────────────────────────────────────────────────────

/** Default geospatial search radius in kilometres */
export const DEFAULT_SEARCH_RADIUS_KM = 50;

/** Maximum geospatial search radius in kilometres (server-enforced cap) */
export const MAX_SEARCH_RADIUS_KM = 200;

/** Default page size for paginated endpoints */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum page size allowed */
export const MAX_PAGE_SIZE = 100;

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Seconds before access-token expiry at which the client should proactively refresh */
export const TOKEN_REFRESH_BUFFER_SECONDS = 60;

/** Access token lifetime in seconds (15 minutes) */
export const ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60;

/** Refresh token lifetime in seconds (7 days) */
export const REFRESH_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

// ─── API ──────────────────────────────────────────────────────────────────────

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

// ─── Donation Cooldown ────────────────────────────────────────────────────────

/** Minimum days between whole-blood donations (WHO guideline) */
export const MIN_DONATION_INTERVAL_DAYS = 56; // 8 weeks

// ─── Notifications ────────────────────────────────────────────────────────────

/** Maximum FCM notification retry attempts before marking FAILED */
export const MAX_NOTIFICATION_RETRIES = 3;

/** Milliseconds between notification retry attempts (exponential base) */
export const NOTIFICATION_RETRY_BASE_MS = 2000;

// ─── Emergency ────────────────────────────────────────────────────────────────

/** Minutes after which an unacknowledged emergency is auto-escalated */
export const EMERGENCY_ESCALATION_THRESHOLD_MINUTES = 10;

/** Valid emergency state transitions */
export const VALID_EMERGENCY_TRANSITIONS: Record<string, string[]> = {
  draft:                ['confirmed', 'cancelled'],
  confirmed:            ['notification_pending', 'cancelled'],
  notification_pending: ['acknowledged', 'escalated', 'failed', 'cancelled'],
  acknowledged:         ['resolved', 'escalated', 'cancelled'],
  escalated:            ['acknowledged', 'resolved', 'cancelled'],
  resolved:             [], // terminal
  cancelled:            [], // terminal
  failed:               ['notification_pending', 'cancelled'], // allow retry
};

// ─── Urgency Levels ───────────────────────────────────────────────────────────

export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type UrgencyLevel = typeof URGENCY_LEVELS[number];

/** Urgency to response-time SLA in minutes */
export const URGENCY_SLA_MINUTES: Record<UrgencyLevel, number> = {
  low:      240, // 4 hours
  medium:   60,  // 1 hour
  high:     30,  // 30 minutes
  critical: 10,  // 10 minutes
};
