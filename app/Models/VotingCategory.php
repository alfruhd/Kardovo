<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VotingCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'is_paid',
        'pricing_tiers',
        'max_selections',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'pricing_tiers' => 'array',
        'max_selections' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Default bundle pricing tiers for paid voting.
     */
    public static function defaultPricingTiers(): array
    {
        return [
            ['quantity' => 1, 'amount' => 500],
            ['quantity' => 3, 'amount' => 1000],
            ['quantity' => 6, 'amount' => 2000],
            ['quantity' => 15, 'amount' => 5000],
            ['quantity' => 35, 'amount' => 10000],
            ['quantity' => 80, 'amount' => 20000],
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(VotingCandidate::class)->orderBy('sort_order')->orderBy('id');
    }

    public function voteOrders(): HasMany
    {
        return $this->hasMany(VoteOrder::class);
    }
}
