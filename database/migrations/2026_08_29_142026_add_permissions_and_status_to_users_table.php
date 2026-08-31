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
            $table->json('permissions')->nullable()->after('role');
            $table->string('status')->default('active')->after('permissions'); // active, suspended
            $table->integer('max_events_limit')->nullable()->after('status');
            $table->string('suspension_reason')->nullable()->after('max_events_limit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['permissions', 'status', 'max_events_limit', 'suspension_reason']);
        });
    }
};
