<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user?->notifications()->latest()->take(12)->get() ?? collect();
        $unreadCount = $user?->unreadNotifications()->count() ?? 0;

        return response()->json([
            'notifications' => $this->transformNotifications($notifications),
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, DatabaseNotification $notification)
    {
        $this->authorizeNotification($request, $notification);
        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    public function markUnread(Request $request, DatabaseNotification $notification)
    {
        $this->authorizeNotification($request, $notification);
        $notification->update(['read_at' => null]);

        return response()->json(['status' => 'ok']);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    private function authorizeNotification(Request $request, DatabaseNotification $notification): void
    {
        if ($notification->notifiable_id !== $request->user()->id) {
            abort(403);
        }
    }

    private function transformNotifications(Collection $notifications): array
    {
        return $notifications->map(function (DatabaseNotification $notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Update',
                'title_rw' => $notification->data['title_rw'] ?? null,
                'title_en' => $notification->data['title_en'] ?? null,
                'title_fr' => $notification->data['title_fr'] ?? null,
                'message' => $notification->data['message'] ?? '',
                'message_rw' => $notification->data['message_rw'] ?? null,
                'message_en' => $notification->data['message_en'] ?? null,
                'message_fr' => $notification->data['message_fr'] ?? null,
                'action_url' => $notification->data['action_url'] ?? null,
                'action_text' => $notification->data['action_text'] ?? null,
                'action_text_rw' => $notification->data['action_text_rw'] ?? null,
                'action_text_en' => $notification->data['action_text_en'] ?? null,
                'action_text_fr' => $notification->data['action_text_fr'] ?? null,
                'type' => $notification->data['type'] ?? 'info',
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ];
        })->all();
    }
}
