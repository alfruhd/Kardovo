<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

        // If Two-Factor Authentication is enabled, generate code and redirect to 2FA screen
        if ($user->two_factor_enabled) {
            $code = $user->generateTwoFactorCode();

            try {
                $user->notify(new TwoFactorCodeNotification($code));
            } catch (\Throwable $e) {
                Log::warning("Failed to send 2FA email to {$user->email}: ".$e->getMessage());
            }

            Auth::guard('web')->logout();

            $request->session()->put('auth.2fa_user_id', $user->id);
            $request->session()->put('auth.2fa_remember', $request->boolean('remember'));
            $request->session()->put('auth.2fa_dev_code', $code);

            return redirect()->route('two-factor.index');
        }

        $request->session()->regenerate();

        // Clear any stale intended session URL (e.g. from previous gate scanner session)
        $request->session()->forget('url.intended');

        AuditLogger::log('login_success', User::class, (string) $user->id, ['role' => $user->role], 'success', $user->id);

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
        $role = $request->input('role', 'customer');
        $email = $request->input('email');

        $user = null;
        if ($email) {
            $user = User::where('email', $email)->first();
        }
        if (! $user && $role === 'admin') {
            $user = User::where('role', 'admin')->first();
        } elseif (! $user && $role === 'sub_admin') {
            $user = User::where('role', 'sub_admin')->first();
        } elseif (! $user && $role === 'customer') {
            $user = User::where('role', 'customer')->first();
        } elseif (! $user && $role === 'scanner') {
            $user = User::where('role', 'scanner')->first();
        }

        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->forget('url.intended');

            if ($user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            } elseif ($user->isScanner()) {
                return redirect()->route('scanner.index');
            } else {
                return redirect()->route('dashboard');
            }
        }

        return redirect()->route('login');
    }

    public function destroy(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $userId = Auth::id();
        if ($userId) {
            AuditLogger::log('logout', User::class, (string) $userId, null, 'success', $userId);
        }

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
