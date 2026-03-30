<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReward extends Model
{
    protected $fillable = [
        'user_id',
        'reward_id',
        'status',
        'assigned_at',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function rewinds()
    {
        return $this->hasMany(RewardRewind::class);
    }
}
