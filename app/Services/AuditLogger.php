<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Log a specific action to the audit_logs table.
     */
    public static function log(
        string $action,
        ?string $resourceType = null,
        ?string $resourceId = null,
        ?array $details = null,
        string $outcome = 'success',
        ?int $userId = null
    ): void {
        AuditLog::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'outcome' => $outcome,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'details' => $details,
        ]);
    }
}
