<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;

class GuestImportService
{
    /**
     * Parse and import guests from an uploaded Excel file (.xlsx, .xls, .csv),
     * uploaded text file, or raw text input under strict acceptance conditions.
     *
     * @return array{
     *   imported: int,
     *   skipped: int,
     *   errors: array<string>,
     *   guests: array<Guest>
     * }
     */
    public function import(
        Event $event,
        ?UploadedFile $file = null,
        ?string $rawText = null,
        string $defaultCategory = 'Single Entry',
        int $defaultMaxEntries = 1
    ): array {
        $rows = [];
        $errors = [];

        if ($file && $file->isValid()) {
            $extension = strtolower($file->getClientOriginalExtension());
            $realPath = $file->getRealPath();

            if (in_array($extension, ['xlsx', 'xls', 'csv', 'txt', 'tsv'])) {
                try {
                    $spreadsheet = IOFactory::load($realPath);
                    $sheet = $spreadsheet->getActiveSheet();
                    $rawRows = $sheet->toArray(null, true, true, false);

                    foreach ($rawRows as $row) {
                        // Filter out completely empty arrays/rows
                        if (!empty(array_filter($row, fn($val) => $val !== null && trim((string)$val) !== ''))) {
                            $rows[] = array_map(fn($cell) => trim((string)$cell), $row);
                        }
                    }
                } catch (\Throwable $e) {
                    // Fallback to native CSV reader if PhpSpreadsheet throws on plain text
                    if (in_array($extension, ['csv', 'txt', 'tsv'])) {
                        $lines = file($realPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                        foreach ($lines as $line) {
                            $trimmed = trim($line);
                            if (!empty($trimmed)) {
                                $rows[] = str_getcsv($trimmed);
                            }
                        }
                    } else {
                        $errors[] = "Failed to parse Excel spreadsheet: " . $e->getMessage();
                        return ['imported' => 0, 'skipped' => 0, 'errors' => $errors, 'guests' => []];
                    }
                }
            } else {
                $errors[] = "Unsupported file format. Please upload an Excel spreadsheet (.xlsx, .xls) or CSV file.";
                return ['imported' => 0, 'skipped' => 0, 'errors' => $errors, 'guests' => []];
            }
        } elseif (!empty(trim((string)$rawText))) {
            $lines = explode("\n", (string)$rawText);
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (empty($trimmed)) {
                    continue;
                }
                // Check if tab-separated (copied directly from Excel) or comma-separated
                if (str_contains($trimmed, "\t")) {
                    $rows[] = array_map('trim', explode("\t", $trimmed));
                } else {
                    $rows[] = str_getcsv($trimmed);
                }
            }
        }

        if (empty($rows)) {
            $errors[] = "No valid data rows found in the uploaded file or text.";
            return ['imported' => 0, 'skipped' => 0, 'errors' => $errors, 'guests' => []];
        }

        // Detect header mapping
        $headerMap = $this->detectHeaderColumns($rows[0]);
        $hasHeader = !empty($headerMap['is_header']);

        if ($hasHeader) {
            array_shift($rows); // Remove header row from insertion queue
        }

        $imported = 0;
        $skipped = 0;
        $createdGuests = [];

        foreach ($rows as $rowIndex => $row) {
            $nameIdx = $headerMap['name'] ?? 0;
            $phoneIdx = $headerMap['phone'] ?? 1;
            $categoryIdx = $headerMap['category'] ?? 2;
            $maxEntriesIdx = $headerMap['max_entries'] ?? 3;
            $emailIdx = $headerMap['email'] ?? 4;
            $notesIdx = $headerMap['notes'] ?? 5;

            $name = trim((string)($row[$nameIdx] ?? ''));
            $rawPhone = trim((string)($row[$phoneIdx] ?? ''));
            $category = trim((string)($row[$categoryIdx] ?? ''));
            $maxEntriesRaw = trim((string)($row[$maxEntriesIdx] ?? ''));
            $email = trim((string)($row[$emailIdx] ?? ''));
            $notes = trim((string)($row[$notesIdx] ?? ''));

            // Acceptance Condition 1: Name must not be empty
            if (empty($name)) {
                $skipped++;
                continue;
            }

            // Acceptance Condition 2: Category and Allowance normalization
            if (empty($category)) {
                $category = $defaultCategory;
            }

            if (!empty($maxEntriesRaw) && is_numeric($maxEntriesRaw)) {
                $maxEntries = max(1, min(20, (int)$maxEntriesRaw));
            } else {
                $maxEntries = str_contains(strtolower($category), 'double') ? 2 : $defaultMaxEntries;
            }

            // Acceptance Condition 3: Phone number normalization (No +, no spaces, leading 0 to 255)
            if (empty($rawPhone)) {
                $phone = '2557' . rand(10, 89) . rand(100, 999) . rand(100, 999);
            } else {
                $phone = PhoneNormalizer::cleanForApi($rawPhone);
            }

            $guest = $event->guests()->create([
                'name' => $name,
                'phone' => $phone,
                'email' => !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null,
                'category' => $category,
                'max_entries' => $maxEntries,
                'entries_used' => 0,
                'delivery_status' => 'draft',
                'rsvp_status' => 'pending',
                'notes' => !empty($notes) ? $notes : null,
            ]);

            $createdGuests[] = $guest;
            $imported++;
        }

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
            'guests' => $createdGuests,
        ];
    }

    /**
     * Detect column indices based on header titles.
     *
     * @param array<string> $firstRow
     * @return array<string, int|bool>
     */
    private function detectHeaderColumns(array $firstRow): array
    {
        $map = [
            'is_header' => false,
            'name' => 0,
            'phone' => 1,
            'category' => 2,
            'max_entries' => 3,
            'email' => 4,
            'notes' => 5,
        ];

        $matchedHeaders = 0;

        foreach ($firstRow as $idx => $cell) {
            $val = strtolower(trim((string)$cell));

            if (preg_match('/^(guest\s*name|full\s*name|name|attendee|jina)$/i', $val)) {
                $map['name'] = $idx;
                $matchedHeaders++;
            } elseif (preg_match('/^(phone|mobile|whatsapp|tel|contact|namba|simu)$/i', $val)) {
                $map['phone'] = $idx;
                $matchedHeaders++;
            } elseif (preg_match('/^(category|ticket|type|pass|group|kitengo)$/i', $val)) {
                $map['category'] = $idx;
                $matchedHeaders++;
            } elseif (preg_match('/^(max\s*entries|entries|allowance|seats|pax|watu)$/i', $val)) {
                $map['max_entries'] = $idx;
                $matchedHeaders++;
            } elseif (preg_match('/^(email|e-mail|barua)$/i', $val)) {
                $map['email'] = $idx;
                $matchedHeaders++;
            } elseif (preg_match('/^(notes|remarks|maoni|table)$/i', $val)) {
                $map['notes'] = $idx;
                $matchedHeaders++;
            }
        }

        if ($matchedHeaders >= 1) {
            $map['is_header'] = true;
        }

        return $map;
    }
}

