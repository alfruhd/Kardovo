<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardTemplate extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'image_path',
        'template_type',
        'headline',
        'brand_color_from',
        'brand_color_to',
        'font_family',
        'show_qr',
        'show_category_badge',
        'show_unique_code',
        'footer_text',
        'layout_json',
        'elements_config',
    ];

    protected $casts = [
        'show_qr' => 'boolean',
        'show_category_badge' => 'boolean',
        'show_unique_code' => 'boolean',
        'layout_json' => 'array',
        'elements_config' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
