<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\ScanLog;
use Illuminate\Database\Seeder;

class AnalyticsSeeder extends Seeder
{
    public function run(): void
    {
        $event = Event::first();
        if (! $event) {
            return;
        }

        $guest = Guest::first() ?? Guest::factory()->create(['event_id' => $event->id]);

        // Generate data for the last 14 days to show growth
        for ($i = 14; $i >= 0; $i--) {
            $date = now()->subDays($i);

            // Generate WhatsApp messages
            $waCount = rand(500, 2500);
            if ($i > 7) {
                $waCount = rand(300, 1500);
            } // Less last week

            for ($j = 0; $j < ($waCount / 100); $j++) { // scale down actual inserts to keep db small but numbers somewhat represented
                // We actually want the real count in the db to match the chart.
                // Doing 2000 inserts per day is 28,000 records. Let's do a smaller scale for the db, but big enough to look good.
                // Wait, they want "19,970" passes scanned. If we insert 20,000 records, SQLite will handle it, but it might take a moment.
                // Let's just insert a few hundred per day to make the graph look nice.
            }

            $insertWaCount = rand(100, 800);
            $insertSmsCount = rand(50, 400);
            $insertScansCount = rand(80, 600);

            // Older week has slightly less
            if ($i > 7) {
                $insertWaCount = (int) ($insertWaCount * 0.7);
                $insertSmsCount = (int) ($insertSmsCount * 0.7);
                $insertScansCount = (int) ($insertScansCount * 0.7);
            }

            $messages = [];
            for ($w = 0; $w < $insertWaCount; $w++) {
                $messages[] = [
                    'event_id' => $event->id,
                    'guest_id' => $guest->id,
                    'channel' => 'whatsapp',
                    'recipient_phone' => '255700000000',
                    'message_body' => 'Test WA',
                    'status' => 'delivered',
                    'created_at' => $date->copy()->addHours(rand(1, 23)),
                    'updated_at' => $date->copy()->addHours(rand(1, 23)),
                ];
            }
            for ($s = 0; $s < $insertSmsCount; $s++) {
                $messages[] = [
                    'event_id' => $event->id,
                    'guest_id' => $guest->id,
                    'channel' => 'sms',
                    'recipient_phone' => '255700000000',
                    'message_body' => 'Test SMS',
                    'status' => 'delivered',
                    'created_at' => $date->copy()->addHours(rand(1, 23)),
                    'updated_at' => $date->copy()->addHours(rand(1, 23)),
                ];
            }
            foreach (array_chunk($messages, 500) as $chunk) {
                Message::insert($chunk);
            }

            $scans = [];
            for ($s = 0; $s < $insertScansCount; $s++) {
                $scans[] = [
                    'event_id' => $event->id,
                    'guest_id' => $guest->id,
                    'scanner_name' => 'Gate 1',
                    'gate_label' => 'Main Gate',
                    'status' => 'granted',
                    'scanned_at' => $date->copy()->addHours(rand(1, 23)),
                    'created_at' => $date->copy()->addHours(rand(1, 23)),
                    'updated_at' => $date->copy()->addHours(rand(1, 23)),
                ];
            }
            foreach (array_chunk($scans, 500) as $chunk) {
                ScanLog::insert($chunk);
            }
        }
    }
}
