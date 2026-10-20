<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'user_id',
        'card_template_id',
        'title',
        'event_type',
        'event_date',
        'event_time',
        'venue',
        'city',
        'description',
        'rsvp_auto_reply_config',
        'microsite_config',
        'status',
        'ticketing_enabled',
        'is_public',
        'is_occasion',
        'cover_photo',
        'occasion_type',
        'ticket_currency',
        'ticket_instructions',
        'ticket_sales_end_at',
        'ticket_template_config',
        'payout_method',
        'payout_provider',
        'payout_account_number',
        'payout_account_name',
        'payout_bank_branch',
        'payout_status',
        'pledge_target',
        'pledge_currency',
        'pledges_enabled',
        'pledge_deadline',
        'pledge_settings',
    ];

    protected $casts = [
        'event_date' => 'date',
        'rsvp_auto_reply_config' => 'array',
        'microsite_config' => 'array',
        'ticketing_enabled' => 'boolean',
        'is_public' => 'boolean',
        'is_occasion' => 'boolean',
        'ticket_sales_end_at' => 'datetime',
        'ticket_template_config' => 'array',
        'pledge_target' => 'decimal:2',
        'pledges_enabled' => 'boolean',
        'pledge_deadline' => 'date',
        'pledge_settings' => 'array',
    ];

    protected $appends = [
        'has_microsite_enabled',
    ];

    public function getHasMicrositeEnabledAttribute(): bool
    {
        return $this->hasMicrositeEnabled();
    }

    public function hasMicrositeEnabled(): bool
    {
        $config = is_array($this->microsite_config) ? $this->microsite_config : [];
        if (! empty($config['admin_override'])) {
            return true;
        }

        $owner = $this->relationLoaded('user') ? $this->user : $this->user()->first();
        if ($owner && $owner->canCustomizeMicrosite()) {
            return true;
        }

        return false;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cardTemplate()
    {
        return $this->belongsTo(CardTemplate::class);
    }

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }

    public function ticketTiers()
    {
        return $this->hasMany(TicketTier::class)->orderBy('sort_order');
    }

    public function ticketOrders()
    {
        return $this->hasMany(TicketOrder::class)->latest();
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class)->latest();
    }

    public function scanLogs()
    {
        return $this->hasMany(ScanLog::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function assignedSubAdmins()
    {
        return $this->belongsToMany(User::class, 'sub_admin_assignments', 'event_id', 'sub_admin_id');
    }

    public function pledgePayments()
    {
        return $this->hasMany(PledgePayment::class)->latest('payment_date');
    }

    public function discountCodes()
    {
        return $this->hasMany(DiscountCode::class)->latest();
    }

    public function wristbandOrders()
    {
        return $this->hasMany(WristbandOrder::class)->latest();
    }

    public function posTerminalRequests()
    {
        return $this->hasMany(PosTerminalRequest::class)->latest();
    }

    public function getPledgeStats(): array
    {
        $target = (float) ($this->pledge_target ?? 0);
        $totalPledged = (float) $this->guests()->where('pledge_amount', '>', 0)->sum('pledge_amount');
        $totalCollected = (float) $this->guests()->where('pledge_amount', '>', 0)->sum('paid_amount');
        $totalBalance = max(0, $totalPledged - $totalCollected);

        $pledgeCount = $this->guests()->where('pledge_amount', '>', 0)->count();
        $completedCount = $this->guests()->where('pledge_amount', '>', 0)->where('pledge_status', 'completed')->count();
        $partialCount = $this->guests()->where('pledge_amount', '>', 0)->where('pledge_status', 'partial')->count();
        $unpaidCount = $this->guests()->where('pledge_amount', '>', 0)->where('pledge_status', 'pledged')->count();

        $percentOfTarget = $target > 0 ? round(($totalCollected / $target) * 100, 1) : 0;

        return [
            'target' => $target,
            'currency' => $this->pledge_currency ?: 'TZS',
            'enabled' => (bool) ($this->pledges_enabled ?? true),
            'deadline' => $this->pledge_deadline ? (is_string($this->pledge_deadline) ? $this->pledge_deadline : $this->pledge_deadline->format('Y-m-d')) : null,
            'settings' => is_array($this->pledge_settings) ? $this->pledge_settings : [],
            'total_pledged' => $totalPledged,
            'total_collected' => $totalCollected,
            'total_balance' => $totalBalance,
            'percent_of_target' => $percentOfTarget,
            'pledge_count' => $pledgeCount,
            'completed_count' => $completedCount,
            'partial_count' => $partialCount,
            'unpaid_count' => $unpaidCount,
        ];
    }

    public function scopeAccessibleBy($query, User $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }

        if ($user->isSubAdmin()) {
            $assignedCustomerIds = $user->assignedOrganizers()->pluck('users.id')->toArray();
            $assignedEventIds = $user->assignedEvents()->pluck('events.id')->toArray();

            return $query->where(function ($q) use ($user, $assignedCustomerIds, $assignedEventIds) {
                $q->where('user_id', $user->id);
                if (! empty($assignedCustomerIds)) {
                    $q->orWhereIn('user_id', $assignedCustomerIds);
                }
                if (! empty($assignedEventIds)) {
                    $q->orWhereIn('id', $assignedEventIds);
                }
            });
        }

        if ($user->isScanner()) {
            $customerId = $user->customer_id ?? $user->id;

            return $query->where('user_id', $customerId);
        }

        return $query->where('user_id', $user->id);
    }

    public function scopeOccasions($query)
    {
        return $query->where('is_occasion', true);
    }

    public function scopeInvitationEvents($query)
    {
        return $query->where('is_occasion', false);
    }
}
