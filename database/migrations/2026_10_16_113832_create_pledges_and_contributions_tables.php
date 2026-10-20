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
        Schema::table('events', function (Blueprint $table) {
            $table->decimal('pledge_target', 14, 2)->default(0)->after('description');
            $table->string('pledge_currency', 10)->default('TZS')->after('pledge_target');
            $table->boolean('pledges_enabled')->default(false)->after('pledge_currency');
            $table->date('pledge_deadline')->nullable()->after('pledges_enabled');
            $table->json('pledge_settings')->nullable()->after('pledge_deadline');
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->decimal('pledge_amount', 12, 2)->default(0)->after('category');
            $table->decimal('paid_amount', 12, 2)->default(0)->after('pledge_amount');
            $table->string('pledge_status', 20)->default('none')->after('paid_amount');
            $table->date('pledge_deadline')->nullable()->after('pledge_status');
        });

        Schema::create('pledge_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 30)->default('cash');
            $table->string('reference', 100)->nullable();
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'payment_date']);
            $table->index(['guest_id', 'payment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pledge_payments');

        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['pledge_amount', 'paid_amount', 'pledge_status', 'pledge_deadline']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['pledge_target', 'pledge_currency', 'pledges_enabled', 'pledge_deadline', 'pledge_settings']);
        });
    }
};
