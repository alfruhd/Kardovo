<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosTerminalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'request_number',
        'terminals_count',
        'required_from_date',
        'required_to_date',
        'venue_location',
        'contact_name',
        'contact_phone',
        'contact_email',
        'status',
        'notes',
    ];

    protected $casts = [
        'terminals_count' => 'integer',
        'required_from_date' => 'date',
        'required_to_date' => 'date',
    ];

    protected $appends = [
        'status_label',
    ];

    protected static function booted()
    {
        static::creating(function ($req) {
            if (empty($req->request_number)) {
                $req->request_number = static::generateRequestNumber();
            }
        });
    }

    public static function generateRequestNumber(): string
    {
        return 'POS-'.date('ymd').'-'.strtoupper(bin2hex(random_bytes(3)));
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Approval',
            'approved' => 'Approved & Preparing Hardware',
            'dispatched' => 'Hardware Dispatched',
            'active' => 'Active at Venue',
            'returned' => 'Returned',
            'rejected' => 'Rejected',
            default => ucfirst($this->status),
        };
    }
}
