<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\PhoneNormalizer;
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
    ];

    protected static function booted()
    {
        static::saving(function ($guest) {
            if (!empty($guest->phone)) {
                $guest->phone = PhoneNormalizer::cleanForApi($guest->phone);
            }
        });

        static::creating(function ($guest) {
            if (empty($guest->card_number)) {
                $guest->card_number = 'KDV-' . date('Y') . '-' . str_pad(mt_rand(1000, 999999), 6, '0', STR_PAD_LEFT);
            }
            if (empty($guest->unique_code)) {
                $guest->unique_code = (string) mt_rand(10000000, 99999999);
            }
            if (empty($guest->qr_token)) {
                $guest->qr_token = Str::random(32);
            }
        });
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
        if ($this->max_entries === 1) {
            return 'Single Entry • scan up to 1x';
        }
        if ($this->max_entries === 2) {
            return 'Double Entry • scan up to 2x';
        }
        return "{$this->category} • scan up to {$this->max_entries}x";
    }
}
