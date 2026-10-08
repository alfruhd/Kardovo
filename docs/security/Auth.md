# Auth.md — Kardovo Identity, Access & Role Permissions

This document defines user authentication, tenant isolation, role-based access control (RBAC), and account lifecycle management in Kardovo.

---

## 1. Authentication Mechanisms
- **Primary Auth**: Email/Phone and Password with Argon2id / Bcrypt password hashing.
- **Two-Factor Authentication (2FA)**:
  - Time-limited 6-digit OTP codes sent via SMS / WhatsApp.
  - Hashed inside `users.two_factor_code` with 10-minute expiry (`two_factor_expires_at`).
  - Strict lockout / throttling per IP and user ID.
- **Session Management**:
  - Secure HTTP-only session cookies with CSRF token verification on all mutation requests (`POST`, `PUT`, `DELETE`).

---

## 2. Role & Permission Matrix

Kardovo supports four distinct roles:

| Role | Description | Allowed Resources | Forbidden Actions |
|---|---|---|---|
| **Super Admin (`admin`)** | System operator with full platform governance | All events, users, system settings, gateway API configs, audit logs, finances | Cannot view user passwords or plain credentials |
| **Sub-Admin (`sub_admin`)** | Support / Moderator | Users, events, assigned logs based on `permissions` array | System setting modifications, payment gateway secrets |
| **Customer / Organizer (`customer`)** | Event creator and ticket issuer | Only events, ticket tiers, guests, orders, and financial transactions where `user_id == current_user->id` | Viewing or modifying another organizer's events or customer orders |
| **Scanner Staff (`scanner`)** | Gate check-in operator | Assigned events via `gate_label` / scanner permissions. Read-only validation and check-in status toggling | Cannot access organizer dashboard, finances, settings, or user lists |

---

## 3. Tenant Data Isolation (Multi-Tenancy)

### 3.1 Server-Side Record Ownership Check
Hiding links or UI navigation buttons is never sufficient. Every controller action resolving an event, guest, order, or financial ledger entry must verify ownership:
```php
// Enforced Pattern:
$event = Event::where('user_id', $request->user()->id)->findOrFail($eventId);
```
Or via policy / authorization gate:
```php
abort_unless($event->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
```

### 3.2 Two-Account Test Matrix
- **Test Case 1 (Cross-Tenant Event Modification)**:
  - User A creates Event #101.
  - User B attempts `PUT /events/101` or `DELETE /events/101`.
  - Expected: HTTP 403 Forbidden or 404 Not Found.
- **Test Case 2 (Cross-Tenant Guest / Attendee Access)**:
  - User B attempts `GET /events/101/guests` or exports attendee CSV.
  - Expected: HTTP 403 Forbidden.
- **Test Case 3 (Scanner Boundary)**:
  - Scanner attempts to access `/admin` or `/dashboard`.
  - Expected: Redirect to `/scanner` or HTTP 403.

---

## 4. Account & Session Lifecycle

1. **Registration**:
   - New accounts default to role `customer` with active status.
   - Initial messaging quota limits set according to onboarding rules.
2. **Password Reset**:
   - 6-digit verification code sent to registered phone or email.
   - Code is hashed in database (`password_reset_tokens`). Expires after 15 minutes.
   - Rate limited to 5 attempts per IP per minute.
3. **Account Suspension**:
   - Admins can set `users.status = 'suspended'` with a `suspension_reason`.
   - Middleware terminates existing sessions and rejects login requests with a suspension banner.
4. **Session Termination**:
   - User logout invalidates session and regenerates CSRF token.

---

## 5. Open Questions
- Should organizer team invites (co-organizers) be introduced with granular scoping per event? (Currently single-owner per event).
