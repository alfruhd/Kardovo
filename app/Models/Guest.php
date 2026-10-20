<?php

namespace App\Models;

use App\Services\PhoneNormalizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Guest extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'phone',
        'email',
        'category',
        'max_entries',
        'entries_used',
        'card_number',
        'unique_code',
        'qr_token',
        'delivery_status',
        'rsvp_status',
        'rsvp_at',
        'notes',
        'custom_fields',
        'pledge_amount',
        'paid_amount',
        'pledge_status',
        'pledge_deadline',
    ];

    protected $casts = [
        'max_entries' => 'integer',
        'entries_used' => 'integer',
        'rsvp_at' => 'datetime',
        'custom_fields' => 'array',
        'pledge_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'pledge_deadline' => 'date',
    ];

    protected $appends = [
        'entries_remaining',
        'allowance_label',
        'api_phone',
        'whatsapp_status',
        'sms_status',
        'channel_statuses',
        'pledge_balance',
        'pledge_progress_percent',
    ];

    protected static function booted()
    {
        static::saving(function ($guest) {
            if (! empty($guest->phone)) {
                $guest->phone = PhoneNormalizer::cleanForApi($guest->phone);
            }
        });

        static::creating(function ($guest) {
            if (empty($guest->card_number)) {
                $guest->card_number = static::generateCardNumber();
            }
            if (empty($guest->unique_code)) {
                $guest->unique_code = static::generateUniqueCode();
            }
            if (empty($guest->qr_token)) {
                $guest->qr_token = Str::random(32);
            }
        });
    }

    public static function generateCardNumber(): string
    {
        do {
            $number = 'KDV-'.str_pad((string) random_int(1000, 999999), 6, '0', STR_PAD_LEFT);
        } while (static::where('card_number', $number)->exists());

        return $number;
    }

    public static function generateUniqueCode(): string
    {
        return (string) random_int(10000000, 99999999);
    }

    public function getApiPhoneAttribute(): string
    {
        return PhoneNormalizer::cleanForApi($this->phone);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function scanLogs()
    {
        return $this->hasMany(ScanLog::class)->latest('scanned_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->latest();
    }

    public function getEntriesRemainingAttribute(): int
    {
        return max(0, $this->max_entries - $this->entries_used);
    }

    public function getAllowanceLabelAttribute(): string
    {
        if (! empty($this->category)) {
            return $this->category;
        }
        if ($this->max_entries === 1) {
            return 'Single Entry';
        }
        if ($this->max_entries === 2) {
            return 'Double Entry';
        }

        return "{$this->max_entries} Entries";
    }

    public function getWhatsappStatusAttribute(): ?string
    {
        if ($this->relationLoaded('messages')) {
            return $this->messages->where('channel', 'whatsapp')->first()?->status;
        }

        return null;
    }

    public function getSmsStatusAttribute(): ?string
    {
        if ($this->relationLoaded('messages')) {
            return $this->messages->where('channel', 'sms')->first()?->status;
        }

        return null;
    }

    /**
     * Resolve structured channel delivery statuses.
     *
     * @return array{whatsapp: ?string, sms: ?string}
     */
    public function getChannelStatusesAttribute(): array
    {
        return [
            'whatsapp' => $this->whatsapp_status,
            'sms' => $this->sms_status,
        ];
    }

    public function pledgePayments()
    {
        return $this->hasMany(PledgePayment::class)->latest('payment_date')->latest('id');
    }

    public function getPledgeBalanceAttribute(): float
    {
        $pledge = floatval($this->pledge_amount ?? 0);
        $paid = floatval($this->paid_amount ?? 0);

        return max(0.0, round($pledge - $paid, 2));
    }

    public function getPledgeProgressPercentAttribute(): int
    {
        $pledge = floatval($this->pledge_amount ?? 0);
        $paid = floatval($this->paid_amount ?? 0);

        if ($pledge > 0) {
            return (int) min(100, round(($paid / $pledge) * 100));
        }

        return $paid > 0 ? 100 : 0;
    }

    public function recalculatePledgePaid(): void
    {
        $totalPaid = floatval($this->pledgePayments()->sum('amount'));
        $this->paid_amount = $totalPaid;
        $pledge = floatval($this->pledge_amount ?? 0);

        if ($pledge <= 0 && $totalPaid <= 0) {
            $this->pledge_status = 'none';
        } elseif ($totalPaid <= 0 && $pledge > 0) {
            $this->pledge_status = 'pledged';
        } elseif ($totalPaid > 0 && $totalPaid < $pledge) {
            $this->pledge_status = 'partial';
        } elseif ($pledge > 0 && $totalPaid >= $pledge) {
            $this->pledge_status = $totalPaid > $pledge ? 'overpaid' : 'completed';
        } elseif ($pledge <= 0 && $totalPaid > 0) {
            $this->pledge_status = 'completed';
        }

        $this->saveQuietly();
    }
}
