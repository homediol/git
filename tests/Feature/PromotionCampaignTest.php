<?php

namespace Tests\Feature;

use App\Mail\PromotionCampaignMail;
use App\Models\Booking;
use App\Models\PromotionCampaign;
use App\Models\PromotionCampaignRecipient;
use App\Models\Reward;
use App\Models\RewardRewind;
use App\Models\Service;
use App\Models\User;
use App\Models\UserReward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PromotionCampaignTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_send_campaign_to_new_users_only(): void
    {
        Mail::fake();

        $admin = $this->createAdmin();
        $newUser = User::factory()->create([
            'role' => 'editor',
            'created_at' => now()->subDays(4),
            'language' => 'en',
        ]);
        $oldUser = User::factory()->create([
            'role' => 'editor',
            'created_at' => now()->subDays(90),
            'language' => 'fr',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.promotions.campaigns.store'), [
            'name' => 'Welcome flow',
            'title_rw' => 'Murakaza neza',
            'title_en' => 'Welcome offer',
            'message_rw' => 'Dufite promo nshya.',
            'message_en' => 'We have a new promotion for you.',
            'audience_type' => 'new_users',
            'new_user_window_days' => 30,
            'send_in_app' => true,
            'send_email' => true,
            'send_sms' => false,
        ]);

        $response->assertRedirect();

        $campaign = PromotionCampaign::first();

        $this->assertNotNull($campaign);
        $this->assertDatabaseHas('promotion_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'user_id' => $newUser->id,
        ]);
        $this->assertDatabaseMissing('promotion_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'user_id' => $oldUser->id,
        ]);
        $this->assertEquals(1, $newUser->notifications()->count());
        $this->assertEquals(0, $oldUser->notifications()->count());

        Mail::assertSent(PromotionCampaignMail::class, function (PromotionCampaignMail $mail) use ($newUser) {
            return $mail->hasTo($newUser->email);
        });
    }

    public function test_booked_service_campaign_targets_matching_users_only(): void
    {
        $admin = $this->createAdmin();
        $photography = Service::create([
            'title' => 'Photography & Videography',
            'description' => 'Studio shoots',
        ]);
        $software = Service::create([
            'title' => 'Software Development',
            'description' => 'Digital products',
        ]);

        $photoUser = User::factory()->create(['role' => 'editor']);
        $softwareUser = User::factory()->create(['role' => 'editor']);

        Booking::create([
            'user_id' => $photoUser->id,
            'service_id' => $photography->id,
            'status' => 'approved',
            'booking_date' => now()->toDateString(),
            'booking_time' => now()->format('H:i:s'),
            'description' => 'Photography booking',
        ]);

        Booking::create([
            'user_id' => $softwareUser->id,
            'service_id' => $software->id,
            'status' => 'approved',
            'booking_date' => now()->toDateString(),
            'booking_time' => now()->format('H:i:s'),
            'description' => 'Software booking',
        ]);

        $this->actingAs($admin)->post(route('admin.promotions.campaigns.store'), [
            'name' => 'Photography push',
            'title_rw' => 'Promo y amafoto',
            'message_rw' => 'Abafashe amafoto bongeye kubona igabanyirizwa.',
            'audience_type' => 'booked_service',
            'target_service_ids' => [$photography->id],
            'send_in_app' => true,
        ]);

        $campaign = PromotionCampaign::first();

        $this->assertNotNull($campaign);
        $this->assertDatabaseHas('promotion_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'user_id' => $photoUser->id,
        ]);
        $this->assertDatabaseMissing('promotion_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'user_id' => $softwareUser->id,
        ]);
    }

    public function test_specific_user_campaign_uses_selected_database_users(): void
    {
        $admin = $this->createAdmin();
        $selectedUser = User::factory()->create(['role' => 'editor']);
        $otherUser = User::factory()->create(['role' => 'editor']);

        $this->actingAs($admin)->post(route('admin.promotions.campaigns.store'), [
            'name' => 'Selected users only',
            'title_rw' => 'Abatoranyijwe',
            'message_rw' => 'Iyi promo igenewe abantu batoranyijwe.',
            'audience_type' => 'specific_users',
            'target_user_ids' => [$selectedUser->id],
            'send_in_app' => true,
        ]);

        $campaign = PromotionCampaign::first();

        $this->assertNotNull($campaign);
        $this->assertDatabaseHas('promotion_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'user_id' => $selectedUser->id,
        ]);
        $this->assertDatabaseMissing('promotion_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'user_id' => $otherUser->id,
        ]);
    }

    public function test_smart_campaign_switches_between_reminder_and_discount(): void
    {
        $admin = $this->createAdmin();
        $reward = Reward::create([
            'name' => 'Photography Reward',
            'name_rw' => 'Impano y amafoto',
            'slug' => 'photo-reward',
            'description' => 'Reward',
            'expires_after_days' => 30,
            'is_active' => true,
        ]);

        $unusedUser = User::factory()->create(['role' => 'editor']);
        $usedUser = User::factory()->create(['role' => 'editor']);

        UserReward::create([
            'user_id' => $unusedUser->id,
            'reward_id' => $reward->id,
            'status' => 'unused',
            'assigned_at' => now()->subDays(2),
            'expires_at' => now()->addDays(10),
        ]);

        UserReward::create([
            'user_id' => $usedUser->id,
            'reward_id' => $reward->id,
            'status' => 'used',
            'assigned_at' => now()->subDays(10),
            'used_at' => now()->subDay(),
            'expires_at' => now()->addDays(5),
        ]);

        $this->actingAs($admin)->post(route('admin.promotions.campaigns.store'), [
            'name' => 'Smart reward flow',
            'title_rw' => 'Impano zanyu',
            'message_rw' => 'Hari ikindi twabateguriye.',
            'audience_type' => 'all_users',
            'reference_reward_id' => $reward->id,
            'smart_reward_mode' => true,
            'discount_percent' => 20,
            'send_in_app' => true,
        ]);

        $campaign = PromotionCampaign::first();

        $this->assertNotNull($campaign);

        $unusedRecipient = PromotionCampaignRecipient::where('campaign_id', $campaign->id)
            ->where('user_id', $unusedUser->id)
            ->first();
        $usedRecipient = PromotionCampaignRecipient::where('campaign_id', $campaign->id)
            ->where('user_id', $usedUser->id)
            ->first();

        $this->assertEquals('reward_reminder', $unusedRecipient?->delivery_strategy);
        $this->assertEquals('discount', $usedRecipient?->delivery_strategy);
    }

    public function test_admin_can_rewind_used_reward_to_unused(): void
    {
        $admin = $this->createAdmin();
        $user = User::factory()->create(['role' => 'editor']);
        $reward = Reward::create([
            'name' => 'Software Reward',
            'name_rw' => 'Impano ya software',
            'slug' => 'software-reward',
            'description' => 'Reward',
            'expires_after_days' => 60,
            'is_active' => true,
        ]);

        $userReward = UserReward::create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'status' => 'used',
            'assigned_at' => now()->subDays(8),
            'used_at' => now()->subDays(2),
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($admin)->post(route('admin.rewards.user.rewind', $userReward), [
            'action' => 'reset_unused',
            'expires_in_days' => 21,
            'notes' => 'Customer requested a second run.',
        ]);

        $response->assertRedirect();

        $userReward->refresh();

        $this->assertEquals('unused', $userReward->status);
        $this->assertNull($userReward->used_at);
        $this->assertNotNull($userReward->expires_at);
        $this->assertEquals(1, RewardRewind::count());
        $this->assertEquals(1, $user->notifications()->count());
    }

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'language' => 'rw',
        ]);
    }
}
