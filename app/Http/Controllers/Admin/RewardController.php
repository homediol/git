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
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:rewards,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'expires_after_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rewards', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $validated['is_active'] = $request->boolean('is_active');

        $reward = Reward::create($validated);

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
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:rewards,slug,' . $reward->id,
            'description' => 'nullable|string',
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

        $validated['is_active'] = $request->boolean('is_active');

        $reward->update($validated);

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
