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
                $query->whereIn('occasion_type', ['event', 'concert', 'festival', 'conference']);
            } elseif ($category === 'flights') {
                $query->where('occasion_type', 'flight');
            } elseif ($category === 'hotels') {
                $query->where('occasion_type', 'hotel');
            } elseif ($category === 'nightlife') {
                $query->where('occasion_type', 'nightlife');
            } elseif ($category === 'sports') {
                $query->where('occasion_type', 'sports');
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
            'events' => $allPublicOccasions->whereIn('occasion_type', ['event', 'concert', 'festival', 'conference'])->count(),
            'flights' => $allPublicOccasions->where('occasion_type', 'flight')->count(),
            'hotels' => $allPublicOccasions->where('occasion_type', 'hotel')->count(),
            'nightlife' => $allPublicOccasions->where('occasion_type', 'nightlife')->count(),
            'sports' => $allPublicOccasions->where('occasion_type', 'sports')->count(),
        ];

        return Inertia::render('Public/TicketMarketplace', [
            'occasions' => $occasions,
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
            'cover_photo' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
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
            'cover_photo' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
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
            'color' => '#10b981',
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
            'cover_photo' => 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
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
            'cover_photo' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
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

        // 5. Precision Air: Dar es Salaam to Kilimanjaro
        $flight = Event::create([
            'user_id' => $user->id,
            'title' => 'PRECISION AIR: DAR ES SALAAM (DAR) TO KILIMANJARO (JRO)',
            'event_type' => 'Flight Pass',
            'occasion_type' => 'flight',
            'event_date' => now()->addDays(10)->toDateString(),
            'event_time' => 'Departure: 09:30 AM',
            'venue' => 'Julius Nyerere International Airport (JNIA) Terminal 2',
            'city' => 'Dar es Salaam',
            'cover_photo' => 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
            'description' => 'Scheduled domestic flight direct from Dar es Salaam to Kilimanjaro International Airport.',
            'ticketing_enabled' => true,
            'is_public' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Check-in counter closes 45 minutes prior to scheduled departure. 23kg check-in bag included.',
        ]);

        TicketTier::create([
            'event_id' => $flight->id,
            'name' => 'Economy Class Flight Ticket',
            'price' => 180000,
            'capacity' => 70,
            'sold_count' => 22,
            'color' => '#0284c7',
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
            'cover_photo' => 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
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
            'cover_photo' => 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
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
            'color' => '#10b981',
        ]);
    }
}
