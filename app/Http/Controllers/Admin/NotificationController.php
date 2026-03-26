<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivity;
use App\Notifications\GenericNotification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $recent = DatabaseNotification::latest()->take(20)->get()->map(function (DatabaseNotification $notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title_rw'] ?? $notification->data['title'] ?? 'Update',
                'message' => $notification->data['message_rw'] ?? $notification->data['message'] ?? '',
                'created_at' => $notification->created_at,
            ];
        });

        return Inertia::render('Admin/Notifications/Index', [
            'recentNotifications' => $recent,
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
            'action_url' => 'nullable|string|max:255',
            'action_text_rw' => 'nullable|string|max:255',
            'action_text_en' => 'nullable|string|max:255',
            'action_text_fr' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:50',
        ]);

        $payload = [
            'title' => $validated['title_rw'],
            'title_rw' => $validated['title_rw'],
            'title_en' => $validated['title_en'] ?? null,
            'title_fr' => $validated['title_fr'] ?? null,
            'message' => $validated['message_rw'],
            'message_rw' => $validated['message_rw'],
            'message_en' => $validated['message_en'] ?? null,
            'message_fr' => $validated['message_fr'] ?? null,
            'action_url' => $validated['action_url'] ?? null,
            'action_text' => $validated['action_text_rw'] ?? null,
            'action_text_rw' => $validated['action_text_rw'] ?? null,
            'action_text_en' => $validated['action_text_en'] ?? null,
            'action_text_fr' => $validated['action_text_fr'] ?? null,
            'type' => $validated['type'] ?? 'info',
        ];

        User::query()->chunk(200, function ($users) use ($payload) {
            foreach ($users as $user) {
                $user->notify(new GenericNotification($payload));
            }
        });

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'notification_sent',
            'meta' => [
                'title' => $payload['title'],
                'message' => $payload['message'],
            ],
        ]);

        return back()->with('success', 'Notification sent to all users.');
    }
}
