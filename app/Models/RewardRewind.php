<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardRewind extends Model
{
    protected $fillable = [
        'user_reward_id',
        'user_id',
        'reward_id',
        'admin_id',
        'action',
        'previous_status',
        'new_status',
        'previous_expires_at',
        'new_expires_at',
        'notes',
        'meta',
    ];

    protected $casts = [
        'previous_expires_at' => 'datetime',
        'new_expires_at' => 'datetime',
        'meta' => 'array',
    ];

    public function userReward()
    {
        return $this->belongsTo(UserReward::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
