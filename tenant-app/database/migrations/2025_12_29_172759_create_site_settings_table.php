<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, textarea, json
            $table->string('group')->default('general'); // general, hero, contact, features
            $table->timestamps();
        });

        // Insert default settings
        $defaults = [
            // Hero section
            ['key' => 'hero_title', 'value' => 'Profesyonel Tedarik', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_subtitle', 'value' => 'İşletmeniz İçin Çözümler', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_description', 'value' => 'Binlerce ürün, rekabetçi toptan fiyatlar ve hızlı teslimat ile işletmenizi büyütün.', 'type' => 'textarea', 'group' => 'hero'],
            ['key' => 'hero_cta_text', 'value' => 'Ürünleri İncele', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_cta_secondary', 'value' => 'Daha Fazla Bilgi', 'type' => 'text', 'group' => 'hero'],
            
            // Company info
            ['key' => 'company_name', 'value' => 'B2B Platform', 'type' => 'text', 'group' => 'general'],
            ['key' => 'company_tagline', 'value' => '🚀 B2B Toptan Satış Platformu', 'type' => 'text', 'group' => 'general'],
            ['key' => 'company_about', 'value' => 'B2B ihtiyaçlarınız için güvenilir tedarik platformu. 10 yılı aşkın sektör tecrübemizle işletmenize değer katıyoruz.', 'type' => 'textarea', 'group' => 'general'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'info@b2bplatform.com', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+90 (212) 555 00 00', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => 'İstanbul, Türkiye', 'type' => 'text', 'group' => 'contact'],
            
            // Stats
            ['key' => 'stat_products', 'value' => '10K+', 'type' => 'text', 'group' => 'stats'],
            ['key' => 'stat_brands', 'value' => '500+', 'type' => 'text', 'group' => 'stats'],
            ['key' => 'stat_partners', 'value' => '2K+', 'type' => 'text', 'group' => 'stats'],
            ['key' => 'stat_satisfaction', 'value' => '99%', 'type' => 'text', 'group' => 'stats'],
        ];

        foreach ($defaults as $setting) {
            DB::table('site_settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
