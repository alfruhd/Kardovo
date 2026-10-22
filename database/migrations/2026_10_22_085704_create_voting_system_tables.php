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
        // 1. Add voting fields to events
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('voting_enabled')->default(false)->after('ticketing_enabled');
            $table->dateTime('voting_start_at')->nullable()->after('voting_enabled');
            $table->dateTime('voting_end_at')->nullable()->after('voting_start_at');
            $table->boolean('voting_visible_tallies')->default(true)->after('voting_end_at');
            $table->text('voting_instructions')->nullable()->after('voting_visible_tallies');
            $table->string('voting_banner')->nullable()->after('voting_instructions');
        });

        // 2. Create voting_categories
        Schema::create('voting_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_paid')->default(true);
            $table->json('pricing_tiers')->nullable();
            $table->unsignedInteger('max_selections')->default(1);
            $table->integer('sort_order')->default(0);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['event_id', 'status']);
        });

        // 3. Create voting_candidates
        Schema::create('voting_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('voting_category_id')->constrained('voting_categories')->cascadeOnDelete();
            $table->string('candidate_number')->nullable();
            $table->string('name');
            $table->text('bio')->nullable();
            $table->string('photo_url')->nullable();
            $table->unsignedBigInteger('total_votes')->default(0);
            $table->decimal('revenue_collected', 12, 2)->default(0.00);
            $table->integer('sort_order')->default(0);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['event_id', 'voting_category_id', 'status']);
        });

        // 4. Create vote_orders
        Schema::create('vote_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('voting_category_id')->constrained('voting_categories')->cascadeOnDelete();
            $table->foreignId('voting_candidate_id')->constrained('voting_candidates')->cascadeOnDelete();
            $table->string('voter_phone');
            $table->string('voter_name')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->string('currency', 10)->default('TZS');
            $table->string('provider', 50)->default('Mpesa');
            $table->string('payment_reference')->nullable();
            $table->string('status', 30)->default('pending');
            $table->dateTime('paid_at')->nullable();
            $table->boolean('is_free')->default(false);
            $table->timestamps();

            $table->index(['order_number', 'status']);
            $table->index(['event_id', 'voting_candidate_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vote_orders');
        Schema::dropIfExists('voting_candidates');
        Schema::dropIfExists('voting_categories');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'voting_enabled',
                'voting_start_at',
                'voting_end_at',
                'voting_visible_tallies',
                'voting_instructions',
                'voting_banner',
            ]);
        });
    }
};
