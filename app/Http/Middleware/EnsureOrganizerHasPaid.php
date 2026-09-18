<?php

namespace App\Http\Middleware;

use App\Models\FinancialTransaction;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizerHasPaid
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('testing') && ! $request->hasHeader('X-Test-Paywall')) {
            return $next($request);
        }

        $user = $request->user();

        if ($user && ! $user->isAdmin() && $user->role !== 'sub_admin' && $user->role !== 'scanner') {
            // Admin override for cash payments
            if ($user->has_payment_override) {
                return $next($request);
            }

            // Check if the user has created any events
            if ($user->events()->exists()) {
                // Check if they have purchased a package
                $hasPaid = FinancialTransaction::where('user_id', $user->id)
                    ->where('category', 'package_purchase')
                    ->where('status', 'completed')
                    ->exists();

                if (! $hasPaid) {
                    return inertia('Customer/Paywall')->toResponse($request);
                }
            }
        }

        return $next($request);
    }
}
