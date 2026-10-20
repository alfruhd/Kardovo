<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    protected $fillable = [
        'transaction_number',
        'idempotency_key',
        'type',
        'category',
        'title',
        'amount',
        'currency',
        'payment_method',
        'reference',
        'user_id',
        'event_id',
        'status',
        'notes',
        'transaction_date',
    ];

    protected $casts = [
        'amount' => 'float',
        'transaction_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function bill()
    {
        return $this->hasOne(FinancialBill::class, 'financial_transaction_id');
    }

    public function ledgerEntries()
    {
        return $this->hasMany(PaymentLedgerEntry::class, 'financial_transaction_id')->orderBy('id');
    }

    /**
     * Generate unique transaction code.
     */
    public static function generateTransactionNumber(): string
    {
        return 'TRX-'.date('Y').'-'.strtoupper(substr(uniqid(), -6));
    }
}
