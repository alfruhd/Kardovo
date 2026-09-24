<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send an SMS message using the configured gateway (or mock in test/dev).
     *
     * @return array{success: bool, simulated?: bool, error?: string, status?: int, response?: mixed}
     */
    public static function send(string $phone, string $message): array
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($phone);
        $config = SystemSetting::get('sms_gateway', []);

        $senderId = $config['sender_id'] ?? 'KARDOVO';
        $endpoint = $config['api_endpoint'] ?? 'https://messaging-service.co.tz/api/sms/v1/text/single';
        $apiKey = $config['api_key'] ?? '';

        Log::info("SMS dispatch initiated to {$cleanPhone} via {$senderId}: {$message}");

        if (app()->environment('testing', 'local') || empty($apiKey) || str_contains($apiKey, 'key')) {
            return [
                'success' => true,
                'simulated' => true,
                'recipient' => $cleanPhone,
                'message' => $message,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])->post($endpoint, [
                'from' => $senderId,
                'to' => $cleanPhone,
                'text' => $message,
            ]);

            return [
                'success' => $response->successful(),
                'status' => $response->status(),
                'response' => $response->json(),
            ];
        } catch (\Throwable $e) {
            Log::error("Failed to send SMS to {$cleanPhone}: ".$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
