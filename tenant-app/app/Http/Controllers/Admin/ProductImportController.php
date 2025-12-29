<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImport;
use App\Models\ErpConnection;
use App\Services\Erp\ErpAdapterFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

final class ProductImportController extends Controller
{
    /**
     * Get import history
     */
    public function index(): JsonResponse
    {
        $imports = ProductImport::with('user')
            ->orderByDesc('created_at')
            ->take(50)
            ->get();

        return response()->json(['imports' => $imports]);
    }

    /**
     * Upload and parse file
     */
    public function upload(Request $request): JsonResponse
    {
        // Debug: Log all request info
        \Log::info('Upload request', [
            'hasFile' => $request->hasFile('file'),
            'allFiles' => $request->allFiles(),
            'contentType' => $request->header('Content-Type'),
        ]);

        // Debug: Check if file is present
        if (!$request->hasFile('file')) {
            return response()->json([
                'message' => 'Dosya bulunamadı. Lütfen bir dosya seçin.',
                'debug' => [
                    'allFiles' => array_keys($request->allFiles()),
                    'hasFile' => $request->hasFile('file'),
                ]
            ], 400);
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        
        // Validate extension manually
        if (!in_array($extension, ['csv', 'xlsx', 'xls'])) {
            return response()->json([
                'message' => 'Desteklenmeyen dosya formatı. CSV, XLSX veya XLS dosyası yükleyin.'
            ], 400);
        }

        $filename = uniqid('import_') . '.' . $extension;
        
        // Ensure imports directory exists
        $importsDir = storage_path('app/imports');
        if (!is_dir($importsDir)) {
            mkdir($importsDir, 0755, true);
        }
        
        // Move file to storage
        $fullPath = $importsDir . DIRECTORY_SEPARATOR . $filename;
        $file->move($importsDir, $filename);
        
        // Verify file exists
        if (!file_exists($fullPath)) {
            return response()->json([
                'message' => 'Dosya kaydedilemedi.'
            ], 500);
        }
        
        try {
            $data = $this->parseFile($fullPath, $extension);
            
            // Get first 10 rows for preview
            $preview = array_slice($data, 0, 10);
            $headers = !empty($data) ? array_keys($data[0]) : [];
            
            // Create import record
            $import = ProductImport::create([
                'filename' => $filename,
                'original_filename' => $file->getClientOriginalName(),
                'source' => $extension === 'csv' ? 'csv' : 'excel',
                'status' => 'pending',
                'total_rows' => count($data),
                'imported_by' => $request->user()->id,
            ]);

            return response()->json([
                'import_id' => $import->id,
                'filename' => $file->getClientOriginalName(),
                'total_rows' => count($data),
                'headers' => $headers,
                'preview' => $preview,
                'available_columns' => $this->getAvailableColumns(),
            ]);
        } catch (\Throwable $e) {
            // Clean up file on error
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            return response()->json([
                'message' => 'Dosya okunamadı: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Execute import with column mapping
     */
    public function import(Request $request, int $importId): JsonResponse
    {
        $request->validate([
            'mapping' => 'required|array',
            'mapping.sku' => 'required|string',
            'mapping.name' => 'required|string',
            'mapping.price' => 'required|string',
            'mapping.stock' => 'required|string',
        ]);

        $import = ProductImport::findOrFail($importId);
        
        if ($import->status !== 'pending') {
            return response()->json(['message' => 'Bu import zaten işlendi'], 400);
        }

        $mapping = $request->input('mapping');
        $import->update([
            'column_mapping' => $mapping,
            'status' => 'processing',
            'started_at' => now(),
        ]);

        try {
            $fullPath = storage_path('app/imports') . DIRECTORY_SEPARATOR . $import->filename;
            $extension = pathinfo($import->filename, PATHINFO_EXTENSION);
            $data = $this->parseFile($fullPath, $extension);

            $imported = 0;
            $updated = 0;
            $failed = 0;
            $errors = [];

            // Debug: Log mapping and first row
            \Log::info('Import debug', [
                'mapping' => $mapping,
                'first_row' => $data[0] ?? null,
                'row_keys' => array_keys($data[0] ?? []),
            ]);

            foreach ($data as $index => $row) {
                try {
                    $sku = $this->getMappedValue($row, $mapping, 'sku');
                    $name = $this->getMappedValue($row, $mapping, 'name');
                    $price = (float) $this->getMappedValue($row, $mapping, 'price');
                    $stock = (int) $this->getMappedValue($row, $mapping, 'stock');

                    if (empty($sku) || empty($name)) {
                        throw new \Exception('SKU ve ürün adı zorunludur');
                    }

                    // Build product data with correct column names
                    $productData = [
                        'name' => $name,
                        'price_usd' => $price,
                        'stock_quantity' => $stock,
                        'oem_code' => $this->getMappedValue($row, $mapping, 'oem_code'),
                        'description' => $this->getMappedValue($row, $mapping, 'description'),
                        'is_active' => true,
                    ];

                    // Handle brand - find or create
                    $brandName = $this->getMappedValue($row, $mapping, 'brand');
                    if (!empty($brandName)) {
                        $brand = \App\Models\Brand::firstOrCreate(
                            ['name' => $brandName],
                            ['slug' => \Illuminate\Support\Str::slug($brandName)]
                        );
                        $productData['brand_id'] = $brand->id;
                    }

                    // Handle category - find or create
                    $categoryName = $this->getMappedValue($row, $mapping, 'category');
                    if (!empty($categoryName)) {
                        $category = \App\Models\Category::firstOrCreate(
                            ['name' => $categoryName],
                            ['slug' => \Illuminate\Support\Str::slug($categoryName)]
                        );
                        $productData['category_id'] = $category->id;
                    }

                    $existing = Product::where('sku', $sku)->first();
                    
                    if ($existing) {
                        $existing->update($productData);
                        $updated++;
                    } else {
                        Product::create(array_merge(['sku' => $sku], $productData));
                        $imported++;
                    }
                } catch (\Throwable $e) {
                    $failed++;
                    $errors[] = [
                        'row' => $index + 2, // +2 for header and 0-index
                        'error' => $e->getMessage(),
                    ];
                }
            }

            $import->update([
                'status' => $failed > 0 && $imported + $updated === 0 ? 'failed' : 'completed',
                'imported_rows' => $imported,
                'updated_rows' => $updated,
                'failed_rows' => $failed,
                'errors' => $errors,
                'completed_at' => now(),
            ]);

            // Clear product cache so new products appear immediately
            \Illuminate\Support\Facades\Cache::flush();

            return response()->json([
                'message' => 'Import tamamlandı',
                'imported' => $imported,
                'updated' => $updated,
                'failed' => $failed,
                'errors' => array_slice($errors, 0, 10), // First 10 errors
            ]);
        } catch (\Throwable $e) {
            $import->update([
                'status' => 'failed',
                'errors' => [['error' => $e->getMessage()]],
                'completed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Import başarısız: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync from ERP
     */
    public function syncErp(Request $request): JsonResponse
    {
        $request->validate([
            'connection_id' => 'required|exists:erp_connections,id',
        ]);

        $connection = ErpConnection::findOrFail($request->input('connection_id'));
        
        try {
            $adapter = ErpAdapterFactory::fromConnection($connection);
            
            $import = ProductImport::create([
                'filename' => 'erp_sync_' . now()->format('Y-m-d_H-i-s'),
                'original_filename' => $adapter->getName() . ' Sync',
                'source' => 'erp',
                'erp_type' => $connection->type,
                'status' => 'processing',
                'imported_by' => $request->user()->id,
                'started_at' => now(),
            ]);

            $result = $adapter->syncAll();

            $import->update([
                'status' => 'completed',
                'imported_rows' => $result['imported'],
                'updated_rows' => $result['updated'],
                'failed_rows' => $result['failed'],
                'total_rows' => $result['imported'] + $result['updated'] + $result['failed'],
                'errors' => $result['errors'],
                'completed_at' => now(),
            ]);

            $connection->update(['last_sync_at' => now()]);

            return response()->json([
                'message' => 'ERP senkronizasyonu tamamlandı',
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'ERP senkronizasyonu başarısız: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ERP connections
     */
    public function erpConnections(): JsonResponse
    {
        $connections = ErpConnection::all();
        $types = ErpAdapterFactory::getAvailableTypes();

        return response()->json([
            'connections' => $connections,
            'available_types' => $types,
        ]);
    }

    /**
     * Save ERP connection
     */
    public function saveErpConnection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:erp_connections,id',
            'name' => 'required|string|max:100',
            'type' => 'required|string|in:' . implode(',', array_keys(ErpAdapterFactory::getAvailableTypes())),
            'config' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['id'])) {
            $connection = ErpConnection::findOrFail($validated['id']);
            $connection->update($validated);
        } else {
            $connection = ErpConnection::create($validated);
        }

        return response()->json([
            'message' => 'Bağlantı kaydedildi',
            'connection' => $connection,
        ]);
    }

    /**
     * Test ERP connection
     */
    public function testErpConnection(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'config' => 'required|array',
        ]);

        try {
            $adapter = ErpAdapterFactory::make($request->input('type'));
            $adapter->configure($request->input('config'));
            
            $result = $adapter->testConnection();

            return response()->json([
                'success' => $result,
                'message' => $result ? 'Bağlantı başarılı' : 'Bağlantı kurulamadı',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bağlantı hatası: ' . $e->getMessage(),
            ], 400);
        }
    }

    private function parseFile(string $path, string $extension): array
    {
        if ($extension === 'csv') {
            return $this->parseCsv($path);
        }
        
        return $this->parseExcel($path);
    }

    private function parseCsv(string $path): array
    {
        $data = [];
        $headers = [];

        if (($handle = fopen($path, 'r')) !== false) {
            $rowIndex = 0;
            while (($row = fgetcsv($handle, 0, ',', '"')) !== false) {
                if ($rowIndex === 0) {
                    $headers = array_map('trim', $row);
                } else {
                    $data[] = array_combine($headers, array_map('trim', $row));
                }
                $rowIndex++;
            }
            fclose($handle);
        }

        return $data;
    }

    private function parseExcel(string $path): array
    {
        $collection = Excel::toCollection(null, $path)->first();
        
        if ($collection->isEmpty()) {
            return [];
        }

        $headers = $collection->first()->toArray();
        $data = [];

        foreach ($collection->skip(1) as $row) {
            $data[] = array_combine($headers, $row->toArray());
        }

        return $data;
    }

    private function getMappedValue(array $row, array $mapping, string $field): ?string
    {
        $column = $mapping[$field] ?? null;
        
        if (empty($column) || $column === '_skip_') {
            return null;
        }

        return $row[$column] ?? null;
    }

    private function getAvailableColumns(): array
    {
        return [
            ['key' => 'sku', 'label' => 'SKU / Ürün Kodu', 'required' => true],
            ['key' => 'name', 'label' => 'Ürün Adı', 'required' => true],
            ['key' => 'price', 'label' => 'Fiyat', 'required' => true],
            ['key' => 'stock', 'label' => 'Stok Miktarı', 'required' => true],
            ['key' => 'brand', 'label' => 'Marka', 'required' => false],
            ['key' => 'category', 'label' => 'Kategori', 'required' => false],
            ['key' => 'oem_code', 'label' => 'OEM Kodu', 'required' => false],
            ['key' => 'description', 'label' => 'Açıklama', 'required' => false],
        ];
    }
}
