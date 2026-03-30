<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Services\SupportChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GuestMessageController extends Controller
{
    public function index(Request $request, SupportChatService $chatService): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->route($request->user()->isAdmin() ? 'admin.messages' : 'messages.index');
        }

        $thread = $chatService->findGuestThread($this->guestSessionKey($request));

        if ($thread) {
            $chatService->markIncomingMessagesAsRead($thread, null, 'guest');
            $thread->load(['messages.sender', 'user', 'assignedAdmin']);
        }

        return Inertia::render('Messages/Guest', [
            'thread' => $thread ? $chatService->serializeThread($thread, null, $thread->messages, 'guest') : null,
            'pollIntervalMs' => 5000,
            'guestProfile' => $this->guestProfile($request, $thread),
        ]);
    }

    public function thread(Request $request, SupportChatService $chatService): JsonResponse
    {
        abort_if($request->user(), 403);

        $thread = $chatService->findGuestThread($this->guestSessionKey($request));

        if ($thread) {
            $chatService->markIncomingMessagesAsRead($thread, null, 'guest');
            $thread->load(['messages.sender', 'user', 'assignedAdmin']);
        }

        return response()->json([
            'thread' => $thread ? $chatService->serializeThread($thread, null, $thread->messages, 'guest') : null,
            'unread_count' => $chatService->unreadCountForGuest($thread),
            'guest_profile' => $this->guestProfile($request, $thread),
        ]);
    }

    public function store(Request $request, SupportChatService $chatService): JsonResponse
    {
        abort_if($request->user(), 403);

        $validated = $request->validate([
            'guest_name' => 'nullable|string|max:255|required_without_all:guest_email,guest_phone',
            'guest_email' => 'nullable|email|max:255|required_without_all:guest_name,guest_phone',
            'guest_phone' => 'nullable|string|max:255|required_without_all:guest_name,guest_email',
            'body' => 'required|string|max:4000',
        ]);

        $this->storeGuestProfile($request, $validated);
        $thread = $chatService->getOrCreateThreadForGuest($this->guestSessionKey($request), $validated);
        $chatService->sendGuestMessage($thread, $validated['body'], $validated);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, null, $thread->messages, 'guest'),
            'unread_count' => $chatService->unreadCountForGuest($thread),
            'guest_profile' => $this->guestProfile($request, $thread),
        ]);
    }

    public function update(Request $request, ChatMessage $message, SupportChatService $chatService): JsonResponse
    {
        abort_if($request->user(), 403);

        $validated = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $thread = $chatService->findGuestThread($this->guestSessionKey($request));
        abort_if(!$thread, 404);

        $chatService->updateGuestMessage($thread, $message, $validated['body']);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, null, $thread->messages, 'guest'),
            'unread_count' => $chatService->unreadCountForGuest($thread),
            'guest_profile' => $this->guestProfile($request, $thread),
        ]);
    }

    public function destroy(Request $request, ChatMessage $message, SupportChatService $chatService): JsonResponse
    {
        abort_if($request->user(), 403);

        $thread = $chatService->findGuestThread($this->guestSessionKey($request));
        abort_if(!$thread, 404);

        $chatService->deleteGuestMessage($thread, $message);
        $thread->refresh()->load(['messages.sender', 'user', 'assignedAdmin']);

        return response()->json([
            'thread' => $chatService->serializeThread($thread, null, $thread->messages, 'guest'),
            'unread_count' => $chatService->unreadCountForGuest($thread),
            'guest_profile' => $this->guestProfile($request, $thread),
        ]);
    }

    private function guestSessionKey(Request $request): string
    {
        if (!$request->session()->has('guest_chat_key')) {
            $request->session()->put('guest_chat_key', (string) Str::uuid());
        }

        return (string) $request->session()->get('guest_chat_key');
    }

    private function storeGuestProfile(Request $request, array $validated): void
    {
        $request->session()->put('guest_chat_profile', [
            'guest_name' => $validated['guest_name'] ?? '',
            'guest_email' => $validated['guest_email'] ?? '',
            'guest_phone' => $validated['guest_phone'] ?? '',
        ]);
    }

    private function guestProfile(Request $request, $thread = null): array
    {
        $sessionProfile = $request->session()->get('guest_chat_profile', []);

        return [
            'guest_name' => $thread?->guest_name ?? ($sessionProfile['guest_name'] ?? ''),
            'guest_email' => $thread?->guest_email ?? ($sessionProfile['guest_email'] ?? ''),
            'guest_phone' => $thread?->guest_phone ?? ($sessionProfile['guest_phone'] ?? ''),
        ];
    }
}
