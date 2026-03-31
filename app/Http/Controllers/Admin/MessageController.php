<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Services\SupportChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request, SupportChatService $chatService): Response
    {
        $threads = $chatService->adminThreadSummaries();
        $activeThreadId = $request->integer('thread') ?: $threads->first()['id'] ?? null;
        $activeThreadPayload = null;

        if ($activeThreadId) {
            $thread = ChatThread::with(['messages.sender', 'user', 'assignedAdmin'])->findOrFail($activeThreadId);
            $chatService->markIncomingMessagesAsRead($thread, $request->user());
            $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);
            $activeThreadPayload = $chatService->serializeThread($thread, $request->user(), $thread->messages);
            $threads = $chatService->adminThreadSummaries();
        }

        return Inertia::render('Admin/Messages/Index', [
            'threads' => $threads,
            'activeThread' => $activeThreadPayload,
            'chatStats' => [
                'threads' => $threads->count(),
                'unreadMessages' => $chatService->unreadCountFor($request->user()),
                'openThreads' => $threads->where('unread_count', '>', 0)->count(),
            ],
            'pollIntervalMs' => 5000,
        ]);
    }

    public function threads(Request $request, SupportChatService $chatService): JsonResponse
    {
        return response()->json([
            'threads' => $chatService->adminThreadSummaries(),
            'unread_count' => $chatService->unreadCountFor($request->user()),
        ]);
    }

    public function show(Request $request, ChatThread $thread, SupportChatService $chatService): JsonResponse
    {
        $thread->load(['messages.sender', 'user', 'assignedAdmin']);
        $chatService->markIncomingMessagesAsRead($thread, $request->user());
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $request->user(), $thread->messages),
            'unread_count' => $chatService->unreadCountFor($request->user()),
        ]);
    }

    public function store(Request $request, ChatThread $thread, SupportChatService $chatService): JsonResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $chatService->sendMessage($thread, $request->user(), $validated['body']);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $request->user(), $thread->messages),
            'unread_count' => $chatService->unreadCountFor($request->user()),
        ]);
    }

    public function update(Request $request, ChatThread $thread, ChatMessage $message, SupportChatService $chatService): JsonResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $chatService->updateMessage($thread, $message, $request->user(), $validated['body']);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $request->user(), $thread->messages),
            'unread_count' => $chatService->unreadCountFor($request->user()),
        ]);
    }

    public function destroy(Request $request, ChatThread $thread, ChatMessage $message, SupportChatService $chatService): JsonResponse
    {
        $chatService->deleteMessage($thread, $message, $request->user());
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, $request->user(), $thread->messages),
            'unread_count' => $chatService->unreadCountFor($request->user()),
        ]);
    }

    public function destroyThread(Request $request, ChatThread $thread, SupportChatService $chatService): JsonResponse
    {
        $deletedThreadId = $thread->id;

        $chatService->deleteThread($thread);

        return response()->json([
            'deleted_thread_id' => $deletedThreadId,
            'threads' => $chatService->adminThreadSummaries(),
            'unread_count' => $chatService->unreadCountFor($request->user()),
        ]);
    }
}
