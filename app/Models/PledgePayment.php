<?php

namespace App\Models;

use Database\Factories\PledgePaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PledgePayment extends Model
{
    /** @use HasFactory<PledgePaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'guest_id',
        'user_id',
        'amount',
        'payment_method',
        'reference',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    protected static function booted()
    {
        static::saved(function (self $payment) {
            if ($payment->guest) {
                $payment->guest->recalculatePledgePaid();
            }
        });

        static::deleted(function (self $payment) {
            if ($payment->guest) {
                $payment->guest->recalculatePledgePaid();
            }
        });
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
