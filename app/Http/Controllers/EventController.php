<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Event;
use App\Models\CardTemplate;
use App\Models\Guest;
use App\Models\ScanLog;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isScanner()) {
            return redirect()->route('scanner.index');
        }

        $eventsQuery = Event::with(['cardTemplate', 'user'])
            ->withCount([
                'guests as total_guests',
                'guests as will_attend_count' => function ($q) {
                    $q->where('rsvp_status', 'attending');
                },
                'guests as will_not_attend_count' => function ($q) {
                    $q->where('rsvp_status', 'declined');
                },
                'guests as pending_rsvp_count' => function ($q) {
                    $q->where('rsvp_status', 'pending');
                },
                'guests as checkins_count' => function ($q) {
                    $q->where('entries_used', '>', 0);
                },
                'messages as messages_sent_count' => function ($q) {
                    $q->where('status', '!=', 'draft');
                },
            ]);

        // If not system administrator, restrict to the user's own events
        if (!$user->isAdmin()) {
            $eventsQuery->where('user_id', $user->id);
        }

        $events = $eventsQuery->latest('event_date')
            ->get()
            ->map(function ($event) {
                $total = $event->total_guests ?: 1;
                $responded = $event->will_attend_count + $event->will_not_attend_count;
                $responseRate = $event->total_guests > 0 ? round(($responded / $event->total_guests) * 100) : 0;
                $attendanceRate = $event->total_guests > 0 ? round(($event->will_attend_count / $event->total_guests) * 100) : 0;

                $event->response_rate = $responseRate;
                $event->attendance_rate = $attendanceRate;
                return $event;
            });

        $overviewStats = [
            'total_events' => $events->count(),
            'total_guests' => $events->sum('total_guests'),
            'total_will_attend' => $events->sum('will_attend_count'),
            'total_checkins' => $events->sum('checkins_count'),
        ];

        $templates = CardTemplate::where(function ($q) use ($user) {
            if (!$user->isAdmin()) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            }
        })->get();

        $organizers = $user->isAdmin() ? \App\Models\User::whereIn('role', ['customer', 'admin'])->get(['id', 'name', 'email']) : [];

        return Inertia::render('Customer/MyEvents', [
            'events' => $events,
            'overviewStats' => $overviewStats,
            'templates' => $templates,
            'organizers' => $organizers,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function show(Request $request, Event $event)
    {
        $user = $request->user();
        if ($event->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized access to this event.');
        }

        $event->load(['cardTemplate', 'user']);

        // Query guests with search & filters
        $search = $request->input('search');
        $deliveryFilter = $request->input('delivery');
        $rsvpFilter = $request->input('rsvp');
        $categoryFilter = $request->input('category');

        $guestsQuery = $event->guests()->latest();

        if ($search) {
            $guestsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('card_number', 'like', "%{$search}%")
                  ->orWhere('unique_code', 'like', "%{$search}%");
            });
        }

        if ($deliveryFilter && $deliveryFilter !== 'all') {
            $guestsQuery->where('delivery_status', $deliveryFilter);
        }

        if ($rsvpFilter && $rsvpFilter !== 'all') {
            $guestsQuery->where('rsvp_status', $rsvpFilter);
        }

        if ($categoryFilter && $categoryFilter !== 'all') {
            $guestsQuery->where('category', $categoryFilter);
        }

        $guests = $guestsQuery->paginate(20)->withQueryString();

        // Calculate event metrics for Stat Cards (matching Figure 4.1 in UI/UX spec)
        $totalGuests = $event->guests()->count();
        $messagesSent = $event->messages()->where('status', '!=', 'draft')->count() ?: $event->guests()->whereIn('delivery_status', ['sent', 'delivered'])->count();
        $willAttendCount = $event->guests()->where('rsvp_status', 'attending')->count();
        $liveCheckins = $event->guests()->where('entries_used', '>', 0)->sum('entries_used');

        $recentScanLogs = ScanLog::where('event_id', $event->id)
            ->with('guest')
            ->latest('scanned_at')
            ->limit(10)
            ->get();

        $templates = CardTemplate::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->get();

        return Inertia::render('Customer/EventDashboard', [
            'event' => $event,
            'guests' => $guests,
            'filters' => [
                'search' => $search ?? '',
                'delivery' => $deliveryFilter ?? 'all',
                'rsvp' => $rsvpFilter ?? 'all',
                'category' => $categoryFilter ?? 'all',
            ],
            'stats' => [
                'total_guests' => $totalGuests,
                'messages_sent' => $messagesSent,
                'will_attend' => $willAttendCount,
                'live_checkins' => $liveCheckins,
                'attendance_percent' => $totalGuests > 0 ? round(($willAttendCount / $totalGuests) * 100) : 0,
            ],
            'recentScanLogs' => $recentScanLogs,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            if (!$user->canCreateEvents()) {
                return back()->with('error', 'Event creation permission is disabled for your organizer account. Please contact system administration.');
            }
            if ($user->max_events_limit && $user->events()->count() >= $user->max_events_limit) {
                return back()->with('error', "Event hosting quota limit of {$user->max_events_limit} reached for your account.");
            }
        }

        $rules = [
            'title' => 'required|string|max:255',
            'event_type' => 'required|string|max:100',
            'event_date' => 'required|date',
            'event_time' => 'nullable|string|max:100',
            'venue' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'description' => 'nullable|string',
            'card_template_id' => 'nullable|exists:card_templates,id',
        ];

        if ($user->isAdmin()) {
            $rules['user_id'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($rules);

        $validated['user_id'] = ($user->isAdmin() && !empty($validated['user_id'])) 
            ? $validated['user_id'] 
            : $user->id;
        $validated['status'] = 'active';

        $event = Event::create($validated);

        return redirect()->route('events.show', $event->id)->with('success', 'Event created successfully!');
    }

    public function update(Request $request, Event $event)
    {
        $user = $request->user();
        if ($event->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to edit this event.');
        }

        $rules = [
            'title' => 'required|string|max:255',
            'event_type' => 'required|string|max:100',
            'event_date' => 'required|date',
            'event_time' => 'nullable|string|max:100',
            'venue' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'description' => 'nullable|string',
            'card_template_id' => 'nullable|exists:card_templates,id',
            'status' => ['nullable', Rule::in(['active', 'draft', 'completed', 'cancelled'])],
        ];

        if ($user->isAdmin()) {
            $rules['user_id'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($rules);

        if (empty($validated['status'])) {
            unset($validated['status']);
        }

        $event->update($validated);

        return back()->with('success', "Event '{$event->title}' updated successfully.");
    }

    public function destroy(Request $request, Event $event)
    {
        $user = $request->user();
        if ($event->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to delete this event.');
        }

        $eventTitle = $event->title;
        $eventId = $event->id;
        $event->delete();

        $referer = $request->header('Referer', '');
        if (str_contains($referer, '/events/' . $eventId)) {
            $targetRoute = $user->isAdmin() ? 'admin.dashboard' : 'dashboard';
            return redirect()->route($targetRoute)->with('success', "Event '{$eventTitle}' deleted successfully.");
        }

        return back()->with('success', "Event '{$eventTitle}' deleted successfully.");
    }
}
