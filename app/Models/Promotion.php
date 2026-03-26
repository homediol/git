<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Promotion extends Model
{
    protected $fillable = [
        'title',
        'title_rw',
        'title_en',
        'title_fr',
        'message',
        'message_rw',
        'message_en',
        'message_fr',
        'image',
        'cta_text',
        'cta_text_rw',
        'cta_text_en',
        'cta_text_fr',
        'cta_url',
        'is_active',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(function (Builder $inner) {
                $inner->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function (Builder $inner) {
                $inner->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }
}
