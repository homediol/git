<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->foreignId('service_id')
                ->nullable()
                ->after('slug')
                ->constrained('services')
                ->nullOnDelete();
        });

        Schema::table('promotion_campaigns', function (Blueprint $table) {
            $table->string('booking_status_filter')
                ->default('any')
                ->after('target_service_ids');
            $table->string('offer_type')
                ->default('standard')
                ->after('reference_reward_id');
        });

        DB::table('promotion_campaigns')
            ->where('smart_reward_mode', true)
            ->update(['offer_type' => 'smart_reward']);

        $serviceLookup = [];

        if (Schema::hasColumn('services', 'service_key')) {
            $serviceLookup = DB::table('services')
                ->whereNull('parent_service_id')
                ->pluck('id', 'service_key')
                ->all();
        } else {
            $serviceLookup = DB::table('services')
                ->whereNull('parent_service_id')
                ->pluck('id', 'title')
                ->all();
        }

        $rewardServiceMap = [
            'photography-videography' => $serviceLookup['photography-videography']
                ?? $serviceLookup['Photography & Videography']
                ?? null,
            'graphics-printing-design' => $serviceLookup['graphics-printing']
                ?? $serviceLookup['Graphics & Printing Design']
                ?? null,
            'graphics-printing' => $serviceLookup['graphics-printing']
                ?? $serviceLookup['Graphics & Printing Design']
                ?? null,
            'make-up' => $serviceLookup['make-up']
                ?? $serviceLookup['Make Up']
                ?? null,
            'software-development' => $serviceLookup['software-development']
                ?? $serviceLookup['Software Development']
                ?? null,
            'sound-system' => $serviceLookup['sound-system']
                ?? $serviceLookup['Sound System']
                ?? null,
        ];

        foreach ($rewardServiceMap as $rewardSlug => $serviceId) {
            if (!$serviceId) {
                continue;
            }

            DB::table('rewards')
                ->where('slug', $rewardSlug)
                ->whereNull('service_id')
                ->update(['service_id' => $serviceId]);
        }
    }

    public function down(): void
    {
        Schema::table('promotion_campaigns', function (Blueprint $table) {
            $table->dropColumn(['booking_status_filter', 'offer_type']);
        });

        Schema::table('rewards', function (Blueprint $table) {
            $table->dropConstrainedForeignId('service_id');
        });
    }
};
