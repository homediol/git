<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromotionCampaign;
use App\Models\Promotion;
use App\Models\Reward;
use App\Models\Service;
use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromotionController extends Controller
{
    public function index()
    {
        $campaigns = PromotionCampaign::with([
            'creator',
            'referenceReward',
            'recipients.user.bookings',
        ])
            ->latest()
            ->get()
            ->map(function (PromotionCampaign $campaign) {
                $launchTime = $campaign->launched_at ?? $campaign->created_at;
                $recipients = $campaign->recipients;

                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'title_rw' => $campaign->title_rw,
                    'title_en' => $campaign->title_en,
                    'title_fr' => $campaign->title_fr,
                    'message_rw' => $campaign->message_rw,
                    'message_en' => $campaign->message_en,
                    'message_fr' => $campaign->message_fr,
                    'cta_text_rw' => $campaign->cta_text_rw,
                    'cta_text_en' => $campaign->cta_text_en,
                    'cta_text_fr' => $campaign->cta_text_fr,
                    'cta_url' => $campaign->cta_url,
                    'image' => $campaign->image,
                    'audience_type' => $campaign->audience_type,
                    'user_age_segment' => $campaign->user_age_segment,
                    'new_user_window_days' => $campaign->new_user_window_days,
                    'reward_filter' => $campaign->reward_filter,
                    'smart_reward_mode' => $campaign->smart_reward_mode,
                    'discount_percent' => $campaign->discount_percent,
                    'discount_code' => $campaign->discount_code,
                    'send_in_app' => $campaign->send_in_app,
                    'send_email' => $campaign->send_email,
                    'send_sms' => $campaign->send_sms,
                    'status' => $campaign->status,
                    'launched_at' => $campaign->launched_at,
                    'created_at' => $campaign->created_at,
                    'created_by' => $campaign->creator?->name,
                    'reference_reward' => $campaign->referenceReward ? [
                        'id' => $campaign->referenceReward->id,
                        'name' => $campaign->referenceReward->name_rw ?: $campaign->referenceReward->name,
                    ] : null,
                    'target_user_ids' => $campaign->target_user_ids ?? [],
                    'target_emails' => $campaign->target_emails ?? [],
                    'target_service_ids' => $campaign->target_service_ids ?? [],
                    'stats' => [
                        'recipients' => $recipients->count(),
                        'opened' => $recipients->whereNotNull('opened_at')->count(),
                        'in_app' => $recipients->whereNotNull('in_app_sent_at')->count(),
                        'email' => $recipients->whereNotNull('email_sent_at')->count(),
                        'sms' => $recipients->whereNotNull('sms_sent_at')->count(),
                        'reminders' => $recipients->where('delivery_strategy', 'reward_reminder')->count(),
                        'discounts' => $recipients->where('delivery_strategy', 'discount')->count(),
                        'conversions' => $recipients->filter(function ($recipient) use ($launchTime) {
                            return $recipient->user?->bookings?->contains(function ($booking) use ($launchTime) {
                                return $booking->created_at && $launchTime && $booking->created_at->gt($launchTime);
                            });
                        })->count(),
                    ],
                    'recipients' => $recipients->take(10)->map(function ($recipient) {
                        return [
                            'id' => $recipient->id,
                            'delivery_strategy' => $recipient->delivery_strategy,
                            'reward_state' => $recipient->reward_state,
                            'in_app_sent_at' => $recipient->in_app_sent_at,
                            'email_sent_at' => $recipient->email_sent_at,
                            'sms_sent_at' => $recipient->sms_sent_at,
                            'opened_at' => $recipient->opened_at,
                            'channel_results' => $recipient->channel_results ?? [],
                            'created_at' => $recipient->created_at,
                            'user' => $recipient->user ? [
                                'id' => $recipient->user->id,
                                'name' => $recipient->user->name,
                                'email' => $recipient->user->email,
                                'phone' => $recipient->user->phone,
                            ] : null,
                        ];
                    })->values(),
                ];
            });

        return Inertia::render('Admin/Promotions/Index', [
            'promotions' => Promotion::latest()->get(),
            'campaigns' => $campaigns,
            'serviceOptions' => Service::orderBy('title')->get(['id', 'title']),
            'rewardOptions' => Reward::orderBy('name')->get(['id', 'name', 'name_rw', 'name_en', 'name_fr']),
            'userOptions' => User::query()
                ->where(function ($query) {
                    $query->whereNull('role')->orWhere('role', '!=', 'admin');
                })
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone', 'created_at'])
                ->map(function (User $user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'created_at' => $user->created_at,
                    ];
                }),
            'audienceStats' => [
                'users' => User::query()
                    ->where(function ($query) {
                        $query->whereNull('role')->orWhere('role', '!=', 'admin');
                    })
                    ->count(),
                'newUsers30d' => User::query()
                    ->where(function ($query) {
                        $query->whereNull('role')->orWhere('role', '!=', 'admin');
                    })
                    ->where('created_at', '>=', now()->subDays(30))
                    ->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title_rw' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'message_rw' => 'required|string',
            'message_en' => 'nullable|string',
            'message_fr' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'cta_text_rw' => 'nullable|string|max:255',
            'cta_text_en' => 'nullable|string|max:255',
            'cta_text_fr' => 'nullable|string|max:255',
            'cta_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('promotions', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $payload = [
            'title' => $validated['title_rw'],
            'title_rw' => $validated['title_rw'],
            'title_en' => $validated['title_en'] ?? null,
            'title_fr' => $validated['title_fr'] ?? null,
            'message' => $validated['message_rw'],
            'message_rw' => $validated['message_rw'],
            'message_en' => $validated['message_en'] ?? null,
            'message_fr' => $validated['message_fr'] ?? null,
            'cta_text' => $validated['cta_text_rw'] ?? null,
            'cta_text_rw' => $validated['cta_text_rw'] ?? null,
            'cta_text_en' => $validated['cta_text_en'] ?? null,
            'cta_text_fr' => $validated['cta_text_fr'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'is_active' => $request->boolean('is_active'),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'created_by' => $request->user()->id,
        ];

        if (isset($validated['image'])) {
            $payload['image'] = $validated['image'];
        }

        $promotion = Promotion::create($payload);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'promotion_created',
            'meta' => ['promotion_id' => $promotion->id, 'title' => $promotion->title],
        ]);

        return back()->with('success', 'Promotion created.');
    }

    public function update(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'title_rw' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'message_rw' => 'required|string',
            'message_en' => 'nullable|string',
            'message_fr' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'cta_text_rw' => 'nullable|string|max:255',
            'cta_text_en' => 'nullable|string|max:255',
            'cta_text_fr' => 'nullable|string|max:255',
            'cta_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('promotions', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }

        $payload = [
            'title' => $validated['title_rw'],
            'title_rw' => $validated['title_rw'],
            'title_en' => $validated['title_en'] ?? null,
            'title_fr' => $validated['title_fr'] ?? null,
            'message' => $validated['message_rw'],
            'message_rw' => $validated['message_rw'],
            'message_en' => $validated['message_en'] ?? null,
            'message_fr' => $validated['message_fr'] ?? null,
            'cta_text' => $validated['cta_text_rw'] ?? null,
            'cta_text_rw' => $validated['cta_text_rw'] ?? null,
            'cta_text_en' => $validated['cta_text_en'] ?? null,
            'cta_text_fr' => $validated['cta_text_fr'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'is_active' => $request->boolean('is_active'),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
        ];

        if (isset($validated['image'])) {
            $payload['image'] = $validated['image'];
        }

        $promotion->update($payload);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'promotion_updated',
            'meta' => ['promotion_id' => $promotion->id, 'title' => $promotion->title],
        ]);

        return back()->with('success', 'Promotion updated.');
    }

    public function destroy(Request $request, Promotion $promotion)
    {
        $promotion->delete();

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'promotion_deleted',
            'meta' => ['promotion_id' => $promotion->id, 'title' => $promotion->title],
        ]);

        return back()->with('success', 'Promotion deleted.');
    }
}
