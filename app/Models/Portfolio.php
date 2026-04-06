<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $fillable = [
        'title',
        'title_rw',
        'title_en',
        'title_fr',
        'description',
        'description_rw',
        'description_en',
        'description_fr',
        'image',
        'category',
        'category_rw',
        'category_en',
        'category_fr',
    ];
}
