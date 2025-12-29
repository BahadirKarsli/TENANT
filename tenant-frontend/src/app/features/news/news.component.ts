import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../core/services';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl font-bold mb-4">Haberler & Duyurular</h1>
          <p class="text-xl text-primary-100">Güncel gelişmeler ve kampanyalardan haberdar olun</p>
        </div>
      </div>

      <!-- News List -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        @if (newsService.loading()) {
          <div class="text-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p class="mt-4 text-gray-500">Yükleniyor...</p>
          </div>
        } @else if (newsService.news().length === 0) {
          <div class="text-center py-20">
            <div class="text-6xl mb-4">📰</div>
            <h3 class="text-xl font-semibold text-gray-700">Henüz haber bulunmuyor</h3>
            <p class="text-gray-500 mt-2">Yakında güncellemeler paylaşacağız</p>
          </div>
        } @else {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (item of newsService.news(); track item.id) {
              <article class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div class="h-48 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <span class="text-6xl">📰</span>
                </div>
                <div class="p-6">
                  @if (item.badge) {
                    <span class="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                          [class]="newsService.getBadgeClass(item.badge_color)">
                      {{ item.badge }}
                    </span>
                  }
                  <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {{ item.title }}
                  </h3>
                  <p class="text-gray-600 mb-4">{{ item.summary }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-400">
                      {{ formatDate(item.published_at) }}
                    </span>
                    <button class="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Devamını Oku →
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class NewsComponent implements OnInit {
  newsService = inject(NewsService);

  ngOnInit(): void {
    this.newsService.loadNews().subscribe();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
