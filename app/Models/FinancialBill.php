<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class FinancialBill extends Model
{
    protected $fillable = [
        'bill_number',
        'vendor_name',
        'title',
        'category',
        'amount',
        'currency',
        'bill_date',
        'due_date',
        'status',
        'is_recurring',
        'recurrence_period',
        'payment_method_intended',
        'vendor_account_reference',
        'financial_transaction_id',
        'reminder_enabled',
        'reminder_days_before',
        'reminded_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'bill_date' => 'date',
        'due_date' => 'date',
        'is_recurring' => 'boolean',
        'reminder_enabled' => 'boolean',
        'reminder_days_before' => 'integer',
        'reminded_at' => 'datetime',
    ];

    public function transaction()
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }

    /**
     * Scope for pending bills.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for overdue bills.
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', 'pending')
            ->whereDate('due_date', '<', Carbon::today());
    }

    /**
     * Scope for bills due soon within given days.
     */
    public function scopeDueSoon(Builder $query, int $days = 7): Builder
    {
        $today = Carbon::today();
        $limit = Carbon::today()->addDays($days);

        return $query->where('status', 'pending')
            ->whereDate('due_date', '>=', $today)
            ->whereDate('due_date', '<=', $limit);
    }

    /**
     * Check dynamic status taking into account due date.
     */
    public function getEffectiveStatusAttribute(): string
    {
        if ($this->status === 'paid') {
            return 'paid';
        }
        if ($this->status === 'cancelled') {
            return 'cancelled';
        }
        if ($this->due_date && Carbon::parse($this->due_date)->isPast() && ! Carbon::parse($this->due_date)->isToday()) {
            return 'overdue';
        }

        return 'pending';
    }

    /**
     * Days remaining until due date (negative if overdue).
     */
    public function getDaysRemainingAttribute(): int
    {
        if (! $this->due_date) {
            return 0;
        }

        return (int) Carbon::today()->diffInDays(Carbon::parse($this->due_date), false);
    }

    /**
     * Generate unique bill reference code.
     */
    public static function generateBillNumber(): string
    {
        return 'BILL-'.date('Y').'-'.strtoupper(substr(uniqid(), -6));
    }
}
