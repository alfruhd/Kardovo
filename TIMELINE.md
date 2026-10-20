# Kardovo Platform Development Timeline

A chronological record of engineering updates, architectural enhancements, security additions, and microsite developments across the platform.

---

## 📅 October 20, 2026 — Precision Visual Tuning, Pass Layout & Guest UX Refinements

- **Guest List UX & Action Clean-up**:
  - Removed the external link (`[↗]`) action button from individual guest rows in `EventDashboard.jsx` to streamline organizer table controls.
- **Card Scale Wrapper & Layout Fix**:
  - Updated `CardScaleWrapper` in `PersonalisedCard.jsx` to use natural flow rendering for signature standard passes (`templateType !== 'custom_art'`).
  - Completely resolved the issue where the `Print Pass` / `Download Pass` action bar was partially hidden or peeking out behind standard passes.
- **Wax Seal & Monogram Precision Calibration**:
  - Calibrated monogram font placement (`top: 52.8%; left: 46.5%`) in both `sacred_garden_exact.html` and `GuestPass.jsx` for exact center symmetry.
  - Re-rendered all six authentic 3D wax seal badges (`seal_emerald_authentic.png`, `seal_navy_authentic.png`, `seal_gold_authentic.png`, `seal_black_authentic.png`, `seal_blush_authentic.png`, `seal_burgundy_authentic.png`) from pristine high-resolution masters, removing any bottom slit, transparency holes, or paper sliver artifacts.
- **Quality Assurance & Formatting**:
  - Full Pest test suite executed: **194 tests passing (1,489 assertions)** with zero failures.
  - Formatted with **Laravel Pint**.

---

## 📅 October 19, 2026 — The Sacred Garden 1:1 Luxury Microsite Replica

- **Exact Microsite Reconstruction**:
  - Built high-fidelity 1:1 Sacred Garden microsite replica (`public/invitation_templates/sacred_garden_exact.html`) matching the bespoke wedding invitation experience.
  - Reconstructed 3D entrance envelope gate with gold foil seam glow, realistic envelope opening animation, and interactive wax seal break.
- **Dynamic Customization Engine**:
  - Enabled dynamic customization for couple initials/monogram, typography, background music player, and schedule events.
  - Added support for 6 authentic luxury colorways (Emerald, Navy, Gold, Black, Blush, Burgundy) plus custom hex codes.
  - Built synchronized RSVP modal matching the original aesthetic with 1-tap guest response persistence.
- **Pass Gating & Permissions**:
  - Integrated `PublicGuestController` to serve the interactive microsite when enabled for events, falling back gracefully to the verified digital pass card.

---

## 📅 October 18, 2026 — Payment Ledger, Idempotency & Bot Defense

- **Payment Ledger & Idempotency**:
  - Added `database/migrations/2026_10_18_000001_create_payment_ledger_entries_and_idempotency_columns.php`.
  - Implemented `PaymentLedgerEntry` model for tamper-evident reconciliation of all inbound transactions.
  - Added idempotency verification to prevent duplicate payment processing across Azampay, WhatsApp, and manual verification channels.
- **Automated Anti-Bot Middleware**:
  - Implemented `ProtectAgainstBotSubmissions` middleware to safeguard public RSVP and pledge endpoints against automated spam and DDoS vectors.
  - Added honeypot fields, rate-limiting headers, and timestamp validation.
- **Messaging Pass-Link Microsite Gating**:
  - Enhanced `MessagingController.php` and `Messaging.jsx` to generate contextual pass and microsite links during WhatsApp campaign dispatches.

---

## 📅 October 17, 2026 — Ticketing Add-ons, Physical Wristbands & POS Terminals

- **Discounts, Wristbands & POS Schema**:
  - Created migration `2026_10_17_153811_create_ticketing_discounts_wristbands_and_pos_tables.php`.
  - Added models:
    - `DiscountCode`: Percentage and fixed amount promotional codes with expiration dates and maximum redemption limits.
    - `WristbandOrder`: Tracking physical NFC/RFID wristband orders for large-scale events.
    - `PosTerminalRequest`: Onsite POS handheld scanner terminal rentals for gate teams.
- **Print Pass & Wristband Sheet Generation**:
  - Built `PrintTicketSheet.jsx` and `PrintWristbandSheet.jsx` for high-density, print-ready PDF/sheet export with automated QR code layout.
- **Ticketing Translations & Localization**:
  - Added `resources/js/Utils/ticketingTranslations.js` supporting multi-lingual ticketing interfaces (English & Swahili).

---

## 📅 October 16, 2026 — Pledges & Contributions Management System

- **Pledges & Contributions Architecture**:
  - Created migration `2026_10_16_113832_create_pledges_and_contributions_tables.php`.
  - Implemented `PledgeController.php`, `PledgePayment.php`, and `PledgePaymentFactory.php`.
  - Added automated calculation of total pledges, amounts collected, remaining balances, and progress percentages.
- **Guest Pledge Portal**:
  - Added interactive contribution tabs on `GuestPass.jsx`:
    - One-click suggested pledge amounts (TZS 20K, 50K, 100K, 200K, 500K).
    - Payment channel display (Lipa Namba, Bank Transfer) with 1-click clipboard copy.
    - Proof-of-payment submission form (amount, transaction reference code, payment method).
- **Database Optimization**:
  - Added migration `2026_10_16_191334_add_optimization_and_integrity_indexes.php` adding foreign key constraints and compound indexes for high-throughput guest lookups.

---

## 📅 October 8 - 15, 2026 — Security Architecture, Webhooks & Authentication

- **Security & Defensive Safeguards**:
  - Comprehensive security hardening across auth controllers (`TwoFactorController`, `AuthenticatedSessionController`, `RegisteredUserController`, `PasswordResetLinkController`).
  - Secure 6-digit verification codes for password resets and two-factor challenges.
  - Strict input sanitization, phone number normalization, and phone authentication support.
- **Payment & Webhook Hardening**:
  - Robust HMAC signature verification for `AzampayWebhookController` and `WhatsAppWebhookController`.
  - Safe transaction state machine with audit log emission.
- **Luxury Web Invitation Architecture (`web-invitation/`)**:
  - Setup Next.js + Supabase parallel workspace for client microsite preview and headless invitation workflows.
