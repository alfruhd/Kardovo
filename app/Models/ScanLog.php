<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScanLog extends Model
{
    protected $fillable = [
        'event_id',
        'guest_id',
        'ticket_id',
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

    protected $appends = [
        'guest_name',
        'attendee_name',
    ];

    public function getGuestNameAttribute(): ?string
    {
        return $this->guest?->name ?? $this->ticket?->attendee_name;
    }

    public function getAttendeeNameAttribute(): ?string
    {
        return $this->ticket?->attendee_name ?? $this->guest?->name;
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function scanner()
    {
        return $this->belongsTo(User::class, 'scanner_id');
    }
}
