<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('title_rw')->nullable()->after('title');
            $table->string('title_en')->nullable()->after('title_rw');
            $table->string('title_fr')->nullable()->after('title_en');
            $table->text('description_rw')->nullable()->after('description');
            $table->text('description_en')->nullable()->after('description_rw');
            $table->text('description_fr')->nullable()->after('description_en');
        });

        DB::table('services')->update([
            'title_en' => DB::raw('title'),
            'description_en' => DB::raw('description'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'title_rw',
                'title_en',
                'title_fr',
                'description_rw',
                'description_en',
                'description_fr',
            ]);
        });
    }
};
