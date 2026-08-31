<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScanLog extends Model
{
    protected $fillable = [
        'event_id',
        'guest_id',
        'scanner_id',
        'scanner_name',
        'gate_label',
        'scanned_at',
        'status',
        'rejection_reason',
        'entries_used_at_scan',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'entries_used_at_scan' => 'integer',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function scanner()
    {
        return $this->belongsTo(User::class, 'scanner_id');
    }
}
