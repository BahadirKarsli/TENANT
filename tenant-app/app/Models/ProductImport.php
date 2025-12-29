<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ProductImport extends Model
{
    protected $fillable = [
        'filename',
        'original_filename',
        'source',
        'erp_type',
        'status',
        'total_rows',
        'imported_rows',
        'updated_rows',
        'failed_rows',
        'column_mapping',
        'errors',
        'imported_by',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'column_mapping' => 'array',
            'errors' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function getSuccessRateAttribute(): float
    {
        if ($this->total_rows === 0) return 0;
        return round(($this->imported_rows + $this->updated_rows) / $this->total_rows * 100, 2);
    }
}
