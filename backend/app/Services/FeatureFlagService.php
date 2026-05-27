<?php

namespace App\Services;

use App\Models\FeatureFlag;
use Illuminate\Support\Facades\Cache;

class FeatureFlagService
{
    private const CACHE_KEY = 'feature_flags.all';

    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, 3600, function () {
            return FeatureFlag::all()->mapWithKeys(function (FeatureFlag $flag) {
                return [
                    $flag->key => [
                        'enabled' => $flag->enabled,
                        'payload' => $flag->payload,
                    ],
                ];
            })->toArray();
        });
    }

    public function isEnabled(string $key): bool
    {
        $flags = $this->all();

        return ($flags[$key]['enabled'] ?? false) === true;
    }

    public function getPayload(string $key, mixed $default = null): mixed
    {
        $flags = $this->all();

        return $flags[$key]['payload'] ?? $default;
    }

    public function getTaxRate(): float
    {
        if (! $this->isEnabled('tax')) {
            return 0.0;
        }

        return (float) ($this->getPayload('tax', ['rate' => 16])['rate'] ?? 16);
    }

    public function update(string $key, bool $enabled, ?array $payload = null, ?string $description = null): FeatureFlag
    {
        $flag = FeatureFlag::updateOrCreate(
            ['key' => $key],
            array_filter([
                'enabled' => $enabled,
                'payload' => $payload,
                'description' => $description,
            ], fn ($v) => $v !== null)
        );

        Cache::forget(self::CACHE_KEY);

        return $flag;
    }

    public function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
