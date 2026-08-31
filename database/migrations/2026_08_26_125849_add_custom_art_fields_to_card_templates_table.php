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
        Schema::table('card_templates', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('name');
            $table->string('template_type')->default('gradient_card')->after('image_path'); // custom_art, gradient_card
            $table->json('elements_config')->nullable()->after('layout_json');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_templates', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'template_type', 'elements_config']);
        });
    }
};
