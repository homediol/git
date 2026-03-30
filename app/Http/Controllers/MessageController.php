<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Services\SupportChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request, SupportChatService $chatService): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.messages');
        }

        $thread = $chatService->getOrCreateThreadForUser($user);
        $chatService->markIncomingMessagesAsRead($thread, $user);
        $thread->load(['messages.sender', 'user', 'assignedAdmin']);

        return Inertia::render('Messages/Index', [
            'thread' => $chatService->serializeThread($thread, $user, $thread->messages),
            'pollIntervalMs' => 5000,
        ]);
    }

    public function thread(Request $request, SupportChatService $chatService): JsonResponse
    {
        $user = $request->user();
        abort_if($user->isAdmin(), 403);
        $thread = $chatService->getOrCreateThreadForUser($user);

        $chatService->markIncomingMessagesAsRead($thread, $user);
        $thread->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $user, $thread->messages),
            'unread_count' => $chatService->unreadCountFor($user),
        ]);
    }

    public function store(Request $request, SupportChatService $chatService): JsonResponse
    {
        $user = $request->user();
        abort_if($user->isAdmin(), 403);
        $validated = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $thread = $chatService->getOrCreateThreadForUser($user);
        $chatService->sendMessage($thread, $user, $validated['body']);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $user, $thread->messages),
            'unread_count' => $chatService->unreadCountFor($user),
        ]);
    }

    public function update(Request $request, ChatMessage $message, SupportChatService $chatService): JsonResponse
    {
        $user = $request->user();
        abort_if($user->isAdmin(), 403);

        $validated = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $thread = $chatService->getOrCreateThreadForUser($user);
        $chatService->updateMessage($thread, $message, $user, $validated['body']);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $user, $thread->messages),
            'unread_count' => $chatService->unreadCountFor($user),
        ]);
    }

    public function destroy(Request $request, ChatMessage $message, SupportChatService $chatService): JsonResponse
    {
        $user = $request->user();
        abort_if($user->isAdmin(), 403);

        $thread = $chatService->getOrCreateThreadForUser($user);
        $chatService->deleteMessage($thread, $message, $user);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $user, $thread->messages),
            'unread_count' => $chatService->unreadCountFor($user),
        ]);
    }

    public function summary(Request $request, SupportChatService $chatService): JsonResponse
    {
        $user = $request->user();

        if (
            !Schema::hasTable('chat_threads')
            || !Schema::hasTable('chat_messages')
        ) {
            return response()->json([
                'unread_count' => 0,
                'thread_id' => null,
                'open_threads' => 0,
            ]);
        }

        $threadId = null;
        $openThreads = null;

        if (!$user->isAdmin()) {
            $threadId = ChatThread::query()->where('user_id', $user->id)->value('id');
        } else {
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
        }

        return response()->json([
            'unread_count' => $chatService->unreadCountFor($user),
            'thread_id' => $threadId,
            'open_threads' => $openThreads,
        ]);
    }
}
