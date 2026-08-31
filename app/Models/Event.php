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
        'status',
    ];

    protected $casts = [
        'event_date' => 'date',
        'rsvp_auto_reply_config' => 'array',
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
}
