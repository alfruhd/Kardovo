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
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->enum('type', ['income', 'expense'])->default('income');
            $table->string('category')->default('pass_sales'); // pass_sales, sms_credits, design_service, subscription, carrier_sms_cogs, whatsapp_api_cogs, server_infrastructure, payment_gateway_fee, operations, other
            $table->string('title');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('TZS');
            $table->string('payment_method')->default('M-Pesa'); // M-Pesa, Tigo Pesa, Airtel Money, Bank Wire, Stripe/Card, Cash / Invoice, Internal Balance
            $table->string('reference')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->string('status')->default('completed'); // completed, pending, refunded, failed
            $table->text('notes')->nullable();
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
