<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'title',
        'title_rw',
        'title_en',
        'title_fr',
        'content',
        'content_rw',
        'content_en',
        'content_fr',
        'category',
        'category_rw',
        'category_en',
        'category_fr',
        'image',
        'video',
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
