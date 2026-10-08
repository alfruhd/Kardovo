# Security.md — Kardovo Security Rules & Controls

This document establishes the baseline security rules enforced across all features, controllers, models, APIs, and background jobs in Kardovo.

---

## 1. Scope
Kardovo is a luxury event access, digital invitation, and ticketing platform handling:
- Authenticated user accounts (Super Admin, Sub-Admin, Organizer/Customer, Gate Scanner Staff).
- Public digital ticket passes and invitation microsites (`/t/{ticket_number}`, `/card/{token}`).
- Mobile money and card payment webhooks & checkouts (AzamPay, M-Pesa).
- Automated communication relays (Meta WhatsApp Cloud API, Beem SMS, Email notifications).

---

## 2. Security Rules by Category

### 2.1 Input Validation & Server-Side Integrity
- **Rule SEC-01: Strict Server-Side Validation**
  - All incoming form and API requests must be validated using Form Requests or `$request->validate()` with explicit type and range constraints. Client-side validation is strictly decorative.
  - Where enforced: Controllers (`TicketCheckoutController`, `EventController`, `GuestController`, `TwoFactorController`).
  - Test: Submit empty strings, oversized strings, and unexpected types; expect HTTP 422 Unprocessable Entity.
- **Rule SEC-02: Role & Parameter Mass Assignment Protection**
  - User role, permissions, quota limits (`max_whatsapp_limit`, `max_sms_limit`), and payment override fields must never be mass-assignable via profile or public registration forms.
  - Where enforced: Explicit assignment in Admin controllers, protected via `User::$fillable` and strict validation rules.
  - Test: Attempt submitting `role=admin` or `max_sms_limit=99999` to `/profile` or registration endpoints. Assert role remains unchanged.

### 2.2 Secrets & Credential Isolation
- **Rule SEC-03: Zero Secrets in Browser or Session Props**
  - Gateway API secrets (AzamPay Client Secret, Meta WhatsApp Access Tokens, Beem SMS Secret, AWS credentials) and user authentication OTPs must never be passed to frontend Inertia props, browser logs, or client-side storage.
  - Where enforced: `app/Http/Middleware/HandleInertiaRequests.php`, `TwoFactorController.php`, `NewPasswordController.php`.
  - Test: Inspect Inertia page props for authentication and public views; confirm no secret keys, tokens, or plaintext OTPs exist.
- **Rule SEC-04: Environment-Gated Developer Endpoints**
  - Backdoors or debugging utilities (such as `/dev/switch-user` or dev OTP bypasses) must strictly be gated behind `app()->environment('local', 'testing')`.
  - Where enforced: `routes/web.php:45`, `AuthenticatedSessionController.php`.
  - Test: Simulate production environment (`APP_ENV=production`) and request `/dev/switch-user`; assert HTTP 404 Route Not Found.

### 2.3 Financial & Checkout Integrity
- **Rule SEC-05: Server-Calculated Pricing & Revenue Splits**
  - Ticket prices, platform fees (6%), organizer net amounts (94%), and total calculations are strictly derived on the server from the database (`TicketTier::$price`). Client-provided subtotals or fee overrides must never be trusted.
  - Where enforced: `TicketCheckoutController::checkout()`.
  - Test: Submit modified `price` or `subtotal` parameters in the checkout payload; verify total charged matches `TicketTier::find($id)->price * quantity`.
- **Rule SEC-06: Decoupled Payment Settlement**
  - Free passes ($0) may be fulfilled immediately. Paid passes must record orders with `payment_status = 'pending'` and transition to `paid` upon verified payment capture.
  - Where enforced: `TicketCheckoutController.php`, `TicketOrder.php`.
  - Test: Feature tests in `TicketingTest.php`.

### 2.4 Abuse Prevention & Resource Exhaustion (SMS / WhatsApp)
- **Rule SEC-07: Public Relay Lockdown**
  - Public resend endpoints (`/t/{ticket}/send-whatsapp`, `/t/{ticket}/send-sms`, `/t/{ticket}/send-email`) must only dispatch notifications to the contact info registered on the ticket (`$ticket->attendee_phone`, `$ticket->attendee_email`). Callers cannot supply arbitrary destination numbers.
  - Where enforced: `PublicTicketController.php:115,138`.
  - Test: Call resend endpoint with `phone=+1234567890`; verify message is sent only to ticket's saved phone.
- **Rule SEC-08: Rate Limiting on Costly Endpoints**
  - Authentication, password reset requests, and SMS/WhatsApp trigger endpoints must have aggressive throttle rate limiters (e.g. 5 requests per minute per IP).
  - Where enforced: `PasswordResetLinkController.php`, `AuthenticatedSessionController.php`, `routes/web.php`.
  - Test: Exceed 5 consecutive requests within 60s; assert HTTP 429 Too Many Requests.

### 2.5 Privacy & PII Protection
- **Rule SEC-09: Contact Masking on Public Pass Views**
  - Attendee phone numbers and email addresses rendered on public pass vouchers and guest microsites must be masked (e.g. `+255 7•••• 678`, `ju••••@example.com`).
  - Where enforced: `PublicTicketController.php:51-52`, `PublicGuestController.php:85`.
  - Test: Request public digital pass and inspect JSON props; verify no full phone numbers or emails appear.

---

## 3. Open Questions & Future Hardening
1. Should public ticket URLs enforce 32-character high-entropy `qr_token` instead of sequential 6-digit ticket numbers when direct links are shared? (Partially addressed via unguessable QR tokens).
2. Should Webhook verification for AzamPay require an HMAC signature header check when in production?
