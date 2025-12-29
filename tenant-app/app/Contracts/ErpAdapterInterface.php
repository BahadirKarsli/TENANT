<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Support\Collection;

/**
 * Interface for ERP system adapters
 * 
 * Implement this interface to add support for new ERP systems like Evira, Logo, Netsis, etc.
 */
interface ErpAdapterInterface
{
    /**
     * Get the adapter type identifier
     */
    public function getType(): string;

    /**
     * Get the adapter display name
     */
    public function getName(): string;

    /**
     * Test connection to the ERP system
     */
    public function testConnection(): bool;

    /**
     * Get all products from the ERP system
     * 
     * @return Collection<int, array{
     *     sku: string,
     *     name: string,
     *     price: float,
     *     stock: int,
     *     brand?: string,
     *     category?: string,
     *     oem_code?: string,
     *     description?: string
     * }>
     */
    public function getProducts(): Collection;

    /**
     * Get stock quantity for a specific product
     */
    public function getStock(string $sku): int;

    /**
     * Get products updated since a specific date
     */
    public function getUpdatedProducts(\DateTimeInterface $since): Collection;

    /**
     * Sync all products from ERP to local database
     * 
     * @return array{imported: int, updated: int, failed: int, errors: array}
     */
    public function syncAll(): array;

    /**
     * Configure the adapter with connection settings
     */
    public function configure(array $config): void;
}
