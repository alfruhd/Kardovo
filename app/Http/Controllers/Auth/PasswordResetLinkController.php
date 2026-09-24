<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PhoneNormalizer;
use App\Services\SmsService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset code request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    /**
     * Handle an incoming password reset code request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string',
            'delivery_method' => 'nullable|in:email,sms',
        ], [
            'email.required' => 'Please provide your registered email address or phone number.',
        ]);

        $identity = trim((string) $request->input('email'));

        // Apply rate limiter per IP address
        $throttleKey = 'password_reset_req_'.$request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => "Too many password reset requests. Please wait {$seconds} seconds.",
            ]);
        }
        RateLimiter::hit($throttleKey, 60);

        // Find user by email or phone
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
            throw ValidationException::withMessages([
                'email' => 'We could not find an account associated with this email or phone number.',
            ]);
        }

        // Determine user channels
        $hasRealEmail = ! empty($user->email) && ! str_ends_with($user->email, '@phone.kardovo.com');
        $hasPhone = ! empty($user->phone);

        $requestedMethod = $request->input('delivery_method');
        $deliveryMethod = 'email';

        if ($requestedMethod === 'sms') {
            $deliveryMethod = $hasPhone ? 'sms' : ($hasRealEmail ? 'email' : 'sms');
        } elseif ($requestedMethod === 'email') {
            $deliveryMethod = $hasRealEmail ? 'email' : ($hasPhone ? 'sms' : 'email');
        } else {
            // Auto detection based on user input or available channels
            if (! str_contains($identity, '@') && $hasPhone) {
                $deliveryMethod = 'sms';
            } elseif ($hasRealEmail) {
                $deliveryMethod = 'email';
            } elseif ($hasPhone) {
                $deliveryMethod = 'sms';
            }
        }

        // Generate secure 6-digit random code
        $code = sprintf('%06d', random_int(100000, 999999));

        // Save hashed code in password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        $maskedTarget = '';

        if ($deliveryMethod === 'sms' && $user->phone) {
            $maskedTarget = substr($user->phone, 0, 4).'••••'.substr($user->phone, -3);
            SmsService::send(
                $user->phone,
                "Your Kardovo password reset code is: {$code}. Valid for 15 minutes. Do not share this code."
            );
        } else {
            $emailParts = explode('@', $user->email);
            $maskedTarget = substr($emailParts[0], 0, 2).'••••@'.($emailParts[1] ?? 'email.com');
            $user->notify(new ResetPassword($code));
        }

        $request->session()->put('password_reset_user_id', $user->id);
        $request->session()->put('password_reset_identity', $identity);
        $request->session()->put('password_reset_email', $user->email);
        $request->session()->put('password_reset_delivery_method', $deliveryMethod);
        $request->session()->put('password_reset_masked_target', $maskedTarget);

        if (app()->environment('local', 'testing')) {
            $request->session()->put('password_reset_dev_code', $code);
        }

        return redirect()->route('password.reset')->with(
            'status',
            "A 6-digit verification code has been sent to {$maskedTarget}."
        );
    }
}
