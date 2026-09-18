<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use App\Models\ScanLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScannerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Enforce gate scanner permission for customer / organizer accounts
        if (! $user->isAdmin() && ! $user->isSubAdmin() && ! $user->isScanner()) {
            if (! $user->canManageScanners() || $user->status === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your organizer account is not permitted to access the Gate Scanner. Contact platform administration.');
            }
        }

        // 1. Get events accessible to this user
        $events = Event::accessibleBy($user)->latest()->get();

        $activeEventId = $request->input('event_id');
        $activeEvent = null;
        if ($activeEventId) {
            $activeEvent = $events->firstWhere('id', (int) $activeEventId);
        }
        if (! $activeEvent) {
            $activeEvent = $events->first();
        }

        $gateLabel = $user->gate_label ?? 'Gate 1 — Main VIP Entrance';

        $stats = $activeEvent ? [
            'total_guests' => $activeEvent->guests()->count(),
            'checked_in_count' => $activeEvent->guests()->where('entries_used', '>', 0)->sum('entries_used'),
            'total_granted_scans' => ScanLog::where('event_id', $activeEvent->id)->where('status', 'granted')->count(),
            'total_rejected_scans' => ScanLog::where('event_id', $activeEvent->id)->where('status', 'rejected')->count(),
        ] : null;

        // Staff personal audit history strictly restricted to accessible events
        $allowedEventIds = $events->pluck('id');
        $myScanHistory = ScanLog::where('scanner_id', $user->id)
            ->whereIn('event_id', $allowedEventIds)
            ->with(['guest', 'event'])
            ->latest('scanned_at')
            ->take(30)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'guest_name' => $log->guest?->name ?? 'Unknown Pass',
                    'card_number' => $log->guest?->card_number ?? 'N/A',
                    'event_title' => $log->event?->title ?? 'General Event',
                    'gate_label' => $log->gate_label,
                    'scanned_at' => $log->scanned_at ? $log->scanned_at->format('h:i:s A - d M Y') : 'Recent',
                    'rejection_reason' => $log->rejection_reason,
                ];
            });

        // Provide sample guests for immediate simulated test scans
        $sampleGuests = $activeEvent ? $activeEvent->guests()->take(3)->get(['id', 'name', 'card_number', 'unique_code', 'qr_token', 'category', 'entries_used', 'max_entries']) : [];

        return Inertia::render('Scanner/ScannerApp', [
            'events' => $events,
            'activeEvent' => $activeEvent,
            'gateLabel' => $gateLabel,
            'scannerName' => $user->name,
            'stats' => $stats,
            'myScanHistory' => $myScanHistory,
            'sampleGuests' => $sampleGuests,
        ]);
    }

    public function validateScan(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isSubAdmin() && ! $user->isScanner()) {
            if (! $user->canManageScanners() || $user->status === 'suspended') {
                return response()->json([
                    'status' => 'rejected',
                    'reason' => 'Access Restricted: Your organizer account is not permitted to operate the gate scanner.',
                ], 403);
            }
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'qr_code' => 'required|string',
            'gate_label' => 'nullable|string',
            'auto_switch' => 'nullable|boolean',
        ]);

        $eventId = (int) $validated['event_id'];
        $rawCode = trim($validated['qr_code']);
        $gateLabel = $validated['gate_label'] ?? ($user->gate_label ?? 'Main Gate');
        $autoSwitch = (bool) ($validated['auto_switch'] ?? false);

        // Enforce strict event access isolation: organizers can ONLY scan passes for their own events
        if ($user->isAdmin() || $user->isSubAdmin()) {
            $isAuthorized = Event::where('id', $eventId)->exists();
        } elseif ($user->isScanner()) {
            $customerId = $user->customer_id ?? $user->id;
            $isAuthorized = Event::where('id', $eventId)->where('user_id', $customerId)->exists();
        } else {
            $isAuthorized = Event::where('id', $eventId)->where('user_id', $user->id)->exists();
        }

        if (! $isAuthorized) {
            return response()->json([
                'status' => 'rejected',
                'reason' => 'Access Denied: You do not have permission to scan passes for this event.',
            ], 403);
        }

        // Robust token normalization: handle URLs, paths, query strings, and plain codes
        $cleanToken = preg_replace('/\?.*$/', '', $rawCode);
        $cleanToken = preg_replace('/#.*$/', '', $cleanToken);
        $cleanToken = rtrim($cleanToken, '/');
        if (str_contains($cleanToken, '/card/')) {
            $parts = explode('/card/', $cleanToken);
            $cleanToken = end($parts);
        } elseif (str_contains($cleanToken, '/pass/')) {
            $parts = explode('/pass/', $cleanToken);
            $cleanToken = end($parts);
        }

        $trimmed = trim($cleanToken);
        $upper = strtoupper($trimmed);
        $lower = strtolower($trimmed);
        $alphanumeric = preg_replace('/[^a-zA-Z0-9]/', '', $trimmed);
        $digitsOnly = preg_replace('/\D/', '', $trimmed);
        $suffix6 = strlen($digitsOnly) >= 6 ? substr($digitsOnly, -6) : null;
        $suffix4 = strlen($digitsOnly) >= 4 ? substr($digitsOnly, -4) : null;

        // Reusable matching query closure
        $matchGuestClosure = function ($q) use ($trimmed, $upper, $lower, $alphanumeric, $digitsOnly, $suffix6) {
            $q->where(function ($sub) use ($trimmed, $upper, $lower, $alphanumeric, $digitsOnly, $suffix6) {
                // 1. Exact and case-insensitive matches on unique_code, card_number, qr_token
                $sub->where('unique_code', $trimmed)
                    ->orWhere('card_number', $trimmed)
                    ->orWhere('qr_token', $trimmed)
                    ->orWhere('unique_code', $upper)
                    ->orWhere('card_number', $upper)
                    ->orWhere('qr_token', $lower)
                    ->orWhere('qr_token', $upper);

                // 2. Alphanumeric matches (ignoring dashes, spaces, underscores)
                if (! empty($alphanumeric)) {
                    $sub->orWhereRaw("REPLACE(REPLACE(REPLACE(UPPER(card_number), '-', ''), ' ', ''), '_', '') = ?", [strtoupper($alphanumeric)])
                        ->orWhereRaw("REPLACE(REPLACE(REPLACE(UPPER(unique_code), '-', ''), ' ', ''), '_', '') = ?", [strtoupper($alphanumeric)])
                        ->orWhereRaw("REPLACE(REPLACE(REPLACE(LOWER(qr_token), '-', ''), ' ', ''), '_', '') = ?", [strtolower($alphanumeric)]);
                }

                // 3. Digits / suffix matches on card number or unique code
                if (! empty($digitsOnly)) {
                    if (strlen($digitsOnly) >= 6) {
                        $sub->orWhere('unique_code', $digitsOnly)
                            ->orWhere('card_number', 'LIKE', '%'.$digitsOnly);
                    }
                    if ($suffix6) {
                        $sub->orWhere('card_number', 'LIKE', '%'.$suffix6);
                    }
                    if (strlen($digitsOnly) >= 8) {
                        $sub->orWhere('unique_code', 'LIKE', '%'.$digitsOnly);
                    }
                    // 4. Phone number matching (if staff searches by attendee phone)
                    if (strlen($digitsOnly) >= 7) {
                        $sub->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', '') LIKE ?", ['%'.$digitsOnly]);
                    }
                }
            });
        };

        // Atomic transaction with pessimistic row-locking to guarantee 100% race-condition prevention across concurrent devices
        return DB::transaction(function () use ($user, $eventId, $rawCode, $gateLabel, $autoSwitch, $matchGuestClosure, $trimmed, $upper, $lower) {
            // 1. FAST PATH: Direct B-Tree indexed exact lookup (sub-millisecond hit)
            $guest = Guest::where('event_id', $eventId)
                ->where(function ($q) use ($trimmed, $upper, $lower) {
                    $q->where('qr_token', $trimmed)
                        ->orWhere('qr_token', $lower)
                        ->orWhere('qr_token', $upper)
                        ->orWhere('unique_code', $trimmed)
                        ->orWhere('unique_code', $upper)
                        ->orWhere('card_number', $trimmed)
                        ->orWhere('card_number', $upper);
                })
                ->lockForUpdate()
                ->first();

            // 2. SLOW PATH FALLBACK: If not found, try fuzzy/normalized matching
            if (! $guest) {
                $guest = Guest::where('event_id', $eventId)
                    ->tap($matchGuestClosure)
                    ->lockForUpdate()
                    ->first();
            }

            // 3. If not found in current event, search ONLY within other events owned by THIS organizer
            if (! $guest) {
                if ($user->isAdmin() || $user->isSubAdmin()) {
                    $otherEventIds = Event::where('id', '!=', $eventId)->pluck('id');
                } elseif ($user->isScanner()) {
                    $customerId = $user->customer_id ?? $user->id;
                    $otherEventIds = Event::where('user_id', $customerId)->where('id', '!=', $eventId)->pluck('id');
                } else {
                    $otherEventIds = Event::where('user_id', $user->id)->where('id', '!=', $eventId)->pluck('id');
                }

                $guestOther = null;
                if ($otherEventIds->isNotEmpty()) {
                    // Try fast-path in other events first
                    $guestOther = Guest::with('event')
                        ->whereIn('event_id', $otherEventIds)
                        ->where(function ($q) use ($trimmed, $upper, $lower) {
                            $q->where('qr_token', $trimmed)
                                ->orWhere('qr_token', $lower)
                                ->orWhere('qr_token', $upper)
                                ->orWhere('unique_code', $trimmed)
                                ->orWhere('unique_code', $upper)
                                ->orWhere('card_number', $trimmed)
                                ->orWhere('card_number', $upper);
                        })
                        ->lockForUpdate()
                        ->first();

                    if (! $guestOther) {
                        $guestOther = Guest::with('event')
                            ->whereIn('event_id', $otherEventIds)
                            ->tap($matchGuestClosure)
                            ->lockForUpdate()
                            ->first();
                    }
                }

                if (! $guestOther) {
                    $rejectionReason = 'Invalid or unrecognised pass / code';

                    ScanLog::create([
                        'event_id' => $eventId,
                        'guest_id' => null,
                        'scanner_id' => $user->id,
                        'scanner_name' => $user->name,
                        'gate_label' => $gateLabel,
                        'scanned_at' => now(),
                        'status' => 'rejected',
                        'rejection_reason' => $rejectionReason,
                        'entries_used_at_scan' => 0,
                    ]);

                    return response()->json([
                        'status' => 'rejected',
                        'reason' => $rejectionReason,
                        'code' => $rawCode,
                        'guest' => null,
                    ]);
                }

                // If autoSwitch is not requested, alert the user with the other event's details
                if (! $autoSwitch) {
                    $otherEventTitle = $guestOther->event?->title ?? 'Another Event';
                    $rejectionReason = "Pass is for '{$otherEventTitle}'";

                    ScanLog::create([
                        'event_id' => $eventId,
                        'guest_id' => $guestOther->id,
                        'scanner_id' => $user->id,
                        'scanner_name' => $user->name,
                        'gate_label' => $gateLabel,
                        'scanned_at' => now(),
                        'status' => 'rejected',
                        'rejection_reason' => $rejectionReason,
                        'entries_used_at_scan' => $guestOther->entries_used ?? 0,
                    ]);

                    return response()->json([
                        'status' => 'wrong_event',
                        'reason' => $rejectionReason,
                        'code' => $rawCode,
                        'other_event_id' => $guestOther->event_id,
                        'other_event_title' => $otherEventTitle,
                        'guest' => [
                            'id' => $guestOther->id,
                            'name' => $guestOther->name,
                            'category' => $guestOther->category,
                            'card_number' => $guestOther->card_number,
                            'unique_code' => $guestOther->unique_code,
                            'entries_used' => $guestOther->entries_used,
                            'max_entries' => $guestOther->max_entries,
                            'entries_remaining' => $guestOther->entries_remaining,
                            'allowance_label' => $guestOther->allowance_label,
                        ],
                    ]);
                }

                // If autoSwitch is true, treat $guestOther as the targeted guest
                $guest = $guestOther;
                $eventId = $guest->event_id;
            }

            // 3. Check entry allowance
            if ($guest->entries_used >= $guest->max_entries) {
                $lastScan = $guest->scanLogs()->latest()->first();
                $lastScanInfo = $lastScan
                    ? "at {$lastScan->scanned_at->format('h:i A - d M Y')} by {$lastScan->scanner_name} ({$lastScan->gate_label})"
                    : 'earlier';

                ScanLog::create([
                    'event_id' => $guest->event_id,
                    'guest_id' => $guest->id,
                    'scanner_id' => $user->id,
                    'scanner_name' => $user->name,
                    'gate_label' => $gateLabel,
                    'scanned_at' => now(),
                    'status' => 'rejected',
                    'rejection_reason' => "All entries used ({$guest->entries_used} of {$guest->max_entries})",
                    'entries_used_at_scan' => $guest->entries_used,
                ]);

                return response()->json([
                    'status' => 'rejected',
                    'reason' => "Already Checked-in ({$guest->entries_used}/{$guest->max_entries})",
                    'guest' => [
                        'id' => $guest->id,
                        'name' => $guest->name,
                        'category' => $guest->category,
                        'card_number' => $guest->card_number,
                        'unique_code' => $guest->unique_code,
                        'entries_used' => $guest->entries_used,
                        'max_entries' => $guest->max_entries,
                        'entries_remaining' => 0,
                        'allowance_label' => $guest->allowance_label,
                    ],
                ]);
            }

            // 4. Admit guest atomically
            $guest->increment('entries_used');
            $guest->refresh();

            $scanLog = ScanLog::create([
                'event_id' => $guest->event_id,
                'guest_id' => $guest->id,
                'scanner_id' => $user->id,
                'scanner_name' => $user->name,
                'gate_label' => $gateLabel,
                'scanned_at' => now(),
                'status' => 'granted',
                'rejection_reason' => null,
                'entries_used_at_scan' => $guest->entries_used,
            ]);

            return response()->json([
                'status' => 'granted',
                'message' => 'ACCESS GRANTED',
                'guest' => [
                    'id' => $guest->id,
                    'name' => $guest->name,
                    'category' => $guest->category,
                    'card_number' => $guest->card_number,
                    'unique_code' => $guest->unique_code,
                    'entries_used' => $guest->entries_used,
                    'max_entries' => $guest->max_entries,
                    'entries_remaining' => $guest->entries_remaining,
                    'allowance_label' => $guest->allowance_label,
                ],
                'event_id' => $guest->event_id,
                'event_title' => $guest->event?->title,
                'scanned_at' => $scanLog->scanned_at->format('h:i:s A - d M Y'),
                'gate_label' => $gateLabel,
            ]);
        });
    }
}
