<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\PromotionCampaign;
use App\Models\Reward;
use App\Models\Service;
use App\Models\User;
use App\Models\UserReward;
use App\Services\PromotionCampaignService;
use Illuminate\Database\Seeder;

class PromotionCampaignDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('role', 'admin')->first();

        if (!$admin) {
            return;
        }

        $photographyService = Service::query()
            ->whereNull('parent_service_id')
            ->where(function ($query) {
                $query->where('service_key', 'photography-videography')
                    ->orWhere('title', 'Photography & Videography');
            })
            ->first();

        $photographyReward = Reward::query()
            ->where(function ($query) {
                $query->where('slug', 'photography-videography')
                    ->orWhere('slug', 'photo-reward');
            })
            ->first();

        if (!$photographyService || !$photographyReward) {
            return;
        }

        if ((int) $photographyReward->service_id !== (int) $photographyService->id) {
            $photographyReward->update([
                'service_id' => $photographyService->id,
            ]);
        }

        $freeRewardUser = User::updateOrCreate(
            ['email' => 'campaign.free@pavonastudios.com'],
            [
                'name' => 'Campaign Free Reward User',
                'username' => 'campaignfree',
                'phone' => '+250788222222',
                'password' => bcrypt('password'),
                'language' => 'rw',
            ]
        );

        $discountUser = User::updateOrCreate(
            ['email' => 'campaign.discount@pavonastudios.com'],
            [
                'name' => 'Campaign Discount User',
                'username' => 'campaigndiscount',
                'phone' => '+250788333333',
                'password' => bcrypt('password'),
                'language' => 'en',
            ]
        );

        foreach ([$freeRewardUser, $discountUser] as $user) {
            Booking::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'service_id' => $photographyService->id,
                    'description' => 'Demo campaign qualifying booking',
                ],
                [
                    'status' => 'approved',
                    'booking_date' => now()->toDateString(),
                    'booking_time' => now()->format('H:i:s'),
                ]
            );
        }

        UserReward::updateOrCreate(
            [
                'user_id' => $discountUser->id,
                'reward_id' => $photographyReward->id,
            ],
            [
                'status' => 'used',
                'assigned_at' => now()->subDays(14),
                'used_at' => now()->subDays(4),
                'expires_at' => now()->subDay(),
            ]
        );

        UserReward::query()
            ->where('user_id', $freeRewardUser->id)
            ->where('reward_id', $photographyReward->id)
            ->delete();

        $campaignService = app(PromotionCampaignService::class);

        $freeRewardCampaign = PromotionCampaign::updateOrCreate(
            ['name' => 'Demo Free Reward for Photography Bookings'],
            [
                'title_rw' => 'Impano y amafoto ku bakoze booking',
                'title_en' => 'Free photography reward for booked users',
                'title_fr' => 'Recompense photo gratuite pour clients ayant reserve',
                'message_rw' => 'Abakiliya bakoze booking ya photography babona free reward ihita ibageraho.',
                'message_en' => 'Users with an approved photography booking receive a free reward automatically.',
                'message_fr' => 'Les utilisateurs ayant une reservation photo approuvee recoivent automatiquement une recompense gratuite.',
                'cta_text_rw' => 'Fungura reward',
                'cta_text_en' => 'Open reward',
                'cta_text_fr' => 'Ouvrir la recompense',
                'cta_url' => null,
                'image' => 'https://source.unsplash.com/1400x900/?camera,studio',
                'audience_type' => 'booked_service',
                'user_age_segment' => 'all',
                'new_user_window_days' => 30,
                'target_user_ids' => [],
                'target_emails' => [],
                'target_service_ids' => [$photographyService->id],
                'booking_status_filter' => 'approved',
                'reward_filter' => 'none',
                'reference_reward_id' => $photographyReward->id,
                'offer_type' => 'free_reward',
                'smart_reward_mode' => false,
                'discount_percent' => null,
                'discount_code' => null,
                'send_in_app' => true,
                'send_email' => false,
                'send_sms' => false,
                'status' => 'draft',
                'created_by' => $admin->id,
            ]
        );

        $discountRewindCampaign = PromotionCampaign::updateOrCreate(
            ['name' => 'Demo Discount Rewind for Used Photography Rewards'],
            [
                'title_rw' => 'Discount rewind ku bamaze gukoresha reward',
                'title_en' => 'Discount rewind for used photography rewards',
                'title_fr' => 'Remise de retour pour recompenses photo deja utilisees',
                'message_rw' => 'Abamaze gukoresha reward ya photography bahabwa discount rewind ihita igaragara muri rewards.',
                'message_en' => 'Users who already used their photography reward receive a visible discount rewind offer.',
                'message_fr' => 'Les utilisateurs ayant deja utilise leur recompense photo recoivent une offre de remise visible.',
                'cta_text_rw' => 'Reba discount',
                'cta_text_en' => 'View discount',
                'cta_text_fr' => 'Voir la remise',
                'cta_url' => null,
                'image' => 'https://source.unsplash.com/1400x900/?discount,photography',
                'audience_type' => 'booked_service',
                'user_age_segment' => 'all',
                'new_user_window_days' => 30,
                'target_user_ids' => [],
                'target_emails' => [],
                'target_service_ids' => [$photographyService->id],
                'booking_status_filter' => 'approved',
                'reward_filter' => 'used',
                'reference_reward_id' => $photographyReward->id,
                'offer_type' => 'discount_rewind',
                'smart_reward_mode' => false,
                'discount_percent' => 15,
                'discount_code' => 'PHOTOREWIND15',
                'original_price_rwf' => 2000,
                'discounted_price_rwf' => 1000,
                'send_in_app' => true,
                'send_email' => false,
                'send_sms' => false,
                'status' => 'draft',
                'created_by' => $admin->id,
            ]
        );

        if ($freeRewardCampaign->recipients()->doesntExist()) {
            $campaignService->launch($freeRewardCampaign);
        }

        if ($discountRewindCampaign->recipients()->doesntExist()) {
            $campaignService->launch($discountRewindCampaign);
        }
    }
}
