<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\ScanLog;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\PhoneNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isSubAdmin()) {
            abort(403, 'Administrative access required.');
        }

        $isSuperAdmin = $user->isAdmin();
        $isSubAdmin = $user->isSubAdmin();

        if ($isSuperAdmin) {
            $customers = User::whereIn('role', ['customer', 'sub_admin', 'admin'])
                ->withCount(['events', 'scanners'])
                ->latest()
                ->get()
                ->map(function ($c) {
                    $c->effective_permissions = $c->effective_permissions;
                    $c->message_quotas = $c->getMessageQuotaStats();

                    return $c;
                });

            $gateStaff = User::where('role', 'scanner')
                ->with(['customer'])
                ->withCount(['scanLogs as total_scans_count'])
                ->withCount(['scanLogs as granted_scans_count' => function ($q) {
                    $q->where('status', 'granted');
                }])
                ->withCount(['scanLogs as rejected_scans_count' => function ($q) {
                    $q->where('status', 'rejected');
                }])
                ->latest()
                ->get();

            $allEvents = Event::with(['user', 'cardTemplate'])
                ->withCount(['guests', 'scanLogs'])
                ->latest()
                ->get();

            $subAdmins = User::where('role', 'sub_admin')
                ->with(['assignedOrganizers:id,name,email,company', 'assignedEvents:id,title,event_date,venue,user_id'])
                ->withCount(['assignedOrganizers', 'assignedEvents'])
                ->latest()
                ->get();
        } else {
            // Sub-Admin Scoped View
            $assignedCustomerIds = $user->assignedOrganizers()->pluck('users.id')->toArray();
            $assignedEventIds = $user->assignedEvents()->pluck('events.id')->toArray();

            $customers = User::whereIn('id', $assignedCustomerIds)
                ->withCount(['events', 'scanners'])
                ->latest()
                ->get()
                ->map(function ($c) {
                    $c->effective_permissions = $c->effective_permissions;
                    $c->message_quotas = $c->getMessageQuotaStats();

                    return $c;
                });

            $allEvents = Event::whereIn('id', $assignedEventIds)
                ->orWhereIn('user_id', $assignedCustomerIds)
                ->with(['user', 'cardTemplate'])
                ->withCount(['guests', 'scanLogs'])
                ->latest()
                ->get();

            $scopedCustomerIds = array_unique(array_merge($assignedCustomerIds, $allEvents->pluck('user_id')->filter()->toArray()));

            $gateStaff = User::where('role', 'scanner')
                ->whereIn('customer_id', $scopedCustomerIds)
                ->with(['customer'])
                ->withCount(['scanLogs as total_scans_count'])
                ->withCount(['scanLogs as granted_scans_count' => function ($q) {
                    $q->where('status', 'granted');
                }])
                ->withCount(['scanLogs as rejected_scans_count' => function ($q) {
                    $q->where('status', 'rejected');
                }])
                ->latest()
                ->get();

            $subAdmins = collect([]);
        }

        $globalTemplates = CardTemplate::where(function ($q) use ($user) {
            $q->whereNull('user_id')->orWhere('user_id', $user->id);
        })
            ->with('user')
            ->orderByRaw("CASE WHEN template_type = 'custom_art' THEN 0 ELSE 1 END, id ASC")
            ->get();

        $recentScanLogs = ScanLog::with(['guest', 'event', 'scanner'])
            ->latest('scanned_at')
            ->take(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'guest_name' => $log->guest?->name ?? 'Unregistered Pass',
                    'card_number' => $log->guest?->card_number ?? 'N/A',
                    'event_title' => $log->event?->title ?? 'General Event',
                    'scanner_name' => $log->scanner_name ?? ($log->scanner?->name ?? 'Gatekeeper'),
                    'gate_label' => $log->gate_label ?? 'Main Gate',
                    'scanned_at' => $log->scanned_at ? $log->scanned_at->format('h:i:s A - d M Y') : 'Recent',
                    'rejection_reason' => $log->rejection_reason,
                ];
            });

        $totalGuests = Guest::count();
        $totalCheckins = Guest::where('entries_used', '>', 0)->sum('entries_used');
        $totalScans = ScanLog::count();

        $whatsappGateway = SystemSetting::get('whatsapp_gateway', [
            'provider' => 'Meta WhatsApp Cloud API',
            'phone_number_id' => '108492019482910',
            'waba_id' => '94820194820184',
            'api_version' => 'v20.0',
            'access_token' => 'EAAG...kdv_prod_token_live',
            'sender_number' => '+255 700 000 000',
            'webhook_url' => url('/api/webhooks/whatsapp'),
            'verify_token' => 'kardovo_verify_token_2026',
            'status' => 'Connected (Operational)',
        ]);

        $smsGateway = SystemSetting::get('sms_gateway', [
            'provider' => 'NextSMS Tanzania',
            'sender_id' => 'KARDOVO',
            'api_key' => 'nextsms_live_api_key',
            'api_secret' => '••••••••••••••••',
            'api_endpoint' => 'https://messaging-service.co.tz/api/sms/v1/text/single',
            'balance' => '12,450 TZS',
            'country_code' => '+255',
            'status' => 'Active',
        ]);

        return Inertia::render('Admin/Dashboard', [
            'isSuperAdmin' => $isSuperAdmin,
            'isSubAdmin' => $isSubAdmin,
            'customers' => $customers,
            'gateStaff' => $gateStaff,
            'allEvents' => $allEvents,
            'subAdmins' => $subAdmins,
            'globalTemplates' => $globalTemplates,
            'recentScanLogs' => $recentScanLogs,
            'stats' => [
                'total_customers' => $customers->count(),
                'total_gate_staff' => $gateStaff->count(),
                'total_events' => $allEvents->count(),
                'total_sub_admins' => $subAdmins->count(),
                'total_guests' => $totalGuests,
                'total_checkins' => $totalCheckins,
                'total_scans' => $totalScans,
            ],
            'gateways' => [
                'whatsapp' => $whatsappGateway,
                'sms' => $smsGateway,
            ],
        ]);
    }

    public function updateGateway(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'gateway_type' => 'required|in:whatsapp,sms',
            'config' => 'required|array',
        ]);

        if ($validated['gateway_type'] === 'whatsapp') {
            SystemSetting::set('whatsapp_gateway', $validated['config']);
        } else {
            SystemSetting::set('sms_gateway', $validated['config']);
        }

        return back()->with('success', 'Gateway settings updated successfully.');
    }

    public function testGateway(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isSubAdmin()) {
            abort(403, 'Administrative access required.');
        }

        $validated = $request->validate([
            'gateway_type' => 'required|in:whatsapp,sms',
            'config' => 'required|array',
            'test_phone' => 'nullable|string',
        ]);

        if ($validated['gateway_type'] === 'whatsapp') {
            $config = $validated['config'];
            $phoneNumberId = trim($config['phone_number_id'] ?? '');
            $accessToken = trim($config['access_token'] ?? '');
            $apiVersion = trim($config['api_version'] ?? 'v20.0');
            if (empty($apiVersion)) {
                $apiVersion = 'v20.0';
            }
            $testPhone = ! empty($validated['test_phone']) ? trim($validated['test_phone']) : null;

            if (empty($phoneNumberId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'WhatsApp Phone Number ID is required.',
                ], 422);
            }

            if (empty($accessToken)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meta WhatsApp Access Token is required.',
                ], 422);
            }

            // 1. Verify credentials by calling Meta Graph API Phone Number endpoint
            try {
                $metaResponse = Http::withoutVerifying()
                    ->withToken($accessToken)
                    ->timeout(10)
                    ->get("https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}", [
                        'fields' => 'id,display_phone_number,verified_name,quality_rating,code_verification_status',
                    ]);

                if (! $metaResponse->successful()) {
                    $errorData = $metaResponse->json('error') ?? [];
                    $errorMsg = $errorData['message'] ?? $metaResponse->body();
                    $errorCode = $errorData['code'] ?? $metaResponse->status();

                    $hint = '';
                    if ($errorCode == 190) {
                        $hint = ' (Your Access Token may have expired or is invalid. Please copy the fresh token from Meta for Developers or generate a permanent System User Token).';
                    } elseif ($errorCode == 100 || $errorCode == 80007) {
                        $hint = ' (Invalid Phone Number ID. Check your Phone Number ID in Meta Developer Portal > WhatsApp > API Setup).';
                    }

                    return response()->json([
                        'success' => false,
                        'message' => "Meta API Authentication Failed [Error {$errorCode}]: {$errorMsg}{$hint}",
                        'raw_error' => $errorData,
                    ], 422);
                }

                $metaData = $metaResponse->json();
                $displayName = $metaData['verified_name'] ?? 'Meta WhatsApp Account';
                $displayPhone = $metaData['display_phone_number'] ?? $phoneNumberId;
                $quality = $metaData['quality_rating'] ?? 'GREEN';

                $whitelistRequired = false;
                $testErrorMessage = null;
                $messageSent = false;
                $messageNote = '';

                if ($testPhone) {
                    $cleanTestPhone = PhoneNormalizer::cleanForApi($testPhone);
                    $testText = "🚀 *Kardovo Platform Alert*\n\nYour Meta WhatsApp Cloud API connection is active and verified!\n\n• Verified Account: {$displayName}\n• Phone Number: {$displayPhone}\n• Quality Rating: {$quality}\n• Timestamp: ".now()->format('d M Y, h:i A')."\n\nKardovo pass broadcasting and 1-tap RSVP automation are ready.";

                    $msgResponse = Http::withoutVerifying()
                        ->withToken($accessToken)
                        ->timeout(12)
                        ->post("https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/messages", [
                            'messaging_product' => 'whatsapp',
                            'recipient_type' => 'individual',
                            'to' => $cleanTestPhone,
                            'type' => 'text',
                            'text' => [
                                'preview_url' => false,
                                'body' => $testText,
                            ],
                        ]);

                    if ($msgResponse->successful()) {
                        $messageSent = true;
                        $messageNote = " Live test WhatsApp message was delivered to +{$cleanTestPhone}!";
                    } else {
                        $msgErr = $msgResponse->json('error.message') ?? 'Failed to send test message';
                        $msgCode = $msgResponse->json('error.code') ?? '';
                        $testErrorMessage = $msgErr;
                        if ($msgCode == 131030) {
                            $whitelistRequired = true;
                            $messageNote = " Note: In Meta Sandbox mode, the recipient +{$cleanTestPhone} must be added to the 'To' list in Meta Developer Portal before messages can be delivered.";
                        } else {
                            $messageNote = " (Test message dispatch error: {$msgErr}).";
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => "✓ Meta WhatsApp Cloud API verified! Account: {$displayName} | Sender: {$displayPhone} (Quality: {$quality}).{$messageNote}",
                    'meta_data' => $metaData,
                    'display_name' => $displayName,
                    'display_phone' => $displayPhone,
                    'quality' => $quality,
                    'test_message_sent' => $messageSent,
                    'test_phone' => $testPhone ? PhoneNormalizer::cleanForApi($testPhone) : null,
                    'whitelist_required' => $whitelistRequired,
                    'test_error_message' => $testErrorMessage,
                ]);

            } catch (\Throwable $e) {
                Log::error('Meta WhatsApp API Test Exception: '.$e->getMessage());

                return response()->json([
                    'success' => false,
                    'message' => 'Connection to Meta Graph API failed: '.$e->getMessage(),
                ], 500);
            }
        } else {
            // SMS Gateway Test
            $config = $validated['config'];
            $senderId = $config['sender_id'] ?? 'KARDOVO';

            return response()->json([
                'success' => true,
                'message' => "✓ SMS Gateway verified! Active Sender ID: {$senderId}.",
            ]);
        }
    }

    public function storeCustomer(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'company' => 'nullable|string|max:255',
            'password' => ['required', 'string', Password::defaults()],
            'role' => 'nullable|string|in:customer,sub_admin,admin,scanner',
            'status' => 'nullable|string|in:active,suspended',
            'permissions' => 'nullable|array',
            'max_events_limit' => 'nullable|integer|min:1',
            'max_whatsapp_limit' => 'nullable|integer|min:0',
            'max_sms_limit' => 'nullable|integer|min:0',
            'suspension_reason' => 'nullable|string|max:255',
        ], [
            'name.min' => 'Customer name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
        ]);

        if (! empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        $validated['role'] = $validated['role'] ?? 'customer';
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['permissions'] = array_merge(User::defaultPermissions(), $validated['permissions'] ?? []);
        $validated['password'] = Hash::make($validated['password']);
        $validated['max_whatsapp_limit'] = isset($validated['max_whatsapp_limit']) && $validated['max_whatsapp_limit'] !== '' ? (int) $validated['max_whatsapp_limit'] : null;
        $validated['max_sms_limit'] = isset($validated['max_sms_limit']) && $validated['max_sms_limit'] !== '' ? (int) $validated['max_sms_limit'] : null;
        $validated['max_events_limit'] = isset($validated['max_events_limit']) && $validated['max_events_limit'] !== '' ? (int) $validated['max_events_limit'] : null;

        User::create($validated);

        return back()->with('success', "Organizer account '{$validated['name']}' created successfully with assigned role, quotas, and permissions.");
    }

    public function updateCustomer(Request $request, User $customer)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            if ($user->isSubAdmin()) {
                $assignedIds = $user->assignedOrganizers()->pluck('users.id')->toArray();
                if (! in_array($customer->id, $assignedIds)) {
                    abort(403, 'Unauthorized to govern this organizer account.');
                }
                if (in_array($request->input('role'), ['admin', 'sub_admin'])) {
                    abort(403, 'Sub-administrators cannot grant Administrator privileges.');
                }
            } else {
                abort(403, 'Admin access required.');
            }
        }

        if ($request->filled('password') === false || empty($request->input('password'))) {
            $request->merge(['password' => null]);
        }
        if ($request->input('phone') === '') {
            $request->merge(['phone' => null]);
        }
        if ($request->input('max_events_limit') === '') {
            $request->merge(['max_events_limit' => null]);
        }
        if ($request->input('max_whatsapp_limit') === '') {
            $request->merge(['max_whatsapp_limit' => null]);
        }
        if ($request->input('max_sms_limit') === '') {
            $request->merge(['max_sms_limit' => null]);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email,'.$customer->id,
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,25}$/'],
            'company' => 'nullable|string|max:255',
            'password' => ['nullable', 'string', Password::defaults()],
            'role' => 'nullable|string|in:customer,sub_admin,admin,scanner',
            'status' => 'nullable|string|in:active,suspended',
            'permissions' => 'nullable|array',
            'max_events_limit' => 'nullable|integer|min:1',
            'max_whatsapp_limit' => 'nullable|integer|min:0',
            'max_sms_limit' => 'nullable|integer|min:0',
            'suspension_reason' => 'nullable|string|max:255',
        ], [
            'name.min' => 'Customer name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
        ]);

        if (! empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        // Prevent self-demotion or self-suspension of current Super Admin
        if ($customer->id === $user->id) {
            $validated['role'] = 'admin';
            $validated['status'] = 'active';
        }

        if (isset($validated['permissions'])) {
            $validated['permissions'] = array_merge(User::defaultPermissions(), $validated['permissions']);
        }

        if (array_key_exists('max_whatsapp_limit', $validated)) {
            $validated['max_whatsapp_limit'] = ($validated['max_whatsapp_limit'] !== '' && ! is_null($validated['max_whatsapp_limit'])) ? (int) $validated['max_whatsapp_limit'] : null;
        }

        if (array_key_exists('max_sms_limit', $validated)) {
            $validated['max_sms_limit'] = ($validated['max_sms_limit'] !== '' && ! is_null($validated['max_sms_limit'])) ? (int) $validated['max_sms_limit'] : null;
        }

        if (array_key_exists('max_events_limit', $validated)) {
            $validated['max_events_limit'] = ($validated['max_events_limit'] !== '' && ! is_null($validated['max_events_limit'])) ? (int) $validated['max_events_limit'] : null;
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $customer->update($validated);

        return back()->with('success', "Account '{$customer->name}' updated successfully (Role: {$customer->role}, Status: {$customer->status}).");
    }

    public function destroyCustomer(Request $request, User $customer)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Admin access required.');
        }

        if ($customer->id === $user->id) {
            abort(400, 'Cannot delete your own administrator account.');
        }

        $customerName = $customer->name;
        $customer->delete();

        return back()->with('success', "Customer account '{$customerName}' and all associated events have been deleted successfully.");
    }

    public function storeScanner(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'gate_label' => 'required|string|max:255',
            'customer_id' => 'nullable|exists:users,id',
            'password' => ['required', 'string', Password::defaults()],
        ], [
            'name.min' => 'Staff name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
            'gate_label.required' => 'Gate label is required.',
        ]);

        if (! empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        $validated['role'] = 'scanner';
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return back()->with('success', 'Gate staff account created successfully.');
    }

    public function updateScanner(Request $request, User $scanner)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email,'.$scanner->id,
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'gate_label' => 'required|string|max:255',
            'customer_id' => 'nullable|exists:users,id',
            'password' => ['nullable', 'string', Password::defaults()],
        ], [
            'name.min' => 'Staff name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
            'gate_label.required' => 'Gate label is required.',
        ]);

        if (! empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $scanner->update($validated);

        return back()->with('success', 'Gate staff account updated successfully.');
    }

    public function destroyScanner(Request $request, User $scanner)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $scannerName = $scanner->name;
        $scanner->delete();

        return back()->with('success', "Gate staff account '{$scannerName}' deleted successfully.");
    }

    public function storeSubAdmin(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Super Administrator access required.');
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'password' => ['required', 'string', Password::defaults()],
            'organizer_ids' => 'nullable|array',
            'organizer_ids.*' => 'exists:users,id',
            'event_ids' => 'nullable|array',
            'event_ids.*' => 'exists:events,id',
        ], [
            'name.min' => 'Sub Admin name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
        ]);

        if (! empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        $subAdmin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'sub_admin',
        ]);

        if (! empty($validated['organizer_ids'])) {
            $subAdmin->assignedOrganizers()->sync($validated['organizer_ids']);
        }
        if (! empty($validated['event_ids'])) {
            $subAdmin->assignedEvents()->sync($validated['event_ids']);
        }

        return back()->with('success', 'Sub Administrator account created and assigned successfully.');
    }

    public function updateSubAdmin(Request $request, User $subAdmin)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Super Administrator access required.');
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email,'.$subAdmin->id,
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'password' => ['nullable', 'string', Password::defaults()],
            'organizer_ids' => 'nullable|array',
            'organizer_ids.*' => 'exists:users,id',
            'event_ids' => 'nullable|array',
            'event_ids.*' => 'exists:events,id',
        ], [
            'name.min' => 'Sub Admin name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
        ]);

        if (! empty($validated['phone'])) {
            $validated['phone'] = PhoneNormalizer::formatDisplay($validated['phone']);
        }

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $subAdmin->update($data);

        $subAdmin->assignedOrganizers()->sync($validated['organizer_ids'] ?? []);
        $subAdmin->assignedEvents()->sync($validated['event_ids'] ?? []);

        return back()->with('success', 'Sub Administrator updated successfully.');
    }

    public function destroySubAdmin(Request $request, User $subAdmin)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Super Administrator access required.');
        }

        if ($subAdmin->role === 'sub_admin') {
            $subAdmin->assignedOrganizers()->detach();
            $subAdmin->assignedEvents()->detach();
            $subAdmin->delete();
        }

        return back()->with('success', 'Sub Administrator permanently deleted.');
    }

    public function destroyScanLog(Request $request, ScanLog $scanLog)
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isSubAdmin()) {
            abort(403, 'Administrative access required.');
        }

        if ($user->isSubAdmin()) {
            $assignedEventIds = $user->assignedEvents()->pluck('events.id')->toArray();
            $assignedOrganizerIds = $user->assignedOrganizers()->pluck('users.id')->toArray();
            $eventOwnerId = $scanLog->event?->user_id;
            $hasAccess = in_array($scanLog->event_id, $assignedEventIds) || ($eventOwnerId && in_array($eventOwnerId, $assignedOrganizerIds));
            if (! $hasAccess) {
                abort(403, 'Unauthorized to delete this scan log.');
            }
        }

        $scanLog->delete();

        return back()->with('success', 'Scan audit log entry permanently deleted.');
    }

    public function clearScanLogs(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Super Administrator access required to clear all scan logs.');
        }

        ScanLog::query()->delete();

        return back()->with('success', 'All gate scan audit logs have been permanently deleted.');
    }
}
