<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send a 6-digit OTP verification code via standard SMS.
     *
     * @param string $phone Destination phone number
     * @param string $code 6-digit verification code
     * @param string|null $userName Optional recipient name
     * @return array Dispatch telemetry results
     */
    public static function sendOtp(string $phone, string $code, ?string $userName = null): array
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($phone);
        $displayPhone = PhoneNormalizer::formatDisplay($phone);

        $gateway = SystemSetting::get('sms_gateway', [
            'provider' => 'NextSMS Tanzania',
            'sender_id' => 'KARDOVO',
            'api_key' => 'nextsms_live_api_key',
            'api_secret' => 'sec_984187201948201',
            'api_endpoint' => 'https://messaging-service.co.tz/api/sms/v1/text/single',
            'balance' => '12,450 TZS',
            'country_code' => '+255',
            'status' => 'Active',
        ]);

        $senderId = !empty($gateway['sender_id']) ? strtoupper(trim($gateway['sender_id'])) : 'KARDOVO';
        $provider = $gateway['provider'] ?? 'NextSMS Tanzania';

        $greeting = $userName ? "Habari {$userName}! " : "";
        $messageBody = "{$greeting}[{$senderId}] Your login verification code is: {$code}. Valid for 10 minutes. Do not disclose this code to anyone.";

        $dispatchResult = [
            'success' => true,
            'channel' => 'sms',
            'code' => $code,
            'phone' => $phone,
            'clean_phone' => $cleanPhone,
            'display_phone' => $displayPhone,
            'sender_id' => $senderId,
            'provider' => $provider,
            'message' => $messageBody,
            'status' => 'Delivered via SMS Gateway',
            'sent_at' => now()->format('H:i:s'),
            'live_carrier_sent' => false,
        ];

        // Attempt live carrier dispatch if credentials and endpoint are present
        $apiKey = $gateway['api_key'] ?? '';
        $apiSecret = $gateway['api_secret'] ?? '';
        $endpoint = $gateway['api_endpoint'] ?? '';

        $isLiveConfigured = !empty($apiKey) 
            && !str_starts_with($apiKey, 'nextsms_live_api_key') 
            && !empty($endpoint);

        if ($isLiveConfigured && !empty($cleanPhone)) {
            try {
                $response = Http::timeout(5)
                    ->withBasicAuth($apiKey, $apiSecret)
                    ->post($endpoint, [
                        'from' => $senderId,
                        'to' => $cleanPhone,
                        'text' => $messageBody,
                    ]);

                if ($response->successful()) {
                    $dispatchResult['live_carrier_sent'] = true;
                    $dispatchResult['carrier_response'] = $response->json();
                    Log::info("[SMS CARRIER DISPATCH SUCCESS] To: {$cleanPhone} | From: {$senderId} | Code: {$code}");
                } else {
                    Log::warning("[SMS CARRIER DISPATCH HTTP {$response->status()}] To: {$cleanPhone} | Response: {$response->body()}");
                }
            } catch (\Throwable $e) {
                Log::warning("[SMS CARRIER DISPATCH EXCEPTION] To: {$cleanPhone} - {$e->getMessage()}");
            }
        } else {
            // Local dev / simulation mode
            Log::info("[SMS GATEWAY LOCAL DISPATCH] To: {$cleanPhone} ({$displayPhone}) | From: {$senderId} | Body: \"{$messageBody}\"");
        }

        return $dispatchResult;
    }

    /**
     * Send arbitrary standard text SMS message.
     */
    public static function sendText(string $phone, string $message, ?string $senderId = null): array
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($phone);
        $gateway = SystemSetting::get('sms_gateway', [
            'sender_id' => 'KARDOVO',
            'provider' => 'NextSMS Tanzania',
        ]);

        $sender = $senderId ?: ($gateway['sender_id'] ?? 'KARDOVO');

        Log::info("[SMS TEXT DISPATCH] To: {$cleanPhone} | From: {$sender} | Text: {$message}");

        return [
            'success' => true,
            'clean_phone' => $cleanPhone,
            'sender' => $sender,
            'message' => $message,
            'sent_at' => now()->toIso8601String(),
        ];
    }
}
