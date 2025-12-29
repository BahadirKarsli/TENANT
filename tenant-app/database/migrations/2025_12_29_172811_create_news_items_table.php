<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->text('content')->nullable();
            $table->string('image_url')->nullable();
            $table->string('badge')->nullable(); // e.g., "Yeni", "Kampanya", "Duyuru"
            $table->string('badge_color')->default('blue'); // blue, green, red, yellow
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Insert sample news items
        $samples = [
            [
                'title' => 'Yeni Ürün Kategorileri Eklendi',
                'summary' => 'Elektronik ve beyaz eşya kategorilerinde yüzlerce yeni ürün sizlerle.',
                'badge' => 'Yeni',
                'badge_color' => 'green',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 1,
            ],
            [
                'title' => 'Kargo Kampanyası',
                'summary' => '500 TL üzeri siparişlerde ücretsiz kargo fırsatını kaçırmayın.',
                'badge' => 'Kampanya',
                'badge_color' => 'red',
                'is_published' => true,
                'published_at' => now()->subDays(2),
                'sort_order' => 2,
            ],
            [
                'title' => 'Yeni Ödeme Seçenekleri',
                'summary' => 'Kredi kartına ek olarak havale ve çek ile ödeme seçenekleri aktif.',
                'badge' => 'Duyuru',
                'badge_color' => 'blue',
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'sort_order' => 3,
            ],
        ];

        foreach ($samples as $item) {
            DB::table('news_items')->insert(array_merge($item, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('news_items');
    }
};
