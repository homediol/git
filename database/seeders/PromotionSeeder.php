<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        Promotion::firstOrCreate(
            ['title' => 'New User Rewards'],
            [
                'message' => 'Sign up today and unlock your free Photo Shoot, Make Up session, and Website Design. Limited-time welcome perks for new clients!',
                'image' => 'https://source.unsplash.com/1400x900/?studio,creative',
                'cta_text' => 'Claim My Rewards',
                'cta_url' => '/rewards',
                'is_active' => true,
            ]
        );
    }
}
