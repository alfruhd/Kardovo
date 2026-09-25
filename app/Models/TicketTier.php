<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'currency',
        'capacity',
        'sold_count',
        'max_per_order',
        'sales_start_at',
        'sales_end_at',
        'status',
        'sort_order',
        'color',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'capacity' => 'integer',
        'sold_count' => 'integer',
        'max_per_order' => 'integer',
        'sales_start_at' => 'datetime',
        'sales_end_at' => 'datetime',
    ];

    protected $appends = [
        'remaining_count',
        'is_available',
        'is_sold_out',
        'formatted_price',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function getRemainingCountAttribute(): int
    {
        return max(0, $this->capacity - $this->sold_count);
    }

    public function getIsSoldOutAttribute(): bool
    {
        return $this->status === 'sold_out' || $this->remaining_count <= 0;
    }

    public function getIsAvailableAttribute(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->is_sold_out) {
            return false;
        }

        if ($this->sales_start_at && now()->lt($this->sales_start_at)) {
            return false;
        }

        if ($this->sales_end_at && now()->gt($this->sales_end_at)) {
            return false;
        }

        return true;
    }

    public function getFormattedPriceAttribute(): string
    {
        if ((float) $this->price <= 0) {
            return 'Free';
        }

        return number_format((float) $this->price, 0).' '.($this->currency ?? 'TZS');
    }
}
