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
            if (! Schema::hasColumn('events', 'is_occasion')) {
                $table->boolean('is_occasion')->default(false)->after('occasion_type')->index();
            }
        });

        // Backfill existing occasions (ticketed experiences like concerts, flights, hotels, nightlife, marathons)
        DB::table('events')
            ->where(function ($q) {
                $q->whereIn('occasion_type', ['concert', 'flight', 'hotel', 'nightlife', 'sports'])
                    ->orWhere(function ($sq) {
                        $sq->where('ticketing_enabled', true)
                            ->whereNull('card_template_id');
                    });
            })
            ->update(['is_occasion' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'is_occasion')) {
                $table->dropColumn('is_occasion');
            }
        });
    }
};
