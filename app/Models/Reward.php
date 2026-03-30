<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    protected $fillable = [
        'name',
        'name_rw',
        'name_en',
        'name_fr',
        'slug',
        'description',
        'description_rw',
        'description_en',
        'description_fr',
        'image',
        'expires_after_days',
        'is_active',
    ];

    protected $casts = [
        'expires_after_days' => 'integer',
        'is_active' => 'boolean',
    ];

    public function userRewards()
    {
        return $this->hasMany(UserReward::class);
    }

    public function promotionCampaigns()
    {
        return $this->hasMany(PromotionCampaign::class, 'reference_reward_id');
    }

    public function rewinds()
    {
        return $this->hasMany(RewardRewind::class);
    }
}
