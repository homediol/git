<?php

namespace App\Services;

use App\Mail\PromotionCampaignMail;
use App\Models\PromotionCampaign;
use App\Models\PromotionCampaignRecipient;
use App\Models\User;
use App\Models\UserReward;
use App\Notifications\GenericNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class PromotionCampaignService
{
    public function launch(PromotionCampaign $campaign): array
    {
        $users = $this->resolveUsers($campaign)
            ->with([
                'bookings.service',
                'userRewards.reward',
            ])
            ->get();

        $stats = [
            'recipients' => 0,
            'in_app' => 0,
            'email' => 0,
            'sms' => 0,
            'reminders' => 0,
            'discounts' => 0,
        ];

        foreach ($users as $user) {
            $delivery = $this->determineDelivery($campaign, $user);

            $recipient = PromotionCampaignRecipient::updateOrCreate(
                [
                    'campaign_id' => $campaign->id,
                    'user_id' => $user->id,
                ],
                [
                    'delivery_strategy' => $delivery['strategy'],
                    'matched_segment' => $campaign->audience_type,
                    'reward_state' => $delivery['reward_state'],
                    'meta' => [
                        'reward_id' => $delivery['reward']?->id,
                        'reward_name' => $delivery['reward']?->reward?->name
                            ?? $delivery['reward']?->reward?->name_rw,
                    ],
                    'channel_results' => [],
                ]
            );

            $payload = $this->buildPayload($campaign, $user, $recipient, $delivery);
            $channelResults = [];
            $now = now();

            if ($campaign->send_in_app) {
                try {
                    $user->notify(new GenericNotification($payload));
                    $recipient->in_app_sent_at = $now;
                    $channelResults['in_app'] = 'sent';
                    $stats['in_app']++;
                } catch (Throwable $exception) {
                    $channelResults['in_app'] = 'failed';
                    $channelResults['in_app_error'] = $exception->getMessage();
                }
            } else {
                $channelResults['in_app'] = 'disabled';
            }

            if ($campaign->send_email) {
                if (!empty($user->email)) {
                    try {
                        Mail::to($user->email)->send(new PromotionCampaignMail($payload, $user));
                        $recipient->email_sent_at = $now;
                        $channelResults['email'] = 'sent';
                        $stats['email']++;
                    } catch (Throwable $exception) {
                        $channelResults['email'] = 'failed';
                        $channelResults['email_error'] = $exception->getMessage();
                    }
                } else {
                    $channelResults['email'] = 'missing_email';
                }
            } else {
                $channelResults['email'] = 'disabled';
            }

            if ($campaign->send_sms) {
                if (!empty($user->phone)) {
                    Log::info('promotion_campaign_sms_logged', [
                        'campaign_id' => $campaign->id,
                        'recipient_id' => $recipient->id,
                        'user_id' => $user->id,
                        'phone' => $user->phone,
                        'message' => $payload['message'] ?? '',
                    ]);
                    $recipient->sms_sent_at = $now;
                    $channelResults['sms'] = 'logged';
                    $stats['sms']++;
                } else {
                    $channelResults['sms'] = 'missing_phone';
                }
            } else {
                $channelResults['sms'] = 'disabled';
            }

            $recipient->channel_results = $channelResults;
            $recipient->save();

            $stats['recipients']++;
            if ($delivery['strategy'] === 'reward_reminder') {
                $stats['reminders']++;
            }
            if ($delivery['strategy'] === 'discount') {
                $stats['discounts']++;
            }
        }

        $campaign->update([
            'status' => 'sent',
            'launched_at' => $campaign->launched_at ?? now(),
        ]);

        return $stats;
    }

    public function resolveUsers(PromotionCampaign $campaign): Builder
    {
        $query = User::query()
            ->where(function (Builder $builder) {
                $builder->whereNull('role')->orWhere('role', '!=', 'admin');
            });

        $this->applyAudienceScope($query, $campaign);
        $this->applyAgeScope($query, $campaign);
        $this->applyRewardScope($query, $campaign);

        return $query->select('users.*')->distinct();
    }

    private function applyAudienceScope(Builder $query, PromotionCampaign $campaign): void
    {
        if ($campaign->audience_type === 'new_users') {
            $query->where('created_at', '>=', now()->subDays($campaign->new_user_window_days ?: 30));
            return;
        }

        if ($campaign->audience_type === 'specific_users') {
            $ids = collect($campaign->target_user_ids ?? [])->filter()->map(fn ($id) => (int) $id)->filter();
            $emails = collect($campaign->target_emails ?? [])->filter();

            $query->where(function (Builder $builder) use ($ids, $emails) {
                if ($ids->isNotEmpty()) {
                    $builder->orWhereIn('id', $ids->all());
                }
                if ($emails->isNotEmpty()) {
                    $builder->orWhereIn('email', $emails->all());
                }
            });

            return;
        }

        if ($campaign->audience_type === 'booked_service') {
            $serviceIds = collect($campaign->target_service_ids ?? [])->filter()->map(fn ($id) => (int) $id)->filter();

            if ($serviceIds->isEmpty()) {
                $query->whereRaw('1 = 0');
                return;
            }

            $query->whereHas('bookings', function (Builder $builder) use ($serviceIds) {
                $builder->whereIn('service_id', $serviceIds->all());
            });
        }
    }

    private function applyAgeScope(Builder $query, PromotionCampaign $campaign): void
    {
        if ($campaign->audience_type === 'new_users') {
            return;
        }

        $threshold = now()->subDays($campaign->new_user_window_days ?: 30);

        if ($campaign->user_age_segment === 'new') {
            $query->where('created_at', '>=', $threshold);
        }

        if ($campaign->user_age_segment === 'existing') {
            $query->where('created_at', '<', $threshold);
        }
    }

    private function applyRewardScope(Builder $query, PromotionCampaign $campaign): void
    {
        $rewardFilter = $campaign->reward_filter ?: 'any';
        if ($rewardFilter === 'any') {
            return;
        }

        $rewardConstraint = function (Builder $builder) use ($campaign, $rewardFilter) {
            if ($campaign->reference_reward_id) {
                $builder->where('reward_id', $campaign->reference_reward_id);
            }

            if ($rewardFilter === 'unused') {
                $builder->where('status', 'unused')
                    ->where(function (Builder $inner) {
                        $inner->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                    });
            }

            if ($rewardFilter === 'used') {
                $builder->where('status', 'used');
            }

            if ($rewardFilter === 'expired') {
                $builder->whereNotNull('expires_at')->where('expires_at', '<', now());
            }
        };

        if ($rewardFilter === 'none') {
            $query->whereDoesntHave('userRewards', function (Builder $builder) use ($campaign) {
                if ($campaign->reference_reward_id) {
                    $builder->where('reward_id', $campaign->reference_reward_id);
                }
            });
            return;
        }

        $query->whereHas('userRewards', $rewardConstraint);
    }

    private function determineDelivery(PromotionCampaign $campaign, User $user): array
    {
        $reward = $this->resolveRelevantReward($campaign, $user);
        $rewardState = $this->resolveRewardState($reward);
        $strategy = 'standard';

        if ($campaign->smart_reward_mode) {
            if ($rewardState === 'unused') {
                $strategy = 'reward_reminder';
            } elseif ($rewardState === 'used') {
                $strategy = 'discount';
            }
        }

        return [
            'strategy' => $strategy,
            'reward_state' => $rewardState,
            'reward' => $reward,
        ];
    }

    private function resolveRelevantReward(PromotionCampaign $campaign, User $user): ?UserReward
    {
        $rewards = $user->userRewards
            ->when($campaign->reference_reward_id, fn (Collection $items) => $items->where('reward_id', $campaign->reference_reward_id))
            ->sortByDesc(function (UserReward $reward) {
                return $reward->assigned_at ?? $reward->created_at;
            })
            ->values();

        if ($rewards->isEmpty()) {
            return null;
        }

        $unused = $rewards->first(function (UserReward $reward) {
            return $reward->status === 'unused'
                && (!$reward->expires_at || $reward->expires_at->isFuture());
        });

        if ($unused) {
            return $unused;
        }

        $used = $rewards->first(fn (UserReward $reward) => $reward->status === 'used');
        if ($used) {
            return $used;
        }

        return $rewards->first();
    }

    private function resolveRewardState(?UserReward $reward): string
    {
        if (!$reward) {
            return 'none';
        }

        if ($reward->status === 'used') {
            return 'used';
        }

        if ($reward->expires_at && $reward->expires_at->isPast()) {
            return 'expired';
        }

        return 'unused';
    }

    private function buildPayload(
        PromotionCampaign $campaign,
        User $user,
        PromotionCampaignRecipient $recipient,
        array $delivery,
    ): array {
        $reward = $delivery['reward'];
        $titleRw = $campaign->title_rw;
        $titleEn = $campaign->title_en ?: $campaign->title_rw;
        $titleFr = $campaign->title_fr ?: $campaign->title_rw;
        $messageRw = $campaign->message_rw;
        $messageEn = $campaign->message_en ?: $campaign->message_rw;
        $messageFr = $campaign->message_fr ?: $campaign->message_rw;

        if ($delivery['strategy'] === 'reward_reminder' && $reward?->reward) {
            $rewardNameRw = $reward->reward->name_rw ?: $reward->reward->name;
            $rewardNameEn = $reward->reward->name_en ?: $reward->reward->name;
            $rewardNameFr = $reward->reward->name_fr ?: $reward->reward->name;
            $expiryRw = $reward->expires_at ? ' Izarangira ku ' . $reward->expires_at->format('Y-m-d') . '.' : '';
            $expiryEn = $reward->expires_at ? ' It expires on ' . $reward->expires_at->format('Y-m-d') . '.' : '';
            $expiryFr = $reward->expires_at ? ' Elle expire le ' . $reward->expires_at->format('Y-m-d') . '.' : '';

            $titleRw .= ' - Ibuka impano yawe';
            $titleEn .= ' - Reward reminder';
            $titleFr .= ' - Rappel de recompense';
            $messageRw .= ' Ufite impano ya ' . $rewardNameRw . ' itarakoreshejwe.' . $expiryRw;
            $messageEn .= ' Your ' . $rewardNameEn . ' reward is still available.' . $expiryEn;
            $messageFr .= ' Votre recompense ' . $rewardNameFr . ' est encore disponible.' . $expiryFr;
        }

        if ($delivery['strategy'] === 'discount') {
            $discountPercent = $campaign->discount_percent ? $campaign->discount_percent . '%' : 'special';
            $discountCode = $campaign->discount_code ? ' Code: ' . $campaign->discount_code . '.' : '';

            $titleRw .= ' - Kugabanyirizwa';
            $titleEn .= ' - Discount for you';
            $titleFr .= ' - Remise pour vous';
            $messageRw .= ' Kubera ko wamaze gukoresha impano yawe, twaguteguriye kugabanyirizwa ' . $discountPercent . '.' . $discountCode;
            $messageEn .= ' Since you already used your reward, we prepared a ' . $discountPercent . ' discount for you.' . $discountCode;
            $messageFr .= ' Puisque vous avez deja utilise votre recompense, nous vous proposons une remise de ' . $discountPercent . '.' . $discountCode;
        }

        return [
            'title' => $titleRw,
            'title_rw' => $titleRw,
            'title_en' => $titleEn,
            'title_fr' => $titleFr,
            'message' => $messageRw,
            'message_rw' => $messageRw,
            'message_en' => $messageEn,
            'message_fr' => $messageFr,
            'action_url' => $campaign->cta_url ?: route('rewards.index'),
            'action_text' => $campaign->cta_text_rw ?: 'Reba promo',
            'action_text_rw' => $campaign->cta_text_rw ?: 'Reba promo',
            'action_text_en' => $campaign->cta_text_en ?: 'Open offer',
            'action_text_fr' => $campaign->cta_text_fr ?: 'Ouvrir l offre',
            'type' => $delivery['strategy'] === 'discount' ? 'success' : 'info',
            'media_url' => $campaign->image,
            'media_type' => $campaign->image ? 'image' : null,
            'campaign_id' => $campaign->id,
            'campaign_recipient_id' => $recipient->id,
            'delivery_strategy' => $delivery['strategy'],
            'reward_state' => $delivery['reward_state'],
            'recipient_language' => $user->language ?: 'rw',
            'notification_type' => 'promotion',
        ];
    }
}
