<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use App\Notifications\GenericNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupportChatService
{
    public function getOrCreateThreadForUser(User $user): ChatThread
    {
        return ChatThread::firstOrCreate(['user_id' => $user->id]);
    }

    public function findGuestThread(string $guestSessionKey): ?ChatThread
    {
        return ChatThread::query()
            ->where('guest_session_key', $guestSessionKey)
            ->first();
    }

    public function getOrCreateThreadForGuest(string $guestSessionKey, array $guestDetails = []): ChatThread
    {
        $thread = ChatThread::firstOrCreate(
            ['guest_session_key' => $guestSessionKey],
            ['user_id' => null]
        );

        $this->syncGuestDetails($thread, $guestDetails);

        return $thread->refresh();
    }

    public function sendMessage(ChatThread $thread, User $sender, string $body): ChatMessage
    {
        $message = DB::transaction(function () use ($thread, $sender, $body) {
            $message = $thread->messages()->create([
                'sender_id' => $sender->id,
                'body' => trim($body),
            ]);

            $thread->update([
                'assigned_admin_id' => $sender->isAdmin()
                    ? ($thread->assigned_admin_id ?: $sender->id)
                    : $thread->assigned_admin_id,
                'last_message_at' => $message->created_at,
            ]);

            return $message;
        });

        $message->load('sender');
        $thread->refresh()->load('user');
        $this->notifyParticipants($thread, $message, $sender);

        return $message;
    }

    public function sendGuestMessage(ChatThread $thread, string $body, array $guestDetails = []): ChatMessage
    {
        $this->syncGuestDetails($thread, $guestDetails);

        $message = DB::transaction(function () use ($thread, $body) {
            $message = $thread->messages()->create([
                'sender_id' => null,
                'body' => trim($body),
            ]);

            $thread->update([
                'last_message_at' => $message->created_at,
            ]);

            return $message;
        });

        $thread->refresh()->load('user');
        $this->notifyAdminsOfGuestMessage($thread, $message);

        return $message;
    }

    public function updateMessage(ChatThread $thread, ChatMessage $message, User $actor, string $body): ChatMessage
    {
        $this->assertMessageCanBeManaged($thread, $message, $actor);

        $message->update([
            'body' => trim($body),
            'edited_at' => now(),
        ]);

        return $message->refresh()->load('sender');
    }

    public function updateGuestMessage(ChatThread $thread, ChatMessage $message, string $body): ChatMessage
    {
        $this->assertGuestMessageCanBeManaged($thread, $message);

        $message->update([
            'body' => trim($body),
            'edited_at' => now(),
        ]);

        return $message->refresh()->load('sender');
    }

    public function deleteMessage(ChatThread $thread, ChatMessage $message, User $actor): void
    {
        $this->assertMessageCanBeManaged($thread, $message, $actor);

        DB::transaction(function () use ($thread, $message) {
            $message->delete();
            $this->syncThreadLastMessageAt($thread);
        });
    }

    public function deleteGuestMessage(ChatThread $thread, ChatMessage $message): void
    {
        $this->assertGuestMessageCanBeManaged($thread, $message);

        DB::transaction(function () use ($thread, $message) {
            $message->delete();
            $this->syncThreadLastMessageAt($thread);
        });
    }

    public function deleteThread(ChatThread $thread): void
    {
        DB::transaction(function () use ($thread) {
            $thread->delete();
        });
    }

    public function markIncomingMessagesAsRead(ChatThread $thread, ?User $viewer = null, string $viewerType = 'user'): int
    {
        $query = $thread->messages()->whereNull('read_at');

        if ($viewerType === 'admin' || $viewer?->isAdmin()) {
            $this->applyCustomerMessageScope($query);
        } else {
            $this->applyAdminMessageScope($query);
        }

        return $query->update([
            'read_at' => now(),
        ]);
    }

    public function serializeThread(ChatThread $thread, ?User $viewer = null, ?Collection $messages = null, string $viewerType = 'user'): array
    {
        $thread->loadMissing(['user', 'assignedAdmin']);
        $messages = ($messages ?? $thread->messages()->with('sender')->orderBy('created_at')->get())
            ->sortBy('created_at')
            ->values();

        $participant = $this->serializeParticipant($thread);

        return [
            'id' => $thread->id,
            'last_message_at' => $thread->last_message_at,
            'user' => $participant,
            'assigned_admin' => $thread->assignedAdmin ? [
                'id' => $thread->assignedAdmin->id,
                'name' => $thread->assignedAdmin->name,
                'email' => $thread->assignedAdmin->email,
            ] : null,
            'messages' => $messages->map(function (ChatMessage $message) use ($viewer, $viewerType, $thread) {
                $isMine = $viewerType === 'guest'
                    ? $message->sender_id === null
                    : ($viewer && (int) $message->sender_id === (int) $viewer->id);

                return [
                    'id' => $message->id,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'read_at' => $message->read_at,
                    'edited_at' => $message->edited_at,
                    'is_mine' => $isMine,
                    'can_manage' => $isMine,
                    'sender' => [
                        'id' => $message->sender?->id,
                        'name' => $message->sender?->name ?? ($message->sender_id === null ? $this->guestDisplayName($thread) : null),
                        'email' => $message->sender?->email ?? ($message->sender_id === null ? $thread->guest_email : null),
                        'role' => $message->sender?->role ?? ($message->sender_id === null ? 'guest' : null),
                    ],
                ];
            })->values(),
        ];
    }

    public function adminThreadSummaries(): Collection
    {
        return ChatThread::with(['user', 'assignedAdmin', 'latestMessage.sender'])
            ->withCount([
                'messages as unread_count' => function ($query) {
                    $query->whereNull('read_at');
                    $this->applyCustomerMessageScope($query);
                },
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (ChatThread $thread) {
                $latestMessage = $thread->latestMessage;

                return [
                    'id' => $thread->id,
                    'last_message_at' => $thread->last_message_at,
                    'unread_count' => $thread->unread_count,
                    'user' => $this->serializeParticipant($thread),
                    'assigned_admin' => $thread->assignedAdmin ? [
                        'id' => $thread->assignedAdmin->id,
                        'name' => $thread->assignedAdmin->name,
                    ] : null,
                    'latest_message' => $latestMessage ? [
                        'id' => $latestMessage->id,
                        'body' => Str::limit($latestMessage->body, 90),
                        'created_at' => $latestMessage->created_at,
                        'sender_name' => $latestMessage->sender?->name ?? ($latestMessage->sender_id === null ? $this->guestDisplayName($thread) : null),
                        'sender_role' => $latestMessage->sender?->role ?? ($latestMessage->sender_id === null ? 'guest' : null),
                    ] : null,
                ];
            })
            ->values();
    }

    public function unreadCountFor(User $user): int
    {
        if ($user->isAdmin()) {
            $query = ChatMessage::query()->whereNull('read_at');
            $this->applyCustomerMessageScope($query);

            return $query->count();
        }

        $thread = ChatThread::query()->where('user_id', $user->id)->first();
        if (!$thread) {
            return 0;
        }

        $query = $thread->messages()->whereNull('read_at');
        $this->applyAdminMessageScope($query);

        return $query->count();
    }

    public function unreadCountForGuest(?ChatThread $thread): int
    {
        if (!$thread) {
            return 0;
        }

        $query = $thread->messages()->whereNull('read_at');
        $this->applyAdminMessageScope($query);

        return $query->count();
    }

    private function notifyParticipants(ChatThread $thread, ChatMessage $message, User $sender): void
    {
        $snippet = Str::limit($message->body, 120);

        if ($sender->isAdmin()) {
            $thread->user?->notify(new GenericNotification([
                'title' => 'New reply from Pavona Studio',
                'title_rw' => 'Ubutumwa bushya buvuye kuri Pavona Studio',
                'title_en' => 'New reply from Pavona Studio',
                'title_fr' => 'Nouvelle reponse de Pavona Studio',
                'message' => $snippet,
                'message_rw' => 'Itsinda rya Pavona ryagusubije: ' . $snippet,
                'message_en' => 'The Pavona team replied: ' . $snippet,
                'message_fr' => 'L equipe Pavona a repondu : ' . $snippet,
                'action_url' => route('dashboard', ['chat' => 'company']),
                'action_text' => 'Open chat',
                'action_text_rw' => 'Fungura chat',
                'action_text_en' => 'Open chat',
                'action_text_fr' => 'Ouvrir le chat',
                'type' => 'info',
                'notification_type' => 'chat',
            ]));

            return;
        }

        $admins = User::query()->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new GenericNotification([
                'title' => 'New customer message',
                'title_rw' => 'Ubutumwa bushya bw umukiriya',
                'title_en' => 'New customer message',
                'title_fr' => 'Nouveau message client',
                'message' => "{$sender->name}: {$snippet}",
                'message_rw' => "{$sender->name}: {$snippet}",
                'message_en' => "{$sender->name}: {$snippet}",
                'message_fr' => "{$sender->name} : {$snippet}",
                'action_url' => route('admin.messages', ['thread' => $thread->id]),
                'action_text' => 'Open inbox',
                'action_text_rw' => 'Fungura inbox',
                'action_text_en' => 'Open inbox',
                'action_text_fr' => 'Ouvrir la boite',
                'type' => 'info',
                'notification_type' => 'chat',
            ]));
        }
    }

    private function notifyAdminsOfGuestMessage(ChatThread $thread, ChatMessage $message): void
    {
        $snippet = Str::limit($message->body, 120);
        $guestName = $this->guestDisplayName($thread);
        $guestContact = $this->guestContactSummary($thread);
        $admins = User::query()->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new GenericNotification([
                'title' => 'New guest message',
                'title_rw' => 'Ubutumwa bushya bw umushyitsi',
                'title_en' => 'New guest message',
                'title_fr' => 'Nouveau message invite',
                'message' => $guestContact ? "{$guestName} ({$guestContact}): {$snippet}" : "{$guestName}: {$snippet}",
                'message_rw' => $guestContact ? "{$guestName} ({$guestContact}): {$snippet}" : "{$guestName}: {$snippet}",
                'message_en' => $guestContact ? "{$guestName} ({$guestContact}): {$snippet}" : "{$guestName}: {$snippet}",
                'message_fr' => $guestContact ? "{$guestName} ({$guestContact}) : {$snippet}" : "{$guestName} : {$snippet}",
                'action_url' => route('admin.messages', ['thread' => $thread->id]),
                'action_text' => 'Open inbox',
                'action_text_rw' => 'Fungura inbox',
                'action_text_en' => 'Open inbox',
                'action_text_fr' => 'Ouvrir la boite',
                'type' => 'info',
                'notification_type' => 'chat',
            ]));
        }
    }

    private function assertMessageCanBeManaged(ChatThread $thread, ChatMessage $message, User $actor): void
    {
        abort_if((int) $message->thread_id !== (int) $thread->id, 404);

        if (!$actor->isAdmin()) {
            abort_if((int) $thread->user_id !== (int) $actor->id, 403);
        }

        abort_if((int) $message->sender_id !== (int) $actor->id, 403);
    }

    private function assertGuestMessageCanBeManaged(ChatThread $thread, ChatMessage $message): void
    {
        abort_if((int) $message->thread_id !== (int) $thread->id, 404);
        abort_if($message->sender_id !== null, 403);
    }

    private function syncThreadLastMessageAt(ChatThread $thread): void
    {
        $latestMessageCreatedAt = $thread->messages()
            ->latest('created_at')
            ->value('created_at');

        $thread->update([
            'last_message_at' => $latestMessageCreatedAt,
        ]);
    }

    private function syncGuestDetails(ChatThread $thread, array $guestDetails = []): void
    {
        $updates = array_filter([
            'guest_name' => trim((string) ($guestDetails['guest_name'] ?? '')) ?: null,
            'guest_email' => trim((string) ($guestDetails['guest_email'] ?? '')) ?: null,
            'guest_phone' => trim((string) ($guestDetails['guest_phone'] ?? '')) ?: null,
        ], fn ($value) => $value !== null);

        if (!empty($updates)) {
            $thread->update($updates);
        }
    }

    private function serializeParticipant(ChatThread $thread): array
    {
        return [
            'id' => $thread->user?->id,
            'name' => $thread->user?->name ?? $this->guestDisplayName($thread),
            'email' => $thread->user?->email ?? $thread->guest_email,
            'phone' => $thread->user?->phone ?? $thread->guest_phone,
            'is_guest' => $thread->user_id === null,
        ];
    }

    private function guestDisplayName(ChatThread $thread): string
    {
        return $thread->guest_name
            ?: $thread->guest_email
            ?: $thread->guest_phone
            ?: 'Guest visitor';
    }

    private function guestContactSummary(ChatThread $thread): ?string
    {
        $contacts = array_values(array_filter([
            $thread->guest_email && $thread->guest_email !== $thread->guest_name ? $thread->guest_email : null,
            $thread->guest_phone && $thread->guest_phone !== $thread->guest_name ? $thread->guest_phone : null,
        ]));

        return !empty($contacts) ? implode(' • ', $contacts) : null;
    }

    private function applyAdminMessageScope($query): void
    {
        $query->whereHas('sender', function ($builder) {
            $builder->where('role', 'admin');
        });
    }

    private function applyCustomerMessageScope($query): void
    {
        $query->where(function ($builder) {
            $builder->whereNull('sender_id')
                ->orWhereHas('sender', function ($senderQuery) {
                    $senderQuery->whereNull('role')->orWhere('role', '!=', 'admin');
                });
        });
    }
}
