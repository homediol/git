<?php

namespace App\Services;

use App\Mail\PromotionCampaignMail;
use App\Models\PromotionCampaign;
use App\Models\PromotionCampaignRecipient;
use App\Models\RewardRewind;
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
            'free_rewards' => 0,
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
                    'meta' => [],
                    'channel_results' => [],
                ]
            );

            if ($delivery['strategy'] === 'free_reward') {
                $delivery['reward'] = $this->grantRewardToUser($campaign, $user);
                $delivery['reward_state'] = $this->resolveRewardState($delivery['reward']);
                $recipient->reward_state = $delivery['reward_state'];
            }

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

            $recipient->delivery_strategy = $delivery['strategy'];
            $recipient->meta = $this->buildRecipientMeta($campaign, $delivery, $payload);
            $recipient->channel_results = $channelResults;
            $recipient->save();

            $stats['recipients']++;
            if ($delivery['strategy'] === 'free_reward') {
                $stats['free_rewards']++;
            }
            if ($delivery['strategy'] === 'reward_reminder') {
                $stats['reminders']++;
            }
            if (in_array($delivery['strategy'], ['discount', 'discount_rewind'], true)) {
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

        if ($campaign->audience_type === 'users_with_bookings') {
            $query->whereHas('bookings', function (Builder $builder) use ($campaign) {
                $this->applyBookingStatusFilter($builder, $campaign);
            });
            return;
        }

        if ($campaign->audience_type === 'users_without_bookings') {
            $query->whereDoesntHave('bookings', function (Builder $builder) use ($campaign) {
                $this->applyBookingStatusFilter($builder, $campaign);
            });
            return;
        }

        if ($campaign->audience_type === 'booked_service') {
            $serviceIds = collect($campaign->target_service_ids ?? [])->filter()->map(fn ($id) => (int) $id)->filter();

            if ($serviceIds->isEmpty()) {
                $query->whereRaw('1 = 0');
                return;
            }

            $query->whereHas('bookings', function (Builder $builder) use ($campaign, $serviceIds) {
                $builder->whereIn('service_id', $serviceIds->all());
                $this->applyBookingStatusFilter($builder, $campaign);
            });
        }
    }

    private function applyBookingStatusFilter(Builder $builder, PromotionCampaign $campaign): void
    {
        $status = $campaign->booking_status_filter ?: 'any';

        if ($status !== 'any') {
            $builder->where('status', $status);
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
        $offerType = $this->resolveOfferType($campaign);
        $strategy = match ($offerType) {
            'free_reward' => 'free_reward',
            'discount_rewind' => 'discount_rewind',
            default => 'standard',
        };

        if ($offerType === 'smart_reward') {
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

    private function resolveOfferType(PromotionCampaign $campaign): string
    {
        if (!empty($campaign->offer_type)) {
            return $campaign->offer_type;
        }

        return $campaign->smart_reward_mode ? 'smart_reward' : 'standard';
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
            $unused->loadMissing('reward.service');
            return $unused;
        }

        $used = $rewards->first(fn (UserReward $reward) => $reward->status === 'used');
        if ($used) {
            $used->loadMissing('reward.service');
            return $used;
        }

        return $rewards->first()?->loadMissing('reward.service');
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
        $actionUrl = $this->resolveActionUrl($campaign, $delivery);

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

        if ($delivery['strategy'] === 'free_reward' && $reward?->reward) {
            $rewardNameRw = $reward->reward->name_rw ?: $reward->reward->name;
            $rewardNameEn = $reward->reward->name_en ?: $reward->reward->name;
            $rewardNameFr = $reward->reward->name_fr ?: $reward->reward->name;
            $expiryRw = $reward->expires_at ? ' Izarangira ku ' . $reward->expires_at->format('Y-m-d') . '.' : '';
            $expiryEn = $reward->expires_at ? ' It expires on ' . $reward->expires_at->format('Y-m-d') . '.' : '';
            $expiryFr = $reward->expires_at ? ' Elle expire le ' . $reward->expires_at->format('Y-m-d') . '.' : '';

            $titleRw .= ' - Impano ya serivisi';
            $titleEn .= ' - Free reward unlocked';
            $titleFr .= ' - Recompense gratuite activee';
            $messageRw .= ' Twongeye kugushyiriraho impano ya ' . $rewardNameRw . '.' . $expiryRw;
            $messageEn .= ' We unlocked your free ' . $rewardNameEn . ' reward.' . $expiryEn;
            $messageFr .= ' Nous avons active votre recompense gratuite ' . $rewardNameFr . '.' . $expiryFr;
        }

        if (in_array($delivery['strategy'], ['discount', 'discount_rewind'], true)) {
            $discountPercent = $campaign->discount_percent ? $campaign->discount_percent . '%' : 'special';
            $discountCode = $campaign->discount_code ? ' Code: ' . $campaign->discount_code . '.' : '';
            $priceRw = $this->formatDiscountPriceMessage($campaign, 'rw');
            $priceEn = $this->formatDiscountPriceMessage($campaign, 'en');
            $priceFr = $this->formatDiscountPriceMessage($campaign, 'fr');
            $rewardModel = $reward?->reward ?: $campaign->referenceReward;
            $rewardServiceRw = $rewardModel?->service?->title_rw ?: $rewardModel?->service?->title;
            $rewardServiceEn = $rewardModel?->service?->title_en ?: $rewardModel?->service?->title;
            $rewardServiceFr = $rewardModel?->service?->title_fr ?: $rewardModel?->service?->title;
            $serviceSuffixRw = $rewardServiceRw ? ' kuri ' . $rewardServiceRw : '';
            $serviceSuffixEn = $rewardServiceEn ? ' for ' . $rewardServiceEn : '';
            $serviceSuffixFr = $rewardServiceFr ? ' pour ' . $rewardServiceFr : '';

            $titleRw .= $delivery['strategy'] === 'discount_rewind' ? ' - Discount rewind' : ' - Kugabanyirizwa';
            $titleEn .= $delivery['strategy'] === 'discount_rewind' ? ' - Discount rewind' : ' - Discount for you';
            $titleFr .= $delivery['strategy'] === 'discount_rewind' ? ' - Reprise remise' : ' - Remise pour vous';
            $messageRw .= ' Dufite kugabanyirizwa ' . $discountPercent . $serviceSuffixRw . '.' . $priceRw . $discountCode;
            $messageEn .= ' We prepared a ' . $discountPercent . ' discount' . $serviceSuffixEn . '.' . $priceEn . $discountCode;
            $messageFr .= ' Nous avons prepare une remise de ' . $discountPercent . $serviceSuffixFr . '.' . $priceFr . $discountCode;
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
            'action_url' => $actionUrl,
            'action_text' => $campaign->cta_text_rw ?: 'Reba promo',
            'action_text_rw' => $campaign->cta_text_rw ?: 'Reba promo',
            'action_text_en' => $campaign->cta_text_en ?: 'Open offer',
            'action_text_fr' => $campaign->cta_text_fr ?: 'Ouvrir l offre',
            'type' => in_array($delivery['strategy'], ['discount', 'discount_rewind', 'free_reward'], true) ? 'success' : 'info',
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

    private function resolveActionUrl(PromotionCampaign $campaign, array $delivery): string
    {
        if (!empty($campaign->cta_url)) {
            return $campaign->cta_url;
        }

        $userReward = $delivery['reward'];
        $reward = $userReward?->reward ?: $campaign->referenceReward;
        $serviceId = $reward?->service_id;

        if ($serviceId && in_array($delivery['strategy'], ['reward_reminder', 'free_reward'], true) && $userReward?->id) {
            return route('bookings.index', [
                'service' => $serviceId,
                'reward' => $userReward->id,
            ]);
        }

        if ($serviceId) {
            return route('bookings.index', ['service' => $serviceId]);
        }

        return route('rewards.index');
    }

    private function grantRewardToUser(PromotionCampaign $campaign, User $user): ?UserReward
    {
        $reward = $campaign->referenceReward;

        if (!$reward) {
            return null;
        }

        $days = $reward->expires_after_days ?: 30;
        $existing = UserReward::query()
            ->where('user_id', $user->id)
            ->where('reward_id', $reward->id)
            ->first();

        $previousStatus = $existing?->status;
        $previousExpiresAt = $existing?->expires_at;

        $userReward = UserReward::updateOrCreate(
            [
                'user_id' => $user->id,
                'reward_id' => $reward->id,
            ],
            [
                'status' => 'unused',
                'assigned_at' => now(),
                'used_at' => null,
                'expires_at' => now()->addDays($days),
            ]
        );

        if ($existing) {
            RewardRewind::create([
                'user_reward_id' => $userReward->id,
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'admin_id' => $campaign->created_by,
                'action' => 'campaign_rewind',
                'previous_status' => $previousStatus,
                'new_status' => $userReward->status,
                'previous_expires_at' => $previousExpiresAt,
                'new_expires_at' => $userReward->expires_at,
                'notes' => 'Promotion campaign reward rewind: ' . $campaign->name,
                'meta' => [
                    'campaign_id' => $campaign->id,
                    'offer_type' => $this->resolveOfferType($campaign),
                ],
            ]);
        }

        return $userReward->loadMissing('reward.service');
    }

    private function buildRecipientMeta(PromotionCampaign $campaign, array $delivery, array $payload): array
    {
        $userReward = $delivery['reward'];
        $reward = $userReward?->reward ?: $campaign->referenceReward;
        $service = $reward?->service;

        return [
            'offer_type' => $this->resolveOfferType($campaign),
            'reward_id' => $reward?->id,
            'reward_name' => $reward?->name_rw ?: $reward?->name,
            'service_id' => $service?->id,
            'service_title' => $service?->title_rw ?: $service?->title,
            'user_reward_id' => $userReward?->id,
            'reward_expires_at' => $userReward?->expires_at?->toIso8601String(),
            'discount_percent' => $campaign->discount_percent,
            'discount_code' => $campaign->discount_code,
            'original_price_rwf' => $campaign->original_price_rwf,
            'discounted_price_rwf' => $campaign->discounted_price_rwf,
            'rendered_payload' => [
                'title_rw' => $payload['title_rw'] ?? null,
                'title_en' => $payload['title_en'] ?? null,
                'title_fr' => $payload['title_fr'] ?? null,
                'message_rw' => $payload['message_rw'] ?? null,
                'message_en' => $payload['message_en'] ?? null,
                'message_fr' => $payload['message_fr'] ?? null,
                'action_url' => $payload['action_url'] ?? null,
                'action_text_rw' => $payload['action_text_rw'] ?? null,
                'action_text_en' => $payload['action_text_en'] ?? null,
                'action_text_fr' => $payload['action_text_fr'] ?? null,
                'type' => $payload['type'] ?? null,
            ],
        ];
    }

    private function formatDiscountPriceMessage(PromotionCampaign $campaign, string $locale): string
    {
        if (!$campaign->original_price_rwf || !$campaign->discounted_price_rwf) {
            return '';
        }

        return match ($locale) {
            'rw' => ' Igiciro cyavuye kuri ' . number_format($campaign->original_price_rwf) . ' FRW kijya kuri ' . number_format($campaign->discounted_price_rwf) . ' FRW.',
            'fr' => ' Le prix est passe de ' . number_format($campaign->original_price_rwf) . ' FRW a ' . number_format($campaign->discounted_price_rwf) . ' FRW.',
            default => ' The price moved from ' . number_format($campaign->original_price_rwf) . ' FRW to ' . number_format($campaign->discounted_price_rwf) . ' FRW.',
        };
    }
}
