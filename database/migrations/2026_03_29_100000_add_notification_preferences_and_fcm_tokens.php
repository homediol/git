<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('in_app_notifications_enabled')->default(true)->after('language');
            $table->boolean('push_notifications_enabled')->default(true)->after('in_app_notifications_enabled');
            $table->json('notification_preferences')->nullable()->after('push_notifications_enabled');
        });

        Schema::create('fcm_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token')->unique();
            $table->string('platform')->nullable();
            $table->string('browser')->nullable();
            $table->string('device_name')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fcm_tokens');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'in_app_notifications_enabled',
                'push_notifications_enabled',
                'notification_preferences',
            ]);
        });
    }
};
