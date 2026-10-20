<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WristbandOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'order_number',
        'material_type',
        'quantity',
        'color_scheme',
        'custom_text',
        'custom_logo_url',
        'contact_name',
        'contact_phone',
        'contact_email',
        'delivery_address',
        'status',
        'estimated_cost',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'estimated_cost' => 'decimal:2',
    ];

    protected $appends = [
        'material_label',
        'status_label',
    ];

    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber(): string
    {
        return 'WB-'.date('ymd').'-'.strtoupper(bin2hex(random_bytes(3)));
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getMaterialLabelAttribute(): string
    {
        return match ($this->material_type) {
            'tyvek' => 'Tyvek (Tamper-evident Paper)',
            'fabric_woven' => 'Woven Fabric with Smart Lock',
            'vinyl' => 'Waterproof Vinyl Multi-Day',
            'silicone' => 'Reusable Debossed Silicone',
            default => ucfirst(str_replace('_', ' ', (string) $this->material_type)),
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'requested' => 'Under Review',
            'processing' => 'Printing in Progress',
            'shipped' => 'Shipped / Dispatched',
            'delivered' => 'Delivered to Venue',
            'cancelled' => 'Cancelled',
            default => ucfirst($this->status),
        };
    }
}
