<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_threads', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('guest_session_key')->nullable()->after('user_id');
            $table->string('guest_name')->nullable()->after('guest_session_key');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');
            $table->unique('guest_session_key');
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->foreignId('sender_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->foreignId('sender_id')->nullable(false)->change();
        });

        Schema::table('chat_threads', function (Blueprint $table) {
            $table->dropUnique(['guest_session_key']);
            $table->dropColumn([
                'guest_session_key',
                'guest_name',
                'guest_email',
                'guest_phone',
            ]);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
