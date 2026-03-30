<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromotionCampaign extends Model
{
    protected $fillable = [
        'name',
        'title_rw',
        'title_en',
        'title_fr',
        'message_rw',
        'message_en',
        'message_fr',
        'cta_text_rw',
        'cta_text_en',
        'cta_text_fr',
        'cta_url',
        'image',
        'audience_type',
        'user_age_segment',
        'new_user_window_days',
        'target_user_ids',
        'target_emails',
        'target_service_ids',
        'reward_filter',
        'reference_reward_id',
        'smart_reward_mode',
        'discount_percent',
        'discount_code',
        'send_in_app',
        'send_email',
        'send_sms',
        'status',
        'launched_at',
        'created_by',
    ];

    protected $casts = [
        'target_user_ids' => 'array',
        'target_emails' => 'array',
        'target_service_ids' => 'array',
        'new_user_window_days' => 'integer',
        'smart_reward_mode' => 'boolean',
        'discount_percent' => 'integer',
        'send_in_app' => 'boolean',
        'send_email' => 'boolean',
        'send_sms' => 'boolean',
        'launched_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function referenceReward()
    {
        return $this->belongsTo(Reward::class, 'reference_reward_id');
    }

    public function recipients()
    {
        return $this->hasMany(PromotionCampaignRecipient::class, 'campaign_id');
    }
}
