<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromotionCampaign;
use App\Models\UserActivity;
use App\Services\PromotionCampaignService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PromotionCampaignController extends Controller
{
    public function store(Request $request, PromotionCampaignService $campaignService)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title_rw' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'message_rw' => 'required|string',
            'message_en' => 'nullable|string',
            'message_fr' => 'nullable|string',
            'cta_text_rw' => 'nullable|string|max:255',
            'cta_text_en' => 'nullable|string|max:255',
            'cta_text_fr' => 'nullable|string|max:255',
            'cta_url' => 'nullable|string|max:255',
            'image' => 'nullable|file|max:512000',
            'audience_type' => 'required|in:all_users,new_users,specific_users,booked_service',
            'user_age_segment' => 'nullable|in:all,new,existing',
            'new_user_window_days' => 'nullable|integer|min:1|max:365',
            'target_user_ids' => 'nullable|array',
            'target_user_ids.*' => 'integer|exists:users,id',
            'specific_users' => 'nullable|string',
            'target_service_ids' => 'nullable|array',
            'target_service_ids.*' => 'integer|exists:services,id',
            'reward_filter' => 'nullable|in:any,unused,used,expired,none',
            'reference_reward_id' => 'nullable|integer|exists:rewards,id',
            'smart_reward_mode' => 'nullable|boolean',
            'discount_percent' => 'nullable|integer|min:1|max:100',
            'discount_code' => 'nullable|string|max:50',
            'send_in_app' => 'nullable|boolean',
            'send_email' => 'nullable|boolean',
            'send_sms' => 'nullable|boolean',
        ]);

        if (
            !$request->boolean('send_in_app')
            && !$request->boolean('send_email')
            && !$request->boolean('send_sms')
        ) {
            throw ValidationException::withMessages([
                'send_in_app' => 'Choose at least one delivery channel.',
            ]);
        }

        [$parsedTargetIds, $targetEmails] = $this->parseSpecificUsers($validated['specific_users'] ?? '');
        $selectedTargetIds = collect($validated['target_user_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $targetIds = $selectedTargetIds
            ->merge($parsedTargetIds)
            ->unique()
            ->values()
            ->all();

        if ($validated['audience_type'] === 'specific_users' && empty($targetIds) && empty($targetEmails)) {
            throw ValidationException::withMessages([
                'target_user_ids' => 'Select at least one user from the database.',
            ]);
        }

        if ($validated['audience_type'] === 'booked_service' && empty($validated['target_service_ids'] ?? [])) {
            throw ValidationException::withMessages([
                'target_service_ids' => 'Select at least one booked service category.',
            ]);
        }

        if ($request->hasFile('image')) {
            $this->ensureImageUpload($request, 'image');
            $path = $request->file('image')->store('promotion-campaigns', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $campaign = PromotionCampaign::create([
            'name' => $validated['name'],
            'title_rw' => $validated['title_rw'],
            'title_en' => $validated['title_en'] ?? null,
            'title_fr' => $validated['title_fr'] ?? null,
            'message_rw' => $validated['message_rw'],
            'message_en' => $validated['message_en'] ?? null,
            'message_fr' => $validated['message_fr'] ?? null,
            'cta_text_rw' => $validated['cta_text_rw'] ?? null,
            'cta_text_en' => $validated['cta_text_en'] ?? null,
            'cta_text_fr' => $validated['cta_text_fr'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'image' => $validated['image'] ?? null,
            'audience_type' => $validated['audience_type'],
            'user_age_segment' => $validated['user_age_segment'] ?? 'all',
            'new_user_window_days' => $validated['new_user_window_days'] ?? 30,
            'target_user_ids' => $targetIds,
            'target_emails' => $targetEmails,
            'target_service_ids' => $validated['target_service_ids'] ?? [],
            'reward_filter' => $validated['reward_filter'] ?? 'any',
            'reference_reward_id' => $validated['reference_reward_id'] ?? null,
            'smart_reward_mode' => $request->boolean('smart_reward_mode'),
            'discount_percent' => $validated['discount_percent'] ?? null,
            'discount_code' => $validated['discount_code'] ?? null,
            'send_in_app' => $request->boolean('send_in_app'),
            'send_email' => $request->boolean('send_email'),
            'send_sms' => $request->boolean('send_sms'),
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        $stats = $campaignService->launch($campaign);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'promotion_campaign_sent',
            'meta' => [
                'campaign_id' => $campaign->id,
                'name' => $campaign->name,
                'audience_type' => $campaign->audience_type,
                'recipients' => $stats['recipients'],
                'in_app' => $stats['in_app'],
                'email' => $stats['email'],
                'sms' => $stats['sms'],
            ],
        ]);

        return back()->with('success', 'Promotion campaign sent successfully.');
    }

    private function ensureImageUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (!str_starts_with($mime, 'image/')) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid image file.',
            ]);
        }
    }

    private function parseSpecificUsers(string $value): array
    {
        $tokens = collect(preg_split('/[\s,;]+/', $value) ?: [])
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values();

        $ids = $tokens
            ->filter(fn ($item) => ctype_digit($item))
            ->map(fn ($item) => (int) $item)
            ->values()
            ->all();

        $emails = $tokens
            ->filter(fn ($item) => filter_var($item, FILTER_VALIDATE_EMAIL))
            ->values()
            ->all();

        return [$ids, $emails];
    }
}
