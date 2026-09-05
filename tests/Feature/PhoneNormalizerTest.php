<?php

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\User;
use App\Services\PhoneNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('PhoneNormalizer strips plus signs, spaces, hyphens, and formats for API', function () {
    // 1. With plus sign and spaces
    expect(PhoneNormalizer::cleanForApi('+255 712 345 678'))->toBe('255712345678');

    // 2. With local leading zero
    expect(PhoneNormalizer::cleanForApi('0712 345 678'))->toBe('255712345678');
    expect(PhoneNormalizer::cleanForApi('0754123456'))->toBe('255754123456');

    // 3. With international double zero prefix
    expect(PhoneNormalizer::cleanForApi('00255 712 345 678'))->toBe('255712345678');

    // 4. With parentheses and dashes
    expect(PhoneNormalizer::cleanForApi('+1 (555) 123-4567'))->toBe('15551234567');

    // 5. Already clean digits
    expect(PhoneNormalizer::cleanForApi('255712345678'))->toBe('255712345678');

    // 6. Null or empty string
    expect(PhoneNormalizer::cleanForApi(''))->toBe('');
    expect(PhoneNormalizer::cleanForApi(null))->toBe('');
});

test('Guest model automatically normalizes phone number on save', function () {
    $event = Event::first();

    $guest = Guest::create([
        'event_id' => $event->id,
        'name' => 'John Doe',
        'phone' => '+255 754 999 888',
        'category' => 'Single Entry',
        'max_entries' => 1,
    ]);

    expect($guest->phone)->toBe('255754999888');
    expect($guest->api_phone)->toBe('255754999888');
});

test('MessagingController sendBroadcast saves sanitized phone without plus or spaces', function () {
    $user = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $user->id)->first();

    $guest = Guest::create([
        'event_id' => $event->id,
        'name' => 'Neema Test',
        'phone' => '+255 712 000 111',
        'category' => 'Double Entry',
        'max_entries' => 2,
        'delivery_status' => 'draft',
    ]);

    $response = $this->actingAs($user)->post(route('messaging.broadcast'), [
        'event_id' => $event->id,
        'channel' => 'whatsapp',
        'target_filter' => 'draft',
        'custom_caption' => 'Test invitation message',
    ]);

    $response->assertRedirect();

    $message = Message::where('guest_id', $guest->id)->latest()->first();
    expect($message)->not->toBeNull();
    expect($message->recipient_phone)->toBe('255712000111');
    expect($message->recipient_phone)->not->toContain('+');
    expect($message->recipient_phone)->not->toContain(' ');
});
