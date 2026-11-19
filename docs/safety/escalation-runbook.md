# PulseNet — Escalation Runbook

**Version:** 1.0  
**Owner:** On-Call Engineering Lead  
**Review:** After every P0 incident; otherwise quarterly

> [!IMPORTANT]
> This runbook is for operational use. All actions taken during an incident must be logged in the admin panel. Post-incident review is mandatory for P0 and P1.

---

## 1. Severity Levels

| Level | Name | Definition | Examples |
|-------|------|-----------|---------|
| **P0** | Critical — Life Safety | An SOS event is active with no operator acknowledgement, OR a system failure is preventing SOS flows | Unacknowledged SOS after 10 min; backend down; FCM delivery failure during active SOS |
| **P1** | High — Service Degraded | Core feature unavailable or severely degraded; data integrity risk | Blood request matching broken; payment processing down; auth service unavailable |
| **P2** | Medium — Feature Impaired | Non-critical feature unavailable; degraded UX with no safety risk | Notification delays; analytics pipeline down; admin dashboard slow |
| **P3** | Low — Minor Issue | Cosmetic, non-urgent, or single-user issue | UI rendering glitch; minor text error; slow API endpoint (< 2x SLA) |

---

## 2. Acknowledgement Targets

| Severity | On-Call Response | Operator Acknowledgement | Engineering Acknowledgement | Management Notification |
|----------|-----------------|------------------------|--------------------------|------------------------|
| P0 | Immediate — PagerDuty fires | Within **5 minutes** | Within **10 minutes** | Within **15 minutes** |
| P1 | Within **15 minutes** | Within **30 minutes** | Within **30 minutes** | Within **1 hour** |
| P2 | Within **1 hour** | Within **4 hours** | Within **4 hours** | Not required |
| P3 | Within **1 business day** | Not required | Within **1 business day** | Not required |

---

## 3. SOS Escalation Path

This is the step-by-step path for an active SOS event from trigger to resolution.

```
Step 1 — Patient triggers SOS
  └─ System: 5-second countdown displayed; patient can cancel
  └─ System: If not cancelled → SOS event created (status: CONFIRMED)

Step 2 — Donor notification (automated)
  └─ System: FCM push to all compatible donors within 10 km radius
  └─ System: Acknowledgement window: 5 minutes
  └─ Timeout: If no donor accepts in 5 min → status: ESCALATED

Step 3 — Escalation: No donor accepted (5 min timeout)
  └─ System: Widens search radius to 25 km
  └─ System: Creates task in operator human-review queue
  └─ Operator: Must acknowledge task within 5 minutes (P0 alert if not)
  └─ Operator action: Manually contact blood banks / hospitals; attempt direct donor outreach

Step 4 — Further escalation: No resolution (10 min from SOS trigger)
  └─ P0 alert fires (PagerDuty + SMS to on-call engineering lead)
  └─ Second operator joins the queue
  └─ Operator verifies: patient's emergency contact notified?
  └─ Operator verifies: local hospital in the loop?

Step 5 — Resolution paths
  └─ Donor accepts and arrives → Operator marks SOS resolved with donor ID
  └─ Patient cancels (no longer needed) → Operator logs cancellation reason
  └─ Hospital handles directly → Operator marks RESOLVED with note
  └─ No resolution possible → Operator marks FAILED with full incident log
      └─ FAILED SOS always triggers mandatory P0 post-incident review

Step 6 — Post-SOS
  └─ Audit log entry auto-created with full timeline
  └─ P0 or FAILED SOS → post-incident review within 48 hours
```

---

## 4. Payment Fraud Escalation

```
Trigger: Razorpay webhook signals payment failure, duplicate, or mismatch

Step 1 — Automated detection
  └─ Payment service flags: amount mismatch, duplicate idempotency key with different payload,
     multiple failed attempts from same user/IP

Step 2 — Automated response
  └─ Block fulfilment of associated blood request (not cancellation — block only)
  └─ Create P1 task in human-review queue
  └─ Notify user: "Your payment is under review; we will contact you within 2 hours."

Step 3 — Operator review (within 30 minutes)
  └─ Operator examines: Razorpay dashboard, payment record, user history
  └─ Operator decision:
      ├─ Legitimate → unblock fulfilment, log decision
      ├─ Duplicate/error → void one transaction, refund, log decision
      └─ Fraudulent → suspend user, freeze payments, escalate to admin

Step 4 — Admin action (if fraudulent)
  └─ Admin reviews evidence; suspends account if confirmed
  └─ Admin notifies Razorpay fraud desk via their merchant dashboard
  └─ Law enforcement referral if amounts exceed ₹10,000

Step 5 — Post-incident
  └─ Document in admin panel: amount, timeline, action taken, outcome
  └─ P1 → post-incident review within 1 week
```

