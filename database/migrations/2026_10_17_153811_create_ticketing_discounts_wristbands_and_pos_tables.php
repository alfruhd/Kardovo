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
        // 1. Discount Codes table for events
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('code', 64);
            $table->string('discount_type', 20)->default('percentage'); // 'percentage' or 'fixed'
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->unsignedInteger('max_uses')->nullable(); // null = unlimited
            $table->unsignedInteger('used_count')->default(0);
            $table->decimal('min_order_amount', 12, 2)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'code']);
            $table->index(['event_id', 'is_active']);
            $table->index('code');
        });

        // 2. Add discount and POS sales tracking fields to ticket_orders
        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->foreignId('discount_code_id')->nullable()->after('currency')->constrained('discount_codes')->nullOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0)->after('discount_code_id');
            $table->string('sales_channel', 30)->default('web')->after('discount_amount'); // 'web', 'pos', 'box_office'
        });

        // 3. Wristband custom printing orders & requests
        Schema::create('wristband_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('order_number', 50)->unique();
            $table->string('material_type', 50)->default('tyvek'); // 'tyvek', 'fabric_woven', 'vinyl', 'silicone'
            $table->unsignedInteger('quantity')->default(100);
            $table->string('color_scheme', 100)->nullable();
            $table->string('custom_text')->nullable();
            $table->text('custom_logo_url')->nullable();
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('contact_email')->nullable();
            $table->text('delivery_address')->nullable();
            $table->string('status', 30)->default('requested'); // 'requested', 'processing', 'shipped', 'delivered', 'cancelled'
            $table->decimal('estimated_cost', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status']);
        });

        // 4. Point of Sale (POS) Hardware Terminal Requests
        Schema::create('pos_terminal_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('request_number', 50)->unique();
            $table->unsignedInteger('terminals_count')->default(1);
            $table->date('required_from_date');
            $table->date('required_to_date')->nullable();
            $table->string('venue_location');
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('contact_email')->nullable();
            $table->string('status', 30)->default('pending'); // 'pending', 'approved', 'dispatched', 'active', 'returned', 'rejected'
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_terminal_requests');
        Schema::dropIfExists('wristband_orders');

        Schema::table('ticket_orders', function (Blueprint $table) {
            $table->dropForeign(['discount_code_id']);
            $table->dropColumn(['discount_code_id', 'discount_amount', 'sales_channel']);
        });

        Schema::dropIfExists('discount_codes');
    }
};
