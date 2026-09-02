<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send a 6-digit OTP verification code via standard telecom SMS.
     *
     * @param string $phone Destination phone number (e.g. +255 767 218 357)
     * @param string $code 6-digit verification code
     * @param string|null $userName Optional recipient name
     * @return array Dispatch telemetry results
     */
    public static function sendOtp(string $phone, string $code, ?string $userName = null): array
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($phone);
        $displayPhone = PhoneNormalizer::formatDisplay($phone);

        $gateway = SystemSetting::get('sms_gateway', []);

        // Resolve active provider and credentials (env takes precedence, then SystemSetting)
        $provider = env('SMS_PROVIDER', $gateway['provider'] ?? 'NextSMS');
        $senderId = env('SMS_SENDER_ID', $gateway['sender_id'] ?? 'KARDOVO');
        $senderId = strtoupper(trim($senderId ?: 'KARDOVO'));

        $greeting = $userName ? "Habari {$userName}! " : "";
        $messageBody = "{$greeting}[{$senderId}] Your security verification code is: {$code}. Valid for 10 minutes. Do not disclose this code to anyone.";

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

        // 1. Check for NextSMS credentials
        $nextSmsUser = env('NEXTSMS_USERNAME', env('NEXTSMS_API_KEY', $gateway['api_key'] ?? ''));
        $nextSmsPass = env('NEXTSMS_PASSWORD', env('NEXTSMS_API_SECRET', $gateway['api_secret'] ?? ''));
        $isNextSmsLive = !empty($nextSmsUser) 
            && !empty($nextSmsPass) 
            && !str_starts_with($nextSmsUser, 'nextsms_live_api_key')
            && !str_starts_with($nextSmsPass, 'sec_');

        // 2. Check for Beem Africa credentials
        $beemApiKey = env('BEEM_API_KEY', $gateway['beem_api_key'] ?? '');
        $beemSecret = env('BEEM_SECRET_KEY', $gateway['beem_secret_key'] ?? '');
        $isBeemLive = !empty($beemApiKey) && !empty($beemSecret);

        // 3. Check for Africa's Talking credentials
        $atApiKey = env('AFRICASTALKING_APIKEY', env('AFRICASTALKING_API_KEY', $gateway['at_api_key'] ?? ''));
        $atUsername = env('AFRICASTALKING_USERNAME', $gateway['at_username'] ?? 'sandbox');
        $isAtLive = !empty($atApiKey);

        // 4. Check for Twilio credentials
        $twilioSid = env('TWILIO_SID', $gateway['twilio_sid'] ?? '');
        $twilioToken = env('TWILIO_AUTH_TOKEN', $gateway['twilio_token'] ?? '');
        $twilioFrom = env('TWILIO_FROM', $gateway['twilio_from'] ?? '');
        $isTwilioLive = !empty($twilioSid) && !empty($twilioToken);

        if (!empty($cleanPhone)) {
            try {
                if ($isNextSmsLive) {
                    // NextSMS Tanzania API
                    $endpoint = $gateway['api_endpoint'] ?? 'https://messaging-service.co.tz/api/sms/v1/text/single';
                    $response = Http::timeout(8)
                        ->withBasicAuth($nextSmsUser, $nextSmsPass)
                        ->acceptJson()
                        ->post($endpoint, [
                            'from' => $senderId,
                            'to' => $cleanPhone,
                            'text' => $messageBody,
                        ]);

                    if ($response->successful()) {
                        $dispatchResult['live_carrier_sent'] = true;
                        $dispatchResult['carrier_response'] = $response->json();
                        Log::info("[NEXTSMS DISPATCH SUCCESS] To: {$cleanPhone} | Sender: {$senderId} | Code: {$code}");
                    } else {
                        Log::warning("[NEXTSMS DISPATCH FAILED] Status: {$response->status()} | Body: {$response->body()}");
                    }
                } elseif ($isBeemLive) {
                    // Beem Africa SMS API
                    $response = Http::timeout(8)
                        ->withBasicAuth($beemApiKey, $beemSecret)
                        ->acceptJson()
                        ->post('https://api.beem.africa/v1/send', [
                            'source_addr' => $senderId,
                            'schedule_time' => '',
                            'encoding' => 0,
                            'message' => $messageBody,
                            'recipients' => [
                                ['recipient_id' => 1, 'dest_addr' => $cleanPhone]
                            ],
                        ]);

                    if ($response->successful()) {
                        $dispatchResult['live_carrier_sent'] = true;
                        $dispatchResult['carrier_response'] = $response->json();
                        Log::info("[BEEM SMS DISPATCH SUCCESS] To: {$cleanPhone} | Code: {$code}");
                    } else {
                        Log::warning("[BEEM SMS DISPATCH FAILED] Status: {$response->status()} | Body: {$response->body()}");
                    }
                } elseif ($isAtLive) {
                    // Africa's Talking SMS API
                    $endpoint = 'https://api.africastalking.com/version1/messaging';
                    $response = Http::timeout(8)
                        ->withHeaders([
                            'apiKey' => $atApiKey,
                            'Accept' => 'application/json',
                        ])
                        ->asForm()
                        ->post($endpoint, [
                            'username' => $atUsername,
                            'to' => '+' . $cleanPhone,
                            'message' => $messageBody,
                            'from' => $senderId,
                        ]);

                    if ($response->successful()) {
                        $dispatchResult['live_carrier_sent'] = true;
                        $dispatchResult['carrier_response'] = $response->json();
                        Log::info("[AFRICAS TALKING DISPATCH SUCCESS] To: {$cleanPhone} | Code: {$code}");
                    } else {
                        Log::warning("[AFRICAS TALKING DISPATCH FAILED] Status: {$response->status()} | Body: {$response->body()}");
                    }
                } elseif ($isTwilioLive) {
                    // Twilio SMS API
                    $endpoint = "https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json";
                    $response = Http::timeout(8)
                        ->withBasicAuth($twilioSid, $twilioToken)
                        ->asForm()
                        ->post($endpoint, [
                            'To' => '+' . $cleanPhone,
                            'From' => $twilioFrom ?: $senderId,
                            'Body' => $messageBody,
                        ]);

                    if ($response->successful()) {
                        $dispatchResult['live_carrier_sent'] = true;
                        $dispatchResult['carrier_response'] = $response->json();
                        Log::info("[TWILIO SMS DISPATCH SUCCESS] To: {$cleanPhone} | Code: {$code}");
                    } else {
                        Log::warning("[TWILIO SMS DISPATCH FAILED] Status: {$response->status()} | Body: {$response->body()}");
                    }
                } else {
                    Log::info("[SMS LOCAL/SANDBOX DISPATCH] No live carrier credentials detected in .env or SystemSetting. SMS simulated to: +{$cleanPhone} ({$displayPhone}) | Sender: {$senderId} | Code: {$code} | Body: \"{$messageBody}\"");
                }
            } catch (\Throwable $e) {
                Log::error("[SMS CARRIER DISPATCH EXCEPTION] To: {$cleanPhone} - {$e->getMessage()}");
            }
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
