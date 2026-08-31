<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FinancialTransaction;
use App\Models\User;
use App\Models\Event;

class FinancialTransactionSeeder extends Seeder
{
    public function run(): void
    {
        if (FinancialTransaction::count() > 0) {
            return;
        }

        $customers = User::where('role', 'customer')->get();
        $events = Event::all();

        $c1 = $customers[0] ?? null;
        $c2 = $customers[1] ?? $c1;
        $e1 = $events[0] ?? null;
        $e2 = $events[1] ?? $e1;

        $records = [
            // Income
            [
                'transaction_number' => 'TRX-2026-00812',
                'type' => 'income',
                'category' => 'pass_sales',
                'title' => 'Enterprise Pass Package (2,500 VIP Passes) — CRDB Bank',
                'amount' => 1250000.00,
                'currency' => 'TZS',
                'payment_method' => 'Bank Wire',
                'reference' => 'CRDB-TX-89210492',
                'user_id' => $c1?->id,
                'event_id' => $e1?->id,
                'status' => 'completed',
                'notes' => 'Corporate tier volume discount applied with custom artwork plaque styling.',
                'transaction_date' => now()->subDays(2),
            ],
            [
                'transaction_number' => 'TRX-2026-00811',
                'type' => 'income',
                'category' => 'pass_sales',
                'title' => 'Executive Wedding Pass Quota (800 Double Entry Passes)',
                'amount' => 480000.00,
                'currency' => 'TZS',
                'payment_method' => 'M-Pesa',
                'reference' => 'MPESA-QY782194',
                'user_id' => $c2?->id,
                'event_id' => $e2?->id,
                'status' => 'completed',
                'notes' => 'Instant M-Pesa automated checkout confirmation.',
                'transaction_date' => now()->subDays(4),
            ],
            [
                'transaction_number' => 'TRX-2026-00810',
                'type' => 'income',
                'category' => 'sms_credits',
                'title' => 'Bulk SMS Campaign Top-up (5,000 Direct SMS Units)',
                'amount' => 175000.00,
                'currency' => 'TZS',
                'payment_method' => 'Tigo Pesa',
                'reference' => 'TIGO-88219034',
                'user_id' => $c1?->id,
                'event_id' => $e1?->id,
                'status' => 'completed',
                'notes' => 'Tanzania carrier priority routing route topup.',
                'transaction_date' => now()->subDays(6),
            ],
            [
                'transaction_number' => 'TRX-2026-00809',
                'type' => 'income',
                'category' => 'design_service',
                'title' => 'Custom 4K Artwork Plaque & VIP Branding Design Fee',
                'amount' => 120000.00,
                'currency' => 'TZS',
                'payment_method' => 'M-Pesa',
                'reference' => 'MPESA-BW419082',
                'user_id' => $c2?->id,
                'event_id' => $e2?->id,
                'status' => 'completed',
                'notes' => 'Bespoke gold leaf typography and dual QR pass layout.',
                'transaction_date' => now()->subDays(8),
            ],
            [
                'transaction_number' => 'TRX-2026-00808',
                'type' => 'income',
                'category' => 'pass_sales',
                'title' => 'Standard Pass Quota (500 Passes) — Tech Summit 2026',
                'amount' => 300000.00,
                'currency' => 'TZS',
                'payment_method' => 'Airtel Money',
                'reference' => 'AIRTEL-7719203',
                'user_id' => $c1?->id,
                'event_id' => $e1?->id,
                'status' => 'completed',
                'notes' => 'Self-service online purchase.',
                'transaction_date' => now()->subDays(12),
            ],
            [
                'transaction_number' => 'TRX-2026-00807',
                'type' => 'income',
                'category' => 'subscription',
                'title' => 'Organizer Monthly Enterprise Subscription Plan',
                'amount' => 250000.00,
                'currency' => 'TZS',
                'payment_method' => 'Stripe/Card',
                'reference' => 'STRIPE-IN-491028',
                'user_id' => $c1?->id,
                'event_id' => null,
                'status' => 'completed',
                'notes' => 'Recurring monthly multi-event organizer plan.',
                'transaction_date' => now()->subDays(15),
            ],

            // Expenses
            [
                'transaction_number' => 'TRX-2026-00806',
                'type' => 'expense',
                'category' => 'carrier_sms_cogs',
                'title' => 'NextSMS Tanzania Direct Carrier Outbound SMS Topup',
                'amount' => 95000.00,
                'currency' => 'TZS',
                'payment_method' => 'Bank Wire',
                'reference' => 'NEXTSMS-INV-9921',
                'user_id' => null,
                'event_id' => null,
                'status' => 'completed',
                'notes' => 'Wholesale carrier rate for TZ telecom networks (Vodacom, Airtel, Tigo, Halotel).',
                'transaction_date' => now()->subDays(3),
            ],
            [
                'transaction_number' => 'TRX-2026-00805',
                'type' => 'expense',
                'category' => 'whatsapp_api_cogs',
                'title' => 'Meta WhatsApp Business Cloud API Usage (Utility & Marketing)',
                'amount' => 140000.00,
                'currency' => 'TZS',
                'payment_method' => 'Stripe/Card',
                'reference' => 'META-WA-89214',
                'user_id' => null,
                'event_id' => null,
                'status' => 'completed',
                'notes' => '1-Tap RSVP interactive template delivery conversation credits.',
                'transaction_date' => now()->subDays(5),
            ],
            [
                'transaction_number' => 'TRX-2026-00804',
                'type' => 'expense',
                'category' => 'server_infrastructure',
                'title' => 'High-Concurrency Redis, WebSocket & Cloud Production Server Hosting',
                'amount' => 180000.00,
                'currency' => 'TZS',
                'payment_method' => 'Stripe/Card',
                'reference' => 'AWS-DO-INV-3910',
                'user_id' => null,
                'event_id' => null,
                'status' => 'completed',
                'notes' => 'Dedicated gate scanner low-latency database & 4K asset CDN edge delivery.',
                'transaction_date' => now()->subDays(10),
            ],
            [
                'transaction_number' => 'TRX-2026-00803',
                'type' => 'expense',
                'category' => 'payment_gateway_fee',
                'title' => 'M-Pesa / TigoPesa / Card Gateway Processing Fees & Merchant MDR',
                'amount' => 45000.00,
                'currency' => 'TZS',
                'payment_method' => 'Internal Balance',
                'reference' => 'MDR-AUTO-DEDUCT',
                'user_id' => null,
                'event_id' => null,
                'status' => 'completed',
                'notes' => 'Aggregated merchant interchange settlement fees.',
                'transaction_date' => now()->subDays(11),
            ],
            [
                'transaction_number' => 'TRX-2026-00802',
                'type' => 'expense',
                'category' => 'operations',
                'title' => 'Gate Scanner Hardware Fleet Maintenance & Optical Lenses',
                'amount' => 85000.00,
                'currency' => 'TZS',
                'payment_method' => 'Cash / Invoice',
                'reference' => 'OPS-EQUIP-0912',
                'user_id' => null,
                'event_id' => null,
                'status' => 'completed',
                'notes' => 'Entrance verification hardware stand kits.',
                'transaction_date' => now()->subDays(14),
            ],
        ];

        foreach ($records as $r) {
            FinancialTransaction::create($r);
        }
    }
}