---

## 5. Data Breach Escalation

```
Trigger: Suspected or confirmed unauthorised access to user personal data

Step 1 — Detection (automated or reported)
  └─ Anomaly: unusual bulk data export, unexpected foreign IP, security alert

Step 2 — Immediate containment (within 30 minutes of detection)
  └─ Engineering: revoke all active sessions for affected users
  └─ Engineering: rotate JWT signing keys (all sessions invalidated globally)
  └─ Engineering: isolate affected service if breach is ongoing
  └─ Create P0 incident

Step 3 — Assessment (within 2 hours)
  └─ Determine: what data was accessed? how many users? which data classes?
  └─ Preserve: all logs, access records (do NOT delete anything — this is evidence)
  └─ Engage: legal counsel

Step 4 — Notification (DPDPA 2023 obligation)
  └─ Notify CERT-In within 6 hours of confirmation (as required by IT Act rules)
  └─ Notify affected users within 72 hours of confirmation:
      "We have detected a security incident affecting your PulseNet account.
       [Specific data classes] may have been accessed. Here is what we know
       and what we are doing: [details]. Here are the steps you should take: [steps]."
  └─ Notify Data Protection Board (DPB) if breach is "significant" per DPDPA 2023

Step 5 — Remediation
  └─ Engineering: patch the vulnerability
  └─ Security: third-party penetration test within 30 days
  └─ Legal: assess liability; engage DPDPA compliance consultant

Step 6 — Post-incident review (mandatory, within 7 days)
  └─ Root cause analysis
  └─ What data was accessed, by whom, for how long
  └─ Remediation steps taken
  └─ Preventive measures implemented
  └─ Report shared with management and legal
```

---

## 6. On-Call Structure

> [!NOTE]
> Replace placeholder roles with actual named personnel and their contact details in a private ops document. Do not store personal contact details in this public runbook.

| Role | Responsibility | Rotation |
|------|---------------|---------|
| **On-Call Engineering Lead** | First engineering responder for P0/P1; has production access | Weekly rotation |
| **On-Call Operator** | First operational responder; works human-review queue | Weekly rotation |
| **Platform Safety Lead** | Decision authority for safety policy violations; clinical escalations | Reachable during business hours; emergency line 24/7 |
| **Engineering Manager** | Management escalation for P0; staffing calls | Available on-call escalation |
| **Legal Counsel** | Data breach and regulatory escalations | On retainer; reachable 24/7 for P0 |

PagerDuty schedules should be maintained by Engineering Manager. All on-call personnel must have admin panel access and production read access configured before going on-call.

---

## 7. Post-Incident Review Process

Mandatory for P0. Strongly recommended for P1. Optional for P2/P3 at team discretion.

### Timeline
- P0: Review must be initiated within **48 hours** of incident close.
- P1: Review must be completed within **1 week**.

### Process

1. **Incident Commander** (on-call lead who managed the incident) drafts the incident report within 24 hours using the template below.
2. **Review meeting** attended by: incident commander, affected team leads, one operator, platform safety lead (for P0 safety events).
3. **Blameless review:** The focus is on systems, processes, and improvements — not individual blame.
4. **Action items** are assigned owners and due dates. All P0 action items are P1 priority in the backlog.
5. **Report is published** to the internal docs system within 72 hours of the review meeting.

### Incident Report Template

```
Incident ID: INC-YYYY-NNN
Severity: P0 / P1
Date/Time (UTC): 
Duration: 
Services Affected:
Users Affected (approximate):

Summary:
[2–3 sentence summary of what happened]

Timeline:
HH:MM UTC — [event]
HH:MM UTC — [event]

Root Cause:
[What was the underlying cause?]

Contributing Factors:
[What made it worse or delayed detection/response?]

What Went Well:
[What worked in the response?]

What Could Be Improved:
[What should change?]

Action Items:
| Action | Owner | Due Date | Priority |
|--------|-------|---------|---------|
| ...    | ...   | ...     | ...     |
```
