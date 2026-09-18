<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'features',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'float',
        'is_active' => 'boolean',
    ];
}
