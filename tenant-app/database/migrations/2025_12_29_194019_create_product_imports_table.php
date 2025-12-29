<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_imports', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_filename');
            $table->enum('source', ['csv', 'excel', 'erp'])->default('csv');
            $table->string('erp_type')->nullable(); // evira, logo, netsis, mock
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('total_rows')->default(0);
            $table->integer('imported_rows')->default(0);
            $table->integer('updated_rows')->default(0);
            $table->integer('failed_rows')->default(0);
            $table->json('column_mapping')->nullable();
            $table->json('errors')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // ERP connection settings table
        Schema::create('erp_connections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // evira, logo, netsis, mock
            $table->json('config')->nullable(); // host, port, database, username, etc.
            $table->boolean('is_active')->default(false);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_connections');
        Schema::dropIfExists('product_imports');
    }
};
