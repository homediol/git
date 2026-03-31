<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\RewardRewind;
use App\Models\UserReward;
use App\Models\UserActivity;
use App\Notifications\GenericNotification;
use App\Services\RewardService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index()
    {
        app(RewardService::class)->ensureDefaultRewards();

        return Inertia::render('Admin/Rewards/Index', [
            'rewards' => Reward::latest()->get(),
            'userRewards' => UserReward::with(['user', 'reward'])->latest()->take(200)->get()->map(function (UserReward $userReward) {
                return [
                    'id' => $userReward->id,
                    'status' => $userReward->status,
                    'assigned_at' => $userReward->assigned_at,
                    'expires_at' => $userReward->expires_at,
                    'used_at' => $userReward->used_at,
                    'is_expired' => (bool) ($userReward->expires_at && $userReward->expires_at->isPast()),
                    'user' => $userReward->user,
                    'reward' => $userReward->reward,
                ];
            }),
            'rewinds' => RewardRewind::with(['user', 'reward', 'admin'])->latest()->take(40)->get()->map(function (RewardRewind $rewind) {
                return [
                    'id' => $rewind->id,
                    'action' => $rewind->action,
                    'previous_status' => $rewind->previous_status,
                    'new_status' => $rewind->new_status,
                    'previous_expires_at' => $rewind->previous_expires_at,
                    'new_expires_at' => $rewind->new_expires_at,
                    'notes' => $rewind->notes,
                    'created_at' => $rewind->created_at,
                    'user' => $rewind->user,
                    'reward' => $rewind->reward,
                    'admin' => $rewind->admin,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_rw' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'name_fr' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:rewards,slug',
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'image' => 'nullable|file|max:512000',
            'expires_after_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $this->ensureRewardMediaUpload($request, 'image');
            $path = $request->file('image')->store('rewards', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $payload = [
            'name' => $validated['name_rw'],
            'name_rw' => $validated['name_rw'],
            'name_en' => $validated['name_en'] ?? null,
            'name_fr' => $validated['name_fr'] ?? null,
            'slug' => $validated['slug'],
            'description' => $validated['description_rw'] ?? null,
            'description_rw' => $validated['description_rw'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_fr' => $validated['description_fr'] ?? null,
            'expires_after_days' => $validated['expires_after_days'] ?? null,
            'is_active' => $request->boolean('is_active'),
        ];

        if (isset($validated['image'])) {
            $payload['image'] = $validated['image'];
        }

        $reward = Reward::create($payload);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'reward_created',
            'meta' => ['reward_id' => $reward->id, 'name' => $reward->name],
        ]);

        return back()->with('success', 'Reward created.');
    }

    public function update(Request $request, Reward $reward)
    {
        $validated = $request->validate([
            'name_rw' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'name_fr' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:rewards,slug,' . $reward->id,
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'image' => 'nullable|file|max:512000',
            'expires_after_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $this->ensureRewardMediaUpload($request, 'image');
            $path = $request->file('image')->store('rewards', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }

        $payload = [
            'name' => $validated['name_rw'],
            'name_rw' => $validated['name_rw'],
            'name_en' => $validated['name_en'] ?? null,
            'name_fr' => $validated['name_fr'] ?? null,
            'slug' => $validated['slug'],
            'description' => $validated['description_rw'] ?? null,
            'description_rw' => $validated['description_rw'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_fr' => $validated['description_fr'] ?? null,
            'expires_after_days' => $validated['expires_after_days'] ?? null,
            'is_active' => $request->boolean('is_active'),
        ];

        if (isset($validated['image'])) {
            $payload['image'] = $validated['image'];
        }

        $reward->update($payload);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'reward_updated',
            'meta' => ['reward_id' => $reward->id, 'name' => $reward->name],
        ]);

        return back()->with('success', 'Reward updated.');
    }

    private function ensureRewardMediaUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (!str_starts_with($mime, 'image/') && !str_starts_with($mime, 'video/')) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid image or video file.',
            ]);
        }
    }

    public function destroy(Request $request, Reward $reward)
    {
        $reward->delete();

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'reward_deleted',
            'meta' => ['reward_id' => $reward->id, 'name' => $reward->name],
        ]);

        return back()->with('success', 'Reward deleted.');
    }

    public function updateUserReward(Request $request, UserReward $userReward)
    {
        $validated = $request->validate([
            'status' => 'required|in:unused,used',
            'expires_at' => 'nullable|date',
        ]);

        $userReward->loadMissing(['user', 'reward']);

        $updates = [
            'status' => $validated['status'],
            'used_at' => $validated['status'] === 'used' ? now() : null,
        ];

        if (!empty($validated['expires_at'])) {
            $updates['expires_at'] = $validated['expires_at'];
        }

        $userReward->update($updates);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'user_reward_updated',
            'meta' => [
                'user_id' => $userReward->user_id,
                'reward_id' => $userReward->reward_id,
                'status' => $validated['status'],
            ],
        ]);

        $rewardNameRw = $userReward->reward?->name_rw ?: $userReward->reward?->name ?: 'impano';
        $rewardNameEn = $userReward->reward?->name_en ?: $userReward->reward?->name ?: 'reward';
        $rewardNameFr = $userReward->reward?->name_fr ?: $userReward->reward?->name ?: 'recompense';

        $userReward->user?->notify(new GenericNotification([
            'title' => 'Impano yawe yavuguruwe',
            'title_rw' => 'Impano yawe yavuguruwe',
            'title_en' => 'Your reward was updated',
            'title_fr' => 'Votre recompense a ete mise a jour',
            'message' => $validated['status'] === 'used'
                ? 'Impano ya ' . $rewardNameRw . ' yashyizwe ku rwego rwa used.'
                : 'Impano ya ' . $rewardNameRw . ' iraboneka kuri konti yawe.',
            'message_rw' => $validated['status'] === 'used'
                ? 'Impano ya ' . $rewardNameRw . ' yashyizwe ku rwego rwa used.'
                : 'Impano ya ' . $rewardNameRw . ' iraboneka kuri konti yawe.',
            'message_en' => $validated['status'] === 'used'
                ? 'Your ' . $rewardNameEn . ' reward was marked as used.'
                : 'Your ' . $rewardNameEn . ' reward is available on your account.',
            'message_fr' => $validated['status'] === 'used'
                ? 'Votre recompense ' . $rewardNameFr . ' a ete marquee comme utilisee.'
                : 'Votre recompense ' . $rewardNameFr . ' est disponible sur votre compte.',
            'action_url' => route('rewards.index'),
            'action_text' => 'Reba impano',
            'action_text_rw' => 'Reba impano',
            'action_text_en' => 'View reward',
            'action_text_fr' => 'Voir la recompense',
            'type' => $validated['status'] === 'used' ? 'info' : 'success',
            'notification_type' => 'reward',
        ]));

        return back()->with('success', 'User reward updated.');
    }

    public function rewindUserReward(Request $request, UserReward $userReward)
    {
        $validated = $request->validate([
            'action' => 'required|in:reactivate,resend,reset_unused',
            'expires_in_days' => 'nullable|integer|min:1|max:365',
            'notes' => 'nullable|string|max:500',
        ]);

        $userReward->load(['user', 'reward']);

        $days = $validated['expires_in_days'] ?? $userReward->reward?->expires_after_days ?? 30;
        $previousStatus = $userReward->status;
        $previousExpiresAt = $userReward->expires_at;

        $updates = match ($validated['action']) {
            'reactivate' => [
                'status' => 'unused',
                'used_at' => null,
                'expires_at' => now()->addDays($days),
            ],
            'resend' => [
                'status' => 'unused',
                'assigned_at' => now(),
                'used_at' => null,
                'expires_at' => now()->addDays($days),
            ],
            default => [
                'status' => 'unused',
                'used_at' => null,
                'expires_at' => $userReward->expires_at && $userReward->expires_at->isFuture()
                    ? $userReward->expires_at
                    : now()->addDays($days),
            ],
        };

        DB::transaction(function () use ($request, $userReward, $validated, $updates, $previousStatus, $previousExpiresAt) {
            $userReward->update($updates);

            RewardRewind::create([
                'user_reward_id' => $userReward->id,
                'user_id' => $userReward->user_id,
                'reward_id' => $userReward->reward_id,
                'admin_id' => $request->user()->id,
                'action' => $validated['action'],
                'previous_status' => $previousStatus,
                'new_status' => $updates['status'] ?? $previousStatus,
                'previous_expires_at' => $previousExpiresAt,
                'new_expires_at' => $updates['expires_at'] ?? $previousExpiresAt,
                'notes' => $validated['notes'] ?? null,
                'meta' => [
                    'expires_in_days' => $validated['expires_in_days'] ?? null,
                ],
            ]);

            UserActivity::create([
                'user_id' => $request->user()->id,
                'action' => 'reward_rewound',
                'meta' => [
                    'user_reward_id' => $userReward->id,
                    'target_user_id' => $userReward->user_id,
                    'reward_id' => $userReward->reward_id,
                    'action' => $validated['action'],
                ],
            ]);
        });

        $userReward->refresh()->load(['user', 'reward']);

        $rewardNameRw = $userReward->reward?->name_rw ?: $userReward->reward?->name ?: 'impano';
        $rewardNameEn = $userReward->reward?->name_en ?: $userReward->reward?->name ?: 'reward';
        $rewardNameFr = $userReward->reward?->name_fr ?: $userReward->reward?->name ?: 'recompense';

        $userReward->user?->notify(new GenericNotification([
            'title' => 'Impano yawe yasubiwemo',
            'title_rw' => 'Impano yawe yasubiwemo',
            'title_en' => 'Your reward was updated',
            'title_fr' => 'Votre recompense a ete remise a jour',
            'message' => 'Serivisi ya ' . $rewardNameRw . ' yongeye kuboneka kuri konti yawe.',
            'message_rw' => 'Serivisi ya ' . $rewardNameRw . ' yongeye kuboneka kuri konti yawe.',
            'message_en' => 'Your ' . $rewardNameEn . ' reward is available again on your account.',
            'message_fr' => 'Votre recompense ' . $rewardNameFr . ' est de nouveau disponible sur votre compte.',
            'action_url' => route('rewards.index'),
            'action_text' => 'Reba impano',
            'action_text_rw' => 'Reba impano',
            'action_text_en' => 'View reward',
            'action_text_fr' => 'Voir la recompense',
            'type' => 'success',
            'notification_type' => 'reward',
        ]));

        return back()->with('success', 'Reward rewind completed.');
    }
}
