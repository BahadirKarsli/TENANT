import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductImportService, ProductImport, UploadResponse } from '../../../core/services/product-import.service';

@Component({
    selector: 'app-admin-import',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Ürün Import</h1>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Upload Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-2xl">📤</span> Dosya Yükle
          </h2>

          @if (!uploadData()) {
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors"
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event)">
              <input type="file" #fileInput (change)="onFileSelect($event)" accept=".csv,.xlsx,.xls" class="hidden">
              
              <div class="text-5xl mb-4">📁</div>
              <p class="text-gray-600 mb-4">CSV veya Excel dosyanızı sürükleyip bırakın</p>
              <button (click)="fileInput.click()" 
                      class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Dosya Seç
              </button>
              <p class="text-sm text-gray-400 mt-4">Desteklenen formatlar: .csv, .xlsx, .xls (max 10MB)</p>
            </div>
          } @else {
            <!-- Column Mapping -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">{{ uploadData()!.filename }}</p>
                  <p class="text-sm text-gray-500">{{ uploadData()!.total_rows }} satır bulundu</p>
                </div>
                <button (click)="resetUpload()" class="text-gray-500 hover:text-gray-700">✕ İptal</button>
              </div>

              <div class="border-t pt-4">
                <h3 class="font-medium mb-3">Sütun Eşleştirme</h3>
                @for (col of uploadData()!.available_columns; track col.key) {
                  <div class="flex items-center gap-4 mb-3">
                    <label class="w-32 text-sm">
                      {{ col.label }}
                      @if (col.required) { <span class="text-red-500">*</span> }
                    </label>
                    <select [(ngModel)]="columnMapping[col.key]" class="flex-1 input">
                      <option value="_skip_">-- Atla --</option>
                      @for (header of uploadData()!.headers; track header) {
                        <option [value]="header">{{ header }}</option>
                      }
                    </select>
                  </div>
                }
              </div>

              <!-- Preview -->
              @if (uploadData()!.preview.length > 0) {
                <div class="border-t pt-4">
                  <h3 class="font-medium mb-3">Önizleme (ilk 5 satır)</h3>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          @for (header of uploadData()!.headers; track header) {
                            <th class="px-3 py-2 text-left">{{ header }}</th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of uploadData()!.preview.slice(0, 5); track $index) {
                          <tr class="border-t">
                            @for (header of uploadData()!.headers; track header) {
                              <td class="px-3 py-2 truncate max-w-[150px]">{{ row[header] }}</td>
                            }
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }

              <button (click)="executeImport()" 
                      [disabled]="importing()"
                      class="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">
                {{ importing() ? 'İmport Ediliyor...' : 'Import Et' }}
              </button>
            </div>
          }
        </div>

        <!-- ERP Sync Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-2xl">🔄</span> ERP Senkronizasyonu
          </h2>

          <div class="space-y-4">
            @for (conn of erpConnections(); track conn.id) {
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">{{ conn.name }}</p>
                  <p class="text-sm text-gray-500">{{ erpTypes()[conn.type] || conn.type }}</p>
                  @if (conn.last_sync_at) {
                    <p class="text-xs text-gray-400">Son sync: {{ formatDate(conn.last_sync_at) }}</p>
                  }
                </div>
                <button (click)="syncErp(conn)" 
                        [disabled]="syncing()"
                        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {{ syncing() ? 'Sync...' : 'Sync' }}
                </button>
              </div>
            } @empty {
              <div class="text-center py-8 text-gray-500">
                <p class="mb-4">Henüz ERP bağlantısı yok</p>
                <button (click)="showErpModal.set(true)" class="text-primary-600 hover:text-primary-700">
                  + Bağlantı Ekle
                </button>
              </div>
            }

            @if (erpConnections().length > 0) {
              <button (click)="showErpModal.set(true)" class="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600">
                + Yeni Bağlantı Ekle
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Import History -->
      <div class="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Import Geçmişi</h2>
        
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Dosya</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Kaynak</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Durum</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Sonuç</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tarih</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (imp of imports(); track imp.id) {
              <tr>
                <td class="px-4 py-3 text-sm">{{ imp.original_filename }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs rounded-full" [class]="getSourceClass(imp.source)">
                    {{ getSourceLabel(imp.source) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs rounded-full" [class]="getStatusClass(imp.status)">
                    {{ getStatusLabel(imp.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="text-green-600">+{{ imp.imported_rows }}</span> /
                  <span class="text-blue-600">↻{{ imp.updated_rows }}</span> /
                  <span class="text-red-600">✕{{ imp.failed_rows }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(imp.created_at) }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">Henüz import yapılmamış</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
          {{ successMessage() }}
        </div>
      }

      <!-- ERP Connection Modal -->
      @if (showErpModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 class="text-xl font-bold mb-6">ERP Bağlantısı</h2>
            
            <form (ngSubmit)="saveErpConnection()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bağlantı Adı</label>
                <input type="text" [(ngModel)]="erpForm.name" name="name" class="input" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ERP Tipi</label>
                <select [(ngModel)]="erpForm.type" name="type" class="input" required>
                  @for (type of Object.entries(erpTypes()); track type[0]) {
                    <option [value]="type[0]">{{ type[1] }}</option>
                  }
                </select>
              </div>
              
              @if (erpForm.type === 'mock') {
                <div class="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Demo ERP seçildi. Bu mod test için sahte ürün verisi üretir.
                </div>
              }

              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="showErpModal.set(false)" class="px-4 py-2 text-gray-600">İptal</button>
                <button type="submit" class="px-6 py-2 bg-primary-600 text-white rounded-lg">Kaydet</button>
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
      padding: 0.5rem 0.75rem;
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
export class AdminImportComponent implements OnInit {
    private importService = inject(ProductImportService);

    Object = Object;

    imports = signal<ProductImport[]>([]);
    erpConnections = signal<any[]>([]);
    erpTypes = signal<Record<string, string>>({});
    uploadData = signal<UploadResponse | null>(null);
    importing = signal(false);
    syncing = signal(false);
    successMessage = signal('');
    showErpModal = signal(false);

    columnMapping: Record<string, string> = {};
    erpForm = { name: '', type: 'mock', config: {} };

    ngOnInit(): void {
        this.loadImports();
        this.loadErpConnections();
    }

    loadImports(): void {
        this.importService.getImports().subscribe({
            next: (res) => this.imports.set(res.imports)
        });
    }

    loadErpConnections(): void {
        this.importService.getErpConnections().subscribe({
            next: (res) => {
                this.erpConnections.set(res.connections);
                this.erpTypes.set(res.available_types);
            }
        });
    }

    onFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.uploadFile(input.files[0]);
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        if (event.dataTransfer?.files.length) {
            this.uploadFile(event.dataTransfer.files[0]);
        }
    }

    uploadFile(file: File): void {
        this.importService.uploadFile(file).subscribe({
            next: (res) => {
                this.uploadData.set(res);
                // Auto-map columns if names match
                this.columnMapping = {};
                for (const col of res.available_columns) {
                    const match = res.headers.find(h =>
                        h.toLowerCase().includes(col.key.toLowerCase()) ||
                        col.label.toLowerCase().includes(h.toLowerCase())
                    );
                    this.columnMapping[col.key] = match || '_skip_';
                }
            },
            error: (err) => {
                alert('Dosya yüklenemedi: ' + (err.error?.message || 'Bilinmeyen hata'));
            }
        });
    }

    resetUpload(): void {
        this.uploadData.set(null);
        this.columnMapping = {};
    }

    executeImport(): void {
        const data = this.uploadData();
        if (!data) return;

        this.importing.set(true);
        this.importService.executeImport(data.import_id, this.columnMapping).subscribe({
            next: (res) => {
                this.importing.set(false);
                let message = `Import tamamlandı: ${res.imported} yeni, ${res.updated} güncelleme`;
                if (res.failed > 0) {
                    message += `, ${res.failed} başarısız`;
                    if (res.errors?.length > 0) {
                        const errorDetails = res.errors.slice(0, 3).map((e: any) => `Satır ${e.row}: ${e.error}`).join('\n');
                        alert('Bazı satırlar başarısız oldu:\n\n' + errorDetails);
                    }
                }
                this.successMessage.set(message);
                setTimeout(() => this.successMessage.set(''), 5000);
                this.resetUpload();
                this.loadImports();
            },
            error: (err) => {
                this.importing.set(false);
                alert('Import başarısız: ' + (err.error?.message || 'Bilinmeyen hata'));
            }
        });
    }

    syncErp(connection: any): void {
        this.syncing.set(true);
        this.importService.syncErp(connection.id).subscribe({
            next: (res) => {
                this.syncing.set(false);
                this.successMessage.set(`Sync tamamlandı: ${res.result.imported} yeni, ${res.result.updated} güncelleme`);
                setTimeout(() => this.successMessage.set(''), 5000);
                this.loadImports();
                this.loadErpConnections();
            },
            error: (err) => {
                this.syncing.set(false);
                alert('Sync başarısız: ' + (err.error?.message || 'Bilinmeyen hata'));
            }
        });
    }

    saveErpConnection(): void {
        this.importService.saveErpConnection(this.erpForm).subscribe({
            next: () => {
                this.showErpModal.set(false);
                this.erpForm = { name: '', type: 'mock', config: {} };
                this.loadErpConnections();
            }
        });
    }

    getSourceLabel(source: string): string {
        return { csv: 'CSV', excel: 'Excel', erp: 'ERP' }[source] || source;
    }

    getSourceClass(source: string): string {
        return {
            csv: 'bg-blue-100 text-blue-700',
            excel: 'bg-green-100 text-green-700',
            erp: 'bg-purple-100 text-purple-700'
        }[source] || 'bg-gray-100 text-gray-700';
    }

    getStatusLabel(status: string): string {
        return {
            pending: 'Bekliyor',
            processing: 'İşleniyor',
            completed: 'Tamamlandı',
            failed: 'Başarısız'
        }[status] || status;
    }

    getStatusClass(status: string): string {
        return {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700'
        }[status] || 'bg-gray-100';
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString('tr-TR');
    }
}
