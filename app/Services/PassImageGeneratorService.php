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

        $cfg = $template?->elements_config ?: [];
        $templateName = strtolower($template?->name ?: '');
        $imagePath = strtolower($template?->image_path ?: '');

        $isPredefinedAdel = str_contains($templateName, 'adel') || str_contains($imagePath, 'adel_laila');
        $isPredefinedZamroth = str_contains($templateName, 'zamroth') || str_contains($imagePath, 'zamroth');

        $isEngagement = $isPredefinedAdel || (($template?->is_predefined ?? false) && ($cfg['theme'] ?? '') === 'engagement_burgundy');
        $isZamroth = $isPredefinedZamroth || (($template?->is_predefined ?? false) && in_array(($cfg['theme'] ?? ''), ['wedding_romantic', 'wedding_gold']));

        // ── 1. Determine Aspect Ratio Number (Width / Height) ──
        $ratioNum = null;
        $configRatio = $cfg['aspect_ratio'] ?? null;
        if (is_numeric($configRatio) && (float)$configRatio > 0) {
            $ratioNum = (float)$configRatio;
        } elseif (is_string($configRatio) && trim($configRatio) !== '') {
            $cleaned = trim($configRatio);
            if (str_contains($cleaned, '/') || str_contains($cleaned, ':')) {
                $delimiter = str_contains($cleaned, '/') ? '/' : ':';
                $parts = array_map('trim', explode($delimiter, $cleaned));
                if (isset($parts[0], $parts[1]) && is_numeric($parts[0]) && is_numeric($parts[1]) && (float)$parts[1] > 0) {
                    $ratioNum = (float)$parts[0] / (float)$parts[1];
                }
            } elseif (is_numeric($cleaned)) {
                $ratioNum = (float)$cleaned;
            }
        }

        // Check if artwork file exists to read native aspect ratio if not explicitly specified
        $bgPath = ($template && !empty($template->image_path)) ? public_path(ltrim($template->image_path, '/')) : null;
        if (!$ratioNum && $bgPath && file_exists($bgPath)) {
            $imgInfo = @getimagesize($bgPath);
            if ($imgInfo && $imgInfo[0] > 0 && $imgInfo[1] > 0) {
                $ratioNum = (float)($imgInfo[0] / $imgInfo[1]);
            }
        }

        // Fallback to orientation / template defaults
        if (!$ratioNum || $ratioNum <= 0) {
            $orientation = $cfg['orientation'] ?? 'portrait';
            if ($orientation === 'landscape') {
                $ratioNum = 16 / 9; // 1.7778
            } elseif ($orientation === 'square') {
                $ratioNum = 1.0;
            } elseif ($isEngagement) {
                $ratioNum = 800 / 1184; // ~0.6757
            } else {
                $ratioNum = 800 / 1200; // 0.6667 (2:3)
            }
        }

        // ── 2. Resolution Tiering (Full HD 1080p, 2K QHD, 4K UHD) ──
        $resTier = strtolower($cfg['resolution_tier'] ?? '1080p');

        if ($ratioNum >= 1.15) {
            // Landscape Mode (16:9, 3:2, 4:3)
            if ($resTier === '4k') {
                $h = 2160;
                $w = (int) round($h * $ratioNum);
            } elseif ($resTier === '2k') {
                $h = 1440;
                $w = (int) round($h * $ratioNum);
            } else {
                // Full HD 1080p: 1920x1080 for 16:9, 1920x1280 for 3:2
                $h = 1080;
                $w = (int) round($h * $ratioNum);
            }
        } elseif ($ratioNum >= 0.9 && $ratioNum < 1.15) {
            // Square Mode (1:1)
            if ($resTier === '4k') {
                $w = 2160;
                $h = 2160;
            } elseif ($resTier === '2k') {
                $w = 1440;
                $h = 1440;
            } else {
                // Full HD 1080p: 1080x1080
                $w = 1080;
                $h = 1080;
            }
        } else {
            // Portrait Mode (9:16, 2:3, 3:4)
            if ($resTier === '4k') {
                $w = 2160;
                $h = (int) round($w / $ratioNum);
            } elseif ($resTier === '2k') {
                $w = 1440;
                $h = (int) round($w / $ratioNum);
            } else {
                // Full HD 1080p: 1080x1920 for 9:16 story, 1080x1620 for 2:3
                $w = 1080;
                $h = (int) round($w / $ratioNum);
            }
        }

        // Ensure minimum dimensions
        $w = max(400, $w);
        $h = max(400, $h);

        // Reference width in the Studio inspector is 410px
        $baseW = 410.0;
        $fontScale = $w / $baseW;

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
        $burgundy = imagecolorallocate($im, 122, 30, 40); // #7A1E28
        $burgundyDark = imagecolorallocate($im, 84, 16, 26); // #54101A

        // ── 3. Draw Background Artwork or Gradient ──
        $hasCustomArt = false;
        if ($bgPath && file_exists($bgPath)) {
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

        $templateType = $template?->template_type ?: ($hasCustomArt ? 'custom_art' : 'gradient_card');

        if ($templateType === 'custom_art' || $hasCustomArt) {
            // ══════════════════════════════════════════════════════════════
            // DYNAMIC CUSTOM ARTWORK PASS (Exact WYSIWYG Percentage Layout)
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

            // In predefined templates, default layers to active
            if ($isEngagement || $isZamroth) {
                $showHeadline = ($template?->show_category_badge !== false);
                $showCoupleNames = true;
                $showDate = true;
                $showQuote = ($cfg['show_quote'] ?? true);
                $showVenue = ($cfg['show_venue'] ?? true);
            }

            // 1. Top Headline / Badge Pill
            if ($showHeadline) {
                $badgeText = $cfg['headline_text'] ?? ($template?->headline ?: ($isEngagement ? 'Engagement Invitation' : "WEDDING INVITATION"));
                $badgeYPercent = (float) ($cfg['headline_y'] ?? $cfg['category_badge']['y'] ?? 5.5);
                $badgeY = (int) round(($badgeYPercent / 100) * $h);
                $badgeW = (int) round(min($w - 40, 250 * $fontScale));
                $badgeH = (int) round(30 * $fontScale);
                $badgeX = (int) (($w - $badgeW) / 2);
                $badgeFontSize = (float) ($cfg['category_badge']['fontSize'] ?? 10.5) * $fontScale;
                
                if ($isEngagement) {
                    $pillBg = imagecolorallocatealpha($im, 255, 255, 255, 30);
                    $pillBorder = imagecolorallocatealpha($im, 122, 30, 40, 75);
                    self::drawSmoothPill($im, $badgeX, (int)($badgeY - ($badgeH / 2)), $badgeW, $badgeH, $pillBg, $pillBorder);
                    self::drawCenteredText($im, $badgeFontSize, 0, (int)($badgeY + ($badgeH * 0.18)), $burgundy, $fontGeorgiaItalic, $badgeText, $w);
                } else {
                    $pillBg = imagecolorallocatealpha($im, 0, 0, 0, 75);
                    $pillBorder = imagecolorallocatealpha($im, 255, 255, 255, 80);
                    self::drawSmoothPill($im, $badgeX, (int)($badgeY - ($badgeH / 2)), $badgeW, $badgeH, $pillBg, $pillBorder);
                    $badgeColor = self::hexToGdColor($im, $cfg['category_badge']['color'] ?? '#FFFFFF');
                    self::drawSpacedText($im, $badgeFontSize, (int)($badgeY + ($badgeH * 0.18)), $badgeColor, $fontArialBold, mb_strtoupper($badgeText), $w, (int) max(2, 3 * $fontScale));
                }
            }

            // 2. Couple Names / Header Title
            if ($showCoupleNames) {
                $coupleText = $cfg['couple_names'] ?? ($isEngagement ? 'Adel & Laila' : 'Zamroth & Husna');
                $namesYPercent = (float) ($cfg['couple_names_y'] ?? 13.5);
                $namesY = (int) round(($namesYPercent / 100) * $h);
                $namesSize = (float) ($cfg['couple_names_size'] ?? 40) * $fontScale;
                $namesColor = self::hexToGdColor($im, $cfg['couple_names_color'] ?? ($isEngagement ? '#7A1E28' : '#FFFFFF'));

                if (!empty($cfg['subtitle_text']) && ($isEngagement || !empty($cfg['show_subtitle']))) {
                    $subText = $cfg['subtitle_text'];
                    $subSize = (float) ($cfg['subtitle_size'] ?? 9.5) * $fontScale;
                    $subColor = self::hexToGdColor($im, $cfg['subtitle_color'] ?? ($isEngagement ? '#7A1E28' : '#FFFFFF'));
                    self::drawCenteredText($im, $subSize, 0, (int)($namesY - (36 * $fontScale)), $subColor, $fontGeorgia, $subText, $w);
                }

                self::drawCenteredTextWithShadow($im, $namesSize, 0, $namesY, $namesColor, $fontGeorgiaItalic, $coupleText, $w);
            }

            // 3. Date & Schedule Details (Organized in one clean vertical sequence starting at date_y)
            if ($showDate) {
                $dateYPercent = (float) ($cfg['date_y'] ?? 46.0);
                $dateY = (int) round(($dateYPercent / 100) * $h);
                $dateSize = (float) ($cfg['date_size'] ?? 10.5) * $fontScale;
                $dateColor = self::hexToGdColor($im, $cfg['date_color'] ?? ($isEngagement ? '#7A1E28' : '#FFFFFF'));
                $dateNumColor = self::hexToGdColor($im, $cfg['date_num_color'] ?? ($isEngagement ? '#7A1E28' : '#FDE047'));

                $dateMonth = $cfg['date_month'] ?? ($isEngagement ? 'APRIL' : 'JANUARY');
                $dateDayName = $cfg['date_day_name'] ?? ($isEngagement ? 'FRIDAY' : 'SUNDAY');
                $dateDayNum = $cfg['date_day_num'] ?? ($isEngagement ? '26' : '4');
                $dateTime = $cfg['date_time'] ?? ($isEngagement ? '8:30 PM' : 'AT 10:00 AM');
                $dateYear = $cfg['date_year'] ?? '2026';

                // Month
                self::drawSpacedText($im, $dateSize, $dateY, $dateColor, $fontArialBold, mb_strtoupper($dateMonth), $w, (int) max(2, 4 * $fontScale));

                // Day Row
                $boxL = imagettfbbox($dateSize * 1.05, 0, $fontArialBold, $dateDayName);
                $wL = abs($boxL[2] - $boxL[0]);
                $boxM = imagettfbbox($dateSize * 1.8, 0, $fontGeorgiaItalic, $dateDayNum);
                $wM = abs($boxM[2] - $boxM[0]);
                $boxR = imagettfbbox($dateSize * 1.05, 0, $fontArialBold, $dateTime);
                $wR = abs($boxR[2] - $boxR[0]);

                $gap = (int) round(14 * $fontScale);
                $totalRowW = $wL + $gap + $wM + $gap + $wR;
                $curX = (int) (($w - $totalRowW) / 2);
                $dayRowY = (int) ($dateY + (24 * $fontScale));

                if ($isEngagement) {
                    $dateBoxW = (int) min($w - 40, $totalRowW + (36 * $fontScale));
                    $dateBoxH = (int) round(40 * $fontScale);
                    $dateBoxX = (int) (($w - $dateBoxW) / 2);
                    $dateBoxBg = imagecolorallocatealpha($im, 255, 255, 255, 35);
                    $dateBoxBorder = imagecolorallocatealpha($im, 122, 30, 40, 85);
                    self::drawSmoothPill($im, $dateBoxX, (int)($dayRowY - (26 * $fontScale)), $dateBoxW, $dateBoxH, $dateBoxBg, $dateBoxBorder);
                }

                imagettftext($im, $dateSize * 1.05, 0, $curX, $dayRowY, $dateColor, $fontArialBold, $dateDayName);
                $curX += $wL + $gap;
                imagettftext($im, $dateSize * 1.8, 0, $curX, (int)($dayRowY + (2 * $fontScale)), $dateNumColor, $fontGeorgiaItalic, $dateDayNum);
                $curX += $wM + $gap;
                imagettftext($im, $dateSize * 1.05, 0, $curX, $dayRowY, $dateColor, $fontArialBold, $dateTime);

                // Year
                $curBlockY = (int) ($dateY + (48 * $fontScale));
                self::drawSpacedText($im, $dateSize, $curBlockY, $dateColor, $fontArialBold, $dateYear, $w, (int) max(2, 4 * $fontScale));

                // Quote
                if ($showQuote) {
                    $quote = $cfg['invitation_quote'] ?? ($isEngagement ? 'CELEBRATING LOVE & PROMISE' : 'WE INVITE YOU TO WITNESS THE BEGINNING OF OUR FOREVER, TOGETHER WITH OUR FAMILIES.');
                    $quoteSize = (float) ($cfg['quote_size'] ?? 8.5) * $fontScale;
                    $quoteColor = self::hexToGdColor($im, $cfg['quote_color'] ?? ($isEngagement ? '#7A1E28' : '#FFFFFF'));
                    $quoteLines = self::wrapText($quote, (int) max(26, 38 * ($w / 1080)));
                    $curBlockY += (int) (22 * $fontScale);
                    $lineSpacing = (int) max(12, 16 * $fontScale);
                    foreach ($quoteLines as $qLine) {
                        self::drawCenteredText($im, $quoteSize, 0, $curBlockY, $quoteColor, $fontArialBold, $qLine, $w);
                        $curBlockY += $lineSpacing;
                    }
                }

                // Venue
                if ($showVenue) {
                    $venueName = $cfg['venue_name'] ?? ($isEngagement ? 'DAR ES SALAAM SERENA HOTEL' : 'ANGKORBAN');
                    $venueSub = $cfg['venue_sub'] ?? ($isEngagement ? 'tanzania' : 'kongmeah, kampongcham');
                    $venueDate = $cfg['venue_date'] ?? ($isEngagement ? '26.04.2026' : '04.01.2026');
                    $saveDate = $cfg['save_the_date'] ?? 'SAVE THE DATE';
                    $venueColor = self::hexToGdColor($im, $cfg['custom_venue_color'] ?? ($isEngagement ? '#7A1E28' : '#FDE047'));
                    
                    $curBlockY += (int) (14 * $fontScale);
                    self::drawSpacedText($im, 9.0 * $fontScale, $curBlockY, $venueColor, $fontArialBold, mb_strtoupper($venueName), $w, (int) max(2, 3 * $fontScale));
                    if ($venueSub) {
                        $curBlockY += (int) (14 * $fontScale);
                        self::drawCenteredText($im, 8.0 * $fontScale, 0, $curBlockY, $graySub, $fontArial, $venueSub, $w);
                    }
                    if ($venueDate) {
                        $curBlockY += (int) (14 * $fontScale);
                        self::drawSpacedText($im, 8.0 * $fontScale, $curBlockY, $graySub, $fontArialBold, $venueDate, $w, (int) max(1, 2 * $fontScale));
                    }
                    if ($saveDate) {
                        $curBlockY += (int) (16 * $fontScale);
                        self::drawSpacedText($im, 8.5 * $fontScale, $curBlockY, $white, $fontArialBold, mb_strtoupper($saveDate), $w, (int) max(2, 4 * $fontScale));
                    }
                }
            }

            // 4. Guest Plaque (Clean Typography or Glass Plaque at ~71.5%)
            if ($showGuestName) {
                $nameCfg = $cfg['guest_name'] ?? [];
                $nameYPercent = (float) ($nameCfg['y'] ?? 71.5);
                $nameXPercent = (float) ($nameCfg['x'] ?? 50.0);
                $plaqueY = (int) round(($nameYPercent / 100) * $h);
                $plaqueCenterX = (int) round(($nameXPercent / 100) * $w);
                $nameSize = (float) ($nameCfg['fontSize'] ?? ($isEngagement ? 18 : 22)) * $fontScale;
                $nameColor = self::hexToGdColor($im, $nameCfg['color'] ?? ($isEngagement ? '#54101A' : '#FFFFFF'));

                $hideBox = !empty($nameCfg['hide_plaque_box']) || !empty($nameCfg['hide_name_box']) || !empty($nameCfg['clean_text']) ||
                           (isset($nameCfg['clean_text']) && in_array($nameCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                           (isset($nameCfg['hide_plaque_box']) && in_array($nameCfg['hide_plaque_box'], [true, 1, '1', 'true'], true)) ||
                           (isset($nameCfg['hide_name_box']) && in_array($nameCfg['hide_name_box'], [true, 1, '1', 'true'], true));

                $guestName = mb_strtoupper($guest->name ?: 'VALUED GUEST');
                if (mb_strlen($guestName) > 20) $nameSize = max(12 * $fontScale, $nameSize * 0.85);
                if (mb_strlen($guestName) > 28) $nameSize = max(10 * $fontScale, $nameSize * 0.7);

                if (!$hideBox) {
                    $plaqueW = (int) round(((($nameCfg['plaqueWidth'] ?? 84) / 100) * $w));
                    $plaqueH = (int) round(68 * $fontScale);
                    $plaqueX = (int) ($plaqueCenterX - ($plaqueW / 2));
                    
                    if ($isEngagement) {
                        $plaqueBg = imagecolorallocatealpha($im, 255, 255, 255, 20);
                        $plaqueBorder = imagecolorallocatealpha($im, 122, 30, 40, 75);
                    } else {
                        $plaqueBg = imagecolorallocatealpha($im, 0, 0, 0, 60);
                        $plaqueBorder = imagecolorallocatealpha($im, 255, 255, 255, 75);
                    }

                    self::drawSmoothPill($im, $plaqueX, (int)($plaqueY - ($plaqueH / 2)), $plaqueW, $plaqueH, $plaqueBg, $plaqueBorder);
                    self::drawSpacedText($im, 8 * $fontScale, (int)($plaqueY - ($plaqueH * 0.15)), $isEngagement ? $burgundy : $graySub, $fontArialBold, 'INVITATION PASS ISSUED TO', $w, (int) max(2, 3 * $fontScale));
                    self::drawCenteredText($im, $nameSize, 0, (int)($plaqueY + ($plaqueH * 0.28)), $isEngagement ? $burgundyDark : $nameColor, $fontGeorgiaBold, $guestName, $w);
                } else {
                    // Pure clean typography directly at the specified percentage coordinate
                    self::drawCenteredText($im, $nameSize, 0, $plaqueY, $isEngagement ? $burgundyDark : $nameColor, $fontGeorgiaBold, $guestName, $w);
                }
            }

            // 5. Allowance Badge (Positioned at ~78.5%)
            $allowBottom = 0;
            if ($showAllowance) {
                $allowCfg = $cfg['allowance_badge'] ?? [];
                $allowYPercent = (float) ($allowCfg['y'] ?? ($ratioNum <= 0.62 ? 77.0 : 78.5));
                $allowXPercent = (float) ($allowCfg['x'] ?? 50.0);
                $allowY = (int) round(($allowYPercent / 100) * $h);
                $allowCenterX = (int) round(($allowXPercent / 100) * $w);
                $allowSize = (float) ($allowCfg['fontSize'] ?? 9.5) * $fontScale;
                $allowColor = self::hexToGdColor($im, $allowCfg['color'] ?? ($isEngagement ? '#7A1E28' : '#FDE047'));
                $maxEntries = $guest->max_entries ?: 1;
                $allowanceText = $guest->category ? mb_strtoupper($guest->category) : ($maxEntries > 1 ? 'DOUBLE ENTRY' : 'SINGLE ENTRY');

                $hideBadgeBox = !empty($allowCfg['hide_badge_box']) || !empty($allowCfg['clean_text']) ||
                                (isset($allowCfg['clean_text']) && in_array($allowCfg['clean_text'], [true, 1, '1', 'true'], true)) ||
                                (isset($allowCfg['hide_badge_box']) && in_array($allowCfg['hide_badge_box'], [true, 1, '1', 'true'], true));

                if (!$hideBadgeBox) {
                    $allowBoxW = (int) min($w - 40, round(160 * $fontScale));
                    $allowBoxH = (int) round(28 * $fontScale);
                    $allowBoxX = (int) ($allowCenterX - ($allowBoxW / 2));
                    $allowBottom = $allowY + (int)($allowBoxH / 2);
                    
                    if ($isEngagement) {
                        $boxBg = imagecolorallocatealpha($im, 255, 255, 255, 30);
                        $boxBorder = imagecolorallocatealpha($im, 122, 30, 40, 75);
                    } else {
                        $boxBg = imagecolorallocatealpha($im, 0, 0, 0, 65);
                        $boxBorder = imagecolorallocatealpha($im, 255, 255, 255, 60);
                    }

                    self::drawSmoothPill($im, $allowBoxX, (int)($allowY - ($allowBoxH / 2)), $allowBoxW, $allowBoxH, $boxBg, $boxBorder);
                    self::drawSpacedText($im, $allowSize, (int)($allowY + ($allowBoxH * 0.2)), $allowColor, $fontArialBold, $allowanceText, $w, (int) max(1, 2 * $fontScale));
                } else {
                    $allowBottom = $allowY + (int)(10 * $fontScale);
                    self::drawSpacedTextWithShadow($im, $allowSize, $allowY, $allowColor, $fontArialBold, $allowanceText, $w, (int) max(1, 2 * $fontScale));
                }
            }

            // 6. QR Code Pass (Positioned safely above code and footer)
            $qrBottom = 0;
            if ($showQr) {
                $qrCfg = $cfg['qr_code'] ?? [];
                $rawQrSize = (float) ($qrCfg['size'] ?? 72);
                $qrSize = (int) round($rawQrSize * $fontScale);
                $qrYPercent = (float) ($qrCfg['y'] ?? ($ratioNum <= 0.62 ? 84.5 : 86.5));
                if ($ratioNum <= 0.62 && $qrYPercent > 86.0) {
                    $qrYPercent = 84.5;
                }
                $qrXPercent = (float) ($qrCfg['x'] ?? 50.0);
                $qrY = (int) round(($qrYPercent / 100) * $h);
                if ($allowBottom > 0 && ($qrY - ($qrSize / 2)) < ($allowBottom + (int)(12 * $fontScale))) {
                    $qrY = $allowBottom + (int)($qrSize / 2) + (int)(14 * $fontScale);
                }
                $qrX = (int) round(($qrXPercent / 100) * $w);

                $darkColorHex = $qrCfg['darkColor'] ?? ($isEngagement ? '#6B1D2F' : '#111827');
                list($dr, $dg, $db) = self::hexToRgb($darkColorHex);

                $scanUrl = rtrim($baseUrl ?: url('/'), '/') . '/card/' . $token;
                $qrIm = QRCodeGenerator::renderToGdImage($scanUrl, $qrSize, 2, $dr, $dg, $db);
                if ($qrIm) {
                    $qrW = imagesx($qrIm);
                    $qrH = imagesy($qrIm);
                    $drawX = (int) ($qrX - ($qrW / 2));
                    $drawY = (int) ($qrY - ($qrH / 2));
                    $qrBottom = $drawY + $qrH;

                    imagecopy($im, $qrIm, $drawX, $drawY, 0, 0, $qrW, $qrH);
                    imagedestroy($qrIm);
                }
            }

            // 7. Security Verification Code (Positioned safely within canvas bounds and below QR)
            if ($showCode) {
                $codeCfg = $cfg['card_number'] ?? [];
                $defaultCodeY = ($ratioNum <= 0.62) ? 94.0 : 95.0;
                $codeYPercent = (float) ($codeCfg['y'] ?? $defaultCodeY);
                if ($codeYPercent > 95.0) {
                    $codeYPercent = 94.5;
                }
                $codeXPercent = (float) ($codeCfg['x'] ?? 50.0);
                $codeY = (int) round(($codeYPercent / 100) * $h);
                // Guarantee code is below the QR code with adequate padding
                if ($qrBottom > 0 && $codeY < ($qrBottom + (int)(16 * $fontScale))) {
                    $codeY = $qrBottom + (int)(22 * $fontScale);
                }
                // Guarantee code stays within canvas bounds
                if ($codeY > ($h - (int)(14 * $fontScale))) {
                    $codeY = $h - (int)(18 * $fontScale);
                }
                $codeSize = (float) ($codeCfg['fontSize'] ?? 10) * $fontScale;
                $codeColor = self::hexToGdColor($im, $codeCfg['color'] ?? ($isEngagement ? '#7A1E28' : '#FFFFFF'));
                $codeText = $guest->unique_code ?: $guest->card_number ?: ('KDV-' . $guest->id);
                self::drawSpacedTextWithShadow($im, $codeSize, $codeY, $codeColor, $fontArialBold, $codeText, $w, (int) max(2, 4 * $fontScale));
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
            self::drawSpacedText($im, 14 * $fontScale, (int)(60 * $fontScale), $white, $fontArialBold, 'KARDOVO', (int)(200 * $fontScale), (int)(3 * $fontScale));
            self::drawSpacedText($im, 7.5 * $fontScale, (int)(78 * $fontScale), $graySub, $fontArialBold, 'ACCESS & INVITATION', (int)(200 * $fontScale), (int)(2 * $fontScale));

            $badgeW = (int)(150 * $fontScale);
            $badgeH = (int)(32 * $fontScale);
            $badgeX = $w - $badgeW - (int)(32 * $fontScale);
            $badgeY = (int)(50 * $fontScale);
            $badgeBg = imagecolorallocatealpha($im, 0, 30, 60, 70);
            self::drawSmoothPill($im, $badgeX, $badgeY, $badgeW, $badgeH, $badgeBg, $cyanBorder);
            imagettftext($im, 8.5 * $fontScale, 0, $badgeX + (int)(16 * $fontScale), $badgeY + (int)(20 * $fontScale), $cyan, $fontArialBold, 'VERIFIED PASS');

            // Header line
            $dividerColor = imagecolorallocatealpha($im, 26, 42, 62, 50);
            imageline($im, (int)(32 * $fontScale), (int)(100 * $fontScale), $w - (int)(32 * $fontScale), (int)(100 * $fontScale), $dividerColor);

            // 2. Headline & Event Title
            self::drawSpacedText($im, 10 * $fontScale, (int)(140 * $fontScale), $cyan, $fontArialBold, mb_strtoupper($headline), $w, (int)(2 * $fontScale));
            $eventLines = self::wrapText($eventTitle, (int) max(24, 30 * ($w / 1080)));
            $ey = (int)(180 * $fontScale);
            foreach ($eventLines as $eLine) {
                self::drawCenteredText($im, 20 * $fontScale, 0, $ey, $white, $fontArialBold, $eLine, $w);
                $ey += (int)(32 * $fontScale);
            }

            // 3. Date Pill
            $datePillW = (int) min($w - 40, 320 * $fontScale);
            $datePillH = (int)(36 * $fontScale);
            $datePillX = (int) (($w - $datePillW) / 2);
            $datePillY = $ey + (int)(12 * $fontScale);
            $datePillBg = imagecolorallocatealpha($im, 20, 32, 46, 60);
            self::drawSmoothPill($im, $datePillX, $datePillY, $datePillW, $datePillH, $datePillBg, $dividerColor);
            self::drawCenteredText($im, 10 * $fontScale, 0, $datePillY + (int)(24 * $fontScale), $graySub, $fontArialBold, $eventDateStr, $w);

            // 4. Guest Plaque
            $plaqueW = (int) min($w - 40, 480 * $fontScale);
            $plaqueH = (int)(120 * $fontScale);
            $plaqueX = (int) (($w - $plaqueW) / 2);
            $plaqueY = $datePillY + (int)(60 * $fontScale);
            $plaqueBg = imagecolorallocatealpha($im, 7, 13, 24, 40);
            self::drawSmoothPill($im, $plaqueX, $plaqueY, $plaqueW, $plaqueH, $plaqueBg, $dividerColor);

            self::drawSpacedText($im, 8.5 * $fontScale, $plaqueY + (int)(30 * $fontScale), $cyan, $fontArialBold, 'INVITATION PASS ISSUED TO', $w, (int)(3 * $fontScale));
            
            $guestName = mb_strtoupper($guest->name ?: 'VALUED GUEST');
            $nameSize = 22 * $fontScale;
            if (mb_strlen($guestName) > 20) $nameSize = 16 * $fontScale;
            if (mb_strlen($guestName) > 28) $nameSize = 13 * $fontScale;
            self::drawCenteredText($im, $nameSize, 0, $plaqueY + (int)(70 * $fontScale), $white, $fontGeorgiaBold, $guestName, $w);

            $allowanceText = $guest->allowance_label ?: ($guest->max_entries > 1 ? 'DOUBLE ENTRY' : 'SINGLE ENTRY');
            $allowPillW = (int)(160 * $fontScale);
            $allowPillH = (int)(26 * $fontScale);
            $allowPillX = (int) (($w - $allowPillW) / 2);
            $allowPillY = $plaqueY + (int)(84 * $fontScale);
            $allowPillBg = imagecolorallocatealpha($im, 10, 22, 38, 50);
            self::drawSmoothPill($im, $allowPillX, $allowPillY, $allowPillW, $allowPillH, $allowPillBg, $cyanBorder);
            self::drawSpacedText($im, 8.5 * $fontScale, $allowPillY + (int)(18 * $fontScale), $cyan, $fontArialBold, mb_strtoupper($allowanceText), $w, (int)(2 * $fontScale));

            // 5. QR Code (Positioned safely above code and footer)
            $scanUrl = rtrim($baseUrl ?: url('/'), '/') . '/card/' . $token;
            $qrSize = (int) round(120 * $fontScale);
            $qrIm = QRCodeGenerator::renderToGdImage($scanUrl, $qrSize, 2, 15, 23, 42);
            if ($qrIm) {
                $qrW = imagesx($qrIm);
                $qrH = imagesy($qrIm);
                $qrX = (int) (($w - $qrW) / 2);
                $qrY = (int) round(0.73 * $h);

                imagecopy($im, $qrIm, $qrX, $qrY, 0, 0, $qrW, $qrH);
                imagedestroy($qrIm);
            }

            // 6. Unique Code (Positioned safely)
            self::drawSpacedText($im, 8 * $fontScale, (int) round(0.87 * $h), $graySub, $fontArialBold, 'GATE VERIFICATION CODE', $w, (int)(3 * $fontScale));
            $codeText = $guest->unique_code ?: $guest->card_number ?: ('KDV-' . $guest->id);
            self::drawSpacedText($im, 16 * $fontScale, (int) round(0.90 * $h), $white, $fontArialBold, $codeText, $w, (int)(4 * $fontScale));

            // 7. Footer line & text (Always securely within canvas bounds)
            $footerTextY = $h - (int)(18 * $fontScale);
            $footerLineY = $footerTextY - (int)(18 * $fontScale);
            imageline($im, (int)(32 * $fontScale), $footerLineY, $w - (int)(32 * $fontScale), $footerLineY, $dividerColor);
            $cardNumber = $guest->card_number ?: ('KDV-' . $guest->id);
            imagettftext($im, 8.5 * $fontScale, 0, (int)(36 * $fontScale), $footerTextY, $graySub, $fontArial, $cardNumber);
            $footerR = 'Secured & verified by KARDOVO';
            $bboxR = imagettfbbox(8.5 * $fontScale, 0, $fontArial, $footerR);
            $rw = abs($bboxR[2] - $bboxR[0]);
            imagettftext($im, 8.5 * $fontScale, 0, $w - (int)(36 * $fontScale) - $rw, $footerTextY, $graySub, $fontArial, $footerR);
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
            imagettftext($im, $size, $angle, $x + 2, $y + 3, $shadow, $fontFile, $text);
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

    private static function drawSpacedTextWithShadow(\GdImage $im, float $size, int $y, int $color, string $fontFile, string $text, int $canvasWidth, int $extraSpacing = 2): void
    {
        if (!file_exists($fontFile)) {
            self::drawCenteredTextWithShadow($im, $size, 0, $y, $color, $fontFile, $text, $canvasWidth);
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
        $shadow = imagecolorallocatealpha($im, 0, 0, 0, 60);

        $sx = $curX + 2;
        foreach ($chars as $i => $ch) {
            imagettftext($im, $size, 0, $sx, $y + 2, $shadow, $fontFile, $ch);
            $sx += $charWidths[$i] + $extraSpacing;
        }

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
