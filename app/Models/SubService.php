<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubService extends Model
{
    protected $fillable = ['service_id', 'title', 'description', 'image'];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
