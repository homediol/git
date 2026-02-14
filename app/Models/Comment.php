<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['post_id', 'name', 'email', 'comment', 'approved'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Scope to get only approved comments
     */
    public function scopeApproved($query)
    {
        return $query->where('approved', true);
    }
}
