<?php

namespace Database\Seeders;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Message;
use App\Models\ScanLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin Account
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@kardovo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+255 700 000 001',
            'company' => 'Kardovo HQ',
        ]);

        // 2. Customer Organiser Account (Alfred)
        $customer = User::create([
            'name' => 'Alfred M.',
            'email' => 'alfred@kardovo.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '+255 754 123 456',
            'company' => 'Kardovo Events & Media Ltd',
        ]);

        // 3. Scanner Accounts
        $scanner1 = User::create([
            'name' => 'Baraka Gatekeeper',
            'email' => 'scanner1@kardovo.com',
            'password' => Hash::make('password'),
            'role' => 'scanner',
            'phone' => '+255 712 345 678',
            'gate_label' => 'Gate 1 — Main VIP Entrance',
            'customer_id' => $customer->id,
        ]);

        $scanner2 = User::create([
            'name' => 'Amina Gatekeeper',
            'email' => 'scanner2@kardovo.com',
            'password' => Hash::make('password'),
            'role' => 'scanner',
            'phone' => '+255 713 987 654',
            'gate_label' => 'Gate 2 — North Wing Entrance',
            'customer_id' => $customer->id,
        ]);

        // 3b. Sub-Administrator Account
        $subAdmin = User::create([
            'name' => 'Sarah Operations',
            'email' => 'subadmin@kardovo.com',
            'password' => Hash::make('password'),
            'role' => 'sub_admin',
            'phone' => '+255 788 112 233',
            'company' => 'Kardovo Operations',
        ]);
        $subAdmin->assignedOrganizers()->attach($customer->id);

        // 4. Default & Custom Imported Card Templates
        $tplSignature = CardTemplate::create([
            'user_id' => null, // Global Official Template
            'name' => 'Kardovo Signature Pass (Midnight Dark Blue)',
            'template_type' => 'gradient_card',
            'headline' => 'EXCLUSIVE INVITATION PASS',
            'brand_color_from' => '#0A1128',
            'brand_color_to' => '#008EE8',
            'font_family' => 'Inter',
            'show_qr' => true,
            'show_category_badge' => true,
            'show_unique_code' => true,
            'footer_text' => 'Secured & verified by KARDOVO',
            'elements_config' => [
                'guest_name' => [
                    'fontSize' => 34,
                    'color' => '#FFFFFF',
                    'fontFamily' => 'Georgia, serif',
                    'fontWeight' => '700',
                ],
                'category_badge' => [
                    'fontSize' => 11,
                    'color' => '#00A3FF',
                    'fontFamily' => 'sans-serif',
                    'fontWeight' => '800',
                ],
                'qr_code' => [
                    'size' => 140,
                    'darkColor' => '#111827',
                    'lightColor' => '#FFFFFF',
                ],
                'card_number' => [
                    'fontSize' => 28,
                    'color' => '#FFFFFF',
                    'fontFamily' => 'monospace',
                ],
            ],
        ]);

        $tplWeddingRomantic = CardTemplate::create([
            'user_id' => null, // Global Recommended Template
            'name' => 'Zamroth & Husna Romantic Wedding Pass',
            'template_type' => 'custom_art',
            'image_path' => '/template_assets/zamroth_husna_wedding.jpg',
            'headline' => 'WEDDING INVITATION',
            'brand_color_from' => '#1F2421',
            'brand_color_to' => '#D4AF37',
            'font_family' => 'Georgia, serif',
            'show_qr' => true,
            'show_category_badge' => true,
            'show_unique_code' => true,
            'footer_text' => 'We invite you to witness the beginning of our forever',
            'elements_config' => [
                'headline_text' => 'WEDDING INVITATION',
                'couple_names' => 'Zamroth & Husna',
                'date_month' => 'JANUARY',
                'date_day_name' => 'SUNDAY',
                'date_day_num' => '4',
                'date_time' => 'AT 11:00 AM',
                'date_year' => '2026',
                'invitation_quote' => 'WE INVITE YOU TO WITNESS THE BEGINNING OF OUR FOREVER, TOGETHER WITH OUR FAMILIES.',
                'venue_name' => 'ANGKORBAN',
                'venue_sub' => 'kongmeah, kampongcham',
                'venue_date' => '04.01.2026',
                'save_the_date' => 'SAVE THE DATE',
                'couple_names_size' => 40,
                'date_size' => 10.5,
                'quote_size' => 8.5,
                'couple_names_y' => 13.5,
                'date_y' => 51.5,
                'category_badge' => [
                    'x' => 50,
                    'y' => 7.8,
                    'fontSize' => 11,
                    'color' => '#FFFFFF',
                    'fontFamily' => 'sans-serif',
                    'fontWeight' => '700',
                    'letterSpacing' => '0.22em',
                ],
                'guest_name' => [
                    'x' => 50,
                    'y' => 71.5,
                    'fontSize' => 20,
                    'color' => '#FFFFFF',
                    'fontFamily' => 'Georgia, serif',
                    'fontWeight' => '800',
                    'textTransform' => 'uppercase',
                    'letterSpacing' => '0.12em',
                ],
                'qr_code' => [
                    'x' => 50,
                    'y' => 84.5,
                    'size' => 88,
                    'darkColor' => '#181512',
                    'lightColor' => '#FFFFFF',
                ],
                'card_number' => [
                    'x' => 50,
                    'y' => 95.8,
                    'fontSize' => 10,
                    'color' => '#FFFFFF',
                    'fontFamily' => 'monospace',
                ],
            ],
        ]);

        $tplEngagement = CardTemplate::create([
            'user_id' => null, // Global Recommended Template
            'name' => 'Adel & Laila Elegant Engagement Pass',
            'template_type' => 'custom_art',
            'image_path' => '/template_assets/adel_laila_engagement.jpg',
            'headline' => 'Engagement Invitation',
            'brand_color_from' => '#7A1E28',
            'brand_color_to' => '#8B2635',
            'font_family' => 'Playfair Display, Georgia, serif',
            'show_qr' => true,
            'show_category_badge' => true,
            'show_unique_code' => true,
            'footer_text' => 'We invite your pleasure to come to our Engagement Party',
            'elements_config' => [
                'theme' => 'engagement_burgundy',
                'headline_text' => 'Engagement Invitation',
                'subtitle_text' => 'We invite your pleasure to come to our Engagement Party of',
                'couple_names' => 'Adel & Laila',
                'couple_names_size' => 44,
                'couple_names_y' => 22.5,
                'date_month' => 'APRIL',
                'date_day_name' => 'FRIDAY',
                'date_day_num' => '26',
                'date_time' => '8:30 PM',
                'date_year' => '2026',
                'date_size' => 11,
                'date_y' => 38.5,
                'invitation_quote' => 'CELEBRATING LOVE & PROMISE',
                'venue_name' => 'DAR ES SALAAM SERENA HOTEL',
                'venue_sub' => 'tanzania',
                'venue_date' => '26.04.2026',
                'save_the_date' => 'SAVE THE DATE',
                'category_badge' => [
                    'x' => 50,
                    'y' => 5.2,
                    'fontSize' => 12,
                    'color' => '#7A1E28',
                    'fontFamily' => 'cursive, Georgia, serif',
                    'fontWeight' => '700',
                ],
                'guest_name' => [
                    'x' => 50,
                    'y' => 71.5,
                    'fontSize' => 18,
                    'color' => '#FFFFFF',
                    'fontFamily' => 'Georgia, serif',
                    'fontWeight' => '800',
                    'plaqueWidth' => 84,
                ],
                'qr_code' => [
                    'x' => 50,
                    'y' => 85.5,
                    'size' => 70,
                    'darkColor' => '#6B1D2F',
                    'lightColor' => '#FFFFFF',
                ],
                'card_number' => [
                    'x' => 50,
                    'y' => 96,
                    'fontSize' => 9.5,
                    'color' => '#7A1E28',
                    'fontFamily' => 'monospace',
                ],
            ],
        ]);

        // 5. Events
        $eventWedding = Event::create([
            'user_id' => $customer->id,
            'card_template_id' => $tplSignature->id,
            'title' => 'Neema & Baraka — Wedding Reception',
            'event_type' => 'Wedding Reception',
            'event_date' => '2026-09-14',
            'event_time' => '4:00 PM — Reception & Dinner',
            'venue' => 'Kunduchi Beach Gardens, Dar es Salaam',
            'city' => 'Dar es Salaam',
            'description' => 'A joyful celebration of love, family, and shared beginnings.',
            'status' => 'active',
        ]);

        $eventAlumni = Event::create([
            'user_id' => $customer->id,
            'card_template_id' => $tplSignature->id,
            'title' => 'CRDB Bank Annual Executive Summit 2026',
            'event_type' => 'Corporate Gala',
            'event_date' => '2026-10-05',
            'event_time' => '9:00 AM — Registration & Keynote',
            'venue' => 'Julius Nyerere Convention Centre, Dar es Salaam',
            'city' => 'Dar es Salaam',
            'description' => 'Annual grand gathering of CRDB executives and key partners.',
            'status' => 'active',
        ]);

        $eventSummit = Event::create([
            'user_id' => $customer->id,
            'card_template_id' => $tplSignature->id,
            'title' => 'Fintech East Africa Summit 2026',
            'event_type' => 'Corporate Conference',
            'event_date' => '2026-11-20',
            'event_time' => '8:30 AM — Registration & Plenary',
            'venue' => 'Dar es Salaam Serena Hotel',
            'city' => 'Dar es Salaam',
            'description' => 'Leading fintech summit in East Africa bringing together banks, telecom operators and innovators.',
            'status' => 'active',
        ]);

        // 6. Guests for Wedding (Neema & Baraka)
        $sampleGuests = [
            [
                'name' => 'Neema Mbwana',
                'phone' => '+255 754 889 001',
                'email' => 'neema.m@example.com',
                'category' => 'Double Entry',
                'max_entries' => 2,
                'entries_used' => 1,
                'card_number' => 'KDV-2026-004821',
                'unique_code' => '29841872',
                'qr_token' => 'kdv_neema_mbwana_29841872',
                'delivery_status' => 'delivered',
                'rsvp_status' => 'attending',
                'rsvp_at' => now()->subHours(12),
            ],
            [
                'name' => 'Baraka Simba',
                'phone' => '+255 765 112 233',
                'email' => 'baraka.s@example.com',
                'category' => 'Single Entry',
                'max_entries' => 1,
                'entries_used' => 0,
                'card_number' => 'KDV-2026-004822',
                'unique_code' => '83719204',
                'qr_token' => 'kdv_baraka_simba_83719204',
                'delivery_status' => 'delivered',
                'rsvp_status' => 'attending',
                'rsvp_at' => now()->subHours(10),
            ],
            [
                'name' => 'Halima Juma',
                'phone' => '+255 788 334 455',
                'email' => 'halima.juma@example.com',
                'category' => 'Double Entry',
                'max_entries' => 2,
                'entries_used' => 0,
                'card_number' => 'KDV-2026-004823',
                'unique_code' => '49201938',
                'qr_token' => 'kdv_halima_juma_49201938',
                'delivery_status' => 'delivered',
                'rsvp_status' => 'attending',
                'rsvp_at' => now()->subHours(6),
            ],
            [
                'name' => 'Elias Kwesi',
                'phone' => '+255 713 556 677',
                'email' => 'elias.kwesi@example.com',
                'category' => 'Single Entry',
                'max_entries' => 1,
                'entries_used' => 1,
                'card_number' => 'KDV-2026-004824',
                'unique_code' => '10293847',
                'qr_token' => 'kdv_elias_kwesi_10293847',
                'delivery_status' => 'delivered',
                'rsvp_status' => 'declined',
                'rsvp_at' => now()->subHours(4),
            ],
            [
                'name' => 'Grace Mushi',
                'phone' => '+255 744 778 899',
                'email' => 'grace.mushi@example.com',
                'category' => 'Double Entry',
                'max_entries' => 2,
                'entries_used' => 0,
                'card_number' => 'KDV-2026-004825',
                'unique_code' => '74839201',
                'qr_token' => 'kdv_grace_mushi_74839201',
                'delivery_status' => 'sent',
                'rsvp_status' => 'pending',
                'rsvp_at' => null,
            ],
            [
                'name' => 'Hon. Joseph Mrope',
                'phone' => '+255 754 000 111',
                'email' => 'jmrope@parliament.go.tz',
                'category' => 'VIP Entry',
                'max_entries' => 3,
                'entries_used' => 0,
                'card_number' => 'KDV-2026-004826',
                'unique_code' => '99887766',
                'qr_token' => 'kdv_joseph_mrope_99887766',
                'delivery_status' => 'delivered',
                'rsvp_status' => 'attending',
                'rsvp_at' => now()->subHours(20),
            ],
            [
                'name' => 'Dr. Faraja Kilonzo',
                'phone' => '+255 715 443 221',
                'email' => 'dr.kilonzo@hospital.org',
                'category' => 'Double Entry',
                'max_entries' => 2,
                'entries_used' => 2,
                'card_number' => 'KDV-2026-004827',
                'unique_code' => '55443322',
                'qr_token' => 'kdv_faraja_kilonzo_55443322',
                'delivery_status' => 'delivered',
                'rsvp_status' => 'attending',
                'rsvp_at' => now()->subDays(1),
            ],
            [
                'name' => 'Sarah & David Makwaia',
                'phone' => '+255 762 998 877',
                'email' => 'smakwaia@gmail.com',
                'category' => 'Double Entry',
                'max_entries' => 2,
                'entries_used' => 0,
                'card_number' => 'KDV-2026-004828',
                'unique_code' => '66778899',
                'qr_token' => 'kdv_makwaia_66778899',
                'delivery_status' => 'failed',
                'rsvp_status' => 'pending',
                'rsvp_at' => null,
            ],
        ];

        foreach ($sampleGuests as $gData) {
            $guest = $eventWedding->guests()->create($gData);

            // Create initial WhatsApp message log
            Message::create([
                'event_id' => $eventWedding->id,
                'guest_id' => $guest->id,
                'channel' => 'whatsapp',
                'recipient_phone' => $guest->phone,
                'message_body' => "Habari {$guest->name}! You're invited to {$eventWedding->title} on {$eventWedding->event_date->format('d F Y')}. View your invitation card and confirm your attendance.",
                'status' => $guest->delivery_status,
                'sent_at' => now()->subHours(24),
                'delivered_at' => $guest->delivery_status === 'delivered' ? now()->subHours(23) : null,
                'read_at' => $guest->rsvp_status !== 'pending' ? now()->subHours(15) : null,
            ]);

            // Add sample scan log if entries used
            if ($guest->entries_used > 0) {
                ScanLog::create([
                    'event_id' => $eventWedding->id,
                    'guest_id' => $guest->id,
                    'scanner_id' => $scanner1->id,
                    'scanner_name' => $scanner1->name,
                    'gate_label' => $scanner1->gate_label,
                    'scanned_at' => now()->subMinutes(rand(10, 180)),
                    'status' => 'granted',
                    'rejection_reason' => null,
                    'entries_used_at_scan' => $guest->entries_used,
                ]);
            }
        }

        // Add additional guests for IFM Alumni Night
        for ($i = 1; $i <= 15; $i++) {
            $eventAlumni->guests()->create([
                'name' => "Alumni Guest {$i} (".['Eng.', 'Adv.', 'Prof.', 'CPA', 'Mr.', 'Ms.'][array_rand(['Eng.', 'Adv.', 'Prof.', 'CPA', 'Mr.', 'Ms.'])].' '.Str::random(5).')',
                'phone' => '+255 7'.rand(10, 89).' '.rand(100, 999).' '.rand(100, 999),
                'category' => $i % 3 === 0 ? 'Double Entry' : 'Single Entry',
                'max_entries' => $i % 3 === 0 ? 2 : 1,
                'entries_used' => $i % 4 === 0 ? 1 : 0,
                'delivery_status' => ['delivered', 'sent', 'delivered', 'delivered'][$i % 4],
                'rsvp_status' => ['attending', 'pending', 'attending', 'declined'][$i % 4],
                'rsvp_at' => $i % 2 === 0 ? now()->subHours($i * 2) : null,
            ]);
        }

        // 7. System Gateway Settings
        SystemSetting::set('whatsapp_gateway', [
            'provider' => 'Meta WhatsApp Cloud API',
            'phone_number_id' => '108492019482910',
            'waba_id' => '94820194820184',
            'api_version' => 'v20.0',
            'status' => 'Connected (Operational)',
            'auto_reply_confirmation' => true,
            'default_template_name' => 'kardovo_invitation_v1',
        ]);

        SystemSetting::set('sms_gateway', [
            'provider' => 'NextSMS / Africa\'s Talking',
            'sender_id' => 'KARDOVO',
            'status' => 'Active',
            'balance' => '12,450 TZS',
        ]);

        SystemSetting::set('platform_info', [
            'app_version' => '1.0.0',
            'organization' => 'Kardovo Access Systems',
            'default_city' => 'Dar es Salaam, Tanzania',
        ]);
    }
}
