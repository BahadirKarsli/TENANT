<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class ErpConnection extends Model
{
    protected $fillable = [
        'name',
        'type',
        'config',
        'is_active',
        'last_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
            'last_sync_at' => 'datetime',
        ];
    }

    public function getHost(): ?string
    {
        return $this->config['host'] ?? null;
    }

    public function getPort(): ?int
    {
        return isset($this->config['port']) ? (int) $this->config['port'] : null;
    }

    public function getDatabase(): ?string
    {
        return $this->config['database'] ?? null;
    }

    public function getUsername(): ?string
    {
        return $this->config['username'] ?? null;
    }

    public function getPassword(): ?string
    {
        return $this->config['password'] ?? null;
    }
}
