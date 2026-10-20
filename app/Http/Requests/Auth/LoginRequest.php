<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Services\PhoneNormalizer;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:128'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $loginInput = trim($this->input('email') ?? $this->input('login') ?? '');
        $password = (string) $this->input('password');
        $remember = $this->boolean('remember');

        $user = null;

        if (filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', strtolower($loginInput))->first();
        } else {
            // Attempt to match by phone number in various formats
            $cleanPhone = PhoneNormalizer::cleanForApi($loginInput);
            $query = User::where(function ($q) use ($loginInput, $cleanPhone) {
                $q->where('phone', $loginInput)
                    ->orWhere('phone', $cleanPhone)
                    ->orWhere('phone', '+'.$cleanPhone);

                if (! empty($cleanPhone) && strlen($cleanPhone) >= 9) {
                    $last9 = substr($cleanPhone, -9);
                    $q->orWhere('phone', 'like', "%{$last9}")
                        ->orWhere('email', "{$cleanPhone}@phone.kardovo.com");
                }
            });

            $user = $query->first();
        }

        // Constant-time password verification: prevents timing side-channel user enumeration
        $dummyHash = '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        $passwordMatches = $user
            ? Hash::check($password, $user->password)
            : Hash::check($password, $dummyHash) && false;

        if (! $user || ! $passwordMatches) {
            RateLimiter::hit($this->throttleKey(), 60);
            RateLimiter::hit($this->ipVelocityKey(), 300);
            RateLimiter::hit($this->accountAttackKey(), 300);
            RateLimiter::hit(static::globalFailedVelocityKey(), 300);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        Auth::login($user, $remember);

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Check whether the target account is currently experiencing a distributed multi-IP credential stuffing attack.
     */
    public function isAccountUnderDistributedAttack(): bool
    {
        return RateLimiter::tooManyAttempts($this->accountAttackKey(), 15);
    }

    /**
     * Check whether the entire application is under a system-wide distributed botnet attack.
     * When active, triggers adaptive challenge mode on untrusted devices without locking legitimate users.
     */
    public static function isSystemUnderDistributedAttack(): bool
    {
        return RateLimiter::attempts(static::globalFailedVelocityKey()) >= 200;
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        // Bucket 1: Per-Account + Per-IP (5 failed attempts/min) — never locks out a real user on a different IP
        if (RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            event(new Lockout($this));

            $seconds = RateLimiter::availableIn($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // Bucket 2: Per-IP Global Credential Spraying (15 failed attempts across ANY accounts in 5 mins)
        if (RateLimiter::tooManyAttempts($this->ipVelocityKey(), 15)) {
            event(new Lockout($this));

            $seconds = RateLimiter::availableIn($this->ipVelocityKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }
    }

    /**
     * Get the rate limiting throttle key for the request (Account + IP).
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    /**
     * Get the per-IP global velocity throttle key (stops multi-account password spraying from one IP).
     */
    public function ipVelocityKey(): string
    {
        return 'login_ip_velocity|'.$this->ip();
    }

    /**
     * Get the per-account distributed attack detector key (tracks failed attempts across all botnet IPs).
     */
    public function accountAttackKey(): string
    {
        return 'login_account_attack|'.Str::transliterate(Str::lower($this->string('email')));
    }

    /**
     * Get the system-wide global failed login velocity key.
     */
    public static function globalFailedVelocityKey(): string
    {
        return 'login_global_failed_velocity';
    }
}
