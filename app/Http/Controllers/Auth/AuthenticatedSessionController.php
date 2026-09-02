<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = $request->user();
        $verifyViaSms = $request->boolean('verify_via_sms');

        // If Two-Factor Authentication is enabled OR user requested SMS verification testing
        if ($user->two_factor_enabled || $verifyViaSms) {
            $code = $user->generateTwoFactorCode();

            $targetPhone = $user->phone ?: ($request->input('phone') ?: '+255 712 345 678');
            $smsResult = SmsService::sendOtp($targetPhone, $code, $user->name);

            try {
                $user->notify(new \App\Notifications\TwoFactorCodeNotification($code));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Failed to send 2FA email to {$user->email}: " . $e->getMessage());
            }

            Auth::guard('web')->logout();

            $request->session()->put('auth.2fa_user_id', $user->id);
            $request->session()->put('auth.2fa_remember', $request->boolean('remember'));
            $request->session()->put('auth.2fa_dev_code', $code);
            $request->session()->put('auth.2fa_sms_info', $smsResult);

            return redirect()->route('two-factor.index')
                ->with('status', "✓ Verification code dispatched to {$smsResult['display_phone']} via normal SMS.");
        }

        $request->session()->regenerate();

        // Clear any stale intended session URL (e.g. from previous gate scanner session)
        $request->session()->forget('url.intended');

        if ($user->isScanner()) {
            return redirect()->route('scanner.index');
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    /**
     * Instant Dev User Switcher
     */
    public function switchUser(Request $request): RedirectResponse
    {
        $role = $request->input("role", "customer");
        $email = $request->input("email");

        $user = null;
        if ($email) {
            $user = \App\Models\User::where("email", $email)->first();
        }
        if (!$user && $role === "admin") {
            $user = \App\Models\User::where("role", "admin")->first();
        } elseif (!$user && $role === "sub_admin") {
            $user = \App\Models\User::where("role", "sub_admin")->first();
        } elseif (!$user && $role === "customer") {
            $user = \App\Models\User::where("role", "customer")->first();
        } elseif (!$user && $role === "scanner") {
            $user = \App\Models\User::where("role", "scanner")->first();
        }

        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->forget("url.intended");

            if ($user->isAdmin()) {
                return redirect()->route("admin.dashboard");
            } elseif ($user->isScanner()) {
                return redirect()->route("scanner.index");
            } else {
                return redirect()->route("dashboard");
            }
        }

        return redirect()->route("login");
    }

    /**
     * Instant Test Trigger for SMS Verification Login.
     */
    public function testSmsVerification(Request $request): RedirectResponse
    {
        $email = $request->input('email');
        $phone = $request->input('phone');

        $user = null;
        if ($email) {
            $user = User::where('email', $email)->first();
        }

        if (!$user) {
            $user = User::where('role', 'customer')->first()
                ?: User::where('role', 'admin')->first()
                ?: User::first();
        }

        if (!$user) {
            return back()->with('error', 'No user account found to test SMS verification.');
        }

        $targetPhone = $phone ?: ($user->phone ?: '+255 712 345 678');
        $code = $user->generateTwoFactorCode();

        // Dispatch OTP via SMS service
        $smsResult = SmsService::sendOtp($targetPhone, $code, $user->name);

        $request->session()->put('auth.2fa_user_id', $user->id);
        $request->session()->put('auth.2fa_remember', false);
        $request->session()->put('auth.2fa_dev_code', $code);
        $request->session()->put('auth.2fa_sms_info', $smsResult);

        return redirect()->route('two-factor.index')
            ->with('status', "✓ SMS verification dispatched to {$smsResult['display_phone']} via {$smsResult['provider']} ({$smsResult['sender_id']})!");
    }

    public function destroy(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if ($request->header('X-Inertia')) {
            return Inertia::location(route('login'));
        }

        return redirect()->route('login')
            ->withHeaders([
                'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => 'Sun, 02 Jan 1990 00:00:00 GMT',
            ]);
    }
}
