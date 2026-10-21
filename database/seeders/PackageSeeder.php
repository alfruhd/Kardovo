<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            // Event Digital Card Packages
            [
                'name' => 'Basic',
                'package_type' => 'event_card',
                'price' => 1000,
                'sms_count' => null,
                'rate_per_sms' => null,
                'description' => '1,000 Tsh per card (1 WhatsApp + 1 SMS included per card)',
                'features' => json_encode([
                    '1 WhatsApp & 1 SMS per card',
                    'Digital QR cards',
                    'Dynamic RSVP & pass tracking',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Standard',
                'package_type' => 'event_card',
                'price' => 1500,
                'sms_count' => null,
                'rate_per_sms' => null,
                'description' => '1,500 Tsh per card (1 WhatsApp + 1 SMS included per card)',
                'features' => json_encode([
                    '1 WhatsApp & 1 SMS per card',
                    'All Basic features',
                    'Phone RSVP verification',
                    'Check-in scanner on event day',
                    'Thank you messages',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Premium',
                'package_type' => 'event_card',
                'price' => 2000,
                'sms_count' => null,
                'rate_per_sms' => null,
                'description' => '2,000 Tsh per card (1 WhatsApp + 1 SMS included per card)',
                'features' => json_encode([
                    '1 WhatsApp & 1 SMS per card',
                    'All Standard features',
                    'Follow-up calls to guests',
                    'Contribution reminder messages',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Executive',
                'package_type' => 'event_card',
                'price' => 2500,
                'sms_count' => null,
                'rate_per_sms' => null,
                'description' => '2,500 Tsh per card (1 WhatsApp + 1 SMS included per card)',
                'features' => json_encode([
                    '1 WhatsApp & 1 SMS per card',
                    'All Premium features',
                    'Custom Event Web Page',
                    'Minimum order: 200 cards',
                ]),
                'is_active' => true,
            ],

            // Bulk Normal SMS Packages
            [
                'name' => 'Starter',
                'package_type' => 'bulk_sms',
                'price' => 20000,
                'sms_count' => 500,
                'rate_per_sms' => 40.00,
                'description' => '500 Bulk SMS credits (40 TZS per SMS)',
                'features' => json_encode([
                    '500 Direct SMS Credits',
                    'Instant Delivery to all Tanzania networks',
                    'Custom sender ID (KARDOVO)',
                    'Delivery reports & broadcast logs',
                    'No digital pass needed',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Standard',
                'package_type' => 'bulk_sms',
                'price' => 35000,
                'sms_count' => 1000,
                'rate_per_sms' => 35.00,
                'description' => '1,000 Bulk SMS credits (35 TZS per SMS)',
                'features' => json_encode([
                    '1,000 Direct SMS Credits',
                    'Instant Delivery to all Tanzania networks',
                    'Custom sender ID (KARDOVO)',
                    'Delivery reports & broadcast logs',
                    'No digital pass needed',
                    'Most popular for event committees & churches',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Pro',
                'package_type' => 'bulk_sms',
                'price' => 80000,
                'sms_count' => 2500,
                'rate_per_sms' => 32.00,
                'description' => '2,500 Bulk SMS credits (32 TZS per SMS)',
                'features' => json_encode([
                    '2,500 Direct SMS Credits',
                    'High priority throughput queue',
                    'Custom sender ID (KARDOVO)',
                    'Delivery reports & broadcast logs',
                    'Ideal for school alerts & large associations',
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'package_type' => 'bulk_sms',
                'price' => 150000,
                'sms_count' => 5000,
                'rate_per_sms' => 30.00,
                'description' => '5,000 Bulk SMS credits (30 TZS per SMS)',
                'features' => json_encode([
                    '5,000 Direct SMS Credits (Lowest rate @ 30 TZS/SMS)',
                    'Dedicated carrier throughput',
                    'Custom sender ID (KARDOVO)',
                    'Full analytics & delivery audit',
                    'Best value for organizations & recurring campaigns',
                ]),
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(['name' => $pkg['name']], $pkg);
        }
    }
}
