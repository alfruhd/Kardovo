<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use App\Services\PhoneNormalizer;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-().]{7,25}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.regex' => 'Please provide a valid phone number (e.g. 07XXXXXXXX or +255 7XX XXX XXX).',
        ]);

        $email = $request->input('email');
        $rawPhone = $request->input('phone');

        if (empty($email) && empty($rawPhone)) {
            throw ValidationException::withMessages([
                'email' => 'Please provide either an email address or a phone number to register.',
            ]);
        }

        $formattedPhone = null;
        if (! empty($rawPhone)) {
            $cleanPhone = PhoneNormalizer::cleanForApi($rawPhone);

            // Check uniqueness of phone
            $existingPhone = User::where(function ($q) use ($rawPhone, $cleanPhone) {
                $q->where('phone', $rawPhone)
                    ->orWhere('phone', $cleanPhone)
                    ->orWhere('phone', '+'.$cleanPhone);
                if (! empty($cleanPhone) && strlen($cleanPhone) >= 9) {
                    $last9 = substr($cleanPhone, -9);
                    $q->orWhere('phone', 'like', "%{$last9}");
                }
            })->exists();

            if ($existingPhone) {
                throw ValidationException::withMessages([
                    'phone' => 'This phone number is already registered.',
                ]);
            }

            $formattedPhone = PhoneNormalizer::formatDisplay($rawPhone);
            if (empty($email)) {
                $email = "{$cleanPhone}@phone.kardovo.com";
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $email,
            'phone' => $formattedPhone,
            'role' => 'customer',
            'two_factor_enabled' => false,
            'password' => Hash::make($request->password),
            'max_whatsapp_limit' => 0,
            'max_sms_limit' => 0,
        ]);

        event(new Registered($user));

        // Generate 2FA code for immediate verification
        $code = $user->generateTwoFactorCode();

        try {
            $user->notify(new TwoFactorCodeNotification($code));
        } catch (\Throwable $e) {
            Log::warning("Failed to send 2FA email to {$user->email}: ".$e->getMessage());
        }

        $request->session()->put('auth.2fa_user_id', $user->id);
        $request->session()->put('auth.2fa_remember', false);
        $request->session()->put('auth.2fa_dev_code', $code);

        return redirect()->route('two-factor.index');
    }
}
