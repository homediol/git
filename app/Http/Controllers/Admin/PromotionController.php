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
