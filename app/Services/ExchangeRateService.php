<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    const CACHE_KEY = 'kardovo_fx_usd_tzs_data';

    const DEFAULT_RATE = 2650.0;

    /**
     * Get the active exchange rate data.
     */
    public static function getRateData(): array
    {
        $cached = Cache::get(self::CACHE_KEY);

        if ($cached && is_array($cached) && isset($cached['rate'])) {
            return $cached;
        }

        // Try fetching live rate if no cache exists
        $liveData = self::fetchLiveRate();
        if ($liveData) {
            return $liveData;
        }

        // Fallback default
        $fallback = [
            'rate' => self::DEFAULT_RATE,
            'last_synced_at' => now()->toIso8601String(),
            'source' => 'Default Reference Baseline',
            'is_manual' => false,
        ];

        Cache::forever(self::CACHE_KEY, $fallback);

        return $fallback;
    }

    /**
     * Fetch real-time rate from public FX API with graceful error handling.
     */
    public static function fetchLiveRate(): ?array
    {
        try {
            $response = Http::timeout(4)->get('https://open.er-api.com/v6/latest/USD');

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['rates']['TZS']) && is_numeric($data['rates']['TZS'])) {
                    $rate = (float) $data['rates']['TZS'];
                    $payload = [
                        'rate' => round($rate, 2),
                        'last_synced_at' => now()->toIso8601String(),
                        'source' => 'Live Market Spot (open.er-api.com)',
                        'is_manual' => false,
                    ];

                    Cache::forever(self::CACHE_KEY, $payload);

                    return $payload;
                }
            }
        } catch (\Throwable $e) {
            Log::info('Exchange rate live sync notice: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Set a manual override exchange rate.
     */
    public static function setManualRate(float $rate): array
    {
        $payload = [
            'rate' => round($rate, 2),
            'last_synced_at' => now()->toIso8601String(),
            'source' => 'Admin Custom Override',
            'is_manual' => true,
        ];

        Cache::forever(self::CACHE_KEY, $payload);

        return $payload;
    }

    /**
     * Reset to automated live sync.
     */
    public static function resetToLive(): array
    {
        Cache::forget(self::CACHE_KEY);
        $live = self::fetchLiveRate();
        if ($live) {
            return $live;
        }

        return self::getRateData();
    }
}
