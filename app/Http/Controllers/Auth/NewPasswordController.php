<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PhoneNormalizer;
use Carbon\Carbon;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request, ?string $token = null): Response
    {
        $devCode = app()->environment('local', 'testing') ? $request->session()->get('password_reset_dev_code') : null;
        $resolvedToken = $token ?? $request->query('token') ?? $devCode;
        $resolvedEmail = $request->query('email') ?? $request->session()->get('password_reset_identity') ?? $request->session()->get('password_reset_email');
        $maskedTarget = $request->session()->get('password_reset_masked_target');
        $deliveryMethod = $request->session()->get('password_reset_delivery_method', 'email');

        return Inertia::render('Auth/ResetPassword', [
            'email' => $resolvedEmail,
            'token' => $resolvedToken,
            'maskedTarget' => $maskedTarget,
            'deliveryMethod' => $deliveryMethod,
            'devCode' => $devCode,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'token.required' => 'Please enter the 6-digit security code.',
            'email.required' => 'Please provide your email address or phone number.',
        ]);

        $identity = trim((string) $request->input('email'));
        $submittedToken = trim((string) $request->input('token'));

        $ipThrottleKey = 'pwd_reset_verify_ip|'.$request->ip();
        $idThrottleKey = 'pwd_reset_verify_id|'.strtolower($identity);

        if (RateLimiter::tooManyAttempts($ipThrottleKey, 5) || RateLimiter::tooManyAttempts($idThrottleKey, 5)) {
            $seconds = max(
                RateLimiter::availableIn($ipThrottleKey),
                RateLimiter::availableIn($idThrottleKey)
            );
            throw ValidationException::withMessages([
                'token' => "Too many incorrect verification attempts. Please wait {$seconds} seconds.",
            ]);
        }

        // Lookup user by email or phone
        $user = null;
        if (filter_var($identity, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $identity)->first();
        }

        if (! $user) {
            $cleanDigits = PhoneNormalizer::cleanForApi($identity);
            if (! empty($cleanDigits)) {
                $user = User::where('phone', 'LIKE', "%{$cleanDigits}%")
                    ->orWhere('email', "{$cleanDigits}@phone.kardovo.com")
                    ->first();
            }
        }

        if (! $user) {
            RateLimiter::hit($ipThrottleKey, 300);
            RateLimiter::hit($idThrottleKey, 300);
            throw ValidationException::withMessages([
                'email' => 'We could not find an account associated with this email or phone number.',
            ]);
        }

        $record = DB::table('password_reset_tokens')->where('email', $user->email)->first();

        if (! $record) {
            RateLimiter::hit($ipThrottleKey, 300);
            RateLimiter::hit($idThrottleKey, 300);
            throw ValidationException::withMessages([
                'token' => 'No active password reset request found. Please request a new code.',
            ]);
        }

        // Check if code has expired (15 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            RateLimiter::hit($ipThrottleKey, 300);
            RateLimiter::hit($idThrottleKey, 300);
            throw ValidationException::withMessages([
                'token' => 'The verification code has expired. Please request a fresh code.',
            ]);
        }

        // Check token match (handles hashed 6-digit codes and legacy plain tokens)
        $isValid = Hash::check($submittedToken, $record->token) || $record->token === $submittedToken;

        if (! $isValid) {
            RateLimiter::hit($ipThrottleKey, 300);
            RateLimiter::hit($idThrottleKey, 300);
            throw ValidationException::withMessages([
                'token' => 'The provided security code is invalid.',
            ]);
        }

        RateLimiter::clear($ipThrottleKey);
        RateLimiter::clear($idThrottleKey);

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        $request->session()->forget([
            'password_reset_user_id',
            'password_reset_identity',
            'password_reset_email',
            'password_reset_delivery_method',
            'password_reset_masked_target',
            'password_reset_dev_code',
        ]);

        return redirect()->route('login')->with(
            'status',
            'Your password has been reset successfully. Please sign in with your new password.'
        );
    }
}
