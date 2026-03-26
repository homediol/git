<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\RewardService;

class RewardSeeder extends Seeder
{
    public function run(): void
    {
        app(RewardService::class)->ensureDefaultRewards();
    }
}
