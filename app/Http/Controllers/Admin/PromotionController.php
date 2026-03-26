<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromotionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Promotions/Index', [
            'promotions' => Promotion::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'cta_text' => 'nullable|string|max:255',
            'cta_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('promotions', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $validated['is_active'] = $request->boolean('is_active');
        $validated['created_by'] = $request->user()->id;

        $promotion = Promotion::create($validated);

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
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'cta_text' => 'nullable|string|max:255',
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

        $validated['is_active'] = $request->boolean('is_active');

        $promotion->update($validated);

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
