<?php

namespace App\Services;

use App\Models\Guest;
use App\Models\Event;
use App\Models\CardTemplate;

class PassImageGeneratorService
{
    public static function generate(Guest $guest, ?CardTemplate $template = null, ?string $baseUrl = null): string
    {
        $event = $guest->event;
        $template = $template ?: ($event?->cardTemplate ?: CardTemplate::first());

        $outputDir = public_path('generated_passes');
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $token = $guest->qr_token ?: $guest->unique_code ?: ('guest_' . $guest->id);
        $fileName = 'pass_' . $token . '_' . time() . '.jpg';
        $outputPath = $outputDir . '/' . $fileName;

        // Clean up old pass files for this guest
        foreach (glob($outputDir . '/pass_' . $token . '_*.jpg') as $oldFile) {
            @unlink($oldFile);
        }
        foreach (glob($outputDir . '/pass_' . $token . '.jpg') as $oldFile) {
            @unlink($oldFile);
        }

        $w = 600;
        $h = 888;

        $im = imagecreatetruecolor($w, $h);
        imagealphablending($im, true);
        imagesavealpha($im, true);

        $fontGeorgia = '/System/Library/Fonts/Supplemental/Georgia.ttf';
        $fontGeorgiaBold = '/System/Library/Fonts/Supplemental/Georgia Bold.ttf';
        if (!file_exists($fontGeorgiaBold)) $fontGeorgiaBold = $fontGeorgia;

        $fontGeorgiaItalic = '/System/Library/Fonts/Supplemental/Georgia Italic.ttf';
        if (!file_exists($fontGeorgiaItalic)) $fontGeorgiaItalic = $fontGeorgia;

        $fontArial = '/System/Library/Fonts/Supplemental/Arial.ttf';
        $fontArialBold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
        if (!file_exists($fontArialBold)) $fontArialBold = $fontArial;

        $white = imagecolorallocate($im, 255, 255, 255);
        $black = imagecolorallocate($im, 10, 15, 25);
        $gold = imagecolorallocate($im, 253, 224, 71); // #FDE047 / amber-300
        $goldDark = imagecolorallocate($im, 245, 158, 11); // amber-500
        $grayText = imagecolorallocate($im, 226, 232, 240); // slate-200
        $graySub = imagecolorallocate($im, 203, 213, 225); // slate-300

        // 1. Draw Background Image
        $hasCustomArt = false;
        if ($template && !empty($template->image_path)) {
            $bgPath = public_path(ltrim($template->image_path, '/'));
            if (file_exists($bgPath)) {
                $ext = strtolower(pathinfo($bgPath, PATHINFO_EXTENSION));
                $bgIm = null;
                if ($ext === 'jpg' || $ext === 'jpeg') {
                    $bgIm = @imagecreatefromjpeg($bgPath);
                } elseif ($ext === 'png') {
                    $bgIm = @imagecreatefrompng($bgPath);
                } elseif ($ext === 'webp') {
                    $bgIm = @imagecreatefromwebp($bgPath);
                }

                if ($bgIm) {
                    imagecopyresampled($im, $bgIm, 0, 0, 0, 0, $w, $h, imagesx($bgIm), imagesy($bgIm));
                    imagedestroy($bgIm);
                    $hasCustomArt = true;
                }
            }
        }

        if (!$hasCustomArt) {
            for ($y = 0; $y < $h; $y++) {
                $ratio = $y / $h;
                $r = (int) (13 * (1 - $ratio) + 7 * $ratio);
                $g = (int) (27 * (1 - $ratio) + 17 * $ratio);
                $b = (int) (42 * (1 - $ratio) + 34 * $ratio);
                $lineColor = imagecolorallocate($im, $r, $g, $b);
                imageline($im, 0, $y, $w, $y, $lineColor);
            }
        }

        $cfg = $template?->elements_config ?: [];
        $templateName = strtolower($template?->name ?: '');
        $imagePath = strtolower($template?->image_path ?: '');

        $burgundy = imagecolorallocate($im, 122, 30, 40); // #7A1E28
        $burgundyDark = imagecolorallocate($im, 84, 16, 26); // #54101A

        $isPredefinedAdel = str_contains($templateName, 'adel') || str_contains($imagePath, 'adel_laila');
        $isPredefinedZamroth = str_contains($templateName, 'zamroth') || str_contains($imagePath, 'zamroth');

        $isEngagement = $isPredefinedAdel || (($template?->is_predefined ?? false) && ($cfg['theme'] ?? '') === 'engagement_burgundy');
        $isZamroth = $isPredefinedZamroth || (($template?->is_predefined ?? false) && in_array(($cfg['theme'] ?? ''), ['wedding_romantic', 'wedding_gold']));

        if ($isEngagement) {
            // ══════════════════════════════════════════════════════════════
            // THEME: ADEL & LAILA (Burgundy & Rose Gold on Light Cream)
            // ══════════════════════════════════════════════════════════════

            // 1. Top Badge Pill: "Engagement Invitation"
            $badgeText = $cfg['headline_text'] ?? 'Engagement Invitation';
            $badgeW = 270;
            $badgeH = 32;
            $badgeX = (int) (($w - $badgeW) / 2);
            $badgeY = 32;
            
            $pillBg = imagecolorallocatealpha($im, 255, 255, 255, 30); // 75% white
            $pillBorder = imagecolorallocatealpha($im, 122, 30, 40, 75); // burgundy border
            self::drawSmoothPill($im, $badgeX, $badgeY, $badgeW, $badgeH, $pillBg, $pillBorder);
            self::drawCenteredText($im, 12, 0, $badgeY + 22, $burgundy, $fontGeorgiaItalic, $badgeText, $w);

            // 2. Subtitle: "We invite your pleasure to come to our Engagement Party of"
            $subtitle = $cfg['subtitle_text'] ?? 'We invite your pleasure to come to our Engagement Party of';
            self::drawCenteredText($im, 9.5, 0, 96, $burgundy, $fontGeorgia, $subtitle, $w);

            // 3. Couple Names: "Adel & Laila"
            $coupleNames = $cfg['couple_names'] ?? 'Adel & Laila';
            self::drawCenteredText($im, 40, 0, 154, $burgundy, $fontGeorgiaItalic, $coupleNames, $w);

            // 4. Date Month & Year: "APRIL 2026"
            $dateMonth = $cfg['date_month'] ?? 'APRIL';
            $dateYear = $cfg['date_year'] ?? '2026';
            self::drawSpacedText($im, 10.5, 204, $burgundy, $fontArialBold, "{$dateMonth} {$dateYear}", $w, 4);

            // 5. Date Day Row Pill: "FRIDAY   26   8:30 PM"
            $dateDayName = $cfg['date_day_name'] ?? 'FRIDAY';
            $dateDayNum = $cfg['date_day_num'] ?? '26';
            $dateTime = $cfg['date_time'] ?? '8:30 PM';

            $dateBoxW = 260;
            $dateBoxH = 44;
            $dateBoxX = (int) (($w - $dateBoxW) / 2);
            $dateBoxY = 220;
            $dateBoxBg = imagecolorallocatealpha($im, 255, 255, 255, 35);
            $dateBoxBorder = imagecolorallocatealpha($im, 122, 30, 40, 85);
            self::drawSmoothPill($im, $dateBoxX, $dateBoxY, $dateBoxW, $dateBoxH, $dateBoxBg, $dateBoxBorder);

            // Inner Day Elements
            $boxL = imagettfbbox(10, 0, $fontArialBold, $dateDayName);
            $wL = abs($boxL[2] - $boxL[0]);
            $boxM = imagettfbbox(22, 0, $fontGeorgiaItalic, $dateDayNum);
            $wM = abs($boxM[2] - $boxM[0]);
            $boxR = imagettfbbox(10, 0, $fontArialBold, $dateTime);
            $wR = abs($boxR[2] - $boxR[0]);

            $gap = 18;
            $totalRowW = $wL + $gap + $wM + $gap + $wR;
            $curX = (int) (($w - $totalRowW) / 2);

            imagettftext($im, 10, 0, $curX, 248, $burgundy, $fontArialBold, $dateDayName);
            $curX += $wL + $gap;
            imagettftext($im, 22, 0, $curX, 252, $burgundy, $fontGeorgiaItalic, $dateDayNum);
            $curX += $wM + $gap;
            imagettftext($im, 10, 0, $curX, 248, $burgundy, $fontArialBold, $dateTime);

            // 6. Quote & Venue
            $quote = $cfg['invitation_quote'] ?? 'CELEBRATING LOVE & PROMISE';
            self::drawSpacedText($im, 8.5, 290, $burgundy, $fontArialBold, $quote, $w, 2);

            $venueName = $cfg['venue_name'] ?? 'DAR ES SALAAM SERENA HOTEL';
            $venueSub = $cfg['venue_sub'] ?? 'tanzania';
            $venueDate = $cfg['venue_date'] ?? '26.04.2026';
            $saveDate = $cfg['save_the_date'] ?? 'SAVE THE DATE';

            self::drawSpacedText($im, 9.5, 314, $burgundy, $fontArialBold, $venueName, $w, 3);
            self::drawCenteredText($im, 8.5, 0, 330, $burgundy, $fontArial, $venueSub, $w);
            self::drawSpacedText($im, 8.5, 346, $burgundy, $fontArialBold, $venueDate, $w, 2);
            self::drawSpacedText($im, 9, 366, $burgundy, $fontArialBold, $saveDate, $w, 4);

            // 7. Guest Plaque (Light Translucent Glass with Burgundy Border or Clean Text)
            $nameCfg = $cfg['guest_name'] ?? [];
            $hideNameBox = !empty($nameCfg['hide_plaque_box']) || !empty($nameCfg['hide_name_box']) || !empty($nameCfg['clean_text']) ||
                           (isset($nameCfg['clean_text']) && in_array($nameCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                           (isset($nameCfg['hide_plaque_box']) && in_array($nameCfg['hide_plaque_box'], [true, 1, '1', 'true'], true));
            $plaqueW = 440;
            $plaqueH = 70;
            $plaqueX = (int) (($w - $plaqueW) / 2);
            $nameYPercent = (float) ($nameCfg['y'] ?? 67.1);
            $plaqueY = isset($nameCfg['y']) ? (int) (($nameYPercent / 100) * $h) : 596;

            $guestName = mb_strtoupper($guest->name ?: 'VALUED GUEST');
            $nameSize = (float) ($nameCfg['fontSize'] ?? 20);
            if (mb_strlen($guestName) > 20) $nameSize = max(12, $nameSize * 0.85);
            if (mb_strlen($guestName) > 28) $nameSize = max(10, $nameSize * 0.7);

            if (!$hideNameBox) {
                $plaqueBg = imagecolorallocatealpha($im, 255, 255, 255, 20); // 85% white glass
                $plaqueBorder = imagecolorallocatealpha($im, 122, 30, 40, 75);
                self::drawSmoothPill($im, $plaqueX, $plaqueY, $plaqueW, $plaqueH, $plaqueBg, $plaqueBorder);
                self::drawSpacedText($im, 8, $plaqueY + 22, $burgundy, $fontArialBold, 'INVITATION PASS ISSUED TO', $w, 3);
                self::drawCenteredText($im, $nameSize, 0, $plaqueY + 52, $burgundyDark, $fontGeorgiaBold, $guestName, $w);
            } else {
                self::drawCenteredText($im, $nameSize, 0, $plaqueY + 30, $burgundyDark, $fontGeorgiaBold, $guestName, $w);
            }

            // 8. Allowance Badge (Clean pill in translucent white with Burgundy text or Clean Text)
            $allowCfg = $cfg['allowance_badge'] ?? [];
            $hideAllowanceBox = !empty($allowCfg['hide_badge_box']) || !empty($allowCfg['clean_text']) ||
                                (isset($allowCfg['clean_text']) && in_array($allowCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                                (isset($allowCfg['hide_badge_box']) && in_array($allowCfg['hide_badge_box'], [true, 1, '1', 'true'], true));
            $maxEntries = $guest->max_entries ?: 1;
            $allowanceText = $guest->category ? mb_strtoupper($guest->category) : ($maxEntries > 1 ? 'DOUBLE ENTRY' : 'SINGLE ENTRY');
            $allowYPercent = (float) ($allowCfg['y'] ?? 76.5);
            $allowBoxY = isset($allowCfg['y']) ? (int) (($allowYPercent / 100) * $h) : 680;
            $allowSize = (float) ($allowCfg['fontSize'] ?? 8.5);

            if (!$hideAllowanceBox) {
                $allowBoxW = 160;
                $allowBoxH = 26;
                $allowBoxX = (int) (($w - $allowBoxW) / 2);
                self::drawSmoothPill($im, $allowBoxX, $allowBoxY, $allowBoxW, $allowBoxH, $pillBg, $pillBorder);
                self::drawSpacedText($im, $allowSize, $allowBoxY + 17, $burgundy, $fontArialBold, $allowanceText, $w, 2);
            } else {
                self::drawSpacedText($im, $allowSize, $allowBoxY + 17, $burgundy, $fontArialBold, $allowanceText, $w, 2);
            }

            // 9. QR Code (Burgundy QR with clean built-in margin, zero pill border)
            $scanUrl = rtrim($baseUrl ?: url('/'), '/') . '/card/' . $token;
            $qrIm = QRCodeGenerator::renderToGdImage($scanUrl, 114, 2, 0x6B, 0x1D, 0x2F);
            if ($qrIm) {
                $qrW = imagesx($qrIm);
                $qrH = imagesy($qrIm);
                $qrX = (int) (($w - $qrW) / 2);
                $qrY = 718;

                imagecopy($im, $qrIm, $qrX, $qrY, 0, 0, $qrW, $qrH);
                imagedestroy($qrIm);
            }

            // 10. Unique Verification Code in Burgundy with a subtle pill
            $codeText = $guest->unique_code ?: $guest->card_number ?: ('KDV-' . $guest->id);
            $codeBoxW = 180;
            $codeBoxH = 24;
            $codeBoxX = (int) (($w - $codeBoxW) / 2);
            $codeBoxY = 852;
            self::drawSmoothPill($im, $codeBoxX, $codeBoxY, $codeBoxW, $codeBoxH, $pillBg, $pillBorder);
            self::drawSpacedText($im, 10, $codeBoxY + 16, $burgundy, $fontArialBold, $codeText, $w, 4);

        } elseif ($isZamroth) {
            // ══════════════════════════════════════════════════════════════
            // THEME: ZAMROTH & HUSNA (Romantic Gold on Dark Wedding Photo)
            // ══════════════════════════════════════════════════════════════

            // 1. Top Badge Pill: "WEDDING INVITATION"
            $badgeText = $cfg['headline_text'] ?? ($template?->headline ?: 'WEDDING INVITATION');
            $badgeW = 250;
            $badgeH = 28;
            $badgeX = (int) (($w - $badgeW) / 2);
            $badgeY = 32;
            
            $pillBg = imagecolorallocatealpha($im, 0, 0, 0, 75);
            $pillBorder = imagecolorallocatealpha($im, 255, 255, 255, 80);
            self::drawSmoothPill($im, $badgeX, $badgeY, $badgeW, $badgeH, $pillBg, $pillBorder);
            self::drawSpacedText($im, 9.5, $badgeY + 19, $white, $fontArialBold, mb_strtoupper($badgeText), $w, 3);

            // 2. Couple Names: "Zamroth & Husna"
            $coupleText = $cfg['couple_names'] ?? 'Zamroth & Husna';
            self::drawCenteredTextWithShadow($im, 38, 0, 126, $white, $fontGeorgiaItalic, $coupleText, $w);

            // 3. Date Month: "JANUARY"
            $dateMonth = $cfg['date_month'] ?? 'JANUARY';
            self::drawSpacedText($im, 10.5, 368, $white, $fontArialBold, $dateMonth, $w, 4);

            // 4. Day Row: "SUNDAY   4   AT 11:00 AM"
            $dateDayName = $cfg['date_day_name'] ?? 'SUNDAY';
            $dateDayNum = $cfg['date_day_num'] ?? '4';
            $dateTime = $cfg['date_time'] ?? 'AT 11:00 AM';

            $boxL = imagettfbbox(11, 0, $fontArialBold, $dateDayName);
            $wL = abs($boxL[2] - $boxL[0]);
            $boxM = imagettfbbox(20, 0, $fontGeorgiaItalic, $dateDayNum);
            $wM = abs($boxM[2] - $boxM[0]);
            $boxR = imagettfbbox(11, 0, $fontArialBold, $dateTime);
            $wR = abs($boxR[2] - $boxR[0]);

            $gap = 16;
            $totalRowW = $wL + $gap + $wM + $gap + $wR;
            $curX = (int) (($w - $totalRowW) / 2);
            
            imagettftext($im, 11, 0, $curX, 398, $white, $fontArialBold, $dateDayName);
            $curX += $wL + $gap;
            imagettftext($im, 20, 0, $curX, 400, $gold, $fontGeorgiaItalic, $dateDayNum);
            $curX += $wM + $gap;
            imagettftext($im, 11, 0, $curX, 398, $white, $fontArialBold, $dateTime);

            // 5. Date Year: "2026"
            $dateYear = $cfg['date_year'] ?? '2026';
            self::drawSpacedText($im, 11, 428, $white, $fontArialBold, $dateYear, $w, 4);

            // 6. Quote & Venue Lockup
            $quote = $cfg['invitation_quote'] ?? 'WE INVITE YOU TO WITNESS THE BEGINNING OF OUR FOREVER, TOGETHER WITH OUR FAMILIES.';
            $quoteLines = self::wrapText($quote, 44);
            $quoteY = 454;
            foreach ($quoteLines as $qLine) {
                self::drawCenteredText($im, 8.5, 0, $quoteY, $white, $fontArialBold, $qLine, $w);
                $quoteY += 16;
            }

            $venueName = $cfg['venue_name'] ?? 'ANGKORBAN';
            $venueSub = $cfg['venue_sub'] ?? 'kongmeah, kampongcham';
            $venueDate = $cfg['venue_date'] ?? '04.01.2026';
            $saveDate = $cfg['save_the_date'] ?? 'SAVE THE DATE';

            self::drawSpacedText($im, 9.5, $quoteY + 12, $gold, $fontArialBold, $venueName, $w, 3);
            self::drawCenteredText($im, 8.5, 0, $quoteY + 28, $graySub, $fontArial, $venueSub, $w);
            self::drawSpacedText($im, 8.5, $quoteY + 44, $graySub, $fontArialBold, $venueDate, $w, 2);
            self::drawSpacedText($im, 9, $quoteY + 62, $white, $fontArialBold, $saveDate, $w, 4);

            // 7. Guest Plaque (Dark Frosted Glass or Clean Text)
            $nameCfg = $cfg['guest_name'] ?? [];
            $hideNameBox = !empty($nameCfg['hide_plaque_box']) || !empty($nameCfg['hide_name_box']) || !empty($nameCfg['clean_text']) ||
                           (isset($nameCfg['clean_text']) && in_array($nameCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                           (isset($nameCfg['hide_plaque_box']) && in_array($nameCfg['hide_plaque_box'], [true, 1, '1', 'true'], true));
            $plaqueW = 440;
            $plaqueH = 70;
            $plaqueX = (int) (($w - $plaqueW) / 2);
            $nameYPercent = (float) ($nameCfg['y'] ?? 67.5);
            $plaqueY = isset($nameCfg['y']) ? (int) (($nameYPercent / 100) * $h) : 600;

            $guestName = mb_strtoupper($guest->name ?: 'VALUED GUEST');
            $nameSize = (float) ($nameCfg['fontSize'] ?? 21);
            if (mb_strlen($guestName) > 20) $nameSize = max(12, $nameSize * 0.85);
            if (mb_strlen($guestName) > 28) $nameSize = max(10, $nameSize * 0.7);

            if (!$hideNameBox) {
                $plaqueBg = imagecolorallocatealpha($im, 0, 0, 0, 60);
                $plaqueBorder = imagecolorallocatealpha($im, 255, 255, 255, 80);
                self::drawSmoothPill($im, $plaqueX, $plaqueY, $plaqueW, $plaqueH, $plaqueBg, $plaqueBorder);
                self::drawSpacedText($im, 8.5, $plaqueY + 22, imagecolorallocate($im, 226, 232, 240), $fontArialBold, 'INVITATION PASS ISSUED TO', $w, 3);
                self::drawCenteredText($im, $nameSize, 0, $plaqueY + 52, $white, $fontGeorgiaBold, $guestName, $w);
            } else {
                self::drawCenteredText($im, $nameSize, 0, $plaqueY + 30, $white, $fontGeorgiaBold, $guestName, $w);
            }

            // 8. Allowance Badge in Gold or Clean Text
            $allowCfg = $cfg['allowance_badge'] ?? [];
            $hideAllowanceBox = !empty($allowCfg['hide_badge_box']) || !empty($allowCfg['clean_text']) ||
                                (isset($allowCfg['clean_text']) && in_array($allowCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                                (isset($allowCfg['hide_badge_box']) && in_array($allowCfg['hide_badge_box'], [true, 1, '1', 'true'], true));
            $maxEntries = $guest->max_entries ?: 1;
            $allowanceText = $guest->category ? mb_strtoupper($guest->category) : ($maxEntries > 1 ? 'DOUBLE ENTRY' : 'SINGLE ENTRY');
            $allowYPercent = (float) ($allowCfg['y'] ?? 78.3);
            $allowY = isset($allowCfg['y']) ? (int) (($allowYPercent / 100) * $h) : 696;
            $allowSize = (float) ($allowCfg['fontSize'] ?? 9.5);
            self::drawSpacedText($im, $allowSize, $allowY, $gold, $fontArialBold, $allowanceText, $w, 3);

            // 9. QR Code (Clean High Contrast QR, zero pill border)
            $scanUrl = rtrim($baseUrl ?: url('/'), '/') . '/card/' . $token;
            $qrIm = QRCodeGenerator::renderToGdImage($scanUrl, 114, 2, 0x18, 0x15, 0x12);
            if ($qrIm) {
                $qrW = imagesx($qrIm);
                $qrH = imagesy($qrIm);
                $qrX = (int) (($w - $qrW) / 2);
                $qrY = 716;

                imagecopy($im, $qrIm, $qrX, $qrY, 0, 0, $qrW, $qrH);
                imagedestroy($qrIm);
            }

            // 10. Unique Verification Code in White Monospace
            $codeText = $guest->unique_code ?: $guest->card_number ?: ('KDV-' . $guest->id);
            self::drawSpacedText($im, 10.5, 862, $white, $fontArialBold, $codeText, $w, 4);

        } elseif ($hasCustomArt) {
            // ══════════════════════════════════════════════════════════════
            // THEME: DYNAMIC CUSTOM / IMPORTED ARTWORK TEMPLATES (e.g. adhd)
            // ══════════════════════════════════════════════════════════════
            $showHeadline = !empty($cfg['show_headline']) || !empty($cfg['show_category_badge']);
            $showCoupleNames = !empty($cfg['show_couple_names']) || !empty($cfg['show_title']);
            $showDate = !empty($cfg['show_date']) || !empty($cfg['show_date_details']);
            $showQuote = !empty($cfg['show_quote']);
            $showVenue = !empty($cfg['show_venue']);
            $showGuestName = ($cfg['show_guest_name'] ?? true);
            $showAllowance = ($cfg['show_allowance_badge'] ?? true);
            $showQr = ($template?->show_qr !== false && ($cfg['show_qr'] ?? true));
            $showCode = ($template?->show_unique_code !== false && ($cfg['show_unique_code'] ?? true));

            // 1. Headline / Top Tag Pill
            if ($showHeadline) {
                $badgeText = $cfg['headline_text'] ?? ($template?->headline ?: "YOU'RE INVITED");
                $badgeYPercent = (float) ($cfg['headline_y'] ?? $cfg['category_badge']['y'] ?? 5.5);
                $badgeY = (int) (($badgeYPercent / 100) * $h);
                $badgeW = 240;
                $badgeH = 28;
                $badgeX = (int) (($w - $badgeW) / 2);
                $pillBg = imagecolorallocatealpha($im, 0, 0, 0, 75);
                $pillBorder = imagecolorallocatealpha($im, 255, 255, 255, 80);
                self::drawSmoothPill($im, $badgeX, $badgeY, $badgeW, $badgeH, $pillBg, $pillBorder);
                $badgeColor = self::hexToGdColor($im, $cfg['category_badge']['color'] ?? '#FFFFFF');
                self::drawSpacedText($im, 9.5, $badgeY + 19, $badgeColor, $fontArialBold, mb_strtoupper($badgeText), $w, 3);
            }

            // 2. Couple Names
            if ($showCoupleNames && !empty($cfg['couple_names'])) {
                $coupleText = $cfg['couple_names'];
                $namesYPercent = (float) ($cfg['couple_names_y'] ?? 13.5);
                $namesY = (int) (($namesYPercent / 100) * $h);
                $namesSize = (float) ($cfg['couple_names_size'] ?? 36);
                $namesColor = self::hexToGdColor($im, $cfg['couple_names_color'] ?? '#FFFFFF');
                self::drawCenteredTextWithShadow($im, $namesSize, 0, $namesY, $namesColor, $fontGeorgiaItalic, $coupleText, $w);
            }

            // 3. Date & Schedule Lockup
            if ($showDate) {
                $dateYPercent = (float) ($cfg['date_y'] ?? 51.5);
                $dateY = (int) (($dateYPercent / 100) * $h);
                $dateSize = (float) ($cfg['date_size'] ?? 10.5);
                $dateColor = self::hexToGdColor($im, $cfg['date_color'] ?? '#FFFFFF');
                $dateNumColor = self::hexToGdColor($im, $cfg['date_num_color'] ?? '#FDE047');

                if (!empty($cfg['date_month'])) {
                    self::drawSpacedText($im, $dateSize, $dateY, $dateColor, $fontArialBold, mb_strtoupper($cfg['date_month']), $w, 4);
                }

                $dateDayName = $cfg['date_day_name'] ?? '';
                $dateDayNum = $cfg['date_day_num'] ?? '';
                $dateTime = $cfg['date_time'] ?? '';

                if ($dateDayName || $dateDayNum || $dateTime) {
                    $boxL = imagettfbbox($dateSize, 0, $fontArialBold, $dateDayName);
                    $wL = abs($boxL[2] - $boxL[0]);
                    $boxM = imagettfbbox($dateSize * 1.8, 0, $fontGeorgiaItalic, $dateDayNum);
                    $wM = abs($boxM[2] - $boxM[0]);
                    $boxR = imagettfbbox($dateSize, 0, $fontArialBold, $dateTime);
                    $wR = abs($boxR[2] - $boxR[0]);

                    $gap = 14;
                    $totalRowW = $wL + $gap + $wM + $gap + $wR;
                    $curX = (int) (($w - $totalRowW) / 2);
                    
                    if ($dateDayName) imagettftext($im, $dateSize, 0, $curX, $dateY + 28, $dateColor, $fontArialBold, $dateDayName);
                    $curX += $wL + $gap;
                    if ($dateDayNum) imagettftext($im, $dateSize * 1.8, 0, $curX, $dateY + 30, $dateNumColor, $fontGeorgiaItalic, $dateDayNum);
                    $curX += $wM + $gap;
                    if ($dateTime) imagettftext($im, $dateSize, 0, $curX, $dateY + 28, $dateColor, $fontArialBold, $dateTime);
                }

                if (!empty($cfg['date_year'])) {
                    self::drawSpacedText($im, $dateSize, $dateY + 54, $dateColor, $fontArialBold, $cfg['date_year'], $w, 4);
                }
            }

            // 4. Quote
            if ($showQuote && !empty($cfg['invitation_quote'])) {
                $quote = $cfg['invitation_quote'];
                $quoteSize = (float) ($cfg['quote_size'] ?? 8.5);
                $quoteColor = self::hexToGdColor($im, $cfg['quote_color'] ?? '#FFFFFF');
                $quoteLines = self::wrapText($quote, 44);
                $qy = 590;
                foreach ($quoteLines as $qLine) {
                    self::drawCenteredText($im, $quoteSize, 0, $qy, $quoteColor, $fontArialBold, $qLine, $w);
                    $qy += 16;
                }
            }

            // 5. Venue
            if ($showVenue && !empty($cfg['venue_name'])) {
                $venueName = $cfg['venue_name'];
                $venueColor = self::hexToGdColor($im, $cfg['custom_venue_color'] ?? '#FDE047');
                self::drawSpacedText($im, 9.5, 635, $venueColor, $fontArialBold, $venueName, $w, 3);
            }

            // 6. Guest Plaque
            if ($showGuestName) {
                $nameCfg = $cfg['guest_name'] ?? [];
                $nameYPercent = (float) ($nameCfg['y'] ?? 71.5);
                $nameXPercent = (float) ($nameCfg['x'] ?? 50);
                $plaqueY = (int) (($nameYPercent / 100) * $h);
                $plaqueCenterX = (int) (($nameXPercent / 100) * $w);
                $nameSize = (float) ($nameCfg['fontSize'] ?? 20);
                $nameColor = self::hexToGdColor($im, $nameCfg['color'] ?? '#FFFFFF');
                $hideBox = !empty($nameCfg['hide_plaque_box']) || !empty($nameCfg['hide_name_box']) || !empty($nameCfg['clean_text']) ||
                           (isset($nameCfg['clean_text']) && in_array($nameCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                           (isset($nameCfg['hide_plaque_box']) && in_array($nameCfg['hide_plaque_box'], [true, 1, '1', 'true'], true)) ||
                           (isset($nameCfg['hide_name_box']) && in_array($nameCfg['hide_name_box'], [true, 1, '1', 'true'], true));
                $guestName = mb_strtoupper($guest->name ?: 'VALUED GUEST');

                if (mb_strlen($guestName) > 20) $nameSize = max(12, $nameSize * 0.85);
                if (mb_strlen($guestName) > 28) $nameSize = max(10, $nameSize * 0.7);

                if (!$hideBox) {
                    $plaqueW = (int) ((($nameCfg['plaqueWidth'] ?? 84) / 100) * $w);
                    $plaqueH = 68;
                    $plaqueX = (int) ($plaqueCenterX - ($plaqueW / 2));
                    $plaqueBg = imagecolorallocatealpha($im, 0, 0, 0, 60);
                    $plaqueBorder = imagecolorallocatealpha($im, 255, 255, 255, 75);
                    self::drawSmoothPill($im, $plaqueX, $plaqueY - 34, $plaqueW, $plaqueH, $plaqueBg, $plaqueBorder);
                    self::drawCenteredText($im, $nameSize, 0, $plaqueY + 6, $nameColor, $fontGeorgiaBold, $guestName, $w);
                } else {
                    // Pure clean typography directly at the specified coordinate
                    self::drawCenteredText($im, $nameSize, 0, $plaqueY, $nameColor, $fontGeorgiaBold, $guestName, $w);
                }
            }

            // 7. Allowance Badge
            if ($showAllowance) {
                $allowCfg = $cfg['allowance_badge'] ?? [];
                $allowYPercent = (float) ($allowCfg['y'] ?? 78.5);
                $allowXPercent = (float) ($allowCfg['x'] ?? 50);
                $allowY = (int) (($allowYPercent / 100) * $h);
                $allowCenterX = (int) (($allowXPercent / 100) * $w);
                $allowSize = (float) ($allowCfg['fontSize'] ?? 9.5);
                $allowColor = self::hexToGdColor($im, $allowCfg['color'] ?? '#FDE047');
                $maxEntries = $guest->max_entries ?: 1;
                $allowanceText = $guest->category ? mb_strtoupper($guest->category) : ($maxEntries > 1 ? 'DOUBLE ENTRY' : 'SINGLE ENTRY');
                $hideBadgeBox = !empty($allowCfg['hide_badge_box']) || !empty($allowCfg['clean_text']) ||
                                (isset($allowCfg['clean_text']) && in_array($allowCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                                (isset($allowCfg['hide_badge_box']) && in_array($allowCfg['hide_badge_box'], [true, 1, '1', 'true'], true));

                if (!$hideBadgeBox) {
                    $allowBoxW = 160;
                    $allowBoxH = 26;
                    $allowBoxX = (int) ($allowCenterX - ($allowBoxW / 2));
                    $boxBg = imagecolorallocatealpha($im, 0, 0, 0, 65);
                    $boxBorder = imagecolorallocatealpha($im, 255, 255, 255, 60);
                    self::drawSmoothPill($im, $allowBoxX, $allowY - 13, $allowBoxW, $allowBoxH, $boxBg, $boxBorder);
                    self::drawSpacedText($im, $allowSize, $allowY + 4, $allowColor, $fontArialBold, $allowanceText, $w, 2);
                } else {
                    // Pure clean typography directly at the specified coordinate
                    self::drawSpacedText($im, $allowSize, $allowY, $allowColor, $fontArialBold, $allowanceText, $w, 2);
                }
            }

            // 8. QR Code (Clean Direct QR with Built-in Margin, zero pill border)
            if ($showQr) {
                $qrCfg = $cfg['qr_code'] ?? [];
                $qrYPercent = (float) ($qrCfg['y'] ?? 85.5);
                $qrXPercent = (float) ($qrCfg['x'] ?? 50);
                $qrY = (int) (($qrYPercent / 100) * $h);
                $qrX = (int) (($qrXPercent / 100) * $w);
                $qrSize = (int) ($qrCfg['size'] ?? 88);
                $darkColorHex = $qrCfg['darkColor'] ?? '#111827';
                list($dr, $dg, $db) = self::hexToRgb($darkColorHex);

                $scanUrl = rtrim($baseUrl ?: url('/'), '/') . '/card/' . $token;
                $qrIm = QRCodeGenerator::renderToGdImage($scanUrl, $qrSize, 2, $dr, $dg, $db);
                if ($qrIm) {
                    $qrW = imagesx($qrIm);
                    $qrH = imagesy($qrIm);
                    $drawX = (int) ($qrX - ($qrW / 2));
                    $drawY = (int) ($qrY - ($qrH / 2));

                    imagecopy($im, $qrIm, $drawX, $drawY, 0, 0, $qrW, $qrH);
                    imagedestroy($qrIm);
                }
            }

            // 9. Security Code
            if ($showCode) {
                $codeCfg = $cfg['card_number'] ?? [];
                $codeYPercent = (float) ($codeCfg['y'] ?? 96);
                $codeXPercent = (float) ($codeCfg['x'] ?? 50);
                $codeY = (int) (($codeYPercent / 100) * $h);
                $codeSize = (float) ($codeCfg['fontSize'] ?? 10);
                $codeColor = self::hexToGdColor($im, $codeCfg['color'] ?? '#FFFFFF');
                $codeText = $guest->unique_code ?: $guest->card_number ?: ('KDV-' . $guest->id);
                self::drawSpacedText($im, $codeSize, $codeY, $codeColor, $fontArialBold, $codeText, $w, 4);
            }
        } else {
            // ══════════════════════════════════════════════════════════════
            // THEME: KARDOVO SIGNATURE PASS (Gradient Background)
            // ══════════════════════════════════════════════════════════════
            $cyan = imagecolorallocate($im, 0, 163, 255); // #00A3FF
            $cyanBorder = imagecolorallocatealpha($im, 0, 136, 221, 75);
            $eventTitle = $event?->title ?: 'Exclusive Invitation Pass';
            $eventDateStr = $event?->event_date ? $event->event_date->format('l, d F Y') : 'Upcoming Event';
            $headline = $template?->headline ?: 'EXCLUSIVE INVITATION PASS';

            // 1. Logo & Top Verified Pass Pill
            self::drawSpacedText($im, 14, 52, $white, $fontArialBold, 'KARDOVO', 200, 3);
            self::drawSpacedText($im, 7.5, 68, $graySub, $fontArialBold, 'ACCESS & INVITATION', 200, 2);

            $badgeW = 150;
            $badgeH = 28;
            $badgeX = $w - $badgeW - 32;
            $badgeY = 42;
            $badgeBg = imagecolorallocatealpha($im, 0, 30, 60, 70);
            self::drawSmoothPill($im, $badgeX, $badgeY, $badgeW, $badgeH, $badgeBg, $cyanBorder);
            imagettftext($im, 8.5, 0, $badgeX + 16, $badgeY + 18, $cyan, $fontArialBold, 'VERIFIED PASS');

            // Header line
            $dividerColor = imagecolorallocatealpha($im, 26, 42, 62, 50);
            imageline($im, 32, 90, $w - 32, 90, $dividerColor);

            // 2. Headline & Event Title
            self::drawSpacedText($im, 10, 130, $cyan, $fontArialBold, mb_strtoupper($headline), $w, 2);
            $eventLines = self::wrapText($eventTitle, 28);
            $ey = 168;
            foreach ($eventLines as $eLine) {
                self::drawCenteredText($im, 20, 0, $ey, $white, $fontArialBold, $eLine, $w);
                $ey += 28;
            }

            // 3. Date Pill
            $datePillW = 320;
            $datePillH = 34;
            $datePillX = (int) (($w - $datePillW) / 2);
            $datePillY = $ey + 10;
            $datePillBg = imagecolorallocatealpha($im, 20, 32, 46, 60);
            self::drawSmoothPill($im, $datePillX, $datePillY, $datePillW, $datePillH, $datePillBg, $dividerColor);
            self::drawCenteredText($im, 10, 0, $datePillY + 22, $graySub, $fontArialBold, $eventDateStr, $w);

            // 4. Guest Plaque
            $plaqueW = 480;
            $plaqueH = 110;
            $plaqueX = (int) (($w - $plaqueW) / 2);
            $plaqueY = $datePillY + 54;
            $plaqueBg = imagecolorallocatealpha($im, 7, 13, 24, 40);
            self::drawSmoothPill($im, $plaqueX, $plaqueY, $plaqueW, $plaqueH, $plaqueBg, $dividerColor);

            self::drawSpacedText($im, 8.5, $plaqueY + 26, $cyan, $fontArialBold, 'INVITATION PASS ISSUED TO', $w, 3);
            
            $guestName = mb_strtoupper($guest->name ?: 'VALUED GUEST');
            $nameSize = 22;
            if (mb_strlen($guestName) > 20) $nameSize = 16;
            if (mb_strlen($guestName) > 28) $nameSize = 13;
            self::drawCenteredText($im, $nameSize, 0, $plaqueY + 62, $white, $fontGeorgiaBold, $guestName, $w);

            $allowanceText = $guest->allowance_label ?: ($guest->max_entries > 1 ? 'DOUBLE ENTRY' : 'SINGLE ENTRY');
            $allowPillW = 160;
            $allowPillH = 24;
            $allowPillX = (int) (($w - $allowPillW) / 2);
            $allowPillY = $plaqueY + 74;
            $allowPillBg = imagecolorallocatealpha($im, 10, 22, 38, 50);
            self::drawSmoothPill($im, $allowPillX, $allowPillY, $allowPillW, $allowPillH, $allowPillBg, $cyanBorder);
            self::drawSpacedText($im, 8.5, $allowPillY + 16, $cyan, $fontArialBold, mb_strtoupper($allowanceText), $w, 2);

            // 5. QR Code (Clean Direct QR, zero pill border)
            $scanUrl = rtrim($baseUrl ?: url('/'), '/') . '/card/' . $token;
            $qrIm = QRCodeGenerator::renderToGdImage($scanUrl, 140, 2, 15, 23, 42);
            if ($qrIm) {
                $qrW = imagesx($qrIm);
                $qrH = imagesy($qrIm);
                $qrX = (int) (($w - $qrW) / 2);
                $qrY = 570;

                imagecopy($im, $qrIm, $qrX, $qrY, 0, 0, $qrW, $qrH);
                imagedestroy($qrIm);
            }

            // 6. Unique Code
            self::drawSpacedText($im, 8, 760, $graySub, $fontArialBold, 'GATE VERIFICATION CODE', $w, 3);
            $codeText = $guest->unique_code ?: $guest->card_number ?: ('KDV-' . $guest->id);
            self::drawSpacedText($im, 16, 790, $white, $fontArialBold, $codeText, $w, 4);

            // Footer line & text
            imageline($im, 32, 830, $w - 32, 830, $dividerColor);
            $cardNumber = $guest->card_number ?: ('KDV-' . $guest->id);
            imagettftext($im, 8.5, 0, 36, 856, $graySub, $fontArial, $cardNumber);
            $footerR = 'Secured & verified by KARDOVO';
            $bboxR = imagettfbbox(8.5, 0, $fontArial, $footerR);
            $rw = abs($bboxR[2] - $bboxR[0]);
            imagettftext($im, 8.5, 0, $w - 36 - $rw, 856, $graySub, $fontArial, $footerR);
        }

        imagejpeg($im, $outputPath, 95);
        imagedestroy($im);

        return '/generated_passes/' . $fileName;
    }

    private static function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        if (strlen($hex) === 6) {
            return [
                hexdec(substr($hex, 0, 2)),
                hexdec(substr($hex, 2, 2)),
                hexdec(substr($hex, 4, 2)),
            ];
        }
        return [255, 255, 255];
    }

    private static function hexToGdColor(\GdImage $im, string $hex, int $alpha = 0): int
    {
        list($r, $g, $b) = self::hexToRgb($hex);
        if ($alpha > 0) {
            return imagecolorallocatealpha($im, $r, $g, $b, $alpha);
        }
        return imagecolorallocate($im, $r, $g, $b);
    }

    private static function drawCenteredText(\GdImage $im, float $size, float $angle, int $y, int $color, string $fontFile, string $text, int $canvasWidth): void
    {
        if (file_exists($fontFile)) {
            $bbox = imagettfbbox($size, $angle, $fontFile, $text);
            $textWidth = abs($bbox[2] - $bbox[0]);
            $x = (int) (($canvasWidth - $textWidth) / 2);
            imagettftext($im, $size, $angle, $x, $y, $color, $fontFile, $text);
        } else {
            $font = 5;
            $textWidth = imagefontwidth($font) * strlen($text);
            $x = (int) (($canvasWidth - $textWidth) / 2);
            imagestring($im, $font, $x, $y - 12, $text, $color);
        }
    }

    private static function drawCenteredTextWithShadow(\GdImage $im, float $size, float $angle, int $y, int $color, string $fontFile, string $text, int $canvasWidth): void
    {
        if (file_exists($fontFile)) {
            $bbox = imagettfbbox($size, $angle, $fontFile, $text);
            $textWidth = abs($bbox[2] - $bbox[0]);
            $x = (int) (($canvasWidth - $textWidth) / 2);
            $shadow = imagecolorallocatealpha($im, 0, 0, 0, 60);
            imagettftext($im, $size, $angle, $x + 1, $y + 2, $shadow, $fontFile, $text);
            imagettftext($im, $size, $angle, $x, $y, $color, $fontFile, $text);
        } else {
            self::drawCenteredText($im, $size, $angle, $y, $color, $fontFile, $text, $canvasWidth);
        }
    }

    private static function drawSpacedText(\GdImage $im, float $size, int $y, int $color, string $fontFile, string $text, int $canvasWidth, int $extraSpacing = 2): void
    {
        if (!file_exists($fontFile)) {
            self::drawCenteredText($im, $size, 0, $y, $color, $fontFile, $text, $canvasWidth);
            return;
        }

        $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
        $totalW = 0;
        $charWidths = [];

        foreach ($chars as $ch) {
            $box = imagettfbbox($size, 0, $fontFile, $ch);
            $cw = abs($box[2] - $box[0]);
            $charWidths[] = $cw;
            $totalW += $cw + $extraSpacing;
        }
        $totalW -= $extraSpacing;

        $curX = (int) (($canvasWidth - $totalW) / 2);
        foreach ($chars as $i => $ch) {
            imagettftext($im, $size, 0, $curX, $y, $color, $fontFile, $ch);
            $curX += $charWidths[$i] + $extraSpacing;
        }
    }

    private static function drawSmoothPill(\GdImage $im, int $x, int $y, int $w, int $h, int $fillColor, ?int $borderColor = null): void
    {
        $radius = (int) ($h / 2);
        $layer = imagecreatetruecolor($w, $h);
        imagealphablending($layer, false);
        imagesavealpha($layer, true);
        $transparent = imagecolorallocatealpha($layer, 0, 0, 0, 127);
        imagefilledrectangle($layer, 0, 0, $w, $h, $transparent);

        imagealphablending($layer, true);
        
        // Fill body
        imagefilledrectangle($layer, $radius, 0, $w - $radius - 1, $h - 1, $fillColor);
        imagefilledarc($layer, $radius, $radius, $radius * 2, $h, 90, 270, $fillColor, IMG_ARC_PIE);
        imagefilledarc($layer, $w - $radius - 1, $radius, $radius * 2, $h, 270, 90, $fillColor, IMG_ARC_PIE);

        // Clean border without cross-overs
        if ($borderColor !== null) {
            imageline($layer, $radius, 0, $w - $radius - 1, 0, $borderColor);
            imageline($layer, $radius, $h - 1, $w - $radius - 1, $h - 1, $borderColor);
            imagearc($layer, $radius, $radius, $radius * 2, $h, 90, 270, $borderColor);
            imagearc($layer, $w - $radius - 1, $radius, $radius * 2, $h, 270, 90, $borderColor);
        }

        imagecopy($im, $layer, $x, $y, 0, 0, $w, $h);
        imagedestroy($layer);
    }

    private static function wrapText(string $text, int $maxChars = 40): array
    {
        $words = explode(' ', $text);
        $lines = [];
        $currentLine = '';

        foreach ($words as $word) {
            if (mb_strlen($currentLine . ' ' . $word) <= $maxChars) {
                $currentLine = $currentLine ? ($currentLine . ' ' . $word) : $word;
            } else {
                if ($currentLine) $lines[] = $currentLine;
                $currentLine = $word;
            }
        }
        if ($currentLine) $lines[] = $currentLine;

        return $lines;
    }
}
