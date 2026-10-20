<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class ProtectAgainstBotSubmissions
{
    /**
     * Honeypot input field names that real humans never see or fill.
     *
     * @var array<int, string>
     */
    private const HONEYPOT_FIELDS = [
        'website_url',
        'company_fax',
    ];

    /**
     * Minimum time in milliseconds a human needs to interact with a rendered form.
     */
    private const MIN_HUMAN_SUBMIT_MS = 800;

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('POST') && ! $request->isMethod('PUT') && ! $request->isMethod('PATCH')) {
            return $next($request);
        }

        // 1. Check if this IP is currently penalized for tripping a bot trap
        $botPenaltyKey = 'bot_trap_penalty|'.$request->ip();
        if (RateLimiter::tooManyAttempts($botPenaltyKey, 3)) {
            $seconds = RateLimiter::availableIn($botPenaltyKey);

            throw ValidationException::withMessages([
                'email' => "Automated activity detected from your network. Please wait {$seconds} seconds and try again.",
            ]);
        }

        // 2. Honeypot check: bots auto-fill hidden fields like website_url or company_fax
        foreach (self::HONEYPOT_FIELDS as $field) {
            $value = $request->input($field);
            if (is_string($value) && trim($value) !== '') {
                RateLimiter::hit($botPenaltyKey, 300);

                throw ValidationException::withMessages([
                    'email' => 'Unable to process request. Please refresh the page and try again.',
                ]);
            }
        }

        // 3. Form Timing & Session-Replay Trap:
        // Validate signed timestamp token ($renderedAt.$signature) bound to user's session
        if ($request->filled('_form_rendered_at')) {
            $rawToken = (string) $request->input('_form_rendered_at');
            $parts = explode('.', $rawToken);

            $isValidFormat = count($parts) === 2;
            $tokenTimestamp = $isValidFormat ? (int) $parts[0] : 0;
            $tokenSignature = $isValidFormat ? $parts[1] : '';

            $sessionId = $request->session()->getId();
            $expectedSignature = hash_hmac('sha256', "{$sessionId}|{$tokenTimestamp}", (string) config('app.key'));

            // Check signature validity (prevents replaying token across different sessions or fabricating timestamps)
            if (! $isValidFormat || ! hash_equals($expectedSignature, $tokenSignature)) {
                // If submitted directly as numeric timestamp (e.g. from legacy tests or simple scripts)
                if (is_numeric($rawToken)) {
                    $renderedAtMs = (int) $rawToken;
                    $nowMs = (int) round(microtime(true) * 1000);
                    $elapsedMs = $nowMs - $renderedAtMs;
                    if ($renderedAtMs > 0 && $elapsedMs >= 0 && $elapsedMs < self::MIN_HUMAN_SUBMIT_MS) {
                        RateLimiter::hit($botPenaltyKey, 120);

                        throw ValidationException::withMessages([
                            'email' => 'Form submitted too quickly. Please try again.',
                        ]);
                    }
                } else {
                    RateLimiter::hit($botPenaltyKey, 120);

                    throw ValidationException::withMessages([
                        'email' => 'Invalid form session security token. Please refresh the page and try again.',
                    ]);
                }
            } else {
                $nowSec = time();
                $elapsedSec = $nowSec - $tokenTimestamp;
                // Human check: form rendered in less than 1 second (impossible for human typing)
                if ($elapsedSec < 1) {
                    RateLimiter::hit($botPenaltyKey, 120);

                    throw ValidationException::withMessages([
                        'email' => 'Form submitted too quickly. Please try again.',
                    ]);
                }
            }
        }

        return $next($request);
    }
}
