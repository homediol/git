<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivity;
use App\Notifications\GenericNotification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $recent = DatabaseNotification::latest()->take(20)->get()->map(function (DatabaseNotification $notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title_rw'] ?? $notification->data['title'] ?? 'Update',
                'title_rw' => $notification->data['title_rw'] ?? $notification->data['title'] ?? '',
                'title_en' => $notification->data['title_en'] ?? '',
                'title_fr' => $notification->data['title_fr'] ?? '',
                'message' => $notification->data['message_rw'] ?? $notification->data['message'] ?? '',
                'message_rw' => $notification->data['message_rw'] ?? $notification->data['message'] ?? '',
                'message_en' => $notification->data['message_en'] ?? '',
                'message_fr' => $notification->data['message_fr'] ?? '',
                'action_url' => $notification->data['action_url'] ?? '',
                'action_text_rw' => $notification->data['action_text_rw'] ?? '',
                'action_text_en' => $notification->data['action_text_en'] ?? '',
                'action_text_fr' => $notification->data['action_text_fr'] ?? '',
                'type' => $notification->data['type'] ?? 'info',
                'notification_type' => $notification->data['notification_type'] ?? 'general',
                'media_url' => $notification->data['media_url'] ?? null,
                'media_type' => $notification->data['media_type'] ?? null,
                'media_name' => $notification->data['media_name'] ?? null,
                'broadcast_id' => $notification->data['broadcast_id'] ?? null,
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
            'media' => 'nullable|file|max:512000',
        ]);

        $broadcastId = (string) Str::uuid();
        $this->ensureNotificationMediaUpload($request, 'media');
        $mediaPayload = $this->storeMedia($request);

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
            'broadcast_id' => $broadcastId,
            'notification_type' => 'general',
        ];

        $payload = array_merge($payload, $mediaPayload);

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
                'broadcast_id' => $broadcastId,
            ],
        ]);

        return back()->with('success', 'Notification sent to all users.');
    }

    public function update(Request $request, DatabaseNotification $notification)
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
            'clear_media' => 'nullable|boolean',
            'media' => 'nullable|file|max:512000',
        ]);

        $payload = $notification->data;
        $payload['title'] = $validated['title_rw'];
        $payload['title_rw'] = $validated['title_rw'];
        $payload['title_en'] = $validated['title_en'] ?? null;
        $payload['title_fr'] = $validated['title_fr'] ?? null;
        $payload['message'] = $validated['message_rw'];
        $payload['message_rw'] = $validated['message_rw'];
        $payload['message_en'] = $validated['message_en'] ?? null;
        $payload['message_fr'] = $validated['message_fr'] ?? null;
        $payload['action_url'] = $validated['action_url'] ?? null;
        $payload['action_text'] = $validated['action_text_rw'] ?? null;
        $payload['action_text_rw'] = $validated['action_text_rw'] ?? null;
        $payload['action_text_en'] = $validated['action_text_en'] ?? null;
        $payload['action_text_fr'] = $validated['action_text_fr'] ?? null;
        $payload['type'] = $validated['type'] ?? ($payload['type'] ?? 'info');

        if ($request->boolean('clear_media')) {
            $payload['media_url'] = null;
            $payload['media_type'] = null;
            $payload['media_name'] = null;
        }

        $this->ensureNotificationMediaUpload($request, 'media');
        $mediaPayload = $this->storeMedia($request);
        if (!empty($mediaPayload)) {
            $payload = array_merge($payload, $mediaPayload);
        }

        $this->updateBroadcastNotifications($notification, $payload);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'notification_updated',
            'meta' => [
                'title' => $payload['title'] ?? 'Update',
                'broadcast_id' => $payload['broadcast_id'] ?? null,
            ],
        ]);

        return back()->with('success', 'Notification updated.');
    }

    public function destroy(Request $request, DatabaseNotification $notification)
    {
        $count = $this->deleteBroadcastNotifications($notification);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'notification_deleted',
            'meta' => [
                'title' => $notification->data['title'] ?? 'Update',
                'broadcast_id' => $notification->data['broadcast_id'] ?? null,
                'count' => $count,
            ],
        ]);

        return back()->with('success', 'Notification deleted.');
    }

    private function ensureNotificationMediaUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (
            !str_starts_with($mime, 'image/')
            && !str_starts_with($mime, 'video/')
            && !str_starts_with($mime, 'audio/')
        ) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid image, video, or audio file.',
            ]);
        }
    }

    private function storeMedia(Request $request): array
    {
        if (!$request->hasFile('media')) {
            return [];
        }

        $file = $request->file('media');
        $path = $file->store('notifications', 'public');
        $mime = $file->getMimeType() ?? '';
        $mediaType = str_starts_with($mime, 'video/')
            ? 'video'
            : (str_starts_with($mime, 'audio/') ? 'audio' : 'image');

        return [
            'media_url' => '/storage/' . $path,
            'media_type' => $mediaType,
            'media_name' => $file->getClientOriginalName(),
        ];
    }

    private function updateBroadcastNotifications(DatabaseNotification $notification, array $payload): void
    {
        $broadcastId = $notification->data['broadcast_id'] ?? null;
        $query = DatabaseNotification::query();

        if ($broadcastId) {
            $query->where('data->broadcast_id', $broadcastId);
        } else {
            $query->whereKey($notification->id);
        }

        $query->get()->each(function (DatabaseNotification $item) use ($payload) {
            $item->update(['data' => array_merge($item->data, $payload)]);
        });
    }

    private function deleteBroadcastNotifications(DatabaseNotification $notification): int
    {
        $broadcastId = $notification->data['broadcast_id'] ?? null;
        $query = DatabaseNotification::query();

        if ($broadcastId) {
            $query->where('data->broadcast_id', $broadcastId);
        } else {
            $query->whereKey($notification->id);
        }

        $count = $query->count();
        $query->delete();

        return $count;
    }
}
