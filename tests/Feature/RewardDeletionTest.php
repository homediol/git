<?php

namespace Tests\Feature;

use App\Models\Reward;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RewardDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleted_reward_does_not_reappear_after_visiting_admin_rewards_or_home(): void
    {
        $admin = $this->createAdmin();
        $reward = app(RewardService::class)->ensureDefaultRewards()->first();

        $this->assertNotNull($reward);

        $response = $this->actingAs($admin)->delete(route('admin.rewards.destroy', $reward));

        $response->assertRedirect();
        $this->assertDatabaseMissing('rewards', [
            'id' => $reward->id,
        ]);

        $this->actingAs($admin)->get(route('admin.rewards'))->assertOk();
        $this->get(route('home'))->assertOk();

        $this->assertDatabaseMissing('rewards', [
            'slug' => $reward->slug,
        ]);
    }

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }
}
