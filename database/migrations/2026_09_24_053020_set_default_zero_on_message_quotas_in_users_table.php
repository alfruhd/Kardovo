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
        DB::table('users')
            ->whereNull('max_whatsapp_limit')
            ->update(['max_whatsapp_limit' => 0]);

        DB::table('users')
            ->whereNull('max_sms_limit')
            ->update(['max_sms_limit' => 0]);

        Schema::table('users', function (Blueprint $table) {
            $table->integer('max_whatsapp_limit')->default(0)->nullable()->change();
            $table->integer('max_sms_limit')->default(0)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('max_whatsapp_limit')->nullable()->default(null)->change();
            $table->integer('max_sms_limit')->nullable()->default(null)->change();
        });
    }
};
