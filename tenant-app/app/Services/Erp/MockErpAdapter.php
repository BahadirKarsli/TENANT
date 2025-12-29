<?php

declare(strict_types=1);

namespace App\Services\Erp;

use App\Contracts\ErpAdapterInterface;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Mock ERP Adapter for development and demo purposes
 * 
 * Generates fake product data for testing the import functionality
 */
final class MockErpAdapter implements ErpAdapterInterface
{
    private array $config = [];

    public function getType(): string
    {
        return 'mock';
    }

    public function getName(): string
    {
        return 'Demo ERP (Mock)';
    }

    public function testConnection(): bool
    {
        // Mock adapter always connects successfully
        return true;
    }

    public function configure(array $config): void
    {
        $this->config = $config;
    }

    public function getProducts(): Collection
    {
        // Generate mock products
        return collect($this->generateMockProducts());
    }

    public function getStock(string $sku): int
    {
        return rand(0, 500);
    }

    public function getUpdatedProducts(\DateTimeInterface $since): Collection
    {
        // Return subset of products as "updated"
        return $this->getProducts()->take(10);
    }

    public function syncAll(): array
    {
        $products = $this->getProducts();
        $imported = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        foreach ($products as $productData) {
            try {
                $existing = Product::where('sku', $productData['sku'])->first();
                
                if ($existing) {
                    $existing->update([
                        'name' => $productData['name'],
                        'price' => $productData['price'],
                        'stock' => $productData['stock'],
                        'brand' => $productData['brand'] ?? null,
                        'category' => $productData['category'] ?? null,
                    ]);
                    $updated++;
                } else {
                    Product::create([
                        'sku' => $productData['sku'],
                        'name' => $productData['name'],
                        'price' => $productData['price'],
                        'stock' => $productData['stock'],
                        'brand' => $productData['brand'] ?? null,
                        'category' => $productData['category'] ?? null,
                        'oem_code' => $productData['oem_code'] ?? null,
                        'description' => $productData['description'] ?? null,
                    ]);
                    $imported++;
                }
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = [
                    'sku' => $productData['sku'],
                    'error' => $e->getMessage(),
                ];
            }
        }

        return compact('imported', 'updated', 'failed', 'errors');
    }

    private function generateMockProducts(): array
    {
        $brands = ['Bosch', 'Mann', 'Mahle', 'SKF', 'Gates', 'Denso', 'NGK', 'Valeo', 'Hella', 'Brembo'];
        $categories = ['Filtreler', 'Fren', 'Motor', 'Elektrik', 'Şanzıman', 'Süspansiyon', 'Aydınlatma'];
        
        $products = [];
        $count = $this->config['product_count'] ?? 50;

        for ($i = 1; $i <= $count; $i++) {
            $brand = $brands[array_rand($brands)];
            $category = $categories[array_rand($categories)];
            
            $products[] = [
                'sku' => 'MOCK-' . str_pad((string)$i, 5, '0', STR_PAD_LEFT),
                'name' => $this->generateProductName($category),
                'price' => round(rand(50, 5000) + rand(0, 99) / 100, 2),
                'stock' => rand(0, 500),
                'brand' => $brand,
                'category' => $category,
                'oem_code' => strtoupper(Str::random(3)) . '-' . rand(1000, 9999),
                'description' => 'Mock ürün açıklaması - ' . $category,
            ];
        }

        return $products;
    }

    private function generateProductName(string $category): string
    {
        $names = [
            'Filtreler' => ['Yağ Filtresi', 'Hava Filtresi', 'Yakıt Filtresi', 'Polen Filtresi', 'Hidrolik Filtre'],
            'Fren' => ['Fren Balatası', 'Fren Diski', 'Fren Kaliperi', 'Fren Hidroliği', 'ABS Sensörü'],
            'Motor' => ['Krank Mili', 'Piston', 'Supap', 'Conta Takımı', 'Alternatör'],
            'Elektrik' => ['Buji', 'Bobin', 'Marş Motoru', 'Akü', 'Sensör'],
            'Şanzıman' => ['Debriyaj Seti', 'Şanzıman Yağı', 'Diferansiyel', 'Kardan Mili'],
            'Süspansiyon' => ['Amortisör', 'Helezon', 'Salıncak', 'Rotil', 'Rot Başı'],
            'Aydınlatma' => ['Far', 'Stop Lambası', 'Sinyal', 'LED Ampul', 'Xenon Kit'],
        ];

        $categoryNames = $names[$category] ?? ['Yedek Parça'];
        return $categoryNames[array_rand($categoryNames)] . ' ' . rand(100, 999);
    }
}
