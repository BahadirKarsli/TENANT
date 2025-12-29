import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NewsItem {
    id: number;
    title: string;
    summary: string | null;
    content?: string | null;
    badge: string | null;
    badge_color: string;
    published_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private readonly apiUrl = `${environment.apiUrl}/content`;

    private newsSignal = signal<NewsItem[]>([]);
    private loadingSignal = signal<boolean>(false);

    readonly news = this.newsSignal.asReadonly();
    readonly loading = this.loadingSignal.asReadonly();

    constructor(private http: HttpClient) { }

    loadNews(): Observable<{ news: NewsItem[] }> {
        this.loadingSignal.set(true);
        return this.http.get<{ news: NewsItem[] }>(`${this.apiUrl}/news`).pipe(
            tap({
                next: (response) => {
                    this.newsSignal.set(response.news);
                    this.loadingSignal.set(false);
                },
                error: () => {
                    this.loadingSignal.set(false);
                }
            })
        );
    }

    getNewsItem(id: number): Observable<{ news: NewsItem }> {
        return this.http.get<{ news: NewsItem }>(`${this.apiUrl}/news/${id}`);
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
}
