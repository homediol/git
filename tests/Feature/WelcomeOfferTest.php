<?php

namespace Tests\Feature;

use App\Models\Reward;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserReward;
use App\Services\WelcomeOfferService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WelcomeOfferTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_assigns_only_admin_selected_welcome_rewards_and_discount(): void
    {
        $selectedReward = Reward::create([
            'name' => 'Selected Reward',
            'name_rw' => 'Impano yatoranyijwe',
            'slug' => 'selected-reward',
            'description' => 'Selected reward',
            'expires_after_days' => 30,
            'is_active' => true,
        ]);

        $otherReward = Reward::create([
            'name' => 'Other Reward',
            'name_rw' => 'Indi mpano',
            'slug' => 'other-reward',
            'description' => 'Other reward',
            'expires_after_days' => 30,
            'is_active' => true,
        ]);

        app(WelcomeOfferService::class)->updateConfig([
            'discount_cards' => [[
                'title_rw' => 'Kumfata 20',
                'title_en' => 'Capture 20',
                'title_fr' => 'Capture 20',
                'discount_percent' => 20,
                'discount_code' => 'WELCOME20',
                'original_price_rwf' => 2000,
                'discounted_price_rwf' => 1500,
            ]],
            'selected_reward_ids' => [$selectedReward->id],
        ]);

        $response = $this->post(route('register'), [
            'username' => 'welcome_user',
            'phone' => '0780000001',
            'email' => 'welcome@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'welcome@example.com')->first();

        $this->assertNotNull($user);
        $this->assertDatabaseHas('user_rewards', [
            'user_id' => $user->id,
            'reward_id' => $selectedReward->id,
        ]);
        $this->assertDatabaseMissing('user_rewards', [
            'user_id' => $user->id,
            'reward_id' => $otherReward->id,
        ]);
        $this->assertSame(1, UserReward::where('user_id', $user->id)->count());
        $welcomeOffer = app(WelcomeOfferService::class)->forFrontend($user);

        $this->assertSame(20, $welcomeOffer['discount_percent']);
        $this->assertSame(1, $welcomeOffer['discount_card_count']);
        $this->assertSame('Kumfata 20', $welcomeOffer['discount_cards'][0]['title_rw']);
        $this->assertSame(1500, $welcomeOffer['discount_cards'][0]['discounted_price_rwf']);
    }

    public function test_admin_can_update_welcome_offer_settings_with_multiple_discount_cards(): void
    {
        $admin = $this->createAdmin();
        $service = Service::create([
            'title' => 'Photography',
            'description' => 'Photography service',
            'title_rw' => 'Amafoto',
        ]);
        $subService = Service::create([
            'title' => 'Wedding Photography',
            'description' => 'Wedding photography service',
            'title_rw' => 'Amafoto y ubukwe',
            'parent_service_id' => $service->id,
        ]);
        $reward = Reward::create([
            'name' => 'Photography Reward',
            'name_rw' => 'Impano y amafoto',
            'slug' => 'photo-reward',
            'description' => 'Reward',
            'expires_after_days' => 30,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.rewards.welcome-offer.update'), [
            'discount_cards' => [
                [
                    'title_rw' => 'Kumfata 25',
                    'title_en' => 'Capture 25',
                    'title_fr' => 'Capture 25',
                    'service_id' => $subService->id,
                    'discount_percent' => 25,
                    'discount_code' => 'VIP25',
                    'original_price_rwf' => 2000,
                    'discounted_price_rwf' => 1500,
                ],
                [
                    'title_rw' => 'Make 10',
                    'title_en' => 'Make 10',
                    'title_fr' => 'Make 10',
                    'discount_percent' => 10,
                    'discount_code' => 'MAKE10',
                    'original_price_rwf' => 8000,
                    'discounted_price_rwf' => 7000,
                ],
            ],
            'selected_reward_ids' => [$reward->id],
        ]);

        $response->assertRedirect();

        $storedCards = json_decode((string) Setting::get('welcome_discount_cards'), true);

        $this->assertIsArray($storedCards);
        $this->assertCount(2, $storedCards);
        $this->assertSame('Kumfata 25', $storedCards[0]['title_rw']);
        $this->assertSame($subService->id, $storedCards[0]['service_id']);
        $this->assertSame(10, $storedCards[1]['discount_percent']);
        $this->assertSame('25', Setting::get('welcome_discount_percent'));
        $this->assertSame('VIP25', Setting::get('welcome_discount_code'));
        $this->assertSame('2000', Setting::get('welcome_original_price_rwf'));
        $this->assertSame('1500', Setting::get('welcome_discounted_price_rwf'));
        $this->assertSame(json_encode([$reward->id]), Setting::get('welcome_reward_ids'));

        $welcomeOffer = app(WelcomeOfferService::class)->forFrontend();

        $this->assertSame($subService->id, $welcomeOffer['discount_cards'][0]['service_id']);
        $this->assertSame($subService->id, $welcomeOffer['discount_cards'][0]['service']['id']);
        $this->assertSame('Amafoto y ubukwe', $welcomeOffer['discount_cards'][0]['service']['title_rw']);
    }

    public function test_admin_cannot_attach_welcome_discount_card_to_parent_service(): void
    {
        $admin = $this->createAdmin();
        $service = Service::create([
            'title' => 'Photography',
            'description' => 'Photography service',
            'title_rw' => 'Amafoto',
        ]);

        $response = $this->actingAs($admin)->from(route('admin.rewards'))->post(route('admin.rewards.welcome-offer.update'), [
            'discount_cards' => [[
                'title_rw' => 'Kumfata 25',
                'service_id' => $service->id,
                'discount_percent' => 25,
                'discounted_price_rwf' => 1500,
                'original_price_rwf' => 2000,
            ]],
            'selected_reward_ids' => [],
        ]);

        $response
            ->assertRedirect(route('admin.rewards'))
            ->assertSessionHasErrors(['discount_cards.0.service_id']);
    }

    public function test_frontend_config_falls_back_to_legacy_single_discount_settings(): void
    {
        Setting::set('welcome_discount_percent', '30');
        Setting::set('welcome_discount_code', 'LEGACY30');
        Setting::set('welcome_original_price_rwf', '3000');
        Setting::set('welcome_discounted_price_rwf', '2100');

        $welcomeOffer = app(WelcomeOfferService::class)->forFrontend();

        $this->assertSame(1, $welcomeOffer['discount_card_count']);
        $this->assertSame(30, $welcomeOffer['discount_cards'][0]['discount_percent']);
        $this->assertSame('LEGACY30', $welcomeOffer['discount_cards'][0]['discount_code']);
        $this->assertSame(2100, $welcomeOffer['discount_cards'][0]['discounted_price_rwf']);
    }

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }
}
