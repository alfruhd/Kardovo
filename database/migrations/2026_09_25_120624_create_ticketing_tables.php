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
        // 1. Add ticketing fields to events table
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('ticketing_enabled')->default(false)->after('status');
            $table->string('ticket_currency', 10)->default('TZS')->after('ticketing_enabled');
            $table->text('ticket_instructions')->nullable()->after('ticket_currency');
            $table->timestamp('ticket_sales_end_at')->nullable()->after('ticket_instructions');
        });

        // 2. Ticket Tiers (e.g. Early Bird, Regular, VIP, VVIP)
        Schema::create('ticket_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->string('currency', 10)->default('TZS');
            $table->unsignedInteger('capacity')->default(100);
            $table->unsignedInteger('sold_count')->default(0);
            $table->unsignedInteger('max_per_order')->default(10);
            $table->timestamp('sales_start_at')->nullable();
            $table->timestamp('sales_end_at')->nullable();
            $table->string('status')->default('active'); // active, sold_out, paused, hidden
            $table->integer('sort_order')->default(0);
            $table->string('color', 20)->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status']);
        });

        // 3. Ticket Orders (Checkout records)
        Schema::create('ticket_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('buyer_name');
            $table->string('buyer_phone');
            $table->string('buyer_email')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('platform_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 10)->default('TZS');
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_status')->default('pending'); // pending, paid, failed, refunded
            $table->timestamp('paid_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'payment_status']);
            $table->index('order_number');
        });

        // 4. Individual Tickets (Individual passes issued per tier)
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_order_id')->constrained('ticket_orders')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('ticket_tier_id')->constrained('ticket_tiers')->cascadeOnDelete();
            $table->string('ticket_number')->unique();
            $table->string('unique_code')->unique();
            $table->string('qr_token', 64)->unique();
            $table->string('attendee_name');
            $table->string('attendee_phone')->nullable();
            $table->string('attendee_email')->nullable();
            $table->decimal('price_paid', 12, 2)->default(0);
            $table->string('currency', 10)->default('TZS');
            $table->string('status')->default('valid'); // valid, checked_in, cancelled
            $table->timestamp('checked_in_at')->nullable();
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('gate_label')->nullable();
            $table->json('delivery_channels')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status']);
            $table->index('ticket_number');
            $table->index('unique_code');
            $table->index('qr_token');
        });

        // 5. Link tickets to scan logs for gate verification tracking
        Schema::table('scan_logs', function (Blueprint $table) {
            $table->foreignId('ticket_id')->nullable()->after('guest_id')->constrained('tickets')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scan_logs', function (Blueprint $table) {
            $table->dropForeign(['ticket_id']);
            $table->dropColumn('ticket_id');
        });

        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_orders');
        Schema::dropIfExists('ticket_tiers');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'ticketing_enabled',
                'ticket_currency',
                'ticket_instructions',
                'ticket_sales_end_at',
            ]);
        });
    }
};
