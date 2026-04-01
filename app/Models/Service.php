<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
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
        'parent_service_id',
        'service_key',
    ];

    public function parentService()
    {
        return $this->belongsTo(self::class, 'parent_service_id');
    }

    public function subServices()
    {
        return $this->hasMany(self::class, 'parent_service_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
