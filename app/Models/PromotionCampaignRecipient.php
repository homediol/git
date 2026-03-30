<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromotionCampaignRecipient extends Model
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'delivery_strategy',
        'matched_segment',
        'reward_state',
        'in_app_sent_at',
        'email_sent_at',
        'sms_sent_at',
        'opened_at',
        'channel_results',
        'meta',
    ];

    protected $casts = [
        'in_app_sent_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'sms_sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'channel_results' => 'array',
        'meta' => 'array',
    ];

    public function campaign()
    {
        return $this->belongsTo(PromotionCampaign::class, 'campaign_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
