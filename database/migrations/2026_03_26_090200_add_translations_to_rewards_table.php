<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->string('name_rw')->nullable()->after('name');
            $table->string('name_en')->nullable()->after('name_rw');
            $table->string('name_fr')->nullable()->after('name_en');
            $table->text('description_rw')->nullable()->after('description');
            $table->text('description_en')->nullable()->after('description_rw');
            $table->text('description_fr')->nullable()->after('description_en');
        });
    }

    public function down(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->dropColumn([
                'name_rw',
                'name_en',
                'name_fr',
                'description_rw',
                'description_en',
                'description_fr',
            ]);
        });
    }
};
