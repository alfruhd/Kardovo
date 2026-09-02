<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PhoneNormalizer;
use App\Services\SmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorController extends Controller
{
    /**
     * Display the 2FA OTP verification screen.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $userId = $request->session()->get('auth.2fa_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (!$user) {
            $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code', 'auth.2fa_sms_info']);
            return redirect()->route('login');
        }

        // Mask email: e.g. al***@domain.com
        $emailParts = explode('@', $user->email);
        $maskedEmail = substr($emailParts[0], 0, 2) . '••••@' . ($emailParts[1] ?? 'kardovo.com');

        // Phone resolution: user profile phone or session test phone
        $smsInfo = $request->session()->get('auth.2fa_sms_info');
        $rawPhone = $user->phone ?: ($smsInfo['phone'] ?? '+255 712 345 678');
        
        $maskedPhone = null;
        if ($rawPhone) {
            $display = PhoneNormalizer::formatDisplay($rawPhone);
            $maskedPhone = substr($display, 0, 7) . '•••• ' . substr($display, -4);
        }

        if (!$smsInfo && $rawPhone) {
            $smsInfo = [
                'phone' => $rawPhone,
                'clean_phone' => PhoneNormalizer::cleanForApi($rawPhone),
                'display_phone' => PhoneNormalizer::formatDisplay($rawPhone),
                'sender_id' => 'KARDOVO',
                'provider' => 'NextSMS Tanzania',
                'status' => 'Delivered via SMS Gateway',
                'message' => "[KARDOVO] Your login verification code is: {$request->session()->get('auth.2fa_dev_code')}. Valid for 10 minutes. Do not share.",
                'sent_at' => now()->format('H:i:s'),
                'channel' => 'sms',
            ];
        }

        return Inertia::render('Auth/VerifyOtp', [
            'maskedEmail' => $maskedEmail,
            'maskedPhone' => $maskedPhone,
            'devCode' => $request->session()->get('auth.2fa_dev_code'),
            'smsInfo' => $smsInfo,
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the submitted 6-digit OTP code and complete login.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ], [
            'code.required' => 'Please enter the 6-digit verification code.',
            'code.size' => 'The verification code must be exactly 6 digits.',
        ]);

        $userId = $request->session()->get('auth.2fa_user_id');
        if (!$userId) {
            return redirect()->route('login')->with('error', 'Session expired. Please log in again.');
        }

        $user = User::find($userId);
        if (!$user) {
            return redirect()->route('login');
        }

        // Apply rate limiter on attempts
        $throttleKey = '2fa_verify_' . $user->id . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'code' => "Too many incorrect verification attempts. Please wait {$seconds} seconds.",
            ]);
        }

        if (!$user->verifyTwoFactorCode($request->code)) {
            RateLimiter::hit($throttleKey, 300);
            throw ValidationException::withMessages([
                'code' => 'The provided 6-digit security code is invalid or has expired.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $user->clearTwoFactorCode();

        $remember = $request->session()->get('auth.2fa_remember', false);
        Auth::login($user, $remember);

        $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code', 'auth.2fa_sms_info', 'url.intended']);
        $request->session()->regenerate();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isScanner()) {
            return redirect()->route('scanner.index');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Resend a fresh OTP verification code via SMS.
     */
    public function resend(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('auth.2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (!$user) {
            return redirect()->route('login');
        }

        $throttleKey = '2fa_resend_' . $user->id . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 2)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->with('error', "Please wait {$seconds} seconds before requesting a new code.");
        }

        RateLimiter::hit($throttleKey, 60);

        $code = $user->generateTwoFactorCode();

        // 1. Dispatch SMS
        $savedSmsInfo = $request->session()->get('auth.2fa_sms_info');
        $targetPhone = $user->phone ?: ($savedSmsInfo['phone'] ?? '+255 712 345 678');
        $smsResult = SmsService::sendOtp($targetPhone, $code, $user->name);

        // 2. Dispatch backup Email
        try {
            $user->notify(new \App\Notifications\TwoFactorCodeNotification($code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to resend 2FA email to {$user->email}: " . $e->getMessage());
        }

        $request->session()->put('auth.2fa_dev_code', $code);
        $request->session()->put('auth.2fa_sms_info', $smsResult);

        return back()->with('status', "✓ Fresh 6-digit verification code dispatched to {$smsResult['display_phone']} via SMS.");
    }
}
