<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code']);
            return redirect()->route('login');
        }

        // Mask email: e.g. al***@domain.com
        $emailParts = explode('@', $user->email);
        $maskedEmail = substr($emailParts[0], 0, 2) . '••••@' . ($emailParts[1] ?? 'kardovo.com');

        // Mask phone: e.g. +255 7•••• 1234
        $maskedPhone = null;
        if ($user->phone) {
            $maskedPhone = substr($user->phone, 0, 4) . '••••' . substr($user->phone, -3);
        }

        return Inertia::render('Auth/VerifyOtp', [
            'maskedEmail' => $maskedEmail,
            'maskedPhone' => $maskedPhone,
            'devCode' => $request->session()->get('auth.2fa_dev_code'),
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

        $request->session()->forget(['auth.2fa_user_id', 'auth.2fa_remember', 'auth.2fa_dev_code', 'url.intended']);
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
     * Resend a fresh OTP verification code.
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

        try {
            $user->notify(new \App\Notifications\TwoFactorCodeNotification($code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to resend 2FA email to {$user->email}: " . $e->getMessage());
        }

        $request->session()->put('auth.2fa_dev_code', $code);

        return back()->with('status', 'A fresh 6-digit security code has been sent to your verified channels.');
    }
}
