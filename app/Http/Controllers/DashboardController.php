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

        if ($user->isAdmin() || $user->isSubAdmin()) {
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
                'tickets as total_tickets_sold',
                'tickets as checked_in_tickets_count' => function ($q) {
                    $q->whereNotNull('checked_in_at');
                },
                'ticketOrders as paid_orders_count' => function ($q) {
                    $q->where('payment_status', 'paid');
                },
            ])
            ->withSum(['tickets as total_ticket_revenue' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }], 'price_paid')
            ->latest('event_date')
            ->get()
            ->map(function ($event) {
                if ($event->is_occasion) {
                    $sold = (int) ($event->total_tickets_sold ?? 0);
                    $checkedIn = (int) ($event->checked_in_tickets_count ?? 0);
                    $event->checkin_rate = $sold > 0 ? round(($checkedIn / $sold) * 100) : 0;
                    $event->total_revenue = (float) ($event->total_ticket_revenue ?? 0);
                    $event->attendees_count = $sold;
                } else {
                    $total = (int) ($event->total_guests ?? 0);
                    $responded = (int) ($event->will_attend_count ?? 0) + (int) ($event->will_not_attend_count ?? 0);
                    $responseRate = $total > 0 ? round(($responded / $total) * 100) : 0;
                    $attendanceRate = $total > 0 ? round(((int) ($event->will_attend_count ?? 0) / $total) * 100) : 0;
                    $checkins = (int) ($event->checkins_count ?? 0);

                    $event->response_rate = $responseRate;
                    $event->attendance_rate = $attendanceRate;
                    $event->checkin_rate = $total > 0 ? round(($checkins / $total) * 100) : 0;
                    $event->attendees_count = $total;
                }

                return $event;
            });

        $invitationEvents = $events->where('is_occasion', false);
        $occasionEvents = $events->where('is_occasion', true);

        $totalGuests = (int) $invitationEvents->sum('total_guests');
        $totalWillAttend = (int) $invitationEvents->sum('will_attend_count');
        $totalInvitationCheckins = (int) $invitationEvents->sum('checkins_count');

        $totalTicketsSold = (int) $occasionEvents->sum('total_tickets_sold');
        $totalTicketRevenue = (float) $occasionEvents->sum('total_ticket_revenue');
        $totalTicketCheckins = (int) $occasionEvents->sum('checked_in_tickets_count');

        $totalAttendees = $totalGuests + $totalTicketsSold;
        $totalCombinedCheckins = $totalInvitationCheckins + $totalTicketCheckins;

        $overviewStats = [
            'total_events' => $events->count(),
            'active_events' => $events->where('status', 'active')->count(),
            'invitation_events_count' => $invitationEvents->count(),
            'occasion_events_count' => $occasionEvents->count(),

            // Invitation metrics
            'total_guests' => $totalGuests,
            'total_will_attend' => $totalWillAttend,
            'total_will_not_attend' => (int) $invitationEvents->sum('will_not_attend_count'),
            'total_pending_rsvp' => (int) $invitationEvents->sum('pending_rsvp_count'),
            'total_invitation_checkins' => $totalInvitationCheckins,
            'total_messages' => (int) $events->sum('messages_sent_count'),
            'overall_attendance_rate' => $totalGuests > 0 ? round(($totalWillAttend / $totalGuests) * 100) : 0,

            // Ticketing metrics
            'total_tickets_sold' => $totalTicketsSold,
            'total_ticket_revenue' => $totalTicketRevenue,
            'total_ticket_checkins' => $totalTicketCheckins,
            'ticket_checkin_rate' => $totalTicketsSold > 0 ? round(($totalTicketCheckins / $totalTicketsSold) * 100) : 0,

            // Global Telemetry
            'total_attendees' => $totalAttendees,
            'total_checkins' => $totalCombinedCheckins,
            'overall_checkin_rate' => $totalAttendees > 0 ? round(($totalCombinedCheckins / $totalAttendees) * 100) : 0,
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
