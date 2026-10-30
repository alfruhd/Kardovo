<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\AzampayWebhookController;
use App\Http\Controllers\CardTemplateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\MessagingController;
use App\Http\Controllers\Organizer\PaymentController;
use App\Http\Controllers\Organizer\VotingController;
use App\Http\Controllers\Organizer\VotingPortalController;
use App\Http\Controllers\PledgeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicGuestController;
use App\Http\Controllers\PublicTicketController;
use App\Http\Controllers\PublicTicketMarketplaceController;
use App\Http\Controllers\PublicVotingController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\TicketCheckoutController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\WhatsAppWebhookController;
use App\Http\Middleware\EnsureOrganizerHasPaid;
use App\Http\Middleware\ProtectAgainstBotSubmissions;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Guest Routes (WhatsApp & SMS 1-tap card & RSVP)
Route::get('/demo/pass', [PublicGuestController::class, 'showDemoPass'])->name('guest.demoPass');
Route::get('/kj/{token?}', [PublicGuestController::class, 'showCard'])->middleware('throttle:300,1')->name('guest.kj');
Route::get('/card/{token}', [PublicGuestController::class, 'showCard'])->middleware('throttle:300,1')->name('guest.card');
Route::post('/card/{token}/rsvp', [PublicGuestController::class, 'submitRsvp'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:60,1'])->name('guest.rsvp');
Route::post('/card/{token}/pledge', [PublicGuestController::class, 'submitPledge'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:60,1'])->name('guest.pledge');
Route::post('/card/{token}/payment-proof', [PublicGuestController::class, 'submitPaymentProof'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:60,1'])->name('guest.paymentProof');

// Public Ticketing & Live Pass Hub
Route::get('/tickets', [PublicTicketMarketplaceController::class, 'index'])->name('tickets.marketplace');
Route::get('/how-it-works', [PublicTicketMarketplaceController::class, 'howItWorks'])->name('tickets.how-it-works');
Route::get('/tickets/how-it-works', [PublicTicketMarketplaceController::class, 'howItWorks']);
Route::get('/e/{event}/tickets', [TicketCheckoutController::class, 'showEventTickets'])->name('events.publicTickets');
Route::get('/t/{ticket_number}', [PublicTicketController::class, 'show'])->name('tickets.publicPass');
Route::get('/t/{ticket_number}/pdf', [PublicTicketController::class, 'downloadPdf'])->name('tickets.downloadPdf');
Route::post('/t/{ticket_number}/whatsapp', [PublicTicketController::class, 'sendWhatsApp'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:30,1'])->name('tickets.sendWhatsApp');
Route::post('/t/{ticket_number}/sms', [PublicTicketController::class, 'sendSms'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:30,1'])->name('tickets.sendSms');
Route::post('/t/{ticket_number}/email', [PublicTicketController::class, 'sendEmail'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:30,1'])->name('tickets.sendEmail');
Route::post('/events/{event}/checkout-tickets', [TicketCheckoutController::class, 'checkout'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:60,1'])->name('tickets.checkout');
Route::post('/events/{event}/validate-discount', [TicketCheckoutController::class, 'validateDiscount'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:60,1'])->name('tickets.validateDiscount');
Route::get('/tickets/order/{order_number}', [TicketCheckoutController::class, 'orderSuccess'])->name('tickets.orderSuccess');
Route::get('/tickets/order/{order_number}/status', [TicketCheckoutController::class, 'checkOrderStatus'])->name('tickets.orderStatus');
Route::post('/tickets/order/{order_number}/verify-payment', [TicketCheckoutController::class, 'verifyPayment'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:30,1'])->name('tickets.verifyPayment');

// Public Voting & Contests Hub
Route::get('/voting', [PublicVotingController::class, 'index'])->name('voting.index');
Route::get('/voting/how-it-works', [PublicVotingController::class, 'howItWorks'])->name('voting.how-it-works');
Route::get('/voting/{event}', [PublicVotingController::class, 'showEventVoting'])->name('voting.show');
Route::get('/e/{event}/voting', [PublicVotingController::class, 'showEventVoting'])->name('events.publicVoting');
Route::get('/vote-for-me/{event}/{candidate}', [PublicVotingController::class, 'showCandidateDirect'])->name('voting.candidateDirect');
Route::post('/events/{event}/checkout-vote', [PublicVotingController::class, 'checkoutVote'])->middleware([ProtectAgainstBotSubmissions::class, 'throttle:60,1'])->name('voting.checkout');
Route::get('/voting/order/{order_number}/status', [PublicVotingController::class, 'checkVoteStatus'])->name('voting.orderStatus');

// Instant Dev Role Switcher (Local & Testing environments only)
if (app()->environment('local', 'testing')) {
    Route::post('/dev/switch-user', [AuthenticatedSessionController::class, 'switchUser'])->name('dev.switchUser');
}

// Public Root Redirect
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Authenticated Application Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Calendar
    Route::get('/calendar', [EventController::class, 'calendar'])->name('calendar.index');

    Route::middleware([EnsureOrganizerHasPaid::class])->group(function () {
        // Events
        Route::resource('events', EventController::class)->only(['index', 'show', 'store', 'update', 'destroy']);

        // Guests
        Route::post('/events/{event}/guests', [GuestController::class, 'store'])->name('guests.store');
        Route::post('/events/{event}/guests/import', [GuestController::class, 'import'])->name('guests.import');
        Route::put('/events/{event}/guests/{guest}', [GuestController::class, 'update'])->name('guests.update');
        Route::delete('/events/{event}/guests/{guest}', [GuestController::class, 'destroy'])->name('guests.destroy');
        Route::delete('/events/{event}/guests-clear', [GuestController::class, 'clearAll'])->name('guests.clearAll');
        Route::get('/events/{event}/guests-export', [GuestController::class, 'exportCsv'])->name('guests.export');
        Route::get('/events/{event}/guests-export-pdf', [GuestController::class, 'exportPdf'])->name('guests.exportPdf');
        Route::get('/guests/sample-template', [GuestController::class, 'downloadSampleTemplate'])->name('guests.sampleTemplate');

        // Pledges & Contributions (Michango na Ahadi)
        Route::match(['put', 'post'], '/events/{event}/pledges/settings', [PledgeController::class, 'updateSettings'])->name('pledges.settings');
        Route::post('/events/{event}/pledges', [PledgeController::class, 'storePledge'])->name('pledges.store');
        Route::post('/events/{event}/guests/{guest}/payments', [PledgeController::class, 'recordPayment'])->name('pledges.recordPayment');
        Route::delete('/events/{event}/pledges/payments/{payment}', [PledgeController::class, 'deletePayment'])->name('pledges.deletePayment');
        Route::get('/events/{event}/pledges/export-csv', [PledgeController::class, 'exportReport'])->name('pledges.exportCsv');

        // Ticketing Portal
        Route::get('/ticketing', [TicketController::class, 'index'])->name('ticketing.index');
        Route::post('/ticketing/occasions', [TicketController::class, 'storeOccasion'])->name('ticketing.occasions.store');
        Route::match(['put', 'post'], '/events/{event}/ticketing-settings', [TicketController::class, 'updateSettings'])->name('events.ticketingSettings');
        Route::match(['put', 'post'], '/events/{event}/ticket-template', [TicketController::class, 'updateTicketTemplate'])->name('events.ticketTemplate.update');
        Route::post('/events/{event}/ticket-tiers', [TicketController::class, 'storeTier'])->name('events.ticketTiers.store');
        Route::put('/events/{event}/ticket-tiers/{tier}', [TicketController::class, 'updateTier'])->name('events.ticketTiers.update');
        Route::delete('/events/{event}/ticket-tiers/{tier}', [TicketController::class, 'destroyTier'])->name('events.ticketTiers.destroy');
        Route::post('/events/{event}/tickets/batch-generate', [TicketController::class, 'batchGenerate'])->name('events.tickets.batchGenerate');
        Route::get('/events/{event}/tickets/print-sheet', [TicketController::class, 'printSheet'])->name('events.tickets.printSheet');
        Route::get('/events/{event}/tickets/export-csv', [TicketController::class, 'exportCsv'])->name('events.tickets.exportCsv');

        // Discount Codes
        Route::post('/events/{event}/discount-codes', [TicketController::class, 'storeDiscountCode'])->name('events.discountCodes.store');
        Route::put('/events/{event}/discount-codes/{discountCode}', [TicketController::class, 'updateDiscountCode'])->name('events.discountCodes.update');
        Route::patch('/events/{event}/discount-codes/{discountCode}/toggle', [TicketController::class, 'toggleDiscountCode'])->name('events.discountCodes.toggle');
        Route::delete('/events/{event}/discount-codes/{discountCode}', [TicketController::class, 'destroyDiscountCode'])->name('events.discountCodes.destroy');

        // Wristband Printing & Production Orders
        Route::post('/events/{event}/wristbands/order', [TicketController::class, 'orderWristbands'])->name('events.wristbands.order');
        Route::get('/events/{event}/wristbands/print', [TicketController::class, 'printWristbands'])->name('events.wristbands.print');
        Route::post('/events/{event}/wristbands/template', [TicketController::class, 'updateWristbandTemplate'])->name('events.wristbands.template');

        // Point of Sale (POS) Hardware Terminal Requests
        Route::post('/events/{event}/pos-request', [TicketController::class, 'requestPosTerminal'])->name('events.posRequest.store');

        // Independent Voting Portal for Organizers
        Route::get('/voting-portal', [VotingPortalController::class, 'index'])->name('voting.portal.index');
        Route::post('/voting-portal', [VotingPortalController::class, 'store'])->name('voting.portal.store');
        Route::get('/voting-portal/{event}', [VotingPortalController::class, 'show'])->name('voting.portal.show');
        Route::put('/voting-portal/{event}', [VotingPortalController::class, 'update'])->name('voting.portal.update');
        Route::delete('/voting-portal/{event}', [VotingPortalController::class, 'destroy'])->name('voting.portal.destroy');

        // Event Voting & Contests Management
        Route::match(['put', 'post'], '/events/{event}/voting-settings', [VotingController::class, 'updateSettings'])->name('events.votingSettings');
        Route::post('/events/{event}/voting-categories', [VotingController::class, 'storeCategory'])->name('events.votingCategories.store');
        Route::put('/events/{event}/voting-categories/{category}', [VotingController::class, 'updateCategory'])->name('events.votingCategories.update');
        Route::delete('/events/{event}/voting-categories/{category}', [VotingController::class, 'destroyCategory'])->name('events.votingCategories.destroy');
        Route::post('/events/{event}/voting-categories/{category}/candidates', [VotingController::class, 'storeCandidate'])->name('events.votingCandidates.store');
        Route::put('/events/{event}/voting-candidates/{candidate}', [VotingController::class, 'updateCandidate'])->name('events.votingCandidates.update');
        Route::delete('/events/{event}/voting-candidates/{candidate}', [VotingController::class, 'destroyCandidate'])->name('events.votingCandidates.destroy');
        Route::post('/events/{event}/voting/manual-vote', [VotingController::class, 'storeManualVote'])->name('events.voting.manualVote');
        Route::get('/events/{event}/voting/export-csv', [VotingController::class, 'exportVotesCsv'])->name('events.voting.exportCsv');

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
        Route::patch('/messaging/events/{event}/template', [MessagingController::class, 'updateEventTemplate'])->name('messaging.updateEventTemplate');
        Route::delete('/messaging/logs/clear-all', [MessagingController::class, 'clearLogs'])->name('messaging.clearLogs');
        Route::delete('/messaging/logs/{message}', [MessagingController::class, 'destroyLog'])->name('messaging.destroyLog');

        // Scanner App (Mobile / PWA View)
        Route::get('/scanner', [ScannerController::class, 'index'])->name('scanner.index');
        Route::post('/scanner/validate', [ScannerController::class, 'validateScan'])->middleware('throttle:300,1')->name('scanner.validate');
        Route::post('/scanner/pos-door-sale', [ScannerController::class, 'posDoorSale'])->middleware('throttle:120,1')->name('scanner.posDoorSale');
    });

    // Admin Portal
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::redirect('/admin/logs', '/admin/audit-logs')->name('admin.logs');
    Route::get('/admin/gateways', [AdminController::class, 'gateways'])->name('admin.gateways');
    Route::get('/admin/audit-logs', [AuditLogController::class, 'index'])->name('admin.auditLogs');
    Route::post('/admin/gateway', [AdminController::class, 'updateGateway'])->name('admin.gateway');
    Route::post('/admin/gateway/test', [AdminController::class, 'testGateway'])->name('admin.gateway.test');
    Route::post('/admin/customers', [AdminController::class, 'storeCustomer'])->name('admin.storeCustomer');
    Route::put('/admin/customers/{customer}', [AdminController::class, 'updateCustomer'])->name('admin.updateCustomer');
    Route::delete('/admin/customers/{customer}', [AdminController::class, 'destroyCustomer'])->name('admin.destroyCustomer');
    Route::post('/admin/scanners', [AdminController::class, 'storeScanner'])->name('admin.storeScanner');
    Route::put('/admin/scanners/{scanner}', [AdminController::class, 'updateScanner'])->name('admin.updateScanner');
    Route::delete('/admin/scanners/{scanner}', [AdminController::class, 'destroyScanner'])->name('admin.destroyScanner');
    Route::post('/admin/sub-admins', [AdminController::class, 'storeSubAdmin'])->name('admin.storeSubAdmin');
    Route::put('/admin/sub-admins/{subAdmin}', [AdminController::class, 'updateSubAdmin'])->name('admin.updateSubAdmin');
    Route::delete('/admin/sub-admins/{subAdmin}', [AdminController::class, 'destroySubAdmin'])->name('admin.destroySubAdmin');
    // Scan Logs & Activity
    Route::delete('/events/{event}/scan-logs/{scanLog}', [EventController::class, 'destroyScanLog'])->name('events.destroyScanLog');
    Route::delete('/events/{event}/scan-logs', [EventController::class, 'clearScanLogs'])->name('events.clearScanLogs');
    Route::delete('/admin/scan-logs/{scanLog}', [AdminController::class, 'destroyScanLog'])->name('admin.destroyScanLog');
    Route::delete('/admin/scan-logs', [AdminController::class, 'clearScanLogs'])->name('admin.clearScanLogs');

    Route::get('/admin/finance', [FinanceController::class, 'index'])->name('admin.finance');
    Route::post('/admin/finance/transactions', [FinanceController::class, 'store'])->name('admin.finance.store');
    Route::delete('/admin/finance/transactions/{transaction}', [FinanceController::class, 'destroy'])->name('admin.finance.destroy');
    Route::get('/admin/finance/export', [FinanceController::class, 'export'])->name('admin.finance.export');
    Route::get('/admin/finance/export-pdf', [FinanceController::class, 'exportPdf'])->name('admin.finance.exportPdf');
    Route::post('/admin/finance/exchange-rate/refresh', [FinanceController::class, 'refreshExchangeRate'])->name('admin.finance.exchangeRate.refresh');
    Route::post('/admin/finance/exchange-rate/update', [FinanceController::class, 'updateExchangeRate'])->name('admin.finance.exchangeRate.update');
    Route::post('/admin/finance/bills', [FinanceController::class, 'storeBill'])->name('admin.finance.bills.store');
    Route::put('/admin/finance/bills/{bill}', [FinanceController::class, 'updateBill'])->name('admin.finance.bills.update');
    Route::post('/admin/finance/bills/{bill}/pay', [FinanceController::class, 'payBill'])->name('admin.finance.bills.pay');
    Route::delete('/admin/finance/bills/{bill}', [FinanceController::class, 'destroyBill'])->name('admin.finance.bills.destroy');
    Route::post('/admin/finance/bills/{bill}/remind', [FinanceController::class, 'remindBill'])->name('admin.finance.bills.remind');

    // Organizer Pricing & Direct Payments
    Route::get('/organizer/pricing', [PaymentController::class, 'index'])->name('organizer.wallet.index');
    Route::post('/organizer/pricing/purchase', [PaymentController::class, 'purchasePackage'])->name('organizer.pricing.purchase');
    Route::get('/organizer/payments/{transaction}/receipt', [PaymentController::class, 'receipt'])->name('organizer.payments.receipt');

    // User Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Legal, Compliance, Privacy & Consumer Protection Policies
Route::get('/terms', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'terms']);
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'privacy']);
})->name('privacy');

Route::get('/cookies', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'cookies']);
})->name('cookies');

Route::get('/refunds', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'refunds']);
})->name('refunds');

Route::get('/policies', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'security']);
})->name('policies');

Route::get('/ticketing-terms', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'ticketing']);
})->name('ticketing.terms');

Route::get('/voting-terms', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'voting']);
})->name('voting.terms');

Route::get('/voting-policy', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'voting']);
})->name('voting.policy');

Route::get('/compliance', function () {
    return Inertia::render('Legal/TermsAndConditions', ['initialTab' => 'compliance']);
})->name('compliance');

// WhatsApp Cloud API & Gateway Webhooks
Route::get('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify'])->name('webhooks.whatsapp.verify');
Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp.handle');
Route::get('/api/webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify']);
Route::post('/api/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle']);

// SMS Gateway Webhooks (NextSMS, Beem, Twilio, AfricasTalking)
Route::match(['get', 'post'], '/webhooks/sms', [WhatsAppWebhookController::class, 'handleSms'])->name('webhooks.sms');
Route::match(['get', 'post'], '/api/webhooks/sms', [WhatsAppWebhookController::class, 'handleSms']);

// Azampay Webhooks
Route::post('/api/webhooks/azampay', [AzampayWebhookController::class, 'handleCallback'])->name('webhooks.azampay');

// Error 404 Route & Universal Fallback
Route::get('/404', function () {
    return Inertia::render('Error404')->toResponse(request())->setStatusCode(404);
})->name('error.404');

Route::fallback(function () {
    return Inertia::render('Error404')->toResponse(request())->setStatusCode(404);
});
