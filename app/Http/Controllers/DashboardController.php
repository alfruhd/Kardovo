<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\ScanLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isScanner()) {
            return redirect()->route('scanner.index');
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // Customer Portfolio View & Executive Telemetry
        $events = Event::where('user_id', $user->id)
            ->with(['cardTemplate'])
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
            ])
            ->latest('event_date')
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

        $totalGuests = $events->sum('total_guests');
        $totalWillAttend = $events->sum('will_attend_count');
        $totalCheckins = $events->sum('checkins_count');

        $overviewStats = [
            'total_events' => $events->count(),
            'active_events' => $events->where('status', 'active')->count(),
            'total_guests' => $totalGuests,
            'total_will_attend' => $totalWillAttend,
            'total_will_not_attend' => $events->sum('will_not_attend_count'),
            'total_pending_rsvp' => $events->sum('pending_rsvp_count'),
            'total_checkins' => $totalCheckins,
            'total_messages' => $events->sum('messages_sent_count'),
            'overall_attendance_rate' => $totalGuests > 0 ? round(($totalWillAttend / $totalGuests) * 100) : 0,
            'overall_checkin_rate' => $totalGuests > 0 ? round(($totalCheckins / $totalGuests) * 100) : 0,
        ];

        $eventIds = $events->pluck('id');

        $recentScanLogs = ScanLog::whereIn('event_id', $eventIds)
            ->with(['guest', 'event', 'scanner'])
            ->latest()
            ->take(8)
            ->get();

        $recentGuests = Guest::whereIn('event_id', $eventIds)
            ->with('event')
            ->latest()
            ->take(6)
            ->get();

        $templates = CardTemplate::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->get();

        return Inertia::render('Customer/Dashboard', [
            'events' => $events,
            'overviewStats' => $overviewStats,
            'recentScanLogs' => $recentScanLogs,
            'recentGuests' => $recentGuests,
            'templates' => $templates,
        ]);
    }
}
