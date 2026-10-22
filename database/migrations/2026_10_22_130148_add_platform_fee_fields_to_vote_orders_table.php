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
        Schema::table('vote_orders', function (Blueprint $table) {
            $table->decimal('platform_fee', 12, 2)->default(0.00)->after('amount');
            $table->decimal('platform_fee_percent', 5, 2)->default(6.00)->after('platform_fee');
            $table->decimal('organizer_net_amount', 12, 2)->default(0.00)->after('platform_fee_percent');
            $table->foreignId('financial_transaction_id')->nullable()->after('payment_reference')->constrained('financial_transactions')->nullOnDelete();
            $table->json('metadata')->nullable()->after('is_free');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vote_orders', function (Blueprint $table) {
            $table->dropForeign(['financial_transaction_id']);
            $table->dropColumn([
                'platform_fee',
                'platform_fee_percent',
                'organizer_net_amount',
                'financial_transaction_id',
                'metadata',
            ]);
        });
    }
};
