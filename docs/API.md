# PulseNet API Reference (v1)

Base URL: `/api/v1`

## Authentication (`/api/v1/auth`)
- `POST /register`: Register user `{ email, phone, password, firstName, lastName, role }`
- `POST /login`: Login `{ email, password }` -> Returns `{ accessToken, refreshToken, user }`
- `POST /refresh`: Refresh token `{ refreshToken }`
- `POST /logout`: Invalidate session
- `GET /me`: Authenticated user profile

## Emergency SOS (`/api/v1/emergency`)
- `POST /`: Trigger SOS `{ bloodGroup, latitude, longitude, locationConsentGranted, description }` (Accepts `X-Idempotency-Key`)
- `GET /active`: Fetch current active emergency for the caller
- `GET /:id`: Details of a specific emergency
- `POST /:id/confirm`: Confirm countdown completion
- `POST /:id/cancel`: Cancel emergency `{ reason }`
- `POST /:id/resolve`: Mark as resolved
- `PATCH /:id/location`: Stream real-time coordinates `{ latitude, longitude, accuracy }`
- `POST /:id/acknowledge`: Operator/Admin acknowledgment `{ notes }`

## Blood Donors (`/api/v1/donors`)
- `POST /register`: Register donor profile `{ bloodGroup, latitude, longitude, isAvailable, locationConsentGranted }`
- `GET /search`: Geospatial search `?bloodGroup=O+&lat=12.9716&lng=77.5946&radius=50`
- `PATCH /me/availability`: Toggle availability `{ isAvailable }`

## Blood Requests (`/api/v1/blood-requests`)
- `POST /`: Create blood request `{ bloodGroup, units, urgency, latitude, longitude, hospitalName }`
- `GET /my`: List requests made by current user
- `PATCH /:id/status`: Update status `{ status, donorId }`
- `DELETE /:id`: Cancel request

## Blood Banks (`/api/v1/blood-banks`)
- `GET /nearby`: Find nearby blood banks `?lat=12.9716&lng=77.5946&radius=50`
- `GET /:id/inventory`: Check stock by blood group
- `PATCH /:id/inventory`: Update inventory units

## Hospitals (`/api/v1/hospitals`)
- `GET /nearby`: Find nearby hospitals
- `GET /:id`: Hospital details
