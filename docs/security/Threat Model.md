# Threat Model.md — Kardovo Realistic Abuse Scenarios & Mitigations

This document outlines the top realistic attack vectors and abuse scenarios against the Kardovo platform, their potential business harm, active protections, and automated test coverage.

---

## 1. Threat Scenarios Matrix

| Risk ID | Abuse Scenario | Why It Matters (Harm) | Required Preconditions | Active Protection | Automated Test | Owner |
|---|---|---|---|---|---|---|
| **TM-01** | **Unauthenticated Super Admin Impersonation via Dev Switch** | Complete platform takeover; attacker elevates to Super Admin without credentials. | Access to `/dev/switch-user` endpoint in production. | Route is strictly gated inside `if (app()->environment('local', 'testing'))` in `routes/web.php`. | Gating verified in test suite. Production requests return 404. | Backend Lead |
| **TM-02** | **Zero-Dollar Ticket Checkout Exploit (Fake Fulfillment)** | Loss of ticket sales revenue; attackers obtain valid VIP passes for paid events without paying. | Checkout endpoint marking paid orders as `paid` immediately without gateway capture. | Free tickets ($0) issue immediately; paid tickets require gateway settlement or pending state. | `TicketingTest::test_attendee_can_checkout_tickets...` | Payments / Backend |
| **TM-03** | **OTP Leakage in Frontend Props or Dev Codes** | Account takeover via leaked two-factor or password reset verification codes. | `devCode` passed to client Inertia props in production. | `devCode` prop evaluated as `app()->environment('local', 'testing') ? ... : null`. | `TwoFactorController` & `PasswordResetTest`. | Auth Lead |
| **TM-04** | **Arbitrary SMS/WhatsApp Relay Credit Drainage** | Financial loss via exhausted SMS credits; phone number harassment using Kardovo gateway. | Public pass resend endpoints accepting arbitrary destination `phone` parameters. | Resend endpoints strictly reject input overrides and bind directly to `$ticket->attendee_phone`. | `TicketingTest::test_public_ticket_notification_endpoints...` | Communications Lead |
| **TM-05** | **Sequential Ticket / Guest ID Enumeration & Harvesting** | Mass attendee PII leak; duplicate badge counterfeit using guessed ticket IDs. | Predictable 6-digit ticket numbers or sequential auto-increment IDs on public URLs. | High-entropy 32-character tokens (`qr_token`) used for QR validation; phone/email PII masked on public render. | Public pass masking feature test. | Security Team |
| **TM-06** | **Cross-Tenant IDOR on Event Orders or Guest Lists** | Organizer A views or deletes Organizer B's revenue, attendee list, or payouts. | Controller fetches records by ID without scoping by `auth()->id()`. | Eloquent queries scoped to `where('user_id', auth()->id())` or policy aborts with 403. | `FinanceTest`, `TicketingTest`. | Core Backend |

---

## 2. Risk Triage & Review Cycle

1. **High Priority (P0)**: Authentication bypasses, admin backdoors, secret leaks.
2. **Medium Priority (P1)**: Public communication relay abuse, IDOR across tenant boundaries.
3. **Low Priority (P2)**: UI metadata disclosure, non-sensitive enumeration.
