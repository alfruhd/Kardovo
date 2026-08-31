<?php

use App\Models\User;
use App\Models\Event;
use App\Models\Guest;
use App\Services\GuestImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('GuestImportService imports from raw text under acceptance conditions', function () {
    $event = Event::first();
    $service = new GuestImportService();

    $rawText = "Guest Name, Phone, Category, Max Entries, Email, Notes\n" .
        "John Doe, +255 754 111 222, VIP Pass, 2, john@example.com, Table 1\n" .
        "Jane Smith, 0712 345 678, Single Entry, 1, jane@example.com, \n" .
        ", +255 700 000 000, Double Entry, 2, , \n"; // Blank name row (should be skipped)

    $result = $service->import($event, null, $rawText);

    expect($result['imported'])->toBe(2);
    expect($result['skipped'])->toBe(1);

    $john = Guest::where('event_id', $event->id)->where('name', 'John Doe')->first();
    expect($john)->not->toBeNull();
    expect($john->phone)->toBe('255754111222');
    expect($john->category)->toBe('VIP Pass');
    expect($john->max_entries)->toBe(2);

    $jane = Guest::where('event_id', $event->id)->where('name', 'Jane Smith')->first();
    expect($jane)->not->toBeNull();
    expect($jane->phone)->toBe('255712345678');
});

test('GuestImportService imports valid Excel .xlsx spreadsheet file', function () {
    $event = Event::first();
    $service = new GuestImportService();

    // Create a mock .xlsx spreadsheet in memory/temp
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->fromArray([
        ['Full Name', 'Mobile Number', 'Pass Category', 'Allowance', 'Email Address', 'Remarks'],
        ['Sarah Connor', '+255 788 123 456', 'VVIP Pass', 3, 'sarah@skynet.com', 'VIP Host'],
        ['Kyle Reese', '0765 999 888', 'Double Entry', 2, 'kyle@future.com', 'Table 4'],
    ]);

    $tempFile = tempnam(sys_get_temp_dir(), 'test_excel_') . '.xlsx';
    $writer = new Xlsx($spreadsheet);
    $writer->save($tempFile);

    $uploadedFile = new UploadedFile(
        $tempFile,
        'guests_test.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $result = $service->import($event, $uploadedFile);

    expect($result['imported'])->toBe(2);
    expect($result['skipped'])->toBe(0);

    $sarah = Guest::where('event_id', $event->id)->where('name', 'Sarah Connor')->first();
    expect($sarah)->not->toBeNull();
    expect($sarah->phone)->toBe('255788123456');
    expect($sarah->max_entries)->toBe(3);

    @unlink($tempFile);
});

test('Organizer can download sample Excel template', function () {
    $user = User::where('role', 'customer')->first();

    $response = $this->actingAs($user)->get(route('guests.sampleTemplate', ['format' => 'xlsx']));

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

