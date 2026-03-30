<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\FirebasePushService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'firebaseConfigured' => app(FirebasePushService::class)->isConfigured(),
            'notificationSettings' => [
                'in_app_notifications_enabled' => (bool) $request->user()->in_app_notifications_enabled,
                'push_notifications_enabled' => (bool) $request->user()->push_notifications_enabled,
                'notification_preferences' => $request->user()->resolvedNotificationPreferences(),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'in_app_notifications_enabled' => ['required', 'boolean'],
            'push_notifications_enabled' => ['required', 'boolean'],
            'notification_preferences' => ['nullable', 'array'],
            'notification_preferences.general.in_app' => ['nullable', 'boolean'],
            'notification_preferences.general.push' => ['nullable', 'boolean'],
            'notification_preferences.chat.in_app' => ['nullable', 'boolean'],
            'notification_preferences.chat.push' => ['nullable', 'boolean'],
            'notification_preferences.booking.in_app' => ['nullable', 'boolean'],
            'notification_preferences.booking.push' => ['nullable', 'boolean'],
            'notification_preferences.promotion.in_app' => ['nullable', 'boolean'],
            'notification_preferences.promotion.push' => ['nullable', 'boolean'],
            'notification_preferences.reward.in_app' => ['nullable', 'boolean'],
            'notification_preferences.reward.push' => ['nullable', 'boolean'],
        ]);

        $request->user()->forceFill([
            'in_app_notifications_enabled' => (bool) $validated['in_app_notifications_enabled'],
            'push_notifications_enabled' => (bool) $validated['push_notifications_enabled'],
            'notification_preferences' => array_replace_recursive(
                $request->user()::defaultNotificationPreferences(),
                $validated['notification_preferences'] ?? [],
            ),
        ])->save();

        return Redirect::route('profile.edit')->with('success', 'Notification settings updated.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
