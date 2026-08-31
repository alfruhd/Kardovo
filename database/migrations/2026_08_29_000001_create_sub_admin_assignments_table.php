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
        Schema::create("sub_admin_assignments", function (Blueprint $table) {
            $table->id();
            $table->foreignId("sub_admin_id")->constrained("users")->cascadeOnDelete();
            $table->foreignId("customer_id")->nullable()->constrained("users")->cascadeOnDelete();
            $table->foreignId("event_id")->nullable()->constrained("events")->cascadeOnDelete();
            $table->timestamps();

            $table->index(["sub_admin_id", "customer_id"]);
            $table->index(["sub_admin_id", "event_id"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("sub_admin_assignments");
    }
};
