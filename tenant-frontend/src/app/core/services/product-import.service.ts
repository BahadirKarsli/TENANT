import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductImport {
    id: number;
    filename: string;
    original_filename: string;
    source: 'csv' | 'excel' | 'erp';
    erp_type: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_rows: number;
    imported_rows: number;
    updated_rows: number;
    failed_rows: number;
    errors: any[];
    created_at: string;
    completed_at: string | null;
}

export interface UploadResponse {
    import_id: number;
    filename: string;
    total_rows: number;
    headers: string[];
    preview: any[];
    available_columns: { key: string; label: string; required: boolean }[];
}

export interface ErpConnection {
    id: number;
    name: string;
    type: string;
    config: any;
    is_active: boolean;
    last_sync_at: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ProductImportService {
    private readonly apiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }

    getImports(): Observable<{ imports: ProductImport[] }> {
        return this.http.get<{ imports: ProductImport[] }>(`${this.apiUrl}/imports`);
    }

    uploadFile(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        // Don't set Content-Type header - let browser set it with boundary
        return this.http.post<UploadResponse>(`${this.apiUrl}/imports/upload`, formData);
    }

    executeImport(importId: number, mapping: Record<string, string>): Observable<any> {
        return this.http.post(`${this.apiUrl}/imports/${importId}/execute`, { mapping });
    }

    // ERP
    getErpConnections(): Observable<{ connections: ErpConnection[]; available_types: Record<string, string> }> {
        return this.http.get<{ connections: ErpConnection[]; available_types: Record<string, string> }>(
            `${this.apiUrl}/erp/connections`
        );
    }

    saveErpConnection(data: Partial<ErpConnection>): Observable<any> {
        return this.http.post(`${this.apiUrl}/erp/connections`, data);
    }

    testErpConnection(type: string, config: any): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/erp/test`, { type, config });
    }

    syncErp(connectionId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/erp/sync`, { connection_id: connectionId });
    }
}
