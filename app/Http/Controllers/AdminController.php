<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\ScanLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isSubAdmin()) {
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
        if (!$user->isAdmin()) {
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

    public function storeCustomer(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|in:customer,sub_admin,admin,scanner',
            'status' => 'nullable|string|in:active,suspended',
            'permissions' => 'nullable|array',
            'max_events_limit' => 'nullable|integer|min:1',
            'max_whatsapp_limit' => 'nullable|integer|min:0',
            'max_sms_limit' => 'nullable|integer|min:0',
            'suspension_reason' => 'nullable|string|max:255',
        ]);

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
        if (!$user->isAdmin()) {
            abort(403, 'Admin access required.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $customer->id,
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:customer,sub_admin,admin,scanner',
            'status' => 'nullable|string|in:active,suspended',
            'permissions' => 'nullable|array',
            'max_events_limit' => 'nullable|integer|min:1',
            'max_whatsapp_limit' => 'nullable|integer|min:0',
            'max_sms_limit' => 'nullable|integer|min:0',
            'suspension_reason' => 'nullable|string|max:255',
        ]);

        // Prevent self-demotion or self-suspension of current Super Admin
        if ($customer->id === $user->id) {
            $validated['role'] = 'admin';
            $validated['status'] = 'active';
        }

        if (isset($validated['permissions'])) {
            $validated['permissions'] = array_merge(User::defaultPermissions(), $validated['permissions']);
        }

        if (array_key_exists('max_whatsapp_limit', $validated)) {
            $validated['max_whatsapp_limit'] = ($validated['max_whatsapp_limit'] !== '' && !is_null($validated['max_whatsapp_limit'])) ? (int) $validated['max_whatsapp_limit'] : null;
        }

        if (array_key_exists('max_sms_limit', $validated)) {
            $validated['max_sms_limit'] = ($validated['max_sms_limit'] !== '' && !is_null($validated['max_sms_limit'])) ? (int) $validated['max_sms_limit'] : null;
        }

        if (array_key_exists('max_events_limit', $validated)) {
            $validated['max_events_limit'] = ($validated['max_events_limit'] !== '' && !is_null($validated['max_events_limit'])) ? (int) $validated['max_events_limit'] : null;
        }

        if (!empty($validated['password'])) {
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
        if (!$user->isAdmin()) {
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
        if (!$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'gate_label' => 'required|string|max:255',
            'customer_id' => 'nullable|exists:users,id',
            'password' => 'required|string|min:6',
        ]);

        $validated['role'] = 'scanner';
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return back()->with('success', 'Gate staff account created successfully.');
    }

    public function updateScanner(Request $request, User $scanner)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $scanner->id,
            'phone' => 'nullable|string|max:50',
            'gate_label' => 'required|string|max:255',
            'customer_id' => 'nullable|exists:users,id',
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['password'])) {
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
        if (!$user->isAdmin()) {
            abort(403);
        }

        $scannerName = $scanner->name;
        $scanner->delete();

        return back()->with('success', "Gate staff account '{$scannerName}' deleted successfully.");
    }

    public function storeSubAdmin(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403, 'Super Administrator access required.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string|min:6',
            'organizer_ids' => 'nullable|array',
            'organizer_ids.*' => 'exists:users,id',
            'event_ids' => 'nullable|array',
            'event_ids.*' => 'exists:events,id',
        ]);

        $subAdmin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'sub_admin',
        ]);

        if (!empty($validated['organizer_ids'])) {
            $subAdmin->assignedOrganizers()->sync($validated['organizer_ids']);
        }
        if (!empty($validated['event_ids'])) {
            $subAdmin->assignedEvents()->sync($validated['event_ids']);
        }

        return back()->with('success', 'Sub Administrator account created and assigned successfully.');
    }

    public function updateSubAdmin(Request $request, User $subAdmin)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403, 'Super Administrator access required.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $subAdmin->id,
            'phone' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6',
            'organizer_ids' => 'nullable|array',
            'organizer_ids.*' => 'exists:users,id',
            'event_ids' => 'nullable|array',
            'event_ids.*' => 'exists:events,id',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ];

        if (!empty($validated['password'])) {
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
        if (!$user->isAdmin()) {
            abort(403, 'Super Administrator access required.');
        }

        if ($subAdmin->role === 'sub_admin') {
            $subAdmin->assignedOrganizers()->detach();
            $subAdmin->assignedEvents()->detach();
            $subAdmin->delete();
        }

        return back()->with('success', 'Sub Administrator permanently deleted.');
    }
}
