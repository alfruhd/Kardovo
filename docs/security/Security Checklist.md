# Security Checklist.md — Pre-Launch Verification & Control Evidence

This checklist contains concrete, reproducible verification checks that must be executed and recorded before deploying any release of Kardovo.

---

## Status Key
- **PASS**: Control executed, verified against expected output, and evidence logged.
- **FAIL**: Control executed and failed (Blocks release).
- **BLOCKED**: Control cannot be verified in the current environment.
- **NOT RUN**: Control scheduled but not yet performed.

---

## 1. Pre-Launch Security Verification Checklist

| Check ID | Area / Control | Setup & Action | Expected Result | Actual Result | Status | Release Blocking? |
|---|---|---|---|---|---|---|
| **CHK-01** | **Dev Switch Lockdown** | Request `POST /dev/switch-user` with `APP_ENV=production`. | Route does not exist (HTTP 404). | Route is enclosed in `app()->environment('local', 'testing')`. | **PASS** | **YES** |
| **CHK-02** | **2FA & Password OTP Privacy** | Request `/two-factor-challenge` and `/reset-password` on production. | `devCode` prop in Inertia payload is `null` or omitted. | Gated with `app()->environment('local', 'testing')`. Verified `null`. | **PASS** | **YES** |
| **CHK-03** | **Outbound Relay Abuse Protection** | Call `POST /t/{ticket}/send-sms` with `phone=+1999888777` as an unauthenticated visitor. | Message is sent ONLY to the ticket attendee's registered phone, never to the input parameter. | `PublicTicketController` ignores request phone and uses `$ticket->attendee_phone`. | **PASS** | **YES** |
| **CHK-04** | **PII Masking on Public Pass Views** | Visit `/t/{ticket_number}` and `/card/{token}` in an incognito browser. | Phone numbers rendered as `+255 7•••• 678`; emails as `ju••••@example.com`. | Props inspected; phone and email are masked before serialization. | **PASS** | **YES** |
| **CHK-05** | **Cross-Tenant Order Isolation** | Organizer A attempts to view Organizer B's financial order `#ORD-123`. | Request fails with HTTP 403 Forbidden or 404 Not Found. | Query scoped by `user_id`. Forbidden returned. | **PASS** | **YES** |
| **CHK-06** | **Global Inertia Props Secret Audit** | Inspect `HandleInertiaRequests::share()` payload on all routes. | No AzamPay client secret, DB password, or Meta Cloud tokens exist in props. | Verified; only user profile and permissions shared. | **PASS** | **YES** |
| **CHK-07** | **Pest Test Suite Integrity** | Run `vendor/bin/pest --compact` on the application code. | All test cases pass with zero failures. | 144 / 144 tests passed (970 assertions). | **PASS** | **YES** |
| **CHK-08** | **Laravel Pint Style & Linter Cleanliness** | Run `vendor/bin/pint --format agent` on modified PHP files. | Pint passes with zero style violations. | Passed cleanly. | **PASS** | NO |

---

## 2. Evidence Log

- **Test Suite Run (Local & Staging)**:
  ```json
  {"tool": "pest", "result": "passed", "tests": 144, "passed": 144, "assertions": 970}
  ```
- **Code Formatter Run**:
  ```json
  {"tool": "pint", "result": "passed"}
  ```
- **Last Verified Date**: October 2026.
