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
        // 1. Add payout account fields to events table
        Schema::table('events', function (Blueprint $table) {
            $table->string('payout_method', 30)->default('mobile_money')->after('ticket_sales_end_at'); // mobile_money, bank
            $table->string('payout_provider', 60)->nullable()->after('payout_method'); // M-Pesa, TigoPesa, Airtel Money, HaloPesa, CRDB, NMB, etc.
            $table->string('payout_account_number', 60)->nullable()->after('payout_provider');
            $table->string('payout_account_name', 120)->nullable()->after('payout_account_number');
            $table->string('payout_bank_branch', 100)->nullable()->after('payout_account_name');
            $table->string('payout_status', 30)->default('unconfigured')->after('payout_bank_branch'); // unconfigured, active, pending_verification
        });

        // 2. Add organizer net amount and platform fee percentage to ticket_orders table
        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->decimal('platform_fee_percent', 5, 2)->default(6.00)->after('platform_fee'); // Default 6%
            $table->decimal('organizer_net_amount', 12, 2)->default(0)->after('platform_fee_percent'); // 94% of subtotal
            $table->string('payout_disbursement_status', 30)->default('pending')->after('payment_status'); // pending, processing, paid, on_hold
            $table->timestamp('payout_disbursed_at')->nullable()->after('payout_disbursement_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'payout_method',
                'payout_provider',
                'payout_account_number',
                'payout_account_name',
                'payout_bank_branch',
                'payout_status',
            ]);
        });

        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->dropColumn([
                'platform_fee_percent',
                'organizer_net_amount',
                'payout_disbursement_status',
                'payout_disbursed_at',
            ]);
        });
    }
};
