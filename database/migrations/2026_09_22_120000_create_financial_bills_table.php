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
        Schema::create('financial_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_number')->unique();
            $table->string('vendor_name');
            $table->string('title');
            $table->string('category')->default('server_infrastructure'); // carrier_sms_cogs, whatsapp_api_cogs, server_infrastructure, payment_gateway_fee, operations, marketing, office_rent, legal_compliance, other
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('TZS');
            $table->date('bill_date');
            $table->date('due_date');
            $table->string('status')->default('pending'); // pending, paid, overdue, cancelled
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_period')->nullable(); // monthly, quarterly, yearly
            $table->string('payment_method_intended')->nullable(); // Bank Wire, M-Pesa, Card, Cash
            $table->string('vendor_account_reference')->nullable(); // Account #, Paybill #, IBAN
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->boolean('reminder_enabled')->default(true);
            $table->integer('reminder_days_before')->default(3);
            $table->timestamp('reminded_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'due_date']);
            $table->index('vendor_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_bills');
    }
};
