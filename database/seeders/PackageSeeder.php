<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Basic',
                'price' => 1000,
                'description' => '1,000 Tsh per card',
                'features' => json_encode(['Digital QR cards', 'WhatsApp & SMS delivery']),
                'is_active' => true,
            ],
            [
                'name' => 'Standard',
                'price' => 1500,
                'description' => '1,500 Tsh per card',
                'features' => json_encode(['All Basic features', 'Phone RSVP verification', 'Check-in scanner on event day', 'Thank you messages']),
                'is_active' => true,
            ],
            [
                'name' => 'Premium',
                'price' => 2000,
                'description' => '2,000 Tsh per card',
                'features' => json_encode(['All Standard features', 'Follow-up calls to guests', 'Contribution reminder messages']),
                'is_active' => true,
            ],
            [
                'name' => 'Executive',
                'price' => 2500,
                'description' => '2,500 Tsh per card',
                'features' => json_encode(['All Premium features', 'Minimum order: 200 cards', 'Custom Event Web Page']),
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(['name' => $pkg['name']], $pkg);
        }
    }
}
