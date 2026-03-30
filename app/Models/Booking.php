<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'service_id',
        'user_reward_id',
        'status',
        'booking_date',
        'booking_time',
        'description',
        'status_updated_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'status_updated_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function userReward()
    {
        return $this->belongsTo(UserReward::class);
    }
}
