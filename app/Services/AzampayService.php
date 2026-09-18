<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AzampayService
{
    protected $baseUrl;

    protected $appName;

    protected $clientId;

    protected $clientSecret;

    public function __construct()
    {
        $settings = SystemSetting::get('azampay_gateway', []);

        $envMode = env('AZAMPAY_ENVIRONMENT', 'sandbox');
        $mode = $settings['environment'] ?? $envMode;

        $this->baseUrl = $mode === 'sandbox'
            ? 'https://sandbox.azampay.co.tz'
            : 'https://checkout.azampay.co.tz';

        $this->appName = $settings['app_name'] ?? env('AZAMPAY_APP_NAME', 'Kardovo');
        $this->clientId = $settings['client_id'] ?? env('AZAMPAY_CLIENT_ID');
        $this->clientSecret = $settings['client_secret'] ?? env('AZAMPAY_SECRET');
    }

    public function generateToken()
    {
        try {
            $response = Http::post('https://authenticator.azampay.co.tz/AppRegistration/GenerateToken', [
                'appName' => $this->appName,
                'clientId' => $this->clientId,
                'clientSecret' => $this->clientSecret,
            ]);

            if ($response->successful()) {
                return $response->json('data.accessToken');
            }

            Log::error('Azampay token generation failed', ['response' => $response->body()]);

            return null;
        } catch (\Exception $e) {
            Log::error('Azampay token generation exception', ['error' => $e->getMessage()]);

            return null;
        }
    }

    public function mnCheckout($amount, $mobileNumber, $provider, $externalId)
    {
        $token = $this->generateToken();

        if (! $token) {
            return ['success' => false, 'message' => 'Failed to authenticate with Payment Gateway.'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$token,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/azampay/mno/checkout", [
                'accountNumber' => $mobileNumber,
                'amount' => (string) $amount,
                'currency' => 'TZS',
                'externalId' => $externalId,
                'provider' => $provider, // Tigo, Airtel, Halopesa, Azampesa
            ]);

            if ($response->successful() && $response->json('success') === true) {
                return ['success' => true, 'message' => 'Payment push sent successfully. Please check your phone.'];
            }

            Log::error('Azampay checkout failed', ['response' => $response->body()]);

            return ['success' => false, 'message' => $response->json('message') ?? 'Payment request failed.'];
        } catch (\Exception $e) {
            Log::error('Azampay checkout exception', ['error' => $e->getMessage()]);

            return ['success' => false, 'message' => 'An error occurred connecting to the gateway.'];
        }
    }
}
