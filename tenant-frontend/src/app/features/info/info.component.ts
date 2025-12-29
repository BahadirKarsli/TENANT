import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl font-bold mb-4">Hakkımızda</h1>
          <p class="text-xl text-primary-100">{{ content.get('company_name', 'B2B Platform') }} ile tanışın</p>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-2 gap-12">
          <!-- About Section -->
          <div class="bg-white rounded-2xl shadow-sm p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Biz Kimiz?</h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              {{ content.get('company_about', 'B2B ihtiyaçlarınız için güvenilir tedarik platformu. 10 yılı aşkın sektör tecrübemizle işletmenize değer katıyoruz.') }}
            </p>
            <div class="grid grid-cols-2 gap-6">
              <div class="text-center p-4 bg-primary-50 rounded-xl">
                <div class="text-3xl font-bold text-primary-600 mb-1">{{ content.get('stat_products', '10K+') }}</div>
                <div class="text-sm text-gray-600">Ürün</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-xl">
                <div class="text-3xl font-bold text-green-600 mb-1">{{ content.get('stat_brands', '500+') }}</div>
                <div class="text-sm text-gray-600">Marka</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-xl">
                <div class="text-3xl font-bold text-blue-600 mb-1">{{ content.get('stat_partners', '2K+') }}</div>
                <div class="text-sm text-gray-600">İş Ortağı</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-xl">
                <div class="text-3xl font-bold text-orange-600 mb-1">{{ content.get('stat_satisfaction', '99%') }}</div>
                <div class="text-sm text-gray-600">Memnuniyet</div>
              </div>
            </div>
          </div>

          <!-- Contact Section -->
          <div class="bg-white rounded-2xl shadow-sm p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">İletişim</h2>
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">📧</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">E-posta</h3>
                  <p class="text-gray-600">{{ content.get('contact_email', 'info@b2bplatform.com') }}</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">📞</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Telefon</h3>
                  <p class="text-gray-600">{{ content.get('contact_phone', '+90 (212) 555 00 00') }}</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">📍</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Adres</h3>
                  <p class="text-gray-600">{{ content.get('contact_address', 'İstanbul, Türkiye') }}</p>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div class="mt-8 pt-8 border-t border-gray-100">
              <a routerLink="/login" 
                 class="block w-full text-center px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all">
                Hemen Başlayın
              </a>
            </div>
          </div>
        </div>

        <!-- Values Section -->
        <div class="mt-12 bg-white rounded-2xl shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Değerlerimiz</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">🤝</span>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">Güvenilirlik</h3>
              <p class="text-gray-600">Müşterilerimizle şeffaf ve dürüst ilişkiler kuruyoruz</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">🎯</span>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">Kalite</h3>
              <p class="text-gray-600">En yüksek standartlarda ürün ve hizmet sunuyoruz</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">🚀</span>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">İnovasyon</h3>
              <p class="text-gray-600">Sürekli gelişim ve yenilikçi çözümler üretiyoruz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InfoComponent {
  content = inject(ContentService);
}
