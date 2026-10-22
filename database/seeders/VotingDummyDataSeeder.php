<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use App\Models\VoteOrder;
use App\Models\VotingCandidate;
use App\Models\VotingCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VotingDummyDataSeeder extends Seeder
{
    /**
     * Seed comprehensive awards & voting dummy data for testing.
     */
    public function run(): void
    {
        // Target organizer user (Alfred M. - ID 2, or first customer/admin)
        $organizer = User::where('email', 'alfredido6@gmail.com')->first()
            ?? User::where('role', 'customer')->first()
            ?? User::first();

        if (! $organizer) {
            return;
        }

        // ═════════════════════════════════════════════════════════════════════
        // COMPETITION 1: Tanzania Music Awards (TMA) 2026
        // ═════════════════════════════════════════════════════════════════════
        $comp1 = Event::updateOrCreate(
            ['title' => 'Tanzania Music Awards (TMA) 2026', 'user_id' => $organizer->id],
            [
                'event_type' => 'Music & Entertainment Awards',
                'event_date' => now()->addDays(28)->toDateString(),
                'event_time' => '19:00',
                'venue' => 'Mlimani City Conference Centre',
                'city' => 'Dar es Salaam',
                'description' => 'The prestigious annual national celebration honoring Tanzania\'s finest recording artists, producers, and musical talents.',
                'status' => 'published',
                'is_public' => true,
                'voting_enabled' => true,
                'voting_visible_tallies' => true,
                'voting_start_at' => now()->subDays(10),
                'voting_end_at' => now()->addDays(28),
                'voting_instructions' => 'Vote for your favorite artist! Multiple paid votes can be cast via M-Pesa, Tigo Pesa, Airtel Money, HaloPesa, or Visa/Mastercard.',
                'voting_banner' => '/template_assets/custom_tpl_1792153398_6ad21736ce5a3.png',
            ]
        );

        $cat1_1 = VotingCategory::updateOrCreate(
            ['event_id' => $comp1->id, 'name' => 'Song of the Year'],
            [
                'description' => 'Most impactful hit track dominating airwaves and streaming across East Africa.',
                'is_paid' => true,
                'pricing_tiers' => [
                    ['quantity' => 1, 'amount' => 500],
                    ['quantity' => 5, 'amount' => 2000],
                    ['quantity' => 15, 'amount' => 5000],
                    ['quantity' => 50, 'amount' => 15000],
                ],
                'max_selections' => 1,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand1_1_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_1->id, 'candidate_number' => '101'],
            [
                'name' => 'Diamond Platnumz — Komasava',
                'bio' => 'Global Afrobeats-Bongo Flava crossover sensation topping continental charts.',
                'total_votes' => 1640,
                'revenue_collected' => 820000.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand1_1_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_1->id, 'candidate_number' => '102'],
            [
                'name' => 'Ali Kiba — Mahaba',
                'bio' => 'Melodic king of authentic Bongo Flava bringing soulful Swahili poetry.',
                'total_votes' => 1320,
                'revenue_collected' => 660000.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand1_1_3 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_1->id, 'candidate_number' => '103'],
            [
                'name' => 'Nandy — Dah!',
                'bio' => 'The African Princess with irresistible rhythm and vocal mastery.',
                'total_votes' => 1150,
                'revenue_collected' => 575000.00,
                'sort_order' => 3,
                'status' => 'active',
            ]
        );

        $cand1_1_4 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_1->id, 'candidate_number' => '104'],
            [
                'name' => 'Marioo — Hakuna Matata',
                'bio' => 'Hitmaker delivering energetic contemporary street anthems.',
                'total_votes' => 890,
                'revenue_collected' => 445000.00,
                'sort_order' => 4,
                'status' => 'active',
            ]
        );

        $cat1_2 = VotingCategory::updateOrCreate(
            ['event_id' => $comp1->id, 'name' => 'Best Female Artist'],
            [
                'description' => 'Top performing female vocalist showcasing exceptional artistry and stage presence.',
                'is_paid' => true,
                'pricing_tiers' => [
                    ['quantity' => 1, 'amount' => 500],
                    ['quantity' => 5, 'amount' => 2000],
                    ['quantity' => 15, 'amount' => 5000],
                ],
                'max_selections' => 1,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand1_2_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_2->id, 'candidate_number' => '201'],
            [
                'name' => 'Zuchu',
                'bio' => 'WCB first lady with record-breaking streaming numbers and iconic live shows.',
                'total_votes' => 960,
                'revenue_collected' => 480000.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand1_2_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_2->id, 'candidate_number' => '202'],
            [
                'name' => 'Nandy',
                'bio' => 'Multi-award winning vocalist and dynamic live festival performer.',
                'total_votes' => 880,
                'revenue_collected' => 440000.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand1_2_3 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_2->id, 'candidate_number' => '203'],
            [
                'name' => 'Rosa Ree',
                'bio' => 'The goddess of rap delivering fearless lyrical power.',
                'total_votes' => 620,
                'revenue_collected' => 310000.00,
                'sort_order' => 3,
                'status' => 'active',
            ]
        );

        $cat1_3 = VotingCategory::updateOrCreate(
            ['event_id' => $comp1->id, 'name' => 'Breakthrough Star of the Year'],
            [
                'description' => 'Emerging talent who captured public attention in the last 12 months (Free Community Vote).',
                'is_paid' => false,
                'pricing_tiers' => null,
                'max_selections' => 1,
                'sort_order' => 3,
                'status' => 'active',
            ]
        );

        $cand1_3_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_3->id, 'candidate_number' => '301'],
            [
                'name' => 'Jay Melody',
                'bio' => 'Sensational songwriter making waves across Eastern and Central Africa.',
                'total_votes' => 750,
                'revenue_collected' => 0.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand1_3_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp1->id, 'voting_category_id' => $cat1_3->id, 'candidate_number' => '302'],
            [
                'name' => 'Lody Music',
                'bio' => 'Fresh vibrant melodies turning viral on TikTok and YouTube.',
                'total_votes' => 590,
                'revenue_collected' => 0.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        // Seed Sample Orders for TMA 2026
        $this->seedSampleVoteOrder($comp1, $cat1_1, $cand1_1_1, 50, 15000.00, 'AzamPay (M-Pesa)', '0754112233', 'Hamisi Juma', 'M-Pesa Live Bundle');
        $this->seedSampleVoteOrder($comp1, $cat1_1, $cand1_1_2, 15, 5000.00, 'AzamPay (Tigo)', '0713889900', 'Aisha Bakari', 'Tigo Pesa Online');
        $this->seedSampleVoteOrder($comp1, $cat1_1, $cand1_1_3, 15, 5000.00, 'Card', '0784556677', 'Faraja Mwangi', 'Visa Card Checkout');
        $this->seedSampleVoteOrder($comp1, $cat1_2, $cand1_2_1, 50, 15000.00, 'Cash', '0767112244', 'Saidi Mwinyi', 'Box Office Cash Collection');
        $this->seedSampleVoteOrder($comp1, $cat1_2, $cand1_2_2, 15, 5000.00, 'AzamPay (Airtel)', '0789223344', 'Beatrice Komba', 'Airtel Money Push');

        // ═════════════════════════════════════════════════════════════════════
        // COMPETITION 2: Miss Grand Tanzania Gala 2026
        // ═════════════════════════════════════════════════════════════════════
        $comp2 = Event::updateOrCreate(
            ['title' => 'Miss Grand Tanzania Gala 2026', 'user_id' => $organizer->id],
            [
                'event_type' => 'Beauty Pageant',
                'event_date' => now()->addDays(15)->toDateString(),
                'event_time' => '20:00',
                'venue' => 'The Superdome Masaki',
                'city' => 'Dar es Salaam',
                'description' => 'Premier national beauty pageant celebrating elegance, leadership, cultural heritage, and community empowerment.',
                'status' => 'published',
                'is_public' => true,
                'voting_enabled' => true,
                'voting_visible_tallies' => true,
                'voting_start_at' => now()->subDays(5),
                'voting_end_at' => now()->addDays(15),
                'voting_instructions' => 'Every vote propels your delegate into the Grand Finale Top 5! Vote online using Mobile Money or Card.',
                'voting_banner' => '/template_assets/custom_tpl_1792657712_6ad9c93040e5d.png',
            ]
        );

        $cat2_1 = VotingCategory::updateOrCreate(
            ['event_id' => $comp2->id, 'name' => 'Miss People\'s Choice & Popularity'],
            [
                'description' => 'The public favorite delegate fast-tracked straight to the coronation final stage.',
                'is_paid' => true,
                'pricing_tiers' => [
                    ['quantity' => 1, 'amount' => 1000],
                    ['quantity' => 5, 'amount' => 4500],
                    ['quantity' => 10, 'amount' => 8500],
                    ['quantity' => 25, 'amount' => 20000],
                ],
                'max_selections' => 1,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand2_1_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp2->id, 'voting_category_id' => $cat2_1->id, 'candidate_number' => '01'],
            [
                'name' => 'Fatma Ally — Dar es Salaam',
                'bio' => 'Environmental activist, runway model, and youth climate ambassador.',
                'total_votes' => 720,
                'revenue_collected' => 720000.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand2_1_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp2->id, 'voting_category_id' => $cat2_1->id, 'candidate_number' => '02'],
            [
                'name' => 'Doreen Peter — Arusha',
                'bio' => 'Tourism entrepreneur advocating for northern wildlife conservation.',
                'total_votes' => 650,
                'revenue_collected' => 650000.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand2_1_3 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp2->id, 'voting_category_id' => $cat2_1->id, 'candidate_number' => '03'],
            [
                'name' => 'Subira Mussa — Zanzibar',
                'bio' => 'Heritage advocate preserving Swahili coastal arts and fashion.',
                'total_votes' => 540,
                'revenue_collected' => 540000.00,
                'sort_order' => 3,
                'status' => 'active',
            ]
        );

        $cand2_1_4 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp2->id, 'voting_category_id' => $cat2_1->id, 'candidate_number' => '04'],
            [
                'name' => 'Grace Mwita — Mwanza',
                'bio' => 'Public health graduate championing maternal wellness around Lake Victoria.',
                'total_votes' => 430,
                'revenue_collected' => 430000.00,
                'sort_order' => 4,
                'status' => 'active',
            ]
        );

        $cat2_2 = VotingCategory::updateOrCreate(
            ['event_id' => $comp2->id, 'name' => 'Best National Cultural Costume'],
            [
                'description' => 'Vibrant traditional attire exhibiting rich authentic Tanzanian artistry.',
                'is_paid' => true,
                'pricing_tiers' => [
                    ['quantity' => 1, 'amount' => 1000],
                    ['quantity' => 5, 'amount' => 4500],
                ],
                'max_selections' => 1,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand2_2_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp2->id, 'voting_category_id' => $cat2_2->id, 'candidate_number' => '05'],
            [
                'name' => 'Amina Said — Kilimanjaro',
                'bio' => 'Regal Chagga ceremonial beaded attire handcrafted by local artisans.',
                'total_votes' => 490,
                'revenue_collected' => 490000.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand2_2_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp2->id, 'voting_category_id' => $cat2_2->id, 'candidate_number' => '06'],
            [
                'name' => 'Jackline Joseph — Mbeya',
                'bio' => 'Southern Highlands textile homage with woven natural fibers.',
                'total_votes' => 380,
                'revenue_collected' => 380000.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        // Seed Sample Orders for Miss Grand
        $this->seedSampleVoteOrder($comp2, $cat2_1, $cand2_1_1, 25, 20000.00, 'Card', '0755998877', 'Kassim Rashid', 'Mastercard Online');
        $this->seedSampleVoteOrder($comp2, $cat2_1, $cand2_1_2, 10, 8500.00, 'AzamPay (M-Pesa)', '0754332211', 'Neema John', 'M-Pesa VIP Vote');
        $this->seedSampleVoteOrder($comp2, $cat2_2, $cand2_2_1, 25, 20000.00, 'Cash', '0714778899', 'Rashid Hassan', 'Reception Cash Entry');

        // ═════════════════════════════════════════════════════════════════════
        // COMPETITION 3: East Africa Tech & Fintech Innovation Awards 2026
        // ═════════════════════════════════════════════════════════════════════
        $comp3 = Event::updateOrCreate(
            ['title' => 'East Africa Tech & Fintech Innovation Awards 2026', 'user_id' => $organizer->id],
            [
                'event_type' => 'Corporate Gala',
                'event_date' => now()->addDays(42)->toDateString(),
                'event_time' => '18:30',
                'venue' => 'Hyatt Regency The Kilimanjaro',
                'city' => 'Dar es Salaam',
                'description' => 'Honoring ground-breaking startups, enterprise fintech solutions, and innovators driving digital transformation in Africa.',
                'status' => 'published',
                'is_public' => true,
                'voting_enabled' => true,
                'voting_visible_tallies' => true,
                'voting_start_at' => now()->subDays(2),
                'voting_end_at' => now()->addDays(42),
                'voting_instructions' => 'Cast your verified vote for the digital pioneers transforming finance and logistics across East Africa.',
                'voting_banner' => '/template_assets/custom_tpl_1790586280_6aba2da8c9940.png',
            ]
        );

        $cat3_1 = VotingCategory::updateOrCreate(
            ['event_id' => $comp3->id, 'name' => 'Fintech Innovator of the Year'],
            [
                'description' => 'Fastest growing cross-border payment or digital financial product.',
                'is_paid' => true,
                'pricing_tiers' => [
                    ['quantity' => 1, 'amount' => 500],
                    ['quantity' => 10, 'amount' => 4500],
                    ['quantity' => 50, 'amount' => 20000],
                ],
                'max_selections' => 1,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand3_1_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp3->id, 'voting_category_id' => $cat3_1->id, 'candidate_number' => '11'],
            [
                'name' => 'NALA Money',
                'bio' => 'Next-gen payment app powering reliable diaspora remittances across Africa.',
                'total_votes' => 850,
                'revenue_collected' => 425000.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand3_1_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp3->id, 'voting_category_id' => $cat3_1->id, 'candidate_number' => '12'],
            [
                'name' => 'Ramani.io',
                'bio' => 'Supply chain financing platform powering FMCG micro-distributors.',
                'total_votes' => 710,
                'revenue_collected' => 355000.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand3_1_3 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp3->id, 'voting_category_id' => $cat3_1->id, 'candidate_number' => '13'],
            [
                'name' => 'Lipa Later',
                'bio' => 'Consumer credit and buy-now-pay-later enabling financial inclusion.',
                'total_votes' => 520,
                'revenue_collected' => 260000.00,
                'sort_order' => 3,
                'status' => 'active',
            ]
        );

        $cat3_2 = VotingCategory::updateOrCreate(
            ['event_id' => $comp3->id, 'name' => 'Best Mobile Banking Experience'],
            [
                'description' => 'Bank application with highest user satisfaction, speed, and seamless customer journey (Free Public Poll).',
                'is_paid' => false,
                'pricing_tiers' => null,
                'max_selections' => 1,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $cand3_2_1 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp3->id, 'voting_category_id' => $cat3_2->id, 'candidate_number' => '21'],
            [
                'name' => 'CRDB SimBanking',
                'bio' => 'Leading mobile banking service with comprehensive digital merchant integrations.',
                'total_votes' => 640,
                'revenue_collected' => 0.00,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $cand3_2_2 = VotingCandidate::updateOrCreate(
            ['event_id' => $comp3->id, 'voting_category_id' => $cat3_2->id, 'candidate_number' => '22'],
            [
                'name' => 'NMB Mkononi',
                'bio' => 'Intuitive smartphone application with nationwide agency branch connectivity.',
                'total_votes' => 590,
                'revenue_collected' => 0.00,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        // Seed Sample Orders for Tech Awards
        $this->seedSampleVoteOrder($comp3, $cat3_1, $cand3_1_1, 50, 20000.00, 'AzamPay (Tigo)', '0715334455', 'Innocent Mushi', 'Tech Community Vote');
        $this->seedSampleVoteOrder($comp3, $cat3_1, $cand3_1_2, 10, 4500.00, 'Card', '0784998877', 'Gloria Makala', 'Online Card Vote');
    }

    /**
     * Helper to seed realistic vote orders and synchronize ledger & accounting pipeline.
     */
    private function seedSampleVoteOrder(
        Event $event,
        VotingCategory $category,
        VotingCandidate $candidate,
        int $quantity,
        float $amount,
        string $provider,
        string $phone,
        string $voterName,
        string $notes
    ): void {
        $orderNumber = 'VO-DEMO-'.strtoupper(Str::random(6));
        $platformFeePercent = 6.00;
        $platformFee = round($amount * 0.06, 2);
        $organizerNetAmount = round($amount - $platformFee, 2);

        $voteOrder = VoteOrder::updateOrCreate(
            ['order_number' => $orderNumber],
            [
                'event_id' => $event->id,
                'voting_category_id' => $category->id,
                'voting_candidate_id' => $candidate->id,
                'voter_phone' => $phone,
                'voter_name' => $voterName,
                'quantity' => $quantity,
                'amount' => $amount,
                'platform_fee' => $platformFee,
                'platform_fee_percent' => $platformFeePercent,
                'organizer_net_amount' => $organizerNetAmount,
                'currency' => 'TZS',
                'provider' => $provider,
                'payment_reference' => 'DEMO-TX-'.rand(100000, 999999),
                'status' => 'completed',
                'paid_at' => now()->subHours(rand(1, 48)),
                'is_free' => false,
                'metadata' => ['notes' => $notes],
            ]
        );

        $voteOrder->recordFinancialTransaction();
    }
}
