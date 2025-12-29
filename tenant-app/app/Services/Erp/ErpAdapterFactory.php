<?php

declare(strict_types=1);

namespace App\Services\Erp;

use App\Contracts\ErpAdapterInterface;
use App\Models\ErpConnection;

/**
 * Factory for creating ERP adapters based on type
 */
final class ErpAdapterFactory
{
    private static array $adapters = [
        'mock' => MockErpAdapter::class,
        'evira' => EviraAdapter::class,
        // Add more adapters here:
        // 'logo' => LogoAdapter::class,
        // 'netsis' => NetsisAdapter::class,
        // 'mikro' => MikroAdapter::class,
    ];

    public static function make(string $type): ErpAdapterInterface
    {
        if (!isset(self::$adapters[$type])) {
            throw new \InvalidArgumentException("Unknown ERP adapter type: {$type}");
        }

        return new self::$adapters[$type]();
    }

    public static function fromConnection(ErpConnection $connection): ErpAdapterInterface
    {
        $adapter = self::make($connection->type);
        $adapter->configure($connection->config ?? []);
        return $adapter;
    }

    public static function getAvailableTypes(): array
    {
        return [
            'mock' => 'Demo ERP (Mock)',
            'evira' => 'Evira ERP',
            // 'logo' => 'Logo ERP',
            // 'netsis' => 'Netsis ERP',
        ];
    }
}
