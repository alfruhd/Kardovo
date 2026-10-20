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
            $table->index('phone', 'idx_guests_phone');
            $table->index(['event_id', 'delivery_status'], 'idx_guests_event_delivery');
            $table->index(['event_id', 'pledge_status'], 'idx_guests_event_pledge_status');
            $table->index(['event_id', 'phone'], 'idx_guests_event_phone');
        });

        Schema::table('pledge_payments', function (Blueprint $table) {
            $table->index(['event_id', 'guest_id'], 'idx_pledge_payments_event_guest');
            $table->index('reference', 'idx_pledge_payments_reference');
        });

        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->index('payment_reference', 'idx_ticket_orders_payment_reference');
            $table->index(['event_id', 'buyer_phone'], 'idx_ticket_orders_event_buyer_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->dropIndex('idx_ticket_orders_payment_reference');
            $table->dropIndex('idx_ticket_orders_event_buyer_phone');
        });

        Schema::table('pledge_payments', function (Blueprint $table) {
            $table->dropIndex('idx_pledge_payments_event_guest');
            $table->dropIndex('idx_pledge_payments_reference');
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->dropIndex('idx_guests_phone');
            $table->dropIndex('idx_guests_event_delivery');
            $table->dropIndex('idx_guests_event_pledge_status');
            $table->dropIndex('idx_guests_event_phone');
        });
    }
};
