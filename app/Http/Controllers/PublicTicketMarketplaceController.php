<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketTier;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicTicketMarketplaceController extends Controller
{
    /**
     * Display the dedicated "How It Works" guide for event organizers.
     */
    public function howItWorks(Request $request)
    {
        return Inertia::render('Public/HowItWorks', [
            'status' => session('status'),
        ]);
    }

    /**
     * Display the public ticketing marketplace / discovery portal.
     */
    public function index(Request $request)
    {
        // Auto-seed sample occasions if no ticketed events exist yet
        $this->ensureSampleMarketplaceOccasionsExist();

        $query = Event::where('ticketing_enabled', true)
            ->where('is_public', true)
            ->with(['ticketTiers' => function ($q) {
                $q->whereIn('status', ['active', 'sold_out'])->orderBy('price', 'asc');
            }]);

        // Category filter
        $category = strtolower($request->input('category', 'all'));
        if ($category && $category !== 'all') {
            if ($category === 'events') {
                $query->whereIn('occasion_type', ['event', 'concert', 'festival']);
            } elseif ($category === 'hotels') {
                $query->where('occasion_type', 'hotel');
            } elseif ($category === 'nightlife') {
                $query->where('occasion_type', 'nightlife');
            } elseif ($category === 'sports') {
                $query->where('occasion_type', 'sports');
            } elseif ($category === 'fashion') {
                $query->where('occasion_type', 'fashion');
            } elseif (in_array($category, ['corporate', 'conference'])) {
                $query->whereIn('occasion_type', ['corporate', 'conference']);
            } else {
                $query->where('occasion_type', $category);
            }
        }

        // Search query
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('venue', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%");
            });
        }

        $occasions = $query->latest('event_date')
            ->get()
            ->map(function ($ev) {
                $activeTiers = $ev->ticketTiers;
                $minPrice = $activeTiers->min('price') ?? 0;
                $isSoldOut = $activeTiers->isEmpty() || $activeTiers->every(fn ($t) => $t->is_sold_out || $t->remaining_count <= 0);

                return [
                    'id' => $ev->id,
                    'title' => $ev->title,
                    'occasion_type' => $ev->occasion_type ?: 'event',
                    'event_type' => $ev->event_type,
                    'cover_photo' => $ev->cover_photo,
                    'event_date' => $ev->event_date?->format('M d, Y'),
                    'event_date_raw' => $ev->event_date?->toDateString(),
                    'event_time' => $ev->event_time,
                    'venue' => $ev->venue,
                    'city' => $ev->city,
                    'description' => $ev->description,
                    'ticket_currency' => $ev->ticket_currency ?? 'TZS',
                    'min_price' => (float) $minPrice,
                    'tiers_count' => $activeTiers->count(),
                    'is_sold_out' => $isSoldOut,
                ];
            });

        // Category counts
        $allPublicOccasions = Event::where('ticketing_enabled', true)->where('is_public', true)->get();
        $categoryCounts = [
            'all' => $allPublicOccasions->count(),
            'events' => $allPublicOccasions->whereIn('occasion_type', ['event', 'concert', 'festival'])->count(),
            'hotels' => $allPublicOccasions->where('occasion_type', 'hotel')->count(),
            'nightlife' => $allPublicOccasions->where('occasion_type', 'nightlife')->count(),
            'sports' => $allPublicOccasions->where('occasion_type', 'sports')->count(),
            'fashion' => $allPublicOccasions->where('occasion_type', 'fashion')->count(),
            'corporate' => $allPublicOccasions->whereIn('occasion_type', ['corporate', 'conference'])->count(),
        ];

        // Dedicated featured occasions for the top carousel (always fixed top 5 latest events, unaffected by search or category filters)
        $featuredOccasions = Event::where('ticketing_enabled', true)
            ->where('is_public', true)
            ->latest('event_date')
            ->limit(5)
            ->get()
            ->map(function ($ev) {
                return [
                    'id' => $ev->id,
                    'title' => $ev->title,
                    'cover_photo' => $ev->cover_photo,
                    'event_date' => $ev->event_date?->format('D, M jS, gA') ?: $ev->event_date?->format('M d, Y'),
                ];
            });

        return Inertia::render('Public/TicketMarketplace', [
            'occasions' => $occasions,
            'featuredOccasions' => $featuredOccasions,
            'categoryCounts' => $categoryCounts,
            'currentCategory' => $category,
            'search' => $search ?? '',
        ]);
    }

    /**
     * Ensure rich demo occasions exist matching the user's reference (Tiketika/Otapp style).
     */
    protected function ensureSampleMarketplaceOccasionsExist(): void
    {
        if (Event::where('ticketing_enabled', true)->whereNotNull('cover_photo')->exists()) {
            return;
        }

        $user = User::first() ?? User::factory()->create();

        // 1. Nandy Festival 2026
        $nandy = Event::create([
            'user_id' => $user->id,
            'title' => 'NANDY FESTIVAL 2026',
            'event_type' => 'Music Festival',
            'occasion_type' => 'concert',
            'event_date' => now()->addDays(7)->toDateString(),
            'event_time' => '6:00 PM Till Dawn',
            'venue' => 'Posta Grounds, Kijitonyama',
            'city' => 'Dar es Salaam',
            'cover_photo' => '/images/categories/events.jpg',
            'description' => 'Experience the biggest music festival featuring Nandy and international guest superstars live on stage.',
            'ticketing_enabled' => true,
            'is_public' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Gate opens at 4:00 PM. Present your digital QR pass or printed voucher at VIP Gate A.',
        ]);

        TicketTier::create([
            'event_id' => $nandy->id,
            'name' => 'Regular Entry',
            'price' => 20000,
            'capacity' => 500,
            'sold_count' => 84,
            'color' => '#3b82f6',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        TicketTier::create([
            'event_id' => $nandy->id,
            'name' => 'VIP Arena',
            'price' => 50000,
            'capacity' => 150,
            'sold_count' => 32,
            'color' => '#8b5cf6',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        TicketTier::create([
            'event_id' => $nandy->id,
            'name' => 'VVIP Table of 6',
            'price' => 500000,
            'capacity' => 20,
            'sold_count' => 5,
            'color' => '#f59e0b',
            'status' => 'active',
            'sort_order' => 3,
        ]);

        // 2. Soft Life Afrika: Shades of the Indian Ocean
        $softLife = Event::create([
            'user_id' => $user->id,
            'title' => 'SOFT LIFE AFRIKA: SHADES OF THE INDIAN OCEAN',
            'event_type' => 'Nightlife Cruise',
            'occasion_type' => 'nightlife',
            'event_date' => now()->addDays(14)->toDateString(),
            'event_time' => '8:00 PM — 3:00 AM',
            'venue' => 'Slipway Yacht Pier, Masaki',
            'city' => 'Dar es Salaam',
            'cover_photo' => '/images/categories/nightlife.jpg',
            'description' => 'The ultimate catamaran party experience along the shores of the Indian Ocean with Afro-house & Amapiano DJs.',
            'ticketing_enabled' => true,
            'is_public' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Boarding strictly closes at 8:45 PM. Dress code: Ocean Blue & White.',
        ]);

        TicketTier::create([
            'event_id' => $softLife->id,
            'name' => 'Cruiser Pass',
            'price' => 30000,
            'capacity' => 200,
            'sold_count' => 45,
            'color' => '#06b6d4',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        TicketTier::create([
            'event_id' => $softLife->id,
            'name' => 'All-Access Yacht Lounge',
            'price' => 80000,
            'capacity' => 50,
            'sold_count' => 12,
            'color' => '#154F7C',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        // 3. Kilimanjaro Marathon 2026
        $marathon = Event::create([
            'user_id' => $user->id,
            'title' => 'KILIMANJARO PREMIUM LAGER MARATHON 2026',
            'event_type' => 'Sports & Athletics',
            'occasion_type' => 'sports',
            'event_date' => now()->addDays(30)->toDateString(),
            'event_time' => '6:00 AM Start',
            'venue' => 'Moshi Stadium & Foothills of Kilimanjaro',
            'city' => 'Moshi',
            'cover_photo' => '/images/categories/sports.jpg',
            'description' => 'Join thousands of international runners beneath Africa\'s highest peak in Tanzania\'s premier road race.',
            'ticketing_enabled' => true,
            'is_public' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Kit collection at Keys Hotel Moshi 2 days prior to race day.',
        ]);

        TicketTier::create([
            'event_id' => $marathon->id,
            'name' => '21km Half Marathon Entry',
            'price' => 35000,
            'capacity' => 1000,
            'sold_count' => 240,
            'color' => '#ef4444',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        TicketTier::create([
            'event_id' => $marathon->id,
            'name' => '42km Full Marathon Entry',
            'price' => 45000,
            'capacity' => 500,
            'sold_count' => 110,
            'color' => '#f97316',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        // 4. Zanzibar Serena Resort Weekend Stay
        $hotel = Event::create([
            'user_id' => $user->id,
            'title' => 'ZANZIBAR SERENA HOTEL LUXURY GETAWAY',
            'event_type' => 'Hotel Stay & Retreat',
            'occasion_type' => 'hotel',
            'event_date' => now()->addDays(20)->toDateString(),
            'event_time' => 'Check-in: 2:00 PM',
            'venue' => 'Stone Town Oceanfront, Zanzibar',
            'city' => 'Zanzibar',
            'cover_photo' => '/images/categories/hotels.jpg',
            'description' => 'Indulge in 5-star seafront heritage hospitality with gourmet seafood dinner and spice island tour.',
            'ticketing_enabled' => true,
            'is_public' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Present your voucher upon arrival at Stone Town reception.',
        ]);

        TicketTier::create([
            'event_id' => $hotel->id,
            'name' => 'Deluxe Ocean View Room',
            'price' => 350000,
            'capacity' => 15,
            'sold_count' => 3,
            'color' => '#8b5cf6',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        // 6. 100% Sold Out Occasion: Wasafi Festival Finale
        $wasafi = Event::create([
            'user_id' => $user->id,
            'title' => 'DIAMOND PLATNUMZ — WASAFI FESTIVAL FINALE 2026',
            'event_type' => 'Concert',
            'occasion_type' => 'concert',
            'is_occasion' => true,
            'ticketing_enabled' => true,
            'is_public' => true,
            'event_date' => now()->addDays(5)->toDateString(),
            'event_time' => '7:00 PM Till Late',
            'venue' => 'Benjamin Mkapa National Stadium',
            'city' => 'Dar es Salaam',
            'cover_photo' => '/images/categories/events.jpg',
            'description' => 'The grand season finale of Wasafi Festival 2026 with Diamond Platnumz and surprise continental acts.',
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Gates open strictly at 4:00 PM. All gates are equipped with Kardovo QR scanners.',
            'status' => 'active',
        ]);

        TicketTier::create([
            'event_id' => $wasafi->id,
            'name' => 'Early Bird Regular Arena',
            'price' => 15000,
            'capacity' => 500,
            'sold_count' => 500,
            'status' => 'sold_out',
            'sort_order' => 1,
            'color' => '#3b82f6',
        ]);

        TicketTier::create([
            'event_id' => $wasafi->id,
            'name' => 'VIP Golden Circle',
            'price' => 50000,
            'capacity' => 150,
            'sold_count' => 150,
            'status' => 'sold_out',
            'sort_order' => 2,
            'color' => '#8b5cf6',
        ]);

        TicketTier::create([
            'event_id' => $wasafi->id,
            'name' => 'VVIP Presidential Box',
            'price' => 350000,
            'capacity' => 15,
            'sold_count' => 15,
            'status' => 'sold_out',
            'sort_order' => 3,
            'color' => '#f59e0b',
        ]);

        // 7. Mixed Tiers Occasion: Serengeti Balloon Safari
        $serengeti = Event::create([
            'user_id' => $user->id,
            'title' => 'SERENGETI BALLOON SAFARI & LUXURY BUSH RETREAT',
            'event_type' => 'Safari & Hotel',
            'occasion_type' => 'hotel',
            'is_occasion' => true,
            'ticketing_enabled' => true,
            'is_public' => true,
            'event_date' => now()->addDays(12)->toDateString(),
            'event_time' => '05:30 AM Sunrise Launch',
            'venue' => 'Serengeti Central Plains & River Camp',
            'city' => 'Serengeti',
            'cover_photo' => '/images/categories/hotels.jpg',
            'description' => 'Glide silently over the Serengeti herds at sunrise followed by bush champagne breakfast and luxury game drive.',
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Transfer departs lodge lobby at 05:00 AM sharp. Warm fleece jacket recommended.',
            'status' => 'active',
        ]);

        TicketTier::create([
            'event_id' => $serengeti->id,
            'name' => 'Dawn Balloon Flight + Champagne Breakfast',
            'price' => 650000,
            'capacity' => 16,
            'sold_count' => 16,
            'status' => 'sold_out',
            'sort_order' => 1,
            'color' => '#ef4444',
        ]);

        TicketTier::create([
            'event_id' => $serengeti->id,
            'name' => 'Sunset Savannah Bush Dinner Experience',
            'price' => 140000,
            'capacity' => 30,
            'sold_count' => 28,
            'status' => 'active',
            'sort_order' => 2,
            'color' => '#f97316',
        ]);

        TicketTier::create([
            'event_id' => $serengeti->id,
            'name' => 'Full Day 4x4 Guided Game Drive Pass',
            'price' => 95000,
            'capacity' => 50,
            'sold_count' => 14,
            'status' => 'active',
            'sort_order' => 3,
            'color' => '#154F7C',
        ]);
    }
}
