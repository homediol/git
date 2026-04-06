<?php

namespace App\Http\Controllers;

use App\Models\PromotionCampaignRecipient;
use App\Services\WelcomeOfferService;
use Illuminate\Http\Request;
use App\Models\SiteSettings;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Rewards/Index', [
            'rewards' => $user->userRewards()->with('reward.service')->latest()->get(),
            'campaignOffers' => PromotionCampaignRecipient::with(['campaign.referenceReward.service'])
                ->where('user_id', $user->id)
                ->whereIn('delivery_strategy', ['reward_reminder', 'discount', 'discount_rewind'])
                ->latest()
                ->take(12)
                ->get()
                ->map(function (PromotionCampaignRecipient $recipient) {
                    $payload = (array) data_get($recipient->meta, 'rendered_payload', []);
                    $campaign = $recipient->campaign;
                    $reward = $campaign?->referenceReward;
                    $service = $reward?->service;

                    return [
                        'id' => $recipient->id,
                        'delivery_strategy' => $recipient->delivery_strategy,
                        'offer_type' => data_get($recipient->meta, 'offer_type', $campaign?->offer_type),
                        'created_at' => $recipient->created_at,
                        'opened_at' => $recipient->opened_at,
                        'title_rw' => $payload['title_rw'] ?? $campaign?->title_rw,
                        'title_en' => $payload['title_en'] ?? $campaign?->title_en,
                        'title_fr' => $payload['title_fr'] ?? $campaign?->title_fr,
                        'message_rw' => $payload['message_rw'] ?? $campaign?->message_rw,
                        'message_en' => $payload['message_en'] ?? $campaign?->message_en,
                        'message_fr' => $payload['message_fr'] ?? $campaign?->message_fr,
                        'action_url' => $payload['action_url'] ?? $campaign?->cta_url ?? route('rewards.index'),
                        'action_text_rw' => $payload['action_text_rw'] ?? $campaign?->cta_text_rw ?? 'Reba offer',
                        'action_text_en' => $payload['action_text_en'] ?? $campaign?->cta_text_en ?? 'Open offer',
                        'action_text_fr' => $payload['action_text_fr'] ?? $campaign?->cta_text_fr ?? 'Voir l offre',
                        'image' => $campaign?->image,
                        'discount_percent' => $campaign?->discount_percent,
                        'discount_code' => $campaign?->discount_code,
                        'original_price_rwf' => $campaign?->original_price_rwf,
                        'discounted_price_rwf' => $campaign?->discounted_price_rwf,
                        'service' => $service ? [
                            'id' => $service->id,
                            'title' => $service->title,
                            'title_rw' => $service->title_rw,
                            'title_en' => $service->title_en,
                            'title_fr' => $service->title_fr,
                        ] : null,
                        'reward' => $reward ? [
                            'id' => $reward->id,
                            'name' => $reward->name,
                            'name_rw' => $reward->name_rw,
                            'name_en' => $reward->name_en,
                            'name_fr' => $reward->name_fr,
                        ] : null,
                    ];
                })
                ->values(),
            'welcomeOffer' => app(WelcomeOfferService::class)->forFrontend($user),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }
}
