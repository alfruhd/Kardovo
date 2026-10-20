<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use LogicException;

class PaymentLedgerEntry extends Model
{
    public const STATE_INTENT_CREATED = 'intent_created';

    public const STATE_AUTHORIZED = 'authorized';

    public const STATE_CAPTURED = 'captured';

    public const STATE_FAILED = 'failed';

    public const STATE_REFUNDED = 'refunded';

    public $timestamps = false;

    protected $fillable = [
        'entry_uuid',
        'ticket_order_id',
        'financial_transaction_id',
        'event_id',
        'idempotency_key',
        'provider_event_id',
        'state',
        'amount',
        'currency',
        'payment_method',
        'gateway_reference',
        'payload_hash',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $entry): void {
            if (empty($entry->entry_uuid)) {
                $entry->entry_uuid = (string) Str::uuid();
            }
            if (empty($entry->created_at)) {
                $entry->created_at = now();
            }
        });

        static::updating(function (): void {
            throw new LogicException('PaymentLedgerEntry rows are immutable and cannot be updated. Append a new ledger entry instead.');
        });

        static::deleting(function (): void {
            throw new LogicException('PaymentLedgerEntry rows are immutable and cannot be deleted.');
        });
    }

    /**
     * Append a new immutable state entry to the payment ledger.
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function appendEntry(array $attributes): self
    {
        if (! empty($attributes['provider_event_id'])) {
            $existing = static::where('provider_event_id', $attributes['provider_event_id'])->first();
            if ($existing) {
                return $existing;
            }
        }

        if (isset($attributes['metadata']) && is_array($attributes['metadata']) && empty($attributes['payload_hash'])) {
            $attributes['payload_hash'] = hash('sha256', json_encode($attributes['metadata']) ?: '');
        }

        return static::create($attributes);
    }

    public function ticketOrder(): BelongsTo
    {
        return $this->belongsTo(TicketOrder::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
