<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\ScanLog;
use App\Services\GuestImportService;
use App\Services\PhoneNormalizer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GuestController extends Controller
{
    public function store(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        if (! $user->isAdmin() && ! $user->canImportGuests()) {
            return back()->with('error', 'Guest management permissions are disabled for your organizer account. Please contact administration.');
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'phone' => ['required', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'email' => 'nullable|email|max:255',
            'category' => 'required|string|max:100',
            'max_entries' => 'required|integer|min:1|max:20',
            'notes' => 'nullable|string|max:500',
        ], [
            'name.min' => 'Guest name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
            'max_entries.min' => 'Maximum entries must be at least 1.',
            'max_entries.max' => 'Maximum entries cannot exceed 20.',
        ]);

        $validated['phone'] = PhoneNormalizer::cleanForApi($validated['phone']);

        $guest = $event->guests()->create($validated);

        return back()->with('success', "Guest {$guest->name} added successfully!");
    }

    public function import(Request $request, Event $event, GuestImportService $importService)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        if (! $user->isAdmin() && ! $user->canImportGuests()) {
            return back()->with('error', 'Bulk guest importing permission is disabled for your organizer account. Please contact administration.');
        }

        $request->validate([
            'file' => 'nullable|file|mimes:xlsx,xls,csv,txt,tsv|max:10240',
            'raw_text' => 'nullable|string',
            'default_category' => 'nullable|string',
            'default_max_entries' => 'nullable|integer|min:1|max:20',
        ]);

        $defaultCategory = $request->input('default_category', 'Single Entry');
        $defaultMaxEntries = (int) $request->input('default_max_entries', 1);

        $result = $importService->import(
            $event,
            $request->file('file'),
            $request->input('raw_text'),
            $defaultCategory,
            $defaultMaxEntries
        );

        if (! empty($result['errors'])) {
            return back()->with('error', implode(' ', $result['errors']));
        }

        if ($result['imported'] === 0) {
            return back()->with('error', 'No valid guests could be imported. Please ensure your Excel/CSV file or text includes a Guest Name in each row.');
        }

        $msg = "Successfully imported {$result['imported']} attendee(s) into {$event->title}!";
        if ($result['skipped'] > 0) {
            $msg .= " ({$result['skipped']} empty row(s) skipped).";
        }

        return back()->with('success', $msg);
    }

    public function downloadSampleTemplate(Request $request)
    {
        $format = $request->input('format', 'xlsx');

        if ($format === 'csv') {
            $fileName = 'kardovo_guest_import_template.csv';
            $headers = [
                'Content-type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            $columns = ['Guest Name', 'Phone', 'Category', 'Max Entries'];
            $sampleRows = [
                ['Alfred Mashauri', '+255 754 123 456', 'VIP Pass', '2'],
                ['Neema Mbwana', '0712 345 678', 'Double Entry', '2'],
                ['Baraka Simba', '255765112233', 'Single Entry', '1'],
            ];

            $callback = function () use ($columns, $sampleRows) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);
                foreach ($sampleRows as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);
            };

            return new StreamedResponse($callback, 200, $headers);
        }

        // Generate .xlsx spreadsheet via PhpSpreadsheet
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Guest Import Template');

        $headers = ['Guest Name', 'Phone', 'Category', 'Max Entries'];
        $sheet->fromArray($headers, null, 'A1');

        // Style Header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '091322']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);

        $sampleData = [
            ['Alfred Mashauri', '+255 754 123 456', 'VIP Pass', 2],
            ['Neema Mbwana', '0712 345 678', 'Double Entry', 2],
            ['Baraka Simba', '255765112233', 'Single Entry', 1],
            ['Halima Juma', '0788 334 455', 'Double Entry', 2],
        ];
        $sheet->fromArray($sampleData, null, 'A2');

        // Auto-fit columns
        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'kardovo_guest_import_template.xlsx';
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function update(Request $request, Event $event, Guest $guest)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'phone' => ['required', 'string', 'max:25', 'regex:/^\+?[0-9\s\-().]{7,20}$/'],
            'email' => 'nullable|email|max:255',
            'category' => 'required|string|max:100',
            'max_entries' => 'required|integer|min:1|max:20',
            'delivery_status' => 'required|string|in:draft,sent,delivered,failed',
            'rsvp_status' => 'required|string|in:pending,attending,declined',
            'entries_used' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ], [
            'name.min' => 'Guest name must be at least 2 characters.',
            'phone.regex' => 'Please provide a valid phone number (e.g. +255 712 345 678).',
            'max_entries.min' => 'Maximum entries must be at least 1.',
            'max_entries.max' => 'Maximum entries cannot exceed 20.',
        ]);

        $validated['phone'] = PhoneNormalizer::cleanForApi($validated['phone']);

        $guest->update($validated);

        return back()->with('success', "Guest {$guest->name} updated successfully.");
    }

    public function destroy(Request $request, Event $event, Guest $guest)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        $name = $guest->name;
        $guest->delete();

        return back()->with('success', "Guest {$name} removed.");
    }

    public function clearAll(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403, 'Unauthorized to clear attendees for this event.');
        }

        if (! $user->isAdmin() && ! $user->canImportGuests()) {
            return back()->with('error', 'Guest management permissions are disabled for your account.');
        }

        $count = $event->guests()->count();
        if ($count === 0) {
            return back()->with('info', 'There are no guests to clear for this event.');
        }

        // Delete associated scan logs and messages for this event's guests
        ScanLog::where('event_id', $event->id)->delete();
        Message::where('event_id', $event->id)->delete();
        $event->guests()->delete();

        return back()->with('success', "All {$count} attendee(s) and their passes have been permanently cleared.");
    }

    public function exportCsv(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        if (! $user->isAdmin() && ! $user->canExportData()) {
            abort(403, 'Data export permissions are disabled for your organizer account. Please contact system administration.');
        }

        $guests = $event->guests()->orderBy('name')->get();
        $fileName = 'kardovo_guests_'.Str::slug($event->title).'_'.date('Y-m-d').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['Card Number', 'Unique Code', 'Guest Name', 'Phone', 'Email', 'Category', 'Max Entries', 'Entries Used', 'Delivery Status', 'RSVP Status', 'RSVP Date'];

        $callback = function () use ($guests, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($guests as $guest) {
                fputcsv($file, [
                    $guest->card_number,
                    $guest->unique_code,
                    $guest->name,
                    $guest->phone,
                    $guest->email ?? '',
                    $guest->category,
                    $guest->max_entries,
                    $guest->entries_used,
                    $guest->delivery_status,
                    $guest->rsvp_status,
                    $guest->rsvp_at ? $guest->rsvp_at->toDateTimeString() : '',
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    public function exportPdf(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        if (! $user->isAdmin() && ! $user->canExportData()) {
            abort(403, 'Data export permissions are disabled for your organizer account. Please contact system administration.');
        }

        $guests = $event->guests()->orderBy('name')->get();
        $event->load('user');

        $pdf = Pdf::loadView('pdf.guest_list', [
            'event' => $event,
            'guests' => $guests,
        ])->setPaper('a4', 'portrait');

        $fileName = 'kardovo_guests_'.Str::slug($event->title).'_'.date('Y-m-d').'.pdf';

        return $pdf->download($fileName);
    }
}
