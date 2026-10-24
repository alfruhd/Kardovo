<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceRequestPayloadSecurity
{
    /**
     * Maximum allowed request body size in bytes (25 Megabytes).
     * Shields PHP runtime against out-of-memory aborts during malicious oversized payloads.
     */
    private const MAX_BODY_BYTES = 25 * 1024 * 1024;

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Guard against oversized payloads before worker memory allocation
        $contentLength = (int) $request->server('CONTENT_LENGTH', 0);
        if ($contentLength > self::MAX_BODY_BYTES) {
            return response()->json([
                'message' => 'The payload size exceeds the server safety threshold (max 25MB).',
            ], Response::HTTP_REQUEST_ENTITY_TOO_LARGE);
        }

        $response = $next($request);

        // 2. Attach hardening security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
