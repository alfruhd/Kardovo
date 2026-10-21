<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'package_type',
        'price',
        'sms_count',
        'rate_per_sms',
        'description',
        'features',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'float',
        'sms_count' => 'integer',
        'rate_per_sms' => 'float',
        'is_active' => 'boolean',
    ];
}
