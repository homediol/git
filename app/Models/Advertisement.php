<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $fillable = ['title', 'description', 'link', 'media', 'type', 'active', 'order', 'duration'];

    protected $casts = [
        'active' => 'boolean',
    ];
}
