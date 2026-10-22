<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VotingCandidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'voting_category_id',
        'candidate_number',
        'name',
        'bio',
        'photo_url',
        'total_votes',
        'revenue_collected',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'total_votes' => 'integer',
        'revenue_collected' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VotingCategory::class, 'voting_category_id');
    }

    public function voteOrders(): HasMany
    {
        return $this->hasMany(VoteOrder::class);
    }

    /**
     * Credit confirmed votes and revenue to this candidate.
     */
    public function recordVotes(int $quantity, float $amount = 0.00): void
    {
        $this->increment('total_votes', $quantity);
        if ($amount > 0) {
            $this->increment('revenue_collected', $amount);
        }
    }
}
