<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CardTemplateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\MessagingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicGuestController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\WhatsAppWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Guest Routes (WhatsApp & SMS 1-tap card & RSVP)
Route::get('/demo/pass', [PublicGuestController::class, 'showDemoPass'])->name('guest.demoPass');
Route::get('/card/{token}', [PublicGuestController::class, 'showCard'])->name('guest.card');
Route::post('/card/{token}/rsvp', [PublicGuestController::class, 'submitRsvp'])->name('guest.rsvp');

// Instant Dev Role Switcher
Route::post('/dev/switch-user', [AuthenticatedSessionController::class, 'switchUser'])->name('dev.switchUser');

// Branded Loading Animation Showcase
Route::get('/loading-preview', function () {
    return Inertia::render('Dev/LoadingPreview');
})->name('dev.loadingPreview');

// Public Root Redirect
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// Authenticated Application Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Events
    Route::resource('events', EventController::class)->only(['index', 'show', 'store', 'update', 'destroy']);

    // Guests
    Route::post('/events/{event}/guests', [GuestController::class, 'store'])->name('guests.store');
    Route::post('/events/{event}/guests/import', [GuestController::class, 'import'])->name('guests.import');
    Route::put('/events/{event}/guests/{guest}', [GuestController::class, 'update'])->name('guests.update');
    Route::delete('/events/{event}/guests/{guest}', [GuestController::class, 'destroy'])->name('guests.destroy');
    Route::get('/events/{event}/guests-export', [GuestController::class, 'exportCsv'])->name('guests.export');
    Route::get('/guests/sample-template', [GuestController::class, 'downloadSampleTemplate'])->name('guests.sampleTemplate');

    // Card Templates
    Route::get('/templates', [CardTemplateController::class, 'index'])->name('templates.index');
    Route::post('/templates', [CardTemplateController::class, 'store'])->name('templates.store');
    Route::match(['put', 'post'], '/templates/{cardTemplate}', [CardTemplateController::class, 'update'])->name('templates.update');
    Route::delete('/templates/{cardTemplate}', [CardTemplateController::class, 'destroy'])->name('templates.destroy');
    Route::get('/guests/{guest}/card-view', [CardTemplateController::class, 'guestCard'])->name('guests.cardView');

    // Messaging & Broadcast Hub
    Route::get('/messaging', [MessagingController::class, 'index'])->name('messaging.index');
    Route::post('/messaging/broadcast', [MessagingController::class, 'sendBroadcast'])->name('messaging.broadcast');
    Route::post('/guests/{guest}/send-message', [MessagingController::class, 'sendSingle'])->name('messaging.sendSingle');

    // Scanner App (Mobile / PWA View)
    Route::get('/scanner', [ScannerController::class, 'index'])->name('scanner.index');
    Route::post('/scanner/validate', [ScannerController::class, 'validateScan'])->name('scanner.validate');

    // Admin Portal
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::post('/admin/gateway', [AdminController::class, 'updateGateway'])->name('admin.gateway');
    Route::post('/admin/customers', [AdminController::class, 'storeCustomer'])->name('admin.storeCustomer');
    Route::put('/admin/customers/{customer}', [AdminController::class, 'updateCustomer'])->name('admin.updateCustomer');
    Route::delete('/admin/customers/{customer}', [AdminController::class, 'destroyCustomer'])->name('admin.destroyCustomer');
    Route::post('/admin/scanners', [AdminController::class, 'storeScanner'])->name('admin.storeScanner');
    Route::put('/admin/scanners/{scanner}', [AdminController::class, 'updateScanner'])->name('admin.updateScanner');
    Route::delete('/admin/scanners/{scanner}', [AdminController::class, 'destroyScanner'])->name('admin.destroyScanner');
    Route::post('/admin/sub-admins', [AdminController::class, 'storeSubAdmin'])->name('admin.storeSubAdmin');
    Route::put('/admin/sub-admins/{subAdmin}', [AdminController::class, 'updateSubAdmin'])->name('admin.updateSubAdmin');
    Route::delete('/admin/sub-admins/{subAdmin}', [AdminController::class, 'destroySubAdmin'])->name('admin.destroySubAdmin');

    // Admin Financial Analytics & Cashflow
    Route::get('/admin/finance', [FinanceController::class, 'index'])->name('admin.finance');
    Route::post('/admin/finance/transactions', [FinanceController::class, 'store'])->name('admin.finance.store');
    Route::delete('/admin/finance/transactions/{transaction}', [FinanceController::class, 'destroy'])->name('admin.finance.destroy');
    Route::get('/admin/finance/export', [FinanceController::class, 'export'])->name('admin.finance.export');

    // User Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Legal, Compliance & Terms Policies
Route::get('/terms', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'terms']);
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'privacy']);
})->name('privacy');

Route::get('/policies', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'security']);
})->name('policies');

// WhatsApp Cloud API & Gateway Webhooks
Route::get('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify'])->name('webhooks.whatsapp.verify');
Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp.handle');
Route::get('/api/webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify']);
Route::post('/api/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle']);

// Error 404 Route & Universal Fallback
Route::get('/404', function () {
    return Inertia::render('Error404')->toResponse(request())->setStatusCode(404);
})->name('error.404');

Route::fallback(function () {
    return Inertia::render('Error404')->toResponse(request())->setStatusCode(404);
});
