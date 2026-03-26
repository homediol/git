<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['title', 'description', 'image', 'parent_service_id', 'service_key'];

    public function parentService()
    {
        return $this->belongsTo(self::class, 'parent_service_id');
    }

    public function subServices()
    {
        return $this->hasMany(self::class, 'parent_service_id');
    }
}
