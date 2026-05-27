<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeatureFlag extends Model
{
    protected $fillable = [
        'key',
        'enabled',
        'payload',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'payload' => 'array',
        ];
    }
}
