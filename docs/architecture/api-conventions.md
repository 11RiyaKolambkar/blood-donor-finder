# PulseNet — API Conventions

## Base URL

```
Production:  https://api.pulsenet.in/api/v1
Staging:     https://api-staging.pulsenet.in/api/v1
Development: http://localhost:5000/api/v1
```

---

## Authentication

All protected endpoints require a Bearer JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

- Access tokens expire in **15 minutes**.
- Refresh tokens expire in **7 days** and are stored server-side (Redis).
- Revoked tokens are blacklisted by JTI until their natural expiry.
- On logout, both access and refresh tokens are invalidated.

### Token Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| POST | `/auth/logout` | Revoke current tokens |
| POST | `/auth/logout-all` | Revoke all sessions for the user |

---

## Response Envelope

Every API response (success or error) uses a consistent envelope.

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "hasNextPage": true
  }
}
```

`meta` is omitted for non-paginated responses. `data` may be `null` for 204-equivalent responses.

### Error

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Blood request not found.",
    "details": { "requestId": "req_abc123" }
  }
}
```

`details` is optional and **must never** include internal stack traces, database error messages, or sensitive system information in production.

---

## Standard Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `MISSING_FIELD` | 400 | Required field absent |
| `INVALID_BLOOD_GROUP` | 400 | Blood group value not recognised |
| `UNAUTHENTICATED` | 401 | No valid token provided |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `TOKEN_REVOKED` | 401 | Token has been blacklisted |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist (see safe errors below) |
| `CONFLICT` | 409 | Resource already exists or state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Downstream service (DB, Redis) unreachable |
| `SOS_COOLDOWN` | 429 | SOS triggered too recently |
| `CONSENT_REQUIRED` | 403 | Action requires consent not yet granted |
| `PAYMENT_FAILED` | 402 | Razorpay payment processing failed |
| `IDEMPOTENCY_CONFLICT` | 409 | Duplicate idempotency key with different payload |

---

## Pagination

Paginated list endpoints accept query parameters:

```
GET /api/v1/blood-requests?page=2&limit=20&sortBy=createdAt&sortOrder=desc
```

| Param | Default | Max | Description |
|-------|---------|-----|-------------|
| `page` | 1 | — | 1-indexed page number |
| `limit` | 20 | 100 | Items per page |
| `sortBy` | `createdAt` | — | Field to sort by |
| `sortOrder` | `desc` | — | `asc` or `desc` |

Response `meta` always includes `page`, `limit`, `total`, and `hasNextPage`.

---

## Rate Limiting

All responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000900
```

`X-RateLimit-Reset` is a Unix timestamp (seconds) when the window resets.

| Bucket | Window | Limit | Scope |
|--------|--------|-------|-------|
| Auth endpoints | 15 min | 10 | Per IP |
| General API | 15 min | 100 | Per authenticated user |
| SOS activation | 1 min | 3 | Per authenticated user |

When a rate limit is exceeded, the response is `429 RATE_LIMITED` with a `Retry-After` header.

---

## Idempotency

POST requests to payment and SOS endpoints **must** include an idempotency key:

```
X-Idempotency-Key: <client-generated UUID v4>
```

The server stores the response for 24 hours. A second request with the same key and identical payload returns the cached response without re-executing. A second request with the same key but a **different** payload returns `409 IDEMPOTENCY_CONFLICT`.

Required on:
- `POST /api/v1/payments/initiate`
- `POST /api/v1/emergency/sos`

---

## Versioning

API versions are URL-based:

```
/api/v1/...   ← current stable
/api/v2/...   ← next version (when applicable)
```

Breaking changes (removed fields, changed semantics) always increment the major version. Additive changes (new optional fields) may be made within a version. Deprecated versions are supported for a minimum of 6 months after the successor version is released, with a `Deprecation` response header on every request to the old version.

---

## Safe Errors

PulseNet handles sensitive resources (user profiles, SOS events, payment records) in a way that **never reveals their existence to unauthorized callers**.

Rules:
- An unauthenticated caller asking for a resource that requires auth gets `401 UNAUTHENTICATED`, not `404 RESOURCE_NOT_FOUND`.
- An authenticated caller without permission to a resource gets `404 RESOURCE_NOT_FOUND` (not `403 FORBIDDEN`), so they cannot infer the resource exists.
- Exception: a caller asking for their **own** resource that does not exist gets `404`.
- SOS endpoints always return the same response shape regardless of whether the user has the right role, to prevent role-probing.

---

## Content Type

All request and response bodies use `application/json`. File uploads use `multipart/form-data` on dedicated upload endpoints.

---

## Health Check

```
GET /health
```

Returns `200 OK` with `{ "status": "ok", "ts": "<ISO timestamp>" }` when all dependencies are healthy. Used by Docker health checks and load balancers.
