import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminContentService, NewsItemAdmin } from '../../../core/services/admin-content.service';

@Component({
    selector: 'app-admin-news',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Haber Yönetimi</h1>
        <button (click)="openModal()" class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          + Yeni Haber
        </button>
      </div>

      @if (loading()) {
        <div class="text-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Başlık</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Etiket</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Durum</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tarih</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of news(); track item.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">{{ item.title }}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">{{ item.summary }}</div>
                  </td>
                  <td class="px-6 py-4">
                    @if (item.badge) {
                      <span class="px-3 py-1 text-xs font-medium rounded-full" [class]="getBadgeClass(item.badge_color)">
                        {{ item.badge }}
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <button (click)="togglePublish(item)" 
                            class="px-3 py-1 text-xs font-medium rounded-full transition-colors"
                            [class]="item.is_published ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                      {{ item.is_published ? 'Yayında' : 'Taslak' }}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ item.published_at ? formatDate(item.published_at) : '-' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="editItem(item)" class="text-primary-600 hover:text-primary-800 mr-3">Düzenle</button>
                    <button (click)="deleteItem(item)" class="text-red-600 hover:text-red-800">Sil</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    Henüz haber eklenmemiş
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 class="text-xl font-bold mb-6">{{ editingItem() ? 'Haber Düzenle' : 'Yeni Haber' }}</h2>
            
            <form (ngSubmit)="saveItem()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                <input type="text" [(ngModel)]="formData.title" name="title" class="input" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Özet</label>
                <textarea [(ngModel)]="formData.summary" name="summary" class="input" rows="2"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Etiket</label>
                  <input type="text" [(ngModel)]="formData.badge" name="badge" class="input" placeholder="Yeni, Kampanya...">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Etiket Rengi</label>
                  <select [(ngModel)]="formData.badge_color" name="badge_color" class="input">
                    <option value="blue">Mavi</option>
                    <option value="green">Yeşil</option>
                    <option value="red">Kırmızı</option>
                    <option value="yellow">Sarı</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="formData.is_published" name="is_published" id="is_published" class="rounded">
                <label for="is_published" class="text-sm text-gray-700">Yayınla</label>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="showModal.set(false)" class="px-4 py-2 text-gray-600 hover:text-gray-800">İptal</button>
                <button type="submit" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {{ editingItem() ? 'Güncelle' : 'Oluştur' }}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    }
    .input:focus {
      outline: none;
      border-color: #6366f1;
    }
  `]
})
export class AdminNewsComponent implements OnInit {
    private adminContent = inject(AdminContentService);

    loading = signal(true);
    news = signal<NewsItemAdmin[]>([]);
    showModal = signal(false);
    editingItem = signal<NewsItemAdmin | null>(null);

    formData = {
        title: '',
        summary: '',
        badge: '',
        badge_color: 'blue',
        is_published: false
    };

    ngOnInit(): void {
        this.loadNews();
    }

    loadNews(): void {
        this.adminContent.getNews().subscribe({
            next: (response) => {
                this.news.set(response.news);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    openModal(): void {
        this.editingItem.set(null);
        this.formData = { title: '', summary: '', badge: '', badge_color: 'blue', is_published: false };
        this.showModal.set(true);
    }

    editItem(item: NewsItemAdmin): void {
        this.editingItem.set(item);
        this.formData = {
            title: item.title,
            summary: item.summary || '',
            badge: item.badge || '',
            badge_color: item.badge_color,
            is_published: item.is_published
        };
        this.showModal.set(true);
    }

    saveItem(): void {
        const editing = this.editingItem();

        if (editing) {
            this.adminContent.updateNews(editing.id, this.formData).subscribe({
                next: () => {
                    this.showModal.set(false);
                    this.loadNews();
                }
            });
        } else {
            this.adminContent.createNews(this.formData).subscribe({
                next: () => {
                    this.showModal.set(false);
                    this.loadNews();
                }
            });
        }
    }

    deleteItem(item: NewsItemAdmin): void {
        if (confirm(`"${item.title}" haberini silmek istediğinize emin misiniz?`)) {
            this.adminContent.deleteNews(item.id).subscribe({
                next: () => this.loadNews()
            });
        }
    }

    togglePublish(item: NewsItemAdmin): void {
        this.adminContent.toggleNewsPublish(item.id).subscribe({
            next: () => this.loadNews()
        });
    }

    getBadgeClass(color: string): string {
        const classes: Record<string, string> = {
            'green': 'bg-green-100 text-green-800',
            'red': 'bg-red-100 text-red-800',
            'yellow': 'bg-yellow-100 text-yellow-800',
            'blue': 'bg-blue-100 text-blue-800',
        };
        return classes[color] || 'bg-gray-100 text-gray-800';
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('tr-TR');
    }
}
