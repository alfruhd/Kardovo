# Data Security.md — Kardovo Data Inventory, Protection & Retention

This document outlines the data Kardovo collects, storage locations, encryption methods, log hygiene, and deletion procedures.

---

## 1. Data Inventory

| Data Classification | Fields & Examples | Purpose | Storage Location | Access Rule | Retention & Deletion |
|---|---|---|---|---|---|
| **User Credentials** | `email`, `phone`, `password` (hashed), `two_factor_code` (hashed) | Identity & authentication | PostgreSQL / MySQL `users` table | User owner + system auth | Preserved until account deletion |
| **Attendee / Guest PII** | `attendee_name`, `attendee_phone`, `attendee_email`, `company` | Ticket pass generation & delivery | `tickets`, `guests` tables | Event organizer + gate scanner | Retained for event lifecycle; soft/hard delete on request |
| **Access Tokens & Passes** | `qr_token`, `unique_code`, `card_number` | Gate validation & QR verification | `tickets`, `guests` tables | Public pass resolver (read-only), Scanner staff | Valid until event expiration |
| **Financial & Payout Data** | `payout_account_number`, `payout_account_name`, `subtotal`, `platform_fee` | Revenue tracking & disbursement | `ticket_orders`, `financial_transactions`, `events` | Super Admin + Event owner | Retained for accounting & financial compliance |
| **Third-Party API Secrets** | AzamPay client secret, Meta token, Beem SMS secret | Outbound messaging & payments | `system_settings` table (JSON) | Super Admin strictly | Encrypted / protected at rest |

---

## 2. Protection & Encryption Rules

### 2.1 Passwords & Security Tokens
- All passwords hashed via Laravel's native Bcrypt / Argon2id hasher (`Hash::make()`).
- All 2FA and Password Reset security codes stored as cryptographic one-way hashes (`Hash::make($code)`). Plaintext OTPs never stored in DB.

### 2.2 Log Hygiene & Secret Redaction
- Raw passwords, credit card numbers, mobile money PINs, and gateway API private keys must NEVER be written to Laravel log files (`storage/logs/laravel.log`) or database audit logs.
- Sensitive parameters in stack traces must be masked using Laravel's `$hidden` attributes and sanitizing exception handlers.

### 2.3 Public Endpoint Masking
- Public digital pass endpoints (`/t/{ticket_number}`, `/card/{token}`) must mask phone numbers (`+255 7•••• 678`) and emails to prevent scraper harvesting.

---

## 3. Backups & Deletion Rules

- **Hard Deletes**: When an organizer deletes a guest, associated delivery logs, scan history, and tokens must cascade or purge.
- **Order Integrity**: Completed ticket orders (`ticket_orders`) and transactions must remain immutable for financial audit trails, with personal contact data anonymized if an erasure request is executed.
- **Database Backups**: Automated database snapshots stored in encrypted object storage with 30-day lifecycle retention.

---

## 4. Open Questions
- Is database-level encryption at rest (e.g. AWS RDS KMS / TDE) active on the production deployment cluster? (Recommended for production launch).
