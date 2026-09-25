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
        Schema::table('events', function (Blueprint $table) {
            if (! Schema::hasColumn('events', 'cover_photo')) {
                $table->string('cover_photo')->nullable()->after('venue');
            }
            if (! Schema::hasColumn('events', 'occasion_type')) {
                $table->string('occasion_type')->default('event')->after('event_type');
            }
            if (! Schema::hasColumn('events', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('ticketing_enabled');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['cover_photo', 'occasion_type', 'is_public']);
        });
    }
};
