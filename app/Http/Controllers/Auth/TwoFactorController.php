<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
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

        if (! $userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (! $user) {
            $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code']);

            return redirect()->route('login');
        }

        // Mask email: e.g. al***@domain.com
        $maskedEmail = null;
        if (! str_ends_with($user->email, '@phone.kardovo.com')) {
            $emailParts = explode('@', $user->email);
            $maskedEmail = substr($emailParts[0], 0, 2).'••••@'.($emailParts[1] ?? 'kardovo.com');
        }

        // Mask phone: e.g. +255 7•••• 1234
        $maskedPhone = null;
        if ($user->phone) {
            $maskedPhone = substr($user->phone, 0, 4).'••••'.substr($user->phone, -3);
        }

        return Inertia::render('Auth/VerifyOtp', [
            'maskedEmail' => $maskedEmail,
            'maskedPhone' => $maskedPhone,
            'devCode' => app()->environment('local', 'testing') ? $request->session()->get('auth.2fa_dev_code') : null,
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
        if (! $userId) {
            return redirect()->route('login')->with('error', 'Session expired. Please log in again.');
        }

        $user = User::find($userId);
        if (! $user) {
            return redirect()->route('login');
        }

        // Multi-IP distributed defense: cap attempts per account/token globally across all IPs
        $accountThrottleKey = '2fa_verify_account_'.$user->id;
        $ipThrottleKey = '2fa_verify_ip_'.$request->ip();

        if (RateLimiter::tooManyAttempts($accountThrottleKey, 5) || RateLimiter::tooManyAttempts($ipThrottleKey, 10)) {
            $user->clearTwoFactorCode();
            RateLimiter::clear($accountThrottleKey);
            $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code']);

            throw ValidationException::withMessages([
                'code' => 'Too many failed verification attempts. This verification code has been permanently invalidated for your security. Please log in again to request a new code.',
            ]);
        }

        if (! $user->verifyTwoFactorCode($request->code)) {
            RateLimiter::hit($accountThrottleKey, 600);
            RateLimiter::hit($ipThrottleKey, 300);

            if (RateLimiter::attempts($accountThrottleKey) >= 5) {
                $user->clearTwoFactorCode();
                RateLimiter::clear($accountThrottleKey);
                $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code']);

                throw ValidationException::withMessages([
                    'code' => 'Too many failed verification attempts. This verification code has been permanently invalidated for your security. Please log in again to request a new code.',
                ]);
            }

            $remaining = 5 - RateLimiter::attempts($accountThrottleKey);

            throw ValidationException::withMessages([
                'code' => "The provided 6-digit security code is invalid or has expired. ({$remaining} attempts remaining before code invalidation)",
            ]);
        }

        RateLimiter::clear($accountThrottleKey);
        RateLimiter::clear($ipThrottleKey);
        $user->clearTwoFactorCode();

        $remember = $request->session()->get('auth.2fa_remember', false);
        Auth::login($user, $remember);

        $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code', 'url.intended']);
        $request->session()->regenerate();

        $trustedDeviceCookieName = 'kdv_trusted_device_'.$user->id;
        $expectedDeviceToken = hash_hmac('sha256', $user->id.'|'.$user->email, (string) config('app.key'));

        $redirect = $user->isAdmin()
            ? redirect()->route('admin.dashboard')
            : ($user->isScanner() ? redirect()->route('scanner.index') : redirect()->route('dashboard'));

        return $redirect->withCookie(cookie()->forever($trustedDeviceCookieName, $expectedDeviceToken));
    }

    /**
     * Resend a fresh OTP verification code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('auth.2fa_user_id');
        if (! $userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (! $user) {
            return redirect()->route('login');
        }

        $throttleKey = '2fa_resend_'.$user->id.'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 2)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->with('error', "Please wait {$seconds} seconds before requesting a new code.");
        }

        RateLimiter::hit($throttleKey, 60);

        RateLimiter::clear('2fa_verify_account_'.$user->id);
        $code = $user->generateTwoFactorCode();

        try {
            $user->notify(new TwoFactorCodeNotification($code));
        } catch (\Throwable $e) {
            Log::warning("Failed to resend 2FA email to {$user->email}: ".$e->getMessage());
        }

        $request->session()->put('auth.2fa_dev_code', $code);

        return back()->with('status', 'A fresh 6-digit security code has been sent to your verified channels.');
    }
}
