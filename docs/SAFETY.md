# Clinical Safety & Human-in-the-Loop Policy

## 1. Safety Principles & Prohibited Automations
- **Never Autonomous Dispatch**: PulseNet does not dispatch official ambulances or municipal emergency services without validated human confirmation.
- **Never Clinical Substitute**: Blood compatibility search is advisory only. Clinical testing (cross-matching) is mandatory before transfusion.
- **Explicit Emergency Disclaimer**: Every SOS screen must clearly present:
  > *"PulseNet is NOT a substitute for emergency services. In immediate life-threatening situations, contact 112 / 911 directly."*

## 2. Emergency State Machine
```
[ DRAFT ] ---> [ CONFIRMED ] ---> [ NOTIFICATION_PENDING ]
                    |                          |
                    v                          v
             [ CANCELLED ]             [ ACKNOWLEDGED ]
                                               |
                                        +------+------+
                                        |             |
                                        v             v
                                   [ ESCALATED ]  [ RESOLVED ]
```

## 3. Human Operator Override
- Human operators have the authority to pause, override, or manually escalate any SOS alert.
- Audit logs capture actor ID, timestamp, and justification for every state change.
