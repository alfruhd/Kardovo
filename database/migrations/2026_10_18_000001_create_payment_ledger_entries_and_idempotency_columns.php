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
        Schema::table('ticket_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('ticket_orders', 'idempotency_key')) {
                $table->string('idempotency_key', 120)->nullable()->unique()->after('order_number');
            }
            if (! Schema::hasColumn('ticket_orders', 'cached_response')) {
                $table->json('cached_response')->nullable()->after('metadata');
            }
        });

        Schema::table('financial_transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('financial_transactions', 'idempotency_key')) {
                $table->string('idempotency_key', 120)->nullable()->unique()->after('transaction_number');
            }
        });

        if (! Schema::hasTable('payment_ledger_entries')) {
            Schema::create('payment_ledger_entries', function (Blueprint $table) {
                $table->id();
                $table->uuid('entry_uuid')->unique();
                $table->foreignId('ticket_order_id')->nullable()->constrained('ticket_orders')->nullOnDelete();
                $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
                $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
                $table->string('idempotency_key', 120)->nullable()->index();
                $table->string('provider_event_id', 160)->nullable()->unique();
                $table->string('state', 40)->index(); // intent_created, authorized, captured, failed, refunded
                $table->decimal('amount', 14, 2)->default(0);
                $table->string('currency', 10)->default('TZS');
                $table->string('payment_method', 60)->nullable();
                $table->string('gateway_reference', 160)->nullable()->index();
                $table->string('payload_hash', 64)->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['ticket_order_id', 'state']);
                $table->index(['financial_transaction_id', 'state']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_ledger_entries');

        Schema::table('ticket_orders', function (Blueprint $table) {
            if (Schema::hasColumn('ticket_orders', 'idempotency_key')) {
                $table->dropUnique(['idempotency_key']);
                $table->dropColumn('idempotency_key');
            }
            if (Schema::hasColumn('ticket_orders', 'cached_response')) {
                $table->dropColumn('cached_response');
            }
        });

        Schema::table('financial_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('financial_transactions', 'idempotency_key')) {
                $table->dropUnique(['idempotency_key']);
                $table->dropColumn('idempotency_key');
            }
        });
    }
};
