<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\UserReward;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Rewards/Index', [
            'rewards' => Reward::latest()->get(),
            'userRewards' => UserReward::with(['user', 'reward'])->latest()->take(200)->get(),
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'expires_after_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'expires_after_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
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

        return back()->with('success', 'User reward updated.');
    }
}
