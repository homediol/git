<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->string('title_rw')->nullable()->after('title');
            $table->string('title_en')->nullable()->after('title_rw');
            $table->string('title_fr')->nullable()->after('title_en');
            $table->text('message_rw')->nullable()->after('message');
            $table->text('message_en')->nullable()->after('message_rw');
            $table->text('message_fr')->nullable()->after('message_en');
            $table->string('cta_text_rw')->nullable()->after('cta_text');
            $table->string('cta_text_en')->nullable()->after('cta_text_rw');
            $table->string('cta_text_fr')->nullable()->after('cta_text_en');
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropColumn([
                'title_rw',
                'title_en',
                'title_fr',
                'message_rw',
                'message_en',
                'message_fr',
                'cta_text_rw',
                'cta_text_en',
                'cta_text_fr',
            ]);
        });
    }
};
