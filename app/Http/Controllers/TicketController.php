<?php

namespace App\Http\Controllers;

use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\TicketOrder;
use App\Models\TicketTier;
use App\Services\PhoneNormalizer;
use App\Services\QRCodeGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display the independent Ticketing Portal.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin() && ! $user->isScanner()) {
            if (! $user->canAccessTicketing() || $user->status === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your account does not have permission to access the Ticketing Portal.');
            }
        }

        $selectedEventId = $request->input('event_id');

        $eventsQuery = Event::accessibleBy($user)
            ->where(function ($q) use ($selectedEventId) {
                $q->where('is_occasion', true);
                if ($selectedEventId) {
                    $q->orWhere('id', (int) $selectedEventId);
                }
            })
            ->withCount(['ticketTiers', 'tickets', 'ticketOrders'])
            ->with(['user', 'cardTemplate']);

        $events = $eventsQuery->latest('event_date')->get()->map(function ($ev) {
            $ev->total_revenue = (float) $ev->ticketOrders()->where('payment_status', 'paid')->sum('total_amount');
            $ev->total_platform_fee = (float) $ev->ticketOrders()->where('payment_status', 'paid')->sum('platform_fee');
            $ev->total_organizer_net = (float) $ev->ticketOrders()->where('payment_status', 'paid')->sum('organizer_net_amount');
            $ev->total_sold = (int) $ev->tickets()->where('status', '!=', 'cancelled')->count();
            $ev->total_capacity = (int) $ev->ticketTiers()->sum('capacity');

            return $ev;
        });

        $allEventIds = $events->pluck('id');

        $globalStats = [
            'total_revenue' => (float) TicketOrder::whereIn('event_id', $allEventIds)->where('payment_status', 'paid')->sum('total_amount'),
            'total_platform_fee' => (float) TicketOrder::whereIn('event_id', $allEventIds)->where('payment_status', 'paid')->sum('platform_fee'),
            'total_organizer_net' => (float) TicketOrder::whereIn('event_id', $allEventIds)->where('payment_status', 'paid')->sum('organizer_net_amount'),
            'total_tickets_sold' => (int) Ticket::whereIn('event_id', $allEventIds)->where('status', '!=', 'cancelled')->count(),
            'total_orders' => (int) TicketOrder::whereIn('event_id', $allEventIds)->count(),
            'total_checked_in' => (int) Ticket::whereIn('event_id', $allEventIds)->where('status', 'checked_in')->count(),
            'total_ticketed_events' => $events->where('ticketing_enabled', true)->count(),
        ];

        $selectedEventId = $request->input('event_id');

        if (! $selectedEventId) {
            $recentOrdersQuery = TicketOrder::query()
                ->with(['event:id,title', 'tickets.ticketTier:id,name', 'user:id,name,phone,email'])
                ->whereIn('event_id', $allEventIds)
                ->latest('id')
                ->limit(100);

            $recentTicketOrders = $recentOrdersQuery->get()->map(function ($order) {
                $firstTier = $order->tickets->first()?->ticketTier;
                $tierNames = $order->tickets->pluck('ticketTier.name')->filter()->unique()->join(', ');

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'created_at' => $order->created_at ? $order->created_at->format('d M Y, H:i') : '',
                    'event_id' => $order->event_id,
                    'event_title' => $order->event?->title ?? 'N/A',
                    'customer_name' => $order->buyer_name ?: ($order->user?->name ?? 'Guest Buyer'),
                    'customer_phone' => $order->buyer_phone ?: ($order->user?->phone ?? '—'),
                    'customer_email' => $order->buyer_email ?: ($order->user?->email ?? '—'),
                    'tier_name' => $tierNames ?: ($firstTier?->name ?? 'Standard Admission'),
                    'quantity' => $order->tickets->count() ?: 1,
                    'total_amount' => (float) $order->total_amount,
                    'platform_fee' => (float) $order->platform_fee,
                    'organizer_net_amount' => (float) $order->organizer_net_amount,
                    'payment_method' => $order->payment_method ?? 'mobile_money',
                    'payment_status' => $order->payment_status ?? 'pending',
                ];
            });

            $globalStats['total_occasions'] = $events->count();

            return Inertia::render('Organizer/Ticketing/Index', [
                'occasions' => $events,
                'globalStats' => $globalStats,
                'recentTicketOrders' => $recentTicketOrders,
                'isAdmin' => $user->isAdmin() || $user->isSubAdmin(),
            ]);
        }

        $selectedEvent = $events->firstWhere('id', (int) $selectedEventId);

        if (! $selectedEvent) {
            return redirect()->route('ticketing.index')->with('error', 'Occasion not found or access restricted.');
        }

        $selectedEventStats = null;
        $selectedEventTiers = collect();
        $selectedEventOrders = collect();
        $selectedEventTickets = null;

        if ($selectedEvent) {
            $totalRevenue = (float) $selectedEvent->ticketOrders()->where('payment_status', 'paid')->sum('total_amount');
            $totalPlatformFee = (float) $selectedEvent->ticketOrders()->where('payment_status', 'paid')->sum('platform_fee');
            $totalOrganizerNet = (float) $selectedEvent->ticketOrders()->where('payment_status', 'paid')->sum('organizer_net_amount');

            // Fallback for orders created before split fields if any
            if ($totalRevenue > 0 && $totalPlatformFee <= 0 && $totalOrganizerNet <= 0) {
                $totalPlatformFee = round($totalRevenue * 0.06, 2);
                $totalOrganizerNet = round($totalRevenue * 0.94, 2);
            }

            $selectedEventStats = [
                'ticketing_enabled' => (bool) $selectedEvent->ticketing_enabled,
                'total_sold' => (int) $selectedEvent->tickets()->where('status', '!=', 'cancelled')->count(),
                'total_revenue' => $totalRevenue,
                'total_platform_fee' => $totalPlatformFee,
                'total_organizer_net' => $totalOrganizerNet,
                'platform_fee_percent' => 6.0,
                'organizer_net_percent' => 94.0,
                'payout_status' => $selectedEvent->payout_status ?? 'unconfigured',
                'payout_method' => $selectedEvent->payout_method ?? 'mobile_money',
                'payout_provider' => $selectedEvent->payout_provider,
                'payout_account_number' => $selectedEvent->payout_account_number,
                'payout_account_name' => $selectedEvent->payout_account_name,
                'payout_bank_branch' => $selectedEvent->payout_bank_branch,
                'total_capacity' => (int) $selectedEvent->ticketTiers()->sum('capacity'),
                'total_checked_in' => (int) $selectedEvent->tickets()->where('status', 'checked_in')->count(),
            ];

            $selectedEventTiers = $selectedEvent->ticketTiers()
                ->withCount('tickets')
                ->orderBy('sort_order')
                ->get();

            $selectedEventOrders = $selectedEvent->ticketOrders()
                ->with('tickets.ticketTier')
                ->latest()
                ->take(30)
                ->get();

            $ticketsQuery = $selectedEvent->tickets()
                ->with(['ticketTier', 'ticketOrder'])
                ->latest();

            if ($search = $request->input('search')) {
                $ticketsQuery->where(function ($q) use ($search) {
                    $q->where('attendee_name', 'like', "%{$search}%")
                        ->orWhere('attendee_phone', 'like', "%{$search}%")
                        ->orWhere('attendee_email', 'like', "%{$search}%")
                        ->orWhere('ticket_number', 'like', "%{$search}%")
                        ->orWhere('unique_code', 'like', "%{$search}%");
                });
            }

            if ($status = $request->input('status')) {
                if ($status !== 'all') {
                    $ticketsQuery->where('status', $status);
                }
            }

            if ($tierId = $request->input('tier_id')) {
                if ($tierId !== 'all') {
                    $ticketsQuery->where('ticket_tier_id', $tierId);
                }
            }

            $selectedEventTickets = $ticketsQuery->paginate(20)->withQueryString();
        }

        $selectedEventDiscountCodes = $selectedEvent ? $selectedEvent->discountCodes()->latest()->get() : collect();
        $selectedEventWristbandOrders = $selectedEvent ? $selectedEvent->wristbandOrders()->latest()->get() : collect();
        $selectedEventPosRequests = $selectedEvent ? $selectedEvent->posTerminalRequests()->latest()->get() : collect();

        return Inertia::render('Customer/TicketingPortal', [
            'events' => $events,
            'selectedEvent' => $selectedEvent,
            'selectedEventStats' => $selectedEventStats,
            'selectedEventTiers' => $selectedEventTiers,
            'selectedEventOrders' => $selectedEventOrders,
            'selectedEventTickets' => $selectedEventTickets,
            'selectedEventDiscountCodes' => $selectedEventDiscountCodes,
            'selectedEventWristbandOrders' => $selectedEventWristbandOrders,
            'selectedEventPosRequests' => $selectedEventPosRequests,
            'globalStats' => $globalStats,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'tier_id' => $request->input('tier_id', 'all'),
                'event_id' => $selectedEvent?->id,
            ],
        ]);
    }

    /**
     * Check if user is authorized to manage the event.
     */
    protected function authorizeEvent(Request $request, Event $event): void
    {
        $user = $request->user();
        if ($user->isAdmin()) {
            return;
        }

        if ($event->user_id !== $user->id && ! $event->assignedSubAdmins()->where('sub_admin_id', $user->id)->exists()) {
            abort(403, 'Unauthorized to manage ticketing for this event.');
        }
    }

    /**
     * Store a new ticketed occasion.
     */
    public function storeOccasion(Request $request)
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            if (! $user->canCreateEvents()) {
                return back()->with('error', 'Occasion creation permission is disabled for your account. Please contact system administration.');
            }
            if ($user->max_events_limit && $user->events()->where('is_occasion', true)->count() >= $user->max_events_limit) {
                return back()->with('error', "Occasion quota limit of {$user->max_events_limit} reached for your account.");
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|min:3|max:255',
            'occasion_type' => 'required|string|in:event,concert,hotel,nightlife,sports,fashion,corporate,conference,other',
            'event_date' => 'required|date',
            'event_time' => 'nullable|string|max:50',
            'venue' => 'required|string|min:2|max:255',
            'city' => 'required|string|min:2|max:100',
            'description' => 'nullable|string|max:3000',
            'ticket_currency' => 'nullable|string|max:10',
            'ticket_instructions' => 'nullable|string|max:2000',
            'is_public' => 'nullable|boolean',
            'cover_photo' => 'nullable|string|max:2000',
            'cover_image' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:10240',
            'initial_tier_name' => 'nullable|string|max:100',
            'initial_tier_price' => 'nullable|numeric|min:0',
            'initial_tier_capacity' => 'nullable|integer|min:1',
        ]);

        $coverPhoto = $validated['cover_photo'] ?? null;

        if ($request->hasFile('cover_image')) {
            $assetsDir = public_path('occasion_covers');
            if (! file_exists($assetsDir)) {
                mkdir($assetsDir, 0755, true);
            }
            $file = $request->file('cover_image');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $fileName = 'cover_'.time().'_'.uniqid().'.'.$extension;
            $file->move($assetsDir, $fileName);
            $coverPhoto = '/occasion_covers/'.$fileName;
        }

        // If no cover provided, assign default thematic cover
        if (! $coverPhoto) {
            $coverPhoto = match ($validated['occasion_type']) {
                'concert' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
                'hotel' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                'nightlife' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
                'sports' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
                'fashion' => '/images/categories/fashion.jpg',
                'corporate', 'conference' => '/images/categories/corporate.jpg',
                default => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
            };
        }

        $event = Event::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'event_type' => ucfirst($validated['occasion_type']),
            'occasion_type' => $validated['occasion_type'],
            'is_occasion' => true,
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'] ?? null,
            'venue' => $validated['venue'],
            'city' => $validated['city'],
            'description' => $validated['description'] ?? null,
            'cover_photo' => $coverPhoto,
            'ticketing_enabled' => true,
            'is_public' => $request->boolean('is_public', true),
            'ticket_currency' => $validated['ticket_currency'] ?? 'TZS',
            'ticket_instructions' => $validated['ticket_instructions'] ?? null,
            'status' => 'active',
        ]);

        if (! empty($validated['initial_tier_name'])) {
            $event->ticketTiers()->create([
                'name' => $validated['initial_tier_name'],
                'price' => $validated['initial_tier_price'] ?? 0,
                'currency' => $event->ticket_currency,
                'capacity' => $validated['initial_tier_capacity'] ?? 100,
                'sold_count' => 0,
                'max_per_order' => 10,
                'status' => 'active',
                'sort_order' => 1,
                'color' => '#154F7C',
            ]);
        }

        return redirect()->route('ticketing.index', ['event_id' => $event->id])
            ->with('success', "Ticketed occasion '{$event->title}' created successfully.");
    }

    /**
     * Update event ticketing configuration settings.
     */
    public function updateSettings(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'ticketing_enabled' => 'required|boolean',
            'ticket_currency' => 'nullable|string|max:10',
            'ticket_instructions' => 'nullable|string|max:2000',
            'ticket_sales_end_at' => 'nullable|date',
            'is_public' => 'nullable|boolean',
            'occasion_type' => 'nullable|string|in:event,concert,hotel,nightlife,sports,fashion,corporate,conference,other',
            'cover_photo' => 'nullable|string|max:2000',
            'cover_image' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:10240',
            // Connected payout account fields
            'payout_method' => 'nullable|string|in:mobile_money,bank',
            'payout_provider' => 'nullable|string|max:60',
            'payout_account_number' => 'nullable|string|max:60',
            'payout_account_name' => 'nullable|string|max:120',
            'payout_bank_branch' => 'nullable|string|max:100',
        ]);

        $updateData = [
            'ticketing_enabled' => $validated['ticketing_enabled'],
            'ticket_currency' => $validated['ticket_currency'] ?? 'TZS',
            'ticket_instructions' => $validated['ticket_instructions'] ?? null,
            'ticket_sales_end_at' => $validated['ticket_sales_end_at'] ?? null,
        ];

        // Process payout account settings if submitted
        if ($request->has('payout_method')) {
            $updateData['payout_method'] = $validated['payout_method'] ?? 'mobile_money';
            $updateData['payout_provider'] = $validated['payout_provider'] ?? null;
            $updateData['payout_account_number'] = $validated['payout_account_number'] ?? null;
            $updateData['payout_account_name'] = $validated['payout_account_name'] ?? null;
            $updateData['payout_bank_branch'] = $validated['payout_bank_branch'] ?? null;

            if (! empty($updateData['payout_account_number']) && ! empty($updateData['payout_provider'])) {
                $updateData['payout_status'] = 'active';
            } elseif (empty($updateData['payout_account_number'])) {
                $updateData['payout_status'] = 'unconfigured';
            }
        }

        if ($request->has('is_public')) {
            $updateData['is_public'] = $request->boolean('is_public');
        }

        if (! empty($validated['occasion_type'])) {
            $updateData['occasion_type'] = $validated['occasion_type'];
        }

        if ($request->hasFile('cover_image')) {
            $assetsDir = public_path('occasion_covers');
            if (! file_exists($assetsDir)) {
                mkdir($assetsDir, 0755, true);
            }
            $file = $request->file('cover_image');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $fileName = 'cover_'.time().'_'.uniqid().'.'.$extension;
            $file->move($assetsDir, $fileName);
            $updateData['cover_photo'] = '/occasion_covers/'.$fileName;
        } elseif ($request->filled('cover_photo')) {
            $updateData['cover_photo'] = $validated['cover_photo'];
        }

        $event->update($updateData);

        return back()->with('success', 'Event ticketing settings updated successfully.');
    }

    /**
     * Store a new ticket tier.
     */
    public function storeTier(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'max_per_order' => 'nullable|integer|min:1|max:50',
            'sales_start_at' => 'nullable|date',
            'sales_end_at' => 'nullable|date',
            'color' => 'nullable|string|max:20',
        ]);

        $nextSortOrder = ($event->ticketTiers()->max('sort_order') ?? 0) + 1;

        $event->ticketTiers()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'currency' => $event->ticket_currency ?? 'TZS',
            'capacity' => $validated['capacity'],
            'sold_count' => 0,
            'max_per_order' => $validated['max_per_order'] ?? 10,
            'sales_start_at' => $validated['sales_start_at'] ?? null,
            'sales_end_at' => $validated['sales_end_at'] ?? null,
            'status' => 'active',
            'sort_order' => $nextSortOrder,
            'color' => $validated['color'] ?? '#154F7C',
        ]);

        // Auto-enable ticketing on the event if adding the first tier
        if (! $event->ticketing_enabled) {
            $event->update(['ticketing_enabled' => true]);
        }

        return back()->with('success', "Ticket tier '{$validated['name']}' created successfully.");
    }

    /**
     * Update an existing ticket tier.
     */
    public function updateTier(Request $request, Event $event, TicketTier $tier)
    {
        $this->authorizeEvent($request, $event);

        if ($tier->event_id !== $event->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:'.max(1, $tier->sold_count),
            'max_per_order' => 'nullable|integer|min:1|max:50',
            'status' => 'required|in:active,sold_out,paused,hidden',
            'sales_start_at' => 'nullable|date',
            'sales_end_at' => 'nullable|date',
            'color' => 'nullable|string|max:20',
        ]);

        $tier->update($validated);

        return back()->with('success', "Ticket tier '{$tier->name}' updated.");
    }

    /**
     * Delete or deactivate a ticket tier.
     */
    public function destroyTier(Request $request, Event $event, TicketTier $tier)
    {
        $this->authorizeEvent($request, $event);

        if ($tier->event_id !== $event->id) {
            abort(404);
        }

        if ($tier->tickets()->count() > 0) {
            $tier->update(['status' => 'paused']);

            return back()->with('info', "Tier '{$tier->name}' has issued tickets so it was paused rather than deleted.");
        }

        $tier->delete();

        return back()->with('success', "Ticket tier '{$tier->name}' deleted.");
    }

    /**
     * Update the visual ticket template and branding configuration.
     */
    public function updateTicketTemplate(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        if ($request->has('show_confetti')) {
            $request->merge(['show_confetti' => $request->boolean('show_confetti')]);
        }
        if ($request->has('show_barcode')) {
            $request->merge(['show_barcode' => $request->boolean('show_barcode')]);
        }
        if ($request->has('show_artwork')) {
            $request->merge(['show_artwork' => $request->boolean('show_artwork')]);
        }
        if ($request->has('show_event_details')) {
            $request->merge(['show_event_details' => $request->boolean('show_event_details')]);
        }

        $validated = $request->validate([
            'template_style' => 'nullable|string|max:50',
            'bg_color' => 'nullable|string|max:30',
            'accent_color' => 'nullable|string|max:30',
            'right_bg_color' => 'nullable|string|max:30',
            'right_overlay' => 'nullable|string|in:none,accent_border,subtle_dots,top_glow',
            'left_design_mode' => 'nullable|string|in:default,custom',
            'left_bg_color' => 'nullable|string|max:30',
            'left_bg_image' => 'nullable|string|max:2000',
            'custom_design_file' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:10240',
            'badge_text' => 'nullable|string|max:60',
            'custom_instructions' => 'nullable|string|max:500',
            'show_confetti' => 'nullable|boolean',
            'show_barcode' => 'nullable|boolean',
            'show_artwork' => 'nullable|boolean',
            'show_event_details' => 'nullable|boolean',
        ]);

        $leftBgImage = $validated['left_bg_image'] ?? ($event->ticket_template_config['left_bg_image'] ?? null);

        if ($request->hasFile('custom_design_file')) {
            $assetsDir = public_path('ticket_designs');
            if (! file_exists($assetsDir)) {
                mkdir($assetsDir, 0755, true);
            }
            $file = $request->file('custom_design_file');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $fileName = 'design_'.time().'_'.uniqid().'.'.$extension;
            $file->move($assetsDir, $fileName);
            $leftBgImage = '/ticket_designs/'.$fileName;
        }

        $event->update([
            'ticket_template_config' => [
                'template_style' => $validated['template_style'] ?? 'festival',
                'bg_color' => $validated['bg_color'] ?? ($validated['left_bg_color'] ?? '#241645'),
                'accent_color' => $validated['accent_color'] ?? '#FABF24',
                'right_bg_color' => $validated['right_bg_color'] ?? '#FFFFFF',
                'right_overlay' => $validated['right_overlay'] ?? 'none',
                'left_design_mode' => $validated['left_design_mode'] ?? 'default',
                'left_bg_color' => $validated['left_bg_color'] ?? ($validated['bg_color'] ?? '#241645'),
                'left_bg_image' => $leftBgImage,
                'badge_text' => $validated['badge_text'] ?? null,
                'custom_instructions' => $validated['custom_instructions'] ?? null,
                'show_confetti' => $request->boolean('show_confetti', false),
                'show_barcode' => $request->boolean('show_barcode', true),
                'show_artwork' => $request->boolean('show_artwork', true),
                'show_event_details' => $request->boolean('show_event_details', false),
            ],
        ]);

        return redirect()->route('ticketing.index', ['event_id' => $event->id])
            ->with('success', 'Ticket pass design configuration saved successfully.');
    }

    /**
     * Batch generate physical/manual tickets for offline door sales or outlets.
     */
    public function batchGenerate(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'tier_id' => 'required|exists:ticket_tiers,id',
            'quantity' => 'required|integer|min:1|max:500',
            'distribution_label' => 'nullable|string|max:150',
            'attendee_prefix' => 'nullable|string|max:100',
            'redirect_to' => 'nullable|string|in:portal,print_tickets,print_wristbands',
        ]);

        $tier = $event->ticketTiers()
            ->where('id', $validated['tier_id'])
            ->firstOrFail();

        $qty = (int) $validated['quantity'];
        if ($tier->remaining_count < $qty) {
            return back()->with('error', "Cannot generate {$qty} tickets. Only {$tier->remaining_count} remaining for '{$tier->name}'.");
        }

        $distributionLabel = ! empty($validated['distribution_label'])
            ? trim($validated['distribution_label'])
            : 'Door Sales / Physical Distribution';

        $prefix = ! empty($validated['attendee_prefix'])
            ? trim($validated['attendee_prefix'])
            : ($tier->name.' Pass');

        $existingCount = Ticket::where('ticket_tier_id', $tier->id)->count();

        $createdOrder = DB::transaction(function () use ($event, $tier, $qty, $distributionLabel, $prefix, $existingCount, $request) {
            $totalAmount = (float) $tier->price * $qty;

            // Create TicketOrder record
            $order = TicketOrder::create([
                'event_id' => $event->id,
                'user_id' => $request->user()->id,
                'buyer_name' => $distributionLabel,
                'buyer_phone' => $request->user()->phone ?? '0700000000',
                'buyer_email' => $request->user()->email,
                'subtotal' => $totalAmount,
                'platform_fee' => 0,
                'total_amount' => $totalAmount,
                'currency' => $event->ticket_currency ?? 'TZS',
                'payment_method' => 'Physical / Manual Batch',
                'payment_reference' => 'MAN-'.date('ymd').'-'.strtoupper(bin2hex(random_bytes(3))),
                'payment_status' => 'paid',
                'paid_at' => now(),
                'metadata' => [
                    'is_manual_batch' => true,
                    'batch_quantity' => $qty,
                    'distribution_label' => $distributionLabel,
                ],
            ]);

            // Batch generate tickets with continuous serial numbering
            for ($i = 1; $i <= $qty; $i++) {
                $serialNum = $existingCount + $i;
                $attendeeName = "{$prefix} #".str_pad((string) $serialNum, 3, '0', STR_PAD_LEFT);

                Ticket::create([
                    'ticket_order_id' => $order->id,
                    'event_id' => $event->id,
                    'ticket_tier_id' => $tier->id,
                    'attendee_name' => $attendeeName,
                    'attendee_phone' => null,
                    'attendee_email' => null,
                    'price_paid' => $tier->price,
                    'currency' => $order->currency,
                    'status' => 'valid',
                ]);
            }

            $tier->increment('sold_count', $qty);
            $tier->refresh();
            if ($tier->remaining_count <= 0) {
                $tier->update(['status' => 'sold_out']);
            }

            return $order;
        });

        $redirectTo = $validated['redirect_to'] ?? null;

        if ($redirectTo === 'print_tickets') {
            return redirect()
                ->route('events.tickets.printSheet', [
                    'event' => $event->id,
                    'order_id' => $createdOrder->id,
                    'tier_id' => $tier->id,
                ])
                ->with('success', "Generated {$qty} scannable tickets for {$tier->name}. Ready to print!");
        }

        if ($redirectTo === 'print_wristbands') {
            return redirect()
                ->route('events.wristbands.print', [
                    'event' => $event->id,
                    'order_id' => $createdOrder->id,
                    'tier_id' => $tier->id,
                ])
                ->with('success', "Generated {$qty} scannable wristbands for {$tier->name}. Ready to print!");
        }

        return back()->with('success', "Successfully generated {$qty} physical tickets for {$tier->name}. You can now print them or export to CSV.");
    }

    /**
     * Printable multi-ticket sheet layout (A4 / 2-3 per page) for door sales and physical vouchers.
     */
    public function printSheet(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $tiers = $event->ticketTiers()->orderBy('sort_order')->get();
        $tierId = $request->input('tier_id', 'all');
        $orderId = $request->input('order_id');

        $query = $event->tickets()
            ->with(['ticketTier', 'ticketOrder'])
            ->where('status', '!=', 'cancelled')
            ->latest();

        if ($tierId && $tierId !== 'all') {
            $query->where('ticket_tier_id', $tierId);
        }

        if ($orderId) {
            $query->where('ticket_order_id', $orderId);
        }

        $tickets = $query->take(200)->get()->map(function ($ticket) {
            $ticket->qr_data_uri = QRCodeGenerator::renderToBase64Png($ticket->qr_token, 220);

            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'unique_code' => $ticket->unique_code,
                'attendee_name' => $ticket->attendee_name,
                'ticket_tier_id' => $ticket->ticket_tier_id,
                'tier_name' => $ticket->ticketTier?->name ?? 'Standard',
                'tier_color' => $ticket->ticketTier?->color ?? '#154F7C',
                'price_paid' => (float) $ticket->price_paid,
                'formatted_price' => $ticket->formatted_price,
                'currency' => $ticket->currency,
                'status' => $ticket->status,
                'qr_data_uri' => $ticket->qr_data_uri,
                'order_ref' => $ticket->ticketOrder?->order_number,
            ];
        });

        return Inertia::render('Customer/PrintTicketSheet', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'event_type' => $event->event_type,
                'event_date' => $event->event_date?->format('l, d F Y'),
                'event_time' => $event->event_time,
                'venue' => $event->venue,
                'city' => $event->city,
                'cover_photo' => $event->cover_photo,
                'ticket_instructions' => $event->ticket_instructions,
                'ticket_template_config' => $event->ticket_template_config ?? [
                    'template_style' => 'festival',
                    'accent_color' => '#154F7C',
                    'badge_text' => 'OFFICIAL PASS',
                    'show_barcode' => true,
                    'show_artwork' => true,
                ],
            ],
            'tiers' => $tiers,
            'tickets' => $tickets,
            'selectedTierId' => $tierId,
            'selectedOrderId' => $orderId,
        ]);
    }

    /**
     * Export tickets as CSV spreadsheet for thermal printers or records.
     */
    public function exportCsv(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $tierId = $request->input('tier_id');
        $query = $event->tickets()->with(['ticketTier', 'ticketOrder'])->latest();

        if ($tierId && $tierId !== 'all') {
            $query->where('ticket_tier_id', $tierId);
        }

        $tickets = $query->get();

        $filename = 'tickets-'.Str::slug($event->title).'-'.date('Ymd-His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($tickets, $event) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'Ticket Number',
                'Attendee Name',
                'Phone',
                'Email',
                'Ticket Tier',
                'Price Paid',
                'Currency',
                'Status',
                'Order Number',
                'Unique Code',
                'Event Title',
                'Event Date',
                'Venue',
                'Verification Pass URL',
                'Issued At',
            ]);

            foreach ($tickets as $t) {
                fputcsv($file, [
                    $t->ticket_number,
                    $t->attendee_name,
                    $t->attendee_phone ?? '',
                    $t->attendee_email ?? '',
                    $t->ticketTier?->name ?? 'Standard',
                    $t->price_paid,
                    $t->currency,
                    $t->status,
                    $t->ticketOrder?->order_number ?? '',
                    $t->unique_code,
                    $event->title,
                    $event->event_date?->format('Y-m-d') ?? '',
                    $event->venue,
                    $t->pass_url,
                    $t->created_at?->format('Y-m-d H:i:s') ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Store a new discount code for an event.
     */
    public function storeDiscountCode(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'code' => 'required|string|max:64',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        $code = strtoupper(trim($validated['code']));

        $event->discountCodes()->create([
            'code' => $code,
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'max_uses' => $validated['max_uses'] ?? null,
            'min_order_amount' => $validated['min_order_amount'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Discount code created successfully.');
    }

    /**
     * Update an existing discount code.
     */
    public function updateDiscountCode(Request $request, Event $event, DiscountCode $discountCode)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'code' => 'required|string|max:64',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        $discountCode->update([
            'code' => strtoupper(trim($validated['code'])),
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'max_uses' => $validated['max_uses'] ?? null,
            'min_order_amount' => $validated['min_order_amount'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Discount code updated successfully.');
    }

    /**
     * Toggle discount code active status.
     */
    public function toggleDiscountCode(Request $request, Event $event, DiscountCode $discountCode)
    {
        $this->authorizeEvent($request, $event);

        $discountCode->update(['is_active' => ! $discountCode->is_active]);

        return redirect()->back()->with('success', 'Discount code status updated.');
    }

    /**
     * Delete a discount code.
     */
    public function destroyDiscountCode(Request $request, Event $event, DiscountCode $discountCode)
    {
        $this->authorizeEvent($request, $event);

        $discountCode->delete();

        return redirect()->back()->with('success', 'Discount code deleted.');
    }

    /**
     * Order custom branded wristbands for gate identification.
     */
    public function orderWristbands(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'material_type' => 'required|string|max:50',
            'quantity' => 'required|integer|min:1',
            'color_scheme' => 'nullable|string|max:100',
            'custom_text' => 'nullable|string|max:255',
            'custom_logo_url' => 'nullable|string',
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'delivery_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $event->wristbandOrders()->create([
            'user_id' => $request->user()?->id,
            'material_type' => $validated['material_type'],
            'quantity' => $validated['quantity'],
            'color_scheme' => $validated['color_scheme'] ?? null,
            'custom_text' => $validated['custom_text'] ?? null,
            'custom_logo_url' => $validated['custom_logo_url'] ?? null,
            'contact_name' => $validated['contact_name'],
            'contact_phone' => $validated['contact_phone'],
            'contact_email' => $validated['contact_email'] ?? $request->user()?->email,
            'delivery_address' => $validated['delivery_address'] ?? null,
            'status' => 'requested',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Custom wristband production order submitted successfully.');
    }

    /**
     * Render the printable DIY wristband sheet for the event.
     */
    public function printWristbands(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $tierId = $request->input('tier_id', 'all');
        $orderId = $request->input('order_id');
        $tiers = $event->ticketTiers()->orderBy('sort_order')->get();

        $query = $event->tickets()
            ->with(['ticketTier', 'ticketOrder'])
            ->where('status', '!=', 'cancelled')
            ->latest();

        if ($tierId && $tierId !== 'all') {
            $query->where('ticket_tier_id', $tierId);
        }

        if ($orderId) {
            $query->where('ticket_order_id', $orderId);
        }

        $tickets = $query->take(500)->get()->map(function ($ticket) {
            $ticket->qr_data_uri = QRCodeGenerator::renderToBase64Png($ticket->qr_token, 180);

            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'unique_code' => $ticket->unique_code,
                'attendee_name' => $ticket->attendee_name,
                'ticket_tier_id' => $ticket->ticket_tier_id,
                'ticket_order_id' => $ticket->ticket_order_id,
                'tier_name' => $ticket->ticketTier?->name ?? 'Standard',
                'tier_color' => $ticket->ticketTier?->color ?? '#154F7C',
                'price_paid' => (float) $ticket->price_paid,
                'formatted_price' => $ticket->formatted_price,
                'currency' => $ticket->currency,
                'status' => $ticket->status,
                'qr_data_uri' => $ticket->qr_data_uri,
                'order_ref' => $ticket->ticketOrder?->order_number,
            ];
        });

        return Inertia::render('Customer/PrintWristbandSheet', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'event_type' => $event->event_type,
                'event_date' => $event->event_date?->format('D, M j, Y') ?? ($event->event_date ? (string) $event->event_date : ''),
                'event_time' => $event->event_time,
                'venue' => $event->venue,
                'city' => $event->city,
                'ticket_currency' => $event->ticket_currency ?? 'TZS',
                'ticket_template_config' => $event->ticket_template_config,
            ],
            'tickets' => $tickets,
            'tiers' => $tiers,
            'selectedTierId' => $tierId,
            'selectedOrderId' => $orderId,
            'wristbandConfig' => $event->ticket_template_config['wristband'] ?? null,
        ]);
    }

    /**
     * Save custom wristband styling, pattern, and design artwork.
     */
    public function updateWristbandTemplate(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        if ($request->has('show_serial')) {
            $request->merge(['show_serial' => $request->boolean('show_serial')]);
        }
        if ($request->has('show_arrows')) {
            $request->merge(['show_arrows' => $request->boolean('show_arrows')]);
        }

        $validated = $request->validate([
            'template_style' => 'nullable|string|max:50',
            'custom_artwork_url' => 'nullable|string',
            'custom_artwork_file' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif,svg|max:10240',
            'font_style' => 'nullable|string|max:50',
            'qr_position' => 'nullable|string|in:left,right,dual',
            'custom_title' => 'nullable|string|max:120',
            'custom_subtitle' => 'nullable|string|max:150',
            'custom_role_label' => 'nullable|string|max:60',
            'show_serial' => 'nullable|boolean',
            'show_arrows' => 'nullable|boolean',
            'bg_mode' => 'nullable|string|in:preset,custom_upload,tier_color',
            'accent_color' => 'nullable|string|max:30',
        ]);

        $artworkUrl = $validated['custom_artwork_url'] ?? ($event->ticket_template_config['wristband']['custom_artwork_url'] ?? null);

        if ($request->hasFile('custom_artwork_file')) {
            $assetsDir = public_path('wristband_designs');
            if (! file_exists($assetsDir)) {
                mkdir($assetsDir, 0755, true);
            }
            $file = $request->file('custom_artwork_file');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $fileName = 'wristband_'.time().'_'.uniqid().'.'.$extension;
            $file->move($assetsDir, $fileName);
            $artworkUrl = '/wristband_designs/'.$fileName;
        }

        $currentConfig = $event->ticket_template_config ?? [];
        $currentConfig['wristband'] = [
            'template_style' => $validated['template_style'] ?? 'festival_pop',
            'bg_mode' => $validated['bg_mode'] ?? 'preset',
            'custom_artwork_url' => $artworkUrl,
            'font_style' => $validated['font_style'] ?? 'chunky_festival',
            'qr_position' => $validated['qr_position'] ?? 'left',
            'custom_title' => $validated['custom_title'] ?? null,
            'custom_subtitle' => $validated['custom_subtitle'] ?? null,
            'custom_role_label' => $validated['custom_role_label'] ?? null,
            'show_serial' => $request->boolean('show_serial', true),
            'show_arrows' => $request->boolean('show_arrows', true),
            'accent_color' => $validated['accent_color'] ?? '#154F7C',
        ];

        $event->update([
            'ticket_template_config' => $currentConfig,
        ]);

        return redirect()->back()->with('success', 'Custom wristband design saved successfully.');
    }

    /**
     * Request an offline Point of Sale (POS) Android/4G hardware device for gate sales.
     */
    public function requestPosTerminal(Request $request, Event $event)
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'terminals_count' => 'required|integer|min:1',
            'required_from_date' => 'required|date',
            'required_to_date' => 'nullable|date|after_or_equal:required_from_date',
            'venue_location' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $event->posTerminalRequests()->create([
            'user_id' => $request->user()?->id,
            'terminals_count' => $validated['terminals_count'],
            'required_from_date' => $validated['required_from_date'],
            'required_to_date' => $validated['required_to_date'] ?? null,
            'venue_location' => $validated['venue_location'],
            'contact_name' => $validated['contact_name'],
            'contact_phone' => PhoneNormalizer::cleanForApi($validated['contact_phone']),
            'contact_email' => $validated['contact_email'] ?? $request->user()?->email,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Point of sale (POS) terminal request submitted successfully.');
    }
}
