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
            $table->index('role');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->index('event_id');
            $table->index('status');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index('event_id');
            $table->index('guest_id');
            $table->index('channel');
            $table->index('status');
        });

        Schema::table('scan_logs', function (Blueprint $table) {
            $table->index('event_id');
            $table->index('guest_id');
            $table->index('status');
        });

        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->index('event_id');
            $table->index('user_id');
            $table->index('type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->dropIndex(['event_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['event_id']);
            $table->dropIndex(['guest_id']);
            $table->dropIndex(['channel']);
            $table->dropIndex(['status']);
        });

        Schema::table('scan_logs', function (Blueprint $table) {
            $table->dropIndex(['event_id']);
            $table->dropIndex(['guest_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropIndex(['event_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['type']);
            $table->dropIndex(['status']);
        });
    }
};
