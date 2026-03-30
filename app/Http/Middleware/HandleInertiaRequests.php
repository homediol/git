<?php

namespace App\Http\Middleware;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Promotion;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => fn () => $request->user()?->language ?? 'rw',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'show_promo' => fn () => $request->session()->get('show_promo'),
            ],
            'promotion' => fn () => Promotion::active()->latest()->first(),
            'publicAnnouncements' => fn () => Promotion::active()
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($promotion) {
                    return [
                        'id' => $promotion->id,
                        'title' => $promotion->title,
                        'title_rw' => $promotion->title_rw,
                        'title_en' => $promotion->title_en,
                        'title_fr' => $promotion->title_fr,
                        'message' => $promotion->message,
                        'message_rw' => $promotion->message_rw,
                        'message_en' => $promotion->message_en,
                        'message_fr' => $promotion->message_fr,
                        'cta_url' => $promotion->cta_url,
                        'cta_text' => $promotion->cta_text,
                        'cta_text_rw' => $promotion->cta_text_rw,
                        'cta_text_en' => $promotion->cta_text_en,
                        'cta_text_fr' => $promotion->cta_text_fr,
                        'created_at' => $promotion->created_at,
                    ];
                })
                ->all(),
            'notifications' => function () use ($request) {
                $user = $request->user();

                if (!$user) {
                    return null;
                }

                $items = $user->notifications()->latest()->take(6)->get()->map(function ($notification) {
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
                        'notification_type' => $notification->data['notification_type'] ?? 'general',
                        'media_url' => $notification->data['media_url'] ?? null,
                        'media_type' => $notification->data['media_type'] ?? null,
                        'media_name' => $notification->data['media_name'] ?? null,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at,
                    ];
                })->all();

                return [
                    'items' => $items,
                    'unread_count' => $user->unreadNotifications()->count(),
                ];
            },
            'chatSummary' => function () use ($request) {
                $user = $request->user();

                if (
                    !$user
                    || !Schema::hasTable('chat_threads')
                    || !Schema::hasTable('chat_messages')
                ) {
                    return null;
                }

                if ($user->isAdmin()) {
                    $unreadCount = ChatMessage::query()
                        ->whereNull('read_at')
                        ->where(function ($builder) {
                            $builder->whereNull('sender_id')
                                ->orWhereHas('sender', function ($senderQuery) {
                                    $senderQuery->whereNull('role')->orWhere('role', '!=', 'admin');
                                });
                        })
                        ->count();

                    $openThreads = ChatThread::query()
                        ->whereHas('messages', function ($query) {
                            $query->whereNull('read_at')->where(function ($builder) {
                                $builder->whereNull('sender_id')
                                    ->orWhereHas('sender', function ($senderQuery) {
                                        $senderQuery->whereNull('role')->orWhere('role', '!=', 'admin');
                                    });
                            });
                        })
                        ->count();

                    return [
                        'unread_count' => $unreadCount,
                        'open_threads' => $openThreads,
                    ];
                }

                $thread = ChatThread::query()->where('user_id', $user->id)->first();
                $unreadCount = $thread
                    ? $thread->messages()
                        ->whereNull('read_at')
                        ->whereHas('sender', function ($builder) {
                            $builder->where('role', 'admin');
                        })
                        ->count()
                    : 0;

                return [
                    'unread_count' => $unreadCount,
                    'thread_id' => $thread?->id,
                ];
            },
            'seo' => [
                'title' => config('app.name'),
                'description' => 'Professional digital solutions and creative services',
                'keywords' => 'web development, design, portfolio, services',
            ],
        ]);
    }
}
