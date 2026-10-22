<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoteOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'event_id',
        'voting_category_id',
        'voting_candidate_id',
        'voter_phone',
        'voter_name',
        'quantity',
        'amount',
        'platform_fee',
        'platform_fee_percent',
        'organizer_net_amount',
        'financial_transaction_id',
        'currency',
        'provider',
        'payment_reference',
        'status',
        'paid_at',
        'is_free',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'platform_fee_percent' => 'decimal:2',
        'organizer_net_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'is_free' => 'boolean',
        'metadata' => 'array',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VotingCategory::class, 'voting_category_id');
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(VotingCandidate::class, 'voting_candidate_id');
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    /**
     * Mark this vote order as completed and credit votes to candidate.
     */
    public function markAsCompleted(?string $reference = null): bool
    {
        if ($this->status === 'completed') {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'paid_at' => now(),
            'payment_reference' => $reference ?? $this->payment_reference,
        ]);

        if ($this->candidate) {
            $this->candidate->recordVotes($this->quantity, (float) $this->amount);
        }

        // Automatic Financial Ledger recording for paid votes
        if (! $this->is_free && (float) $this->amount > 0) {
            $this->recordFinancialTransaction();
        }

        return true;
    }

    /**
     * Record or synchronize financial transaction and ledger entry for this vote order.
     */
    public function recordFinancialTransaction(): ?FinancialTransaction
    {
        $idempotencyKey = 'vote:'.$this->order_number;

        $event = $this->event ?? Event::find($this->event_id);
        $candidate = $this->candidate ?? VotingCandidate::find($this->voting_candidate_id);

        $platformFeePercent = (float) ($this->platform_fee_percent ?: 6.00);
        $platformFee = (float) ($this->platform_fee ?: round((float) $this->amount * ($platformFeePercent / 100), 2));
        $organizerNetAmount = (float) ($this->organizer_net_amount ?: round((float) $this->amount - $platformFee, 2));

        $transaction = FinancialTransaction::firstOrCreate(
            ['idempotency_key' => $idempotencyKey],
            [
                'transaction_number' => FinancialTransaction::generateTransactionNumber(),
                'event_id' => $this->event_id,
                'user_id' => $event?->user_id,
                'type' => 'income',
                'category' => 'vote_sales',
                'title' => "Vote Order #{$this->order_number} (".($event?->title ?? 'Awards').')',
                'amount' => $this->amount,
                'currency' => $this->currency ?? 'TZS',
                'payment_method' => $this->provider,
                'reference' => $this->payment_reference ?? $this->order_number,
                'status' => 'completed',
                'transaction_date' => $this->paid_at ?? now(),
                'notes' => json_encode([
                    'vote_order_id' => $this->id,
                    'order_number' => $this->order_number,
                    'candidate_id' => $this->voting_candidate_id,
                    'candidate_name' => $candidate?->name,
                    'category_id' => $this->voting_category_id,
                    'votes_count' => $this->quantity,
                    'platform_fee_percent' => $platformFeePercent,
                    'platform_fee' => $platformFee,
                    'organizer_net_amount' => $organizerNetAmount,
                    'voter_phone' => $this->voter_phone,
                    'voter_name' => $this->voter_name,
                ]),
            ]
        );

        $this->update([
            'platform_fee' => $platformFee,
            'platform_fee_percent' => $platformFeePercent,
            'organizer_net_amount' => $organizerNetAmount,
            'financial_transaction_id' => $transaction->id,
        ]);

        try {
            PaymentLedgerEntry::appendEntry([
                'financial_transaction_id' => $transaction->id,
                'event_id' => $this->event_id,
                'idempotency_key' => $idempotencyKey,
                'provider_event_id' => 'vote:capture:'.$this->order_number,
                'state' => PaymentLedgerEntry::STATE_CAPTURED,
                'amount' => $this->amount,
                'currency' => $this->currency ?? 'TZS',
                'payment_method' => $this->provider,
                'gateway_reference' => $this->payment_reference ?? $this->order_number,
                'metadata' => [
                    'order_number' => $this->order_number,
                    'candidate' => $candidate?->name,
                    'votes' => $this->quantity,
                    'platform_fee' => $platformFee,
                    'organizer_net_amount' => $organizerNetAmount,
                ],
            ]);
        } catch (\Throwable $e) {
            // Ledger entry already recorded or duplicate provider event id
        }

        return $transaction;
    }
}
