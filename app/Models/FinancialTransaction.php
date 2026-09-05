<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    protected $fillable = [
        'transaction_number',
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

    /**
     * Generate unique transaction code.
     */
    public static function generateTransactionNumber(): string
    {
        return 'TRX-'.date('Y').'-'.strtoupper(substr(uniqid(), -6));
    }
}
