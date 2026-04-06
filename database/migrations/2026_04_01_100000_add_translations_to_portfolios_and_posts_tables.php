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
        Schema::table('portfolios', function (Blueprint $table) {
            if (!Schema::hasColumn('portfolios', 'title_rw')) {
                $table->string('title_rw')->nullable()->after('title');
            }
            if (!Schema::hasColumn('portfolios', 'title_en')) {
                $table->string('title_en')->nullable()->after('title_rw');
            }
            if (!Schema::hasColumn('portfolios', 'title_fr')) {
                $table->string('title_fr')->nullable()->after('title_en');
            }
            if (!Schema::hasColumn('portfolios', 'description_rw')) {
                $table->text('description_rw')->nullable()->after('description');
            }
            if (!Schema::hasColumn('portfolios', 'description_en')) {
                $table->text('description_en')->nullable()->after('description_rw');
            }
            if (!Schema::hasColumn('portfolios', 'description_fr')) {
                $table->text('description_fr')->nullable()->after('description_en');
            }
            if (!Schema::hasColumn('portfolios', 'category_rw')) {
                $table->string('category_rw')->nullable()->after('category');
            }
            if (!Schema::hasColumn('portfolios', 'category_en')) {
                $table->string('category_en')->nullable()->after('category_rw');
            }
            if (!Schema::hasColumn('portfolios', 'category_fr')) {
                $table->string('category_fr')->nullable()->after('category_en');
            }
        });

        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'title_rw')) {
                $table->string('title_rw')->nullable()->after('title');
            }
            if (!Schema::hasColumn('posts', 'title_en')) {
                $table->string('title_en')->nullable()->after('title_rw');
            }
            if (!Schema::hasColumn('posts', 'title_fr')) {
                $table->string('title_fr')->nullable()->after('title_en');
            }
            if (!Schema::hasColumn('posts', 'content_rw')) {
                $table->text('content_rw')->nullable()->after('content');
            }
            if (!Schema::hasColumn('posts', 'content_en')) {
                $table->text('content_en')->nullable()->after('content_rw');
            }
            if (!Schema::hasColumn('posts', 'content_fr')) {
                $table->text('content_fr')->nullable()->after('content_en');
            }
            if (!Schema::hasColumn('posts', 'category_rw')) {
                $table->string('category_rw')->nullable()->after('category');
            }
            if (!Schema::hasColumn('posts', 'category_en')) {
                $table->string('category_en')->nullable()->after('category_rw');
            }
            if (!Schema::hasColumn('posts', 'category_fr')) {
                $table->string('category_fr')->nullable()->after('category_en');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn([
                'title_rw',
                'title_en',
                'title_fr',
                'content_rw',
                'content_en',
                'content_fr',
                'category_rw',
                'category_en',
                'category_fr',
            ]);
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn([
                'title_rw',
                'title_en',
                'title_fr',
                'description_rw',
                'description_en',
                'description_fr',
                'category_rw',
                'category_en',
                'category_fr',
            ]);
        });
    }
};
