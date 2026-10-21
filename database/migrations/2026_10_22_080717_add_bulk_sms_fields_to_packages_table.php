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
        Schema::table('packages', function (Blueprint $table) {
            $table->string('package_type')->default('event_card')->after('name')->index();
            $table->unsignedInteger('sms_count')->nullable()->after('price');
            $table->decimal('rate_per_sms', 8, 2)->nullable()->after('sms_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['package_type', 'sms_count', 'rate_per_sms']);
        });
    }
};
