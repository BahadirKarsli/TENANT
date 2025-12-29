<?php
$import = App\Models\ProductImport::latest()->first();
if ($import) {
    echo "Mapping: " . json_encode($import->column_mapping, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    echo "Errors: " . json_encode($import->errors, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} else {
    echo "No imports found";
}
