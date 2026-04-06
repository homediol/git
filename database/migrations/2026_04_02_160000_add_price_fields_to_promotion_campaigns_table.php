<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotion_campaigns', function (Blueprint $table) {
            $table->unsignedInteger('original_price_rwf')
                ->nullable()
                ->after('discount_code');
            $table->unsignedInteger('discounted_price_rwf')
                ->nullable()
                ->after('original_price_rwf');
        });
    }

    public function down(): void
    {
        Schema::table('promotion_campaigns', function (Blueprint $table) {
            $table->dropColumn(['original_price_rwf', 'discounted_price_rwf']);
        });
    }
};
