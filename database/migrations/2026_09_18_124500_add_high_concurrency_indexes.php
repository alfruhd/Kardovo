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
        Schema::table('guests', function (Blueprint $table) {
            $table->index(['event_id', 'card_number'], 'idx_guests_event_card_number');
            $table->index(['event_id', 'unique_code'], 'idx_guests_event_unique_code');
            $table->index(['event_id', 'qr_token'], 'idx_guests_event_qr_token');
            $table->index(['event_id', 'rsvp_status', 'entries_used'], 'idx_guests_event_rsvp_entries');
        });

        Schema::table('scan_logs', function (Blueprint $table) {
            $table->index(['event_id', 'scanner_id', 'scanned_at'], 'idx_scan_logs_event_scanner_scanned');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['event_id', 'status', 'channel'], 'idx_messages_event_status_channel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropIndex('idx_guests_event_card_number');
            $table->dropIndex('idx_guests_event_unique_code');
            $table->dropIndex('idx_guests_event_qr_token');
            $table->dropIndex('idx_guests_event_rsvp_entries');
        });

        Schema::table('scan_logs', function (Blueprint $table) {
            $table->dropIndex('idx_scan_logs_event_scanner_scanned');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_messages_event_status_channel');
        });
    }
};

