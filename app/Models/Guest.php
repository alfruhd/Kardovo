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
    ];

    protected $casts = [
        'max_entries' => 'integer',
        'entries_used' => 'integer',
        'rsvp_at' => 'datetime',
        'custom_fields' => 'array',
    ];

    protected $appends = [
        'entries_remaining',
        'allowance_label',
        'api_phone',
        'whatsapp_status',
        'sms_status',
        'channel_statuses',
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
        return 'KDV-'.str_pad((string) random_int(1000, 999999), 6, '0', STR_PAD_LEFT);
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

        return $this->messages()->where('channel', 'whatsapp')->value('status');
    }

    public function getSmsStatusAttribute(): ?string
    {
        if ($this->relationLoaded('messages')) {
            return $this->messages->where('channel', 'sms')->first()?->status;
        }

        return $this->messages()->where('channel', 'sms')->value('status');
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
}
