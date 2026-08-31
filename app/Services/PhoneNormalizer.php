<?php

namespace App\Services;

class PhoneNormalizer
{
    /**
     * Normalize a phone number for WhatsApp and SMS Gateway APIs.
     * Output format: Digits-only without leading '+' and without spaces/symbols.
     *
     * Examples:
     *   "+255 712 345 678"  -> "255712345678"
     *   "0712 345 678"      -> "255712345678"
     *   "00255 712 345 678" -> "255712345678"
     *   "+1 (555) 123-4567" -> "15551234567"
     *   "255712345678"      -> "255712345678"
     */
    public static function cleanForApi(?string $phone, string $defaultCountryCode = '255'): string
    {
        if (empty($phone)) {
            return '';
        }

        // 1. Remove all non-digit characters (spaces, +, -, (), dots, etc.)
        $digits = preg_replace('/[^0-9]/', '', $phone);

        if (empty($digits)) {
            return '';
        }

        // 2. Remove international dialing prefix (00)
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        // 3. If phone starts with local leading 0 (e.g. 07XXXXXXXX or 06XXXXXXXX), prepend country code
        if (str_starts_with($digits, '0')) {
            $digits = $defaultCountryCode . substr($digits, 1);
        }

        return $digits;
    }

    /**
     * Format phone for human display (e.g. +255 712 345 678).
     */
    public static function formatDisplay(?string $phone, string $defaultCountryCode = '255'): string
    {
        $clean = self::cleanForApi($phone, $defaultCountryCode);
        if (empty($clean)) {
            return '';
        }

        // If Tanzanian 12-digit number (255XXXXXXXXX)
        if (str_starts_with($clean, '255') && strlen($clean) === 12) {
            return '+255 ' . substr($clean, 3, 3) . ' ' . substr($clean, 6, 3) . ' ' . substr($clean, 9, 3);
        }

        return '+' . $clean;
    }
}

