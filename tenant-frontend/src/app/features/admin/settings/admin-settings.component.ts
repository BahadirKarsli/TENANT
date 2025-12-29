import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminContentService, SiteSetting } from '../../../core/services/admin-content.service';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Site Ayarları</h1>
        <button (click)="saveSettings()" 
                [disabled]="saving()"
                class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50">
          {{ saving() ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
        </button>
      </div>

      @if (loading()) {
        <div class="text-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      } @else {
        <div class="space-y-8">
          <!-- Hero Section -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-2xl">🏠</span> Hero Bölümü
            </h2>
            <div class="grid gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input type="text" [(ngModel)]="formData['hero_title']" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <input type="text" [(ngModel)]="formData['hero_subtitle']" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea [(ngModel)]="formData['hero_description']" class="input" rows="3"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ana Buton Metni</label>
                  <input type="text" [(ngModel)]="formData['hero_cta_text']" class="input">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">İkinci Buton Metni</label>
                  <input type="text" [(ngModel)]="formData['hero_cta_secondary']" class="input">
                </div>
              </div>
            </div>
          </div>

          <!-- Company Info -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-2xl">🏢</span> Şirket Bilgileri
            </h2>
            <div class="grid gap-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                  <input type="text" [(ngModel)]="formData['company_name']" class="input">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                  <input type="text" [(ngModel)]="formData['company_tagline']" class="input">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hakkımızda Metni</label>
                <textarea [(ngModel)]="formData['company_about']" class="input" rows="4"></textarea>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-2xl">📞</span> İletişim Bilgileri
            </h2>
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input type="email" [(ngModel)]="formData['contact_email']" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="text" [(ngModel)]="formData['contact_phone']" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input type="text" [(ngModel)]="formData['contact_address']" class="input">
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-2xl">📊</span> İstatistikler
            </h2>
            <div class="grid md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Sayısı</label>
                <input type="text" [(ngModel)]="formData['stat_products']" class="input" placeholder="10K+">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Marka Sayısı</label>
                <input type="text" [(ngModel)]="formData['stat_brands']" class="input" placeholder="500+">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">İş Ortağı</label>
                <input type="text" [(ngModel)]="formData['stat_partners']" class="input" placeholder="2K+">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Memnuniyet</label>
                <input type="text" [(ngModel)]="formData['stat_satisfaction']" class="input" placeholder="99%">
              </div>
            </div>
          </div>
        </div>

        @if (successMessage()) {
          <div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
            {{ successMessage() }}
          </div>
        }
      }
    </div>
  `,
    styles: [`
    .input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }
    .input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
    private adminContent = inject(AdminContentService);

    loading = signal(true);
    saving = signal(false);
    successMessage = signal('');
    formData: Record<string, string> = {};

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings(): void {
        this.adminContent.getSettings().subscribe({
            next: (response) => {
                this.formData = { ...response.flat };
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    saveSettings(): void {
        this.saving.set(true);

        const settings = Object.entries(this.formData).map(([key, value]) => ({ key, value }));

        this.adminContent.updateSettings(settings).subscribe({
            next: () => {
                this.saving.set(false);
                this.successMessage.set('Ayarlar başarıyla kaydedildi!');
                setTimeout(() => this.successMessage.set(''), 3000);
            },
            error: () => {
                this.saving.set(false);
            }
        });
    }
}
