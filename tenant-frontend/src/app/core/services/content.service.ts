import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SiteSettings {
    [key: string]: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private readonly apiUrl = `${environment.apiUrl}/content`;

    // Signals for reactive state
    private settingsSignal = signal<SiteSettings>({});
    private loadingSignal = signal<boolean>(false);

    readonly settings = this.settingsSignal.asReadonly();
    readonly loading = this.loadingSignal.asReadonly();

    constructor(private http: HttpClient) {
        this.loadSettings();
    }

    loadSettings(): void {
        this.loadingSignal.set(true);
        this.http.get<{ settings: SiteSettings }>(`${this.apiUrl}/settings`).subscribe({
            next: (response) => {
                this.settingsSignal.set(response.settings);
                this.loadingSignal.set(false);
            },
            error: () => {
                this.loadingSignal.set(false);
                // Use defaults on error
                this.settingsSignal.set(this.getDefaults());
            }
        });
    }

    get(key: string, defaultValue: string = ''): string {
        return this.settingsSignal()[key] ?? defaultValue;
    }

    private getDefaults(): SiteSettings {
        return {
            hero_title: 'Profesyonel Tedarik',
            hero_subtitle: 'İşletmeniz İçin Çözümler',
            hero_description: 'Binlerce ürün, rekabetçi toptan fiyatlar ve hızlı teslimat ile işletmenizi büyütün.',
            hero_cta_text: 'Ürünleri İncele',
            hero_cta_secondary: 'Daha Fazla Bilgi',
            company_name: 'B2B Platform',
            company_tagline: '🚀 B2B Toptan Satış Platformu',
            company_about: 'B2B ihtiyaçlarınız için güvenilir tedarik platformu.',
            contact_email: 'info@b2bplatform.com',
            contact_phone: '+90 (212) 555 00 00',
            contact_address: 'İstanbul, Türkiye',
            stat_products: '10K+',
            stat_brands: '500+',
            stat_partners: '2K+',
            stat_satisfaction: '99%',
        };
    }
}
