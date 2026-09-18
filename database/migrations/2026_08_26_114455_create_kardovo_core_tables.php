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
        Schema::create('card_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('headline')->default("YOU'RE INVITED");
            $table->string('brand_color_from')->default('#1144A0');
            $table->string('brand_color_to')->default('#117534');
            $table->string('font_family')->default('Inter');
            $table->boolean('show_qr')->default(true);
            $table->boolean('show_category_badge')->default(true);
            $table->boolean('show_unique_code')->default(true);
            $table->string('footer_text')->default('Generated & secured by KARDOVO');
            $table->json('layout_json')->nullable();
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('card_template_id')->nullable()->constrained('card_templates')->nullOnDelete();
            $table->string('title');
            $table->string('event_type')->default('Wedding'); // Wedding, Corporate, Gala, Alumni, Birthday, Concert, etc.
            $table->date('event_date');
            $table->string('event_time')->nullable(); // e.g. "4:00 PM - Reception & Dinner"
            $table->string('venue');
            $table->string('city')->default('Dar es Salaam');
            $table->text('description')->nullable();
            $table->string('status')->default('active'); // active, draft, completed, cancelled
            $table->timestamps();
        });

        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('category')->default('Single Entry'); // Single Entry, Double Entry, VIP Pass, etc.
            $table->integer('max_entries')->default(1);
            $table->integer('entries_used')->default(0);
            $table->string('card_number')->unique(); // e.g. KDV-2026-004821
            $table->string('unique_code')->unique(); // 8-digit human-readable e.g. 29841872
            $table->string('qr_token', 64)->unique(); // Secure URL/QR lookup token
            $table->string('delivery_status')->default('draft'); // draft, sent, delivered, failed
            $table->string('rsvp_status')->default('pending'); // pending, attending, declined
            $table->timestamp('rsvp_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'delivery_status']);
            $table->index(['event_id', 'rsvp_status']);
        });

        Schema::create('scan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained('guests')->cascadeOnDelete();
            $table->foreignId('scanner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('scanner_name')->nullable();
            $table->string('gate_label')->default('Main Gate');
            $table->timestamp('scanned_at');
            $table->string('status'); // granted, rejected
            $table->string('rejection_reason')->nullable();
            $table->integer('entries_used_at_scan')->default(1);
            $table->timestamps();

            $table->index(['event_id', 'scanned_at']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->string('channel')->default('whatsapp'); // whatsapp, sms
            $table->string('recipient_phone');
            $table->text('message_body');
            $table->string('status')->default('sent'); // draft, queued, sent, delivered, read, failed
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('scan_logs');
        Schema::dropIfExists('guests');
        Schema::dropIfExists('events');
        Schema::dropIfExists('card_templates');
    }
};
