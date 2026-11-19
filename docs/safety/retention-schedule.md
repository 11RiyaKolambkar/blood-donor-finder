# PulseNet — Data Retention Schedule

**Standard:** DPDPA 2023 (India), IT Act 2000, applicable financial regulations  
**Version:** 1.0  
**Review:** Annually or after regulatory change

> [!WARNING]
> Deletion must be permanent and irreversible. "Soft delete" (setting a `deleted_at` flag) does not satisfy retention obligations — data must be purged from the database and all backups within 30 days of expiry, unless a Legal Hold is active.

---

## Retention Schedule

| Data Class | Retention Period | Deletion Method | Legal Hold Exception | Notes |
|------------|-----------------|-----------------|---------------------|-------|
| **Account profile data** (name, email, phone, blood group, DOB) | 7 years from account deletion date | Hard delete from MongoDB; backups purged on next rotation cycle | Active litigation, regulatory investigation | Required for identity verification audit trail |
| **Blood request records** | 5 years from fulfilment or cancellation date | Hard delete; anonymised aggregate counts may be retained | Active dispute or litigation involving the request | Includes requester, matched donors, status history |
| **Precise GPS coordinates** (point-in-time) | 30 days from collection date | TTL index on MongoDB collection; auto-deleted | None | Never retained beyond 30 days under any circumstance |
| **Live location trace logs** | 90 days from session end | TTL index; hard delete after 90 days | None | Session metadata (start/end time, user ID) retained as part of audit log for 7 years |
| **Coarse location** (city/district level) | 365 days from collection | Hard delete | None | Derived from precise location; not the raw coordinates |
| **Notification records** (FCM delivery logs) | 365 days from send date | Hard delete | None | Includes delivery status, retry count, failure reason |
| **Payment transaction records** | 7 years from transaction date | Hard delete (data) — legal hold possible; Razorpay retains their own records per their policy | Tax audit, financial dispute | PulseNet retains: amount, timestamp, type, Razorpay order ID, status. No card/bank details. |
| **Audit logs** (privileged actions, break-glass) | 7 years from event date | **Never deleted within retention window** — append-only | Logs are themselves the legal hold record | Immutable; write-once storage enforced at DB level |
| **Consent records** | 5 years after consent ends (revocation or account deletion, whichever is later) | Hard delete | Regulatory investigation | Records what was consented to, when, and under which policy version |
| **AI input/output logs** | 2 years from creation | Hard delete | None | Includes query text and AI response shown to operator; not training data |
| **Support communications** | 3 years from ticket close | Hard delete | Active dispute or litigation | Includes chat transcripts, emails, file attachments |
| **Emergency contact data** | Until user removes contacts; then immediate deletion | Hard delete within 24 hours of removal request | None | 90-day audit log entry of when contacts were added/removed |
| **OTP / verification codes** | 5 minutes (active); purged immediately on use or expiry | Redis TTL auto-expire | None | Never persisted to MongoDB |
| **JWT refresh tokens** | 7 days (or until logout) | Redis TTL; revocation blacklist for access tokens | None | Blacklist entries expire with the token |
| **Crash / error reports** | 90 days | Auto-rotation by analytics platform | None | Must not contain PII in production — scrubbed before logging |

---

## Deletion Process

### Standard Deletion (No Legal Hold)
1. Scheduler job runs nightly identifying records past their retention date.
2. Records are hard-deleted (not flagged) from primary MongoDB collections.
3. Corresponding records in Redis are expired (TTL enforced continuously).
4. Backup purge: next scheduled backup rotation (max 30 days after primary delete).
5. Deletion event logged in audit log (record ID, data class, deletion timestamp).

### Legal Hold
1. Data steward places a hold on a specific user ID or data class via the admin panel.
2. Scheduler job skips records under hold.
3. Hold must be reviewed every 90 days; stale holds require re-authorisation.
4. When hold is lifted, standard deletion runs at the next nightly cycle.

### User-Requested Deletion (Right to Erasure — DPDPA 2023)
- User submits deletion request via app or support.
- Request is acknowledged within 72 hours.
- Deletion is completed within **30 days** unless a Legal Hold applies.
- If a Legal Hold applies, user is notified of the hold and the minimum retention period remaining.
- Audit log entries that reference the user (but do not contain avoidable PII) are pseudonymised, not deleted, for the full 7-year audit window.

---

## Backup Retention

| Backup Type | Retention |
|-------------|-----------|
| Daily MongoDB snapshot | 30 days |
| Weekly snapshot | 90 days |
| Monthly snapshot | 1 year |

Backup deletion must respect Legal Holds. Backup purge schedules are automatically paused for a user ID if a Legal Hold is active on that user's data.
