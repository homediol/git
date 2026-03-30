<?php

namespace Tests\Feature;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupportChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_messages_page(): void
    {
        $response = $this->get(route('messages.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_guest_is_redirected_when_posting_message(): void
    {
        $response = $this->post(route('messages.store'), [
            'body' => 'Hello support',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_guest_can_start_support_chat_and_notify_admins(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->withSession([
            'guest_chat_key' => 'guest-session-1',
        ])->post(route('guest.messages.store'), [
            'guest_name' => 'Guest Visitor',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '0780000000',
            'body' => 'Hello from guest chat',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('chat_threads', [
            'guest_session_key' => 'guest-session-1',
            'user_id' => null,
            'guest_name' => 'Guest Visitor',
            'guest_email' => 'guest@example.com',
        ]);
        $this->assertDatabaseHas('chat_messages', [
            'sender_id' => null,
            'body' => 'Hello from guest chat',
        ]);
        $this->assertEquals(1, $admin->fresh()->notifications()->count());
    }

    public function test_guest_can_start_support_chat_with_only_phone_number(): void
    {
        $response = $this->withSession([
            'guest_chat_key' => 'guest-session-phone-only',
        ])->post(route('guest.messages.store'), [
            'guest_name' => '',
            'guest_email' => '',
            'guest_phone' => '0781234567',
            'body' => 'Phone-only guest message',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('chat_threads', [
            'guest_session_key' => 'guest-session-phone-only',
            'guest_name' => null,
            'guest_email' => null,
            'guest_phone' => '0781234567',
        ]);
        $this->assertDatabaseHas('chat_messages', [
            'sender_id' => null,
            'body' => 'Phone-only guest message',
        ]);
    }

    public function test_user_message_creates_thread_and_notifies_admins(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->post(route('messages.store'), [
            'body' => 'I need help with my booking.',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('chat_threads', [
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('chat_messages', [
            'sender_id' => $user->id,
            'body' => 'I need help with my booking.',
        ]);
        $this->assertEquals(1, $admin->fresh()->notifications()->count());
    }

    public function test_admin_reply_notifies_user(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
        ]);

        ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $user->id,
            'body' => 'Hello admin',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.messages.store', $thread), [
            'body' => 'We have received your message.',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('chat_messages', [
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'body' => 'We have received your message.',
        ]);
        $this->assertEquals(1, $user->fresh()->notifications()->count());
    }

    public function test_user_thread_endpoint_marks_admin_messages_as_read(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'body' => 'Your booking is approved.',
        ]);

        $response = $this->actingAs($user)->get(route('messages.thread'));

        $response->assertOk();
        $message->refresh();

        $this->assertNotNull($message->read_at);
    }

    public function test_admin_thread_endpoint_marks_user_messages_as_read(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $user->id,
            'body' => 'Can you help me?',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.messages.show', $thread));

        $response->assertOk();
        $message->refresh();

        $this->assertNotNull($message->read_at);
    }

    public function test_guest_thread_endpoint_marks_admin_messages_as_read(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => null,
            'guest_session_key' => 'guest-session-2',
            'guest_name' => 'Guest Visitor',
            'guest_email' => 'guest@example.com',
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'body' => 'Hello guest',
        ]);

        $response = $this->withSession([
            'guest_chat_key' => 'guest-session-2',
        ])->get(route('guest.messages.thread'));

        $response->assertOk();
        $message->refresh();

        $this->assertNotNull($message->read_at);
    }

    public function test_guest_can_edit_own_message_via_method_override(): void
    {
        $thread = ChatThread::create([
            'user_id' => null,
            'guest_session_key' => 'guest-session-4',
            'guest_name' => 'Guest Visitor',
            'guest_email' => 'guest@example.com',
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => null,
            'body' => 'Original guest message',
        ]);

        $response = $this->withSession([
            'guest_chat_key' => 'guest-session-4',
        ])->post(route('guest.messages.update', $message), [
            '_method' => 'put',
            'body' => 'Updated guest message',
        ]);

        $response->assertOk();
        $message->refresh();

        $this->assertSame('Updated guest message', $message->body);
        $this->assertNotNull($message->edited_at);
    }

    public function test_user_can_edit_own_message(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $user->id,
            'body' => 'Initial draft',
        ]);

        $response = $this->actingAs($user)->put(route('messages.update', $message), [
            'body' => 'Updated draft',
        ]);

        $response->assertOk();
        $message->refresh();

        $this->assertSame('Updated draft', $message->body);
        $this->assertNotNull($message->edited_at);
    }

    public function test_user_cannot_edit_admin_message(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'body' => 'Admin reply',
        ]);

        $response = $this->actingAs($user)->put(route('messages.update', $message), [
            'body' => 'Trying to change admin message',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('chat_messages', [
            'id' => $message->id,
            'body' => 'Admin reply',
        ]);
    }

    public function test_user_can_delete_own_message(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
            'last_message_at' => now(),
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $user->id,
            'body' => 'Delete me',
        ]);

        $response = $this->actingAs($user)->delete(route('messages.destroy', $message));

        $response->assertOk();
        $this->assertDatabaseMissing('chat_messages', [
            'id' => $message->id,
        ]);
        $this->assertNull($thread->fresh()->last_message_at);
    }

    public function test_admin_can_edit_own_reply(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'body' => 'Original admin reply',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.messages.update', [
            'thread' => $thread,
            'message' => $message,
        ]), [
            'body' => 'Updated admin reply',
        ]);

        $response->assertOk();
        $message->refresh();

        $this->assertSame('Updated admin reply', $message->body);
        $this->assertNotNull($message->edited_at);
    }

    public function test_admin_can_delete_own_reply(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
            'last_message_at' => now(),
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'body' => 'Temporary admin reply',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.messages.destroy', [
            'thread' => $thread,
            'message' => $message,
        ]));

        $response->assertOk();
        $this->assertDatabaseMissing('chat_messages', [
            'id' => $message->id,
        ]);
        $this->assertNull($thread->fresh()->last_message_at);
    }

    public function test_user_can_delete_own_message_via_method_override(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $thread = ChatThread::create([
            'user_id' => $user->id,
            'last_message_at' => now(),
        ]);

        $message = ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => $user->id,
            'body' => 'Method override delete me',
        ]);

        $response = $this->actingAs($user)->post(route('messages.destroy', $message), [
            '_method' => 'delete',
        ]);

        $response->assertOk();
        $this->assertDatabaseMissing('chat_messages', [
            'id' => $message->id,
        ]);
    }

    public function test_admin_summary_counts_guest_threads_and_messages(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $thread = ChatThread::create([
            'user_id' => null,
            'guest_session_key' => 'guest-session-3',
            'guest_name' => 'Guest Visitor',
            'guest_email' => 'guest@example.com',
        ]);

        ChatMessage::create([
            'thread_id' => $thread->id,
            'sender_id' => null,
            'body' => 'Need help as a guest',
        ]);

        $response = $this->actingAs($admin)->get(route('messages.summary'));

        $response->assertOk()
            ->assertJson([
                'unread_count' => 1,
                'open_threads' => 1,
            ]);
    }
}
