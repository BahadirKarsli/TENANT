import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SiteSetting {
    id: number;
    key: string;
    value: string;
    type: string;
    group: string;
}

export interface NewsItemAdmin {
    id: number;
    title: string;
    summary: string | null;
    content: string | null;
    image_url: string | null;
    badge: string | null;
    badge_color: string;
    is_published: boolean;
    published_at: string | null;
    sort_order: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminContentService {
    private readonly apiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }

    // Site Settings
    getSettings(): Observable<{ settings: Record<string, SiteSetting[]>; flat: Record<string, string> }> {
        return this.http.get<{ settings: Record<string, SiteSetting[]>; flat: Record<string, string> }>(
            `${this.apiUrl}/settings`
        );
    }

    updateSettings(settings: { key: string; value: string }[]): Observable<any> {
        return this.http.put(`${this.apiUrl}/settings`, { settings });
    }

    // News
    getNews(): Observable<{ news: NewsItemAdmin[] }> {
        return this.http.get<{ news: NewsItemAdmin[] }>(`${this.apiUrl}/news`);
    }

    createNews(data: Partial<NewsItemAdmin>): Observable<{ news: NewsItemAdmin }> {
        return this.http.post<{ news: NewsItemAdmin }>(`${this.apiUrl}/news`, data);
    }

    updateNews(id: number, data: Partial<NewsItemAdmin>): Observable<{ news: NewsItemAdmin }> {
        return this.http.put<{ news: NewsItemAdmin }>(`${this.apiUrl}/news/${id}`, data);
    }

    deleteNews(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/news/${id}`);
    }

    toggleNewsPublish(id: number): Observable<{ news: NewsItemAdmin }> {
        return this.http.post<{ news: NewsItemAdmin }>(`${this.apiUrl}/news/${id}/toggle-publish`, {});
    }
}
