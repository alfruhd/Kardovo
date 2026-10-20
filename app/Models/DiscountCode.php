<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscountCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'min_order_amount',
        'expires_at',
        'is_active',
        'description',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketOrders(): HasMany
    {
        return $this->hasMany(TicketOrder::class);
    }

    public function isValid(?float $subtotal = null): bool
    {
        return $this->checkValidity($subtotal)['valid'];
    }

    public function checkValidity(?float $subtotal = null): array
    {
        if (! $this->is_active) {
            return ['valid' => false, 'error' => "Discount code '{$this->code}' is currently inactive."];
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return ['valid' => false, 'error' => "Discount code '{$this->code}' has expired."];
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return ['valid' => false, 'error' => "Discount code '{$this->code}' has reached its maximum redemption limit."];
        }

        if ($subtotal !== null && $this->min_order_amount !== null && $subtotal < (float) $this->min_order_amount) {
            return ['valid' => false, 'error' => 'Minimum order amount of TZS '.number_format((float) $this->min_order_amount).' required for this discount.'];
        }

        return ['valid' => true, 'error' => null];
    }

    public function getFormattedDiscountAttribute(): string
    {
        if ($this->discount_type === 'percentage') {
            return rtrim(rtrim(number_format((float) $this->discount_value, 2), '0'), '.').'% OFF';
        }

        return 'TZS '.number_format((float) $this->discount_value).' OFF';
    }

    public function calculateDiscount(float $subtotal): float
    {
        if (! $this->isValid($subtotal)) {
            return 0.0;
        }

        if ($this->discount_type === 'percentage') {
            $computed = ($subtotal * (float) $this->discount_value) / 100.0;
        } else {
            $computed = (float) $this->discount_value;
        }

        return (float) min($subtotal, max(0.0, round($computed, 2)));
    }
}
