<?php

namespace App\Models;

use App\Services\PhoneNormalizer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TicketOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'event_id',
        'user_id',
        'buyer_name',
        'buyer_phone',
        'buyer_email',
        'subtotal',
        'platform_fee',
        'total_amount',
        'currency',
        'payment_method',
        'payment_reference',
        'payment_status',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected $appends = [
        'formatted_total',
    ];

    protected static function booted()
    {
        static::saving(function ($order) {
            if (! empty($order->buyer_phone)) {
                $order->buyer_phone = PhoneNormalizer::cleanForApi($order->buyer_phone);
            }
        });

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber(): string
    {
        return 'KDO-'.date('ymd').'-'.strtoupper(Str::random(5));
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function getFormattedTotalAttribute(): string
    {
        return number_format((float) $this->total_amount, 0).' '.($this->currency ?? 'TZS');
    }
}
