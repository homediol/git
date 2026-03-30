<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title_rw');
            $table->string('title_en')->nullable();
            $table->string('title_fr')->nullable();
            $table->text('message_rw');
            $table->text('message_en')->nullable();
            $table->text('message_fr')->nullable();
            $table->string('cta_text_rw')->nullable();
            $table->string('cta_text_en')->nullable();
            $table->string('cta_text_fr')->nullable();
            $table->string('cta_url')->nullable();
            $table->string('image')->nullable();
            $table->string('audience_type')->default('all_users');
            $table->string('user_age_segment')->default('all');
            $table->unsignedInteger('new_user_window_days')->default(30);
            $table->json('target_user_ids')->nullable();
            $table->json('target_emails')->nullable();
            $table->json('target_service_ids')->nullable();
            $table->string('reward_filter')->default('any');
            $table->foreignId('reference_reward_id')->nullable()->constrained('rewards')->nullOnDelete();
            $table->boolean('smart_reward_mode')->default(false);
            $table->unsignedInteger('discount_percent')->nullable();
            $table->string('discount_code')->nullable();
            $table->boolean('send_in_app')->default(true);
            $table->boolean('send_email')->default(false);
            $table->boolean('send_sms')->default(false);
            $table->string('status')->default('draft');
            $table->timestamp('launched_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['audience_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_campaigns');
    }
};
