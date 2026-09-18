<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Restrict to Admin/SubAdmin
        if (! $user->isAdmin() && ! $user->isSubAdmin()) {
            abort(403, 'Unauthorized access to Audit Logs.');
        }

        $query = AuditLog::with('user:id,name,email,role')
            ->orderBy('created_at', 'desc');

        if ($request->filled('action_type')) {
            $query->where('action', $request->action_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate(50)->withQueryString();

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs,
            'filters' => $request->only(['action_type', 'user_id']),
        ]);
    }
}
