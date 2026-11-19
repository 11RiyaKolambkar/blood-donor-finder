# PulseNet — Consent Matrix

**Standard:** DPDPA 2023 (India), and general privacy best practices  
**Version:** 1.0  
**Review:** Every 6 months

> [!IMPORTANT]
> Each consent purpose must be presented separately. Bundling two purposes into one toggle is prohibited. Users must be able to grant and revoke each purpose independently, except where marked "Bundled with essential service."

---

## Consent Matrix

| Purpose | Data Collected | Why (Legitimate Use) | Recipients | Revocable? | Retention | Bundled with Essential Service? |
|---------|---------------|---------------------|-----------|-----------|----------|--------------------------------|
| **ACCOUNT** | Name, email, phone, date of birth, blood group, gender, verification documents | Account creation, identity verification, login, support | Internal only; verification via third-party KYC if applicable | No — required to use the platform | 7 years after account deletion (legal obligation) | **Yes** — service cannot function without this |
| **LOCATION_PRECISE** | GPS lat/lng coordinates (accurate to ~10 m) | Match donors to nearby blood requests; navigate to donation sites | Backend matching service; never shared with other users directly | Yes — disabling stops matching | 30 days, then deleted | No — platform falls back to city-level matching |
| **LOCATION_LIVE** | Continuous GPS updates (up to 1 hour per session) | Allow recipient/hospital to track donor en route during active donation | Backend; ETA visible to the requesting hospital/patient during active session only | Yes — session terminates immediately | 90 days (trace logs); live feed discarded when session ends | No — donor route tracking is opt-in |
| **NOTIFICATIONS** | FCM device token | Deliver push notifications for blood requests, SOS alerts, status updates | Firebase Cloud Messaging (Google); token stored internally | Yes — stops push notifications (can still use in-app) | 365 days or until token rotation | No — in-app polling is a fallback |
| **DATA_SHARING** | Anonymised usage patterns, donation history aggregates | Improve matching algorithms; research partnerships (anonymised only) | Internal data team; anonymised aggregates to research partners only | Yes — opt-out stops new sharing; past anonymised data cannot be recalled | 2 years | No |
| **PAYMENTS** | Name, payment method type (not card number — handled by Razorpay), transaction ID, amount | Process voluntary travel cost compensation between patients and donors | Razorpay (payment processor); internal records for tax/legal | No once transaction is initiated — can disable future payment features | 7 years (financial/tax legal requirement) | No — payments are optional |
| **ANALYTICS** | App events (screens viewed, features used), crash reports, session duration | Understand feature usage, fix bugs, improve UX | Internal analytics team; Google Firebase Analytics (anonymised) | Yes | 2 years | No |
| **AI_ASSISTANCE** | Query text, context provided to AI features (e.g., AI-assisted donor matching suggestions) | Generate AI-powered suggestions shown to operators | Internal AI service; no input/output sent to external model training | Yes — disables AI-assisted features; falls back to rule-based matching | 2 years | No |
| **EMERGENCY_CONTACTS** | Names and phone numbers of up to 3 emergency contacts | Notify contacts if user triggers SOS and is unresponsive | SMS/call gateway only during active SOS; not stored with any third party | Yes — removes stored contacts; existing contacts are deleted within 24 hours | Until user removes contacts, then deleted; 90-day audit log | No |

---

## Notes

### Revocation Process
- Revocation requests must be processed within **24 hours** for data access; **immediately** for active features (e.g., stopping live location).
- Revocation does not apply retroactively to data already collected under a valid consent (e.g., past donation history remains for legal retention).
- If a user revokes **LOCATION_PRECISE**, the system degrades to city-level matching. This is communicated clearly before revocation is confirmed.

### Consent Version Tracking
Every consent grant records:
- Purpose
- Consent version (linked to the privacy policy version shown)
- Timestamp (UTC)
- Method of grant (in-app toggle, onboarding flow, settings)

When the platform updates its privacy policy in a material way affecting a purpose, existing consent for that purpose is re-requested.

### Minor Users
PulseNet does not knowingly register users under 18. If a user is found to be under 18 at registration, their account is suspended pending parental consent verification per DPDPA 2023 requirements.
