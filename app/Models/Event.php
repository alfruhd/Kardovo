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
    ];

    protected $casts = [
        'event_date' => 'date',
        'rsvp_auto_reply_config' => 'array',
        'microsite_config' => 'array',
    ];

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
}
