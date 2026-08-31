<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Event;
use App\Models\CardTemplate;
use App\Models\Guest;
use App\Models\ScanLog;
use App\Models\User;
use App\Models\SystemSetting;
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

        // Customer "My Events" Portfolio View (matching Figure 4.2 in UI/UX Design doc)
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

        $overviewStats = [
            'total_events' => $events->count(),
            'total_guests' => $events->sum('total_guests'),
            'total_will_attend' => $events->sum('will_attend_count'),
            'total_checkins' => $events->sum('checkins_count'),
        ];

        $templates = CardTemplate::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->get();

        return Inertia::render('Customer/MyEvents', [
            'events' => $events,
            'overviewStats' => $overviewStats,
            'templates' => $templates,
        ]);
    }
}
