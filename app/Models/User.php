<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'role',
        'language',
        'in_app_notifications_enabled',
        'push_notifications_enabled',
        'notification_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'in_app_notifications_enabled' => 'boolean',
            'push_notifications_enabled' => 'boolean',
            'notification_preferences' => 'array',
        ];
    }

    public static function defaultNotificationPreferences(): array
    {
        return [
            'general' => ['in_app' => true, 'push' => true],
            'chat' => ['in_app' => true, 'push' => true],
            'booking' => ['in_app' => true, 'push' => true],
            'promotion' => ['in_app' => true, 'push' => true],
            'reward' => ['in_app' => true, 'push' => true],
        ];
    }

    public function resolvedNotificationPreferences(): array
    {
        $stored = is_array($this->notification_preferences) ? $this->notification_preferences : [];

        return array_replace_recursive(static::defaultNotificationPreferences(), $stored);
    }

    public function allowsNotificationChannel(string $category = 'general', string $channel = 'in_app'): bool
    {
        $category = $category ?: 'general';
        $channel = $channel === 'push' ? 'push' : 'in_app';
        $masterEnabled = $channel === 'push'
            ? $this->push_notifications_enabled
            : $this->in_app_notifications_enabled;

        if (!$masterEnabled) {
            return false;
        }

        return (bool) data_get(
            $this->resolvedNotificationPreferences(),
            "{$category}.{$channel}",
            true,
        );
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isEditor()
    {
        return $this->role === 'editor';
    }

    public function userRewards()
    {
        return $this->hasMany(UserReward::class);
    }

    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function promotionCampaignRecipients()
    {
        return $this->hasMany(PromotionCampaignRecipient::class);
    }

    public function createdPromotionCampaigns()
    {
        return $this->hasMany(PromotionCampaign::class, 'created_by');
    }

    public function rewardRewinds()
    {
        return $this->hasMany(RewardRewind::class);
    }

    public function chatThread()
    {
        return $this->hasOne(ChatThread::class);
    }

    public function assignedChatThreads()
    {
        return $this->hasMany(ChatThread::class, 'assigned_admin_id');
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    public function fcmTokens(): HasMany
    {
        return $this->hasMany(FcmToken::class);
    }
}
