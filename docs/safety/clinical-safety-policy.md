# PulseNet — Clinical Safety Policy

**Version:** 1.0  
**Effective Date:** 2024-01-01  
**Review Cycle:** Every 6 months or after any P0 safety incident  
**Owner:** Platform Safety Lead (see escalation runbook for contact)

---

> [!CAUTION]
> This document is a binding policy. Any feature, automation, or code change that conflicts with this policy MUST NOT be shipped without written approval from the Platform Safety Lead and a designated clinical advisor.

---

## 1. Fundamental Limitation Statement

**PulseNet is a blood donation coordination logistics platform. It is NOT:**

- A substitute for emergency medical services (call 112 / 911 for medical emergencies)
- A clinical diagnosis or treatment tool
- A blood bank management system certified under CDSCO
- A medical device under the Medical Devices Rules, 2017
- A guarantee of blood availability or timely donation

PulseNet connects willing donors with people in need. The platform does not provide medical advice, does not validate clinical compatibility beyond blood group type, and does not replace the professional judgment of licensed healthcare providers.

---

## 2. Prohibited Automations

The following actions are **absolutely prohibited** without direct, real-time human initiation and confirmation:

### 2.1 AI/Automation CANNOT

| Prohibited Action | Reason |
|------------------|--------|
| Autonomously resolve an SOS event | Risk of leaving a critical patient without help |
| Confirm a blood unit as clinically safe for a specific recipient | Clinical crossmatch required by licensed personnel |
| Cancel a blood request on behalf of a patient | Patient may have lost connectivity, not changed their mind |
| Approve a payment refund without operator review | Financial fraud risk |
| Modify a user's blood group on their profile automatically | Medical record accuracy; must be verified |
| Send an SMS/call to emergency contacts without user confirmation | Privacy and consent violation |
| Extend live location sharing beyond 1 hour without fresh consent | DPDPA 2023 compliance |
| Revoke a user's account without admin review | Due process |
| Mark a donation as "fulfilled" without donor confirmation | Chain of custody integrity |

### 2.2 AI-Assisted Actions (Allowed with Human Review)

The following AI-assisted actions are allowed **only if presented as suggestions** to a human operator who makes the final decision:

- Ranking donor candidates by proximity and compatibility
- Flagging suspicious payment activity for operator review
- Suggested escalation path for a stalled SOS event
- Identifying blood requests with no matches after a threshold period

---

## 3. Required Disclaimers

### 3.1 App Onboarding (shown once, acknowledgement required)

> **Important Safety Notice**
> PulseNet is a voluntary blood donation coordination service. It is not a substitute for emergency medical services. In a medical emergency, always call 112 (India) or your local emergency number first. PulseNet does not guarantee blood availability, donor response time, or clinical compatibility beyond ABO blood group type.

### 3.2 SOS Screen (shown before SOS confirmation)

> **⚠️ Call Emergency Services First**
> Before activating PulseNet SOS, please call 112 or your nearest hospital emergency line. PulseNet SOS notifies nearby donors — it is not a replacement for professional emergency response.
>
> Do you want to also activate PulseNet SOS to request nearby donor assistance? [Cancel] [Activate PulseNet SOS]

This disclaimer is **verbatim** and must not be abbreviated, hidden behind a scroll, or shown in font smaller than 14sp. The "Call Emergency Services" button must appear above the "Activate PulseNet SOS" button.

### 3.3 Blood Request Confirmation

> Blood group compatibility shown is ABO/Rh type only. Clinical suitability (crossmatch, antibody screen) must be verified by qualified healthcare professionals at the point of donation and transfusion.

### 3.4 Donor Acceptance Screen

> By accepting this request, you confirm you meet standard donor eligibility criteria (see [donation guidelines link]). PulseNet does not perform medical screening. Donation must be supervised by qualified medical staff.

### 3.5 Footer / About (persistent, low-prominence)

> PulseNet is a logistics coordination tool, not a medical service. Blood group compatibility shown is indicative only.

---

## 4. Escalation Thresholds

| Event | Threshold | Required Action |
|-------|-----------|----------------|
| SOS acknowledged but no donor accepted | 5 minutes | Auto-escalate to operator queue; operator must acknowledge within 5 min |
| SOS acknowledged, no donor arrived at site | 20 minutes | Operator must contact patient directly; P0 alert raised |
| Blood request unfulfilled | 2 hours | Operator notified; hospital contact initiated |
| Blood request unfulfilled — critical priority | 30 minutes | Operator notified immediately |
| Payment discrepancy (amount mismatch) | Any | Block fulfilment; flag for operator review |
| Three consecutive failed FCM deliveries | Per user | Flag account; operator review to verify contact details |

---

## 5. Human Override Authority

### 5.1 Who Can Override What

| Override Type | Minimum Role | Logging Required |
|--------------|-------------|----------------|
| Resolve SOS event manually | Operator | Yes — reason + timestamp |
| Cancel a blood request on behalf of user | Operator | Yes — reason mandatory |
| Modify user blood group | Admin + clinical justification doc | Yes — immutable |
| Issue payment refund | Admin | Yes |
| Extend break-glass session | Admin (second, different admin) | Yes |
| Suppress a safety disclaimer | **PROHIBITED — no override** | N/A |

### 5.2 Override Logging

Every override writes an immutable audit log entry containing:
- Operator/admin user ID and name
- Action performed
- Resource ID and type
- Written justification (minimum 20 characters)
- Timestamp (UTC)
- IP address and device fingerprint

---

## 6. Break-Glass Access Procedure

Break-glass grants temporary elevated access to a restricted resource during an active emergency.

**Step 1:** Operator navigates to the resource in the admin panel.  
**Step 2:** Clicks "Request Break-Glass Access".  
**Step 3:** Enters written justification (min 20 chars; e.g. "Active P0 SOS, patient unresponsive, verifying location data").  
**Step 4:** System creates a 30-minute break-glass session and logs the initiation.  
**Step 5:** A second admin is notified and must acknowledge within 60 minutes.  
**Step 6:** All reads and writes during the session are tagged `break_glass: true` in audit logs.  
**Step 7:** Session auto-expires. Second admin reviews and either approves (closes) or escalates to Platform Safety Lead.  

Break-glass sessions cannot be nested. A user can only hold one active break-glass session at a time.

---

## 7. Emergency Disclaimer Text (Verbatim — Use Exactly As Written)

The following strings are **canonical**. Mobile and admin apps must render these exactly, without paraphrasing, abbreviation, or creative rewriting. String IDs are for localisation reference.

```
SAFETY_ONBOARDING_NOTICE:
"PulseNet is a voluntary blood donation coordination service. It is not a 
substitute for emergency medical services. In a medical emergency, always call 
112 (India) or your local emergency number first. PulseNet does not guarantee 
blood availability, donor response time, or clinical compatibility beyond ABO 
blood group type."

SAFETY_SOS_PRE_CONFIRM:
"⚠️ Call Emergency Services First — Before activating PulseNet SOS, please 
call 112 or your nearest hospital emergency line. PulseNet SOS notifies nearby 
donors — it is not a replacement for professional emergency response."

SAFETY_BLOOD_COMPAT_NOTICE:
"Blood group compatibility shown is ABO/Rh type only. Clinical suitability 
(crossmatch, antibody screen) must be verified by qualified healthcare 
professionals at the point of donation and transfusion."

SAFETY_DONOR_ACCEPT_NOTICE:
"By accepting this request, you confirm you meet standard donor eligibility 
criteria. PulseNet does not perform medical screening. Donation must be 
supervised by qualified medical staff."
```

Any change to these strings requires a code review approval from the Platform Safety Lead.
