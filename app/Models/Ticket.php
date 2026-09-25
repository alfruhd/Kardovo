<?php

namespace App\Models;

use App\Services\PhoneNormalizer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_order_id',
        'event_id',
        'ticket_tier_id',
        'ticket_number',
        'unique_code',
        'qr_token',
        'attendee_name',
        'attendee_phone',
        'attendee_email',
        'price_paid',
        'currency',
        'status',
        'checked_in_at',
        'checked_in_by',
        'gate_label',
        'delivery_channels',
    ];

    protected $casts = [
        'price_paid' => 'decimal:2',
        'checked_in_at' => 'datetime',
        'delivery_channels' => 'array',
    ];

    protected $appends = [
        'formatted_price',
        'is_checked_in',
        'pass_url',
    ];

    protected static function booted()
    {
        static::saving(function ($ticket) {
            if (! empty($ticket->attendee_phone)) {
                $ticket->attendee_phone = PhoneNormalizer::cleanForApi($ticket->attendee_phone);
            }
        });

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber();
            }
            if (empty($ticket->unique_code)) {
                $ticket->unique_code = static::generateUniqueCode();
            }
            if (empty($ticket->qr_token)) {
                $ticket->qr_token = Str::random(32);
            }
        });
    }

    public static function generateTicketNumber(): string
    {
        return 'TK-'.str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function generateUniqueCode(): string
    {
        return (string) random_int(10000000, 99999999);
    }

    public function ticketOrder()
    {
        return $this->belongsTo(TicketOrder::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketTier()
    {
        return $this->belongsTo(TicketTier::class);
    }

    public function checkedInByUser()
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function scanLogs()
    {
        return $this->hasMany(ScanLog::class)->latest('scanned_at');
    }

    public function getIsCheckedInAttribute(): bool
    {
        return $this->status === 'checked_in';
    }

    public function getFormattedPriceAttribute(): string
    {
        if ((float) $this->price_paid <= 0) {
            return 'Free';
        }

        return number_format((float) $this->price_paid, 0).' '.($this->currency ?? 'TZS');
    }

    public function getPassUrlAttribute(): string
    {
        return url('/t/'.$this->ticket_number);
    }

    public function markCheckedIn(?int $scannerId = null, string $gateLabel = 'Main Gate'): bool
    {
        if ($this->status === 'checked_in') {
            return false;
        }

        $this->status = 'checked_in';
        $this->checked_in_at = now();
        $this->checked_in_by = $scannerId;
        $this->gate_label = $gateLabel;
        $this->save();

        return true;
    }
}
