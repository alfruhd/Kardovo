<?php

namespace App\Services;

class QRCodeGenerator
{
    private static array $capacityTable = [
        1 => ['total_words' => 26, 'ec_words' => 10, 'blocks' => 1, 'align' => []],
        2 => ['total_words' => 44, 'ec_words' => 16, 'blocks' => 1, 'align' => [6, 18]],
        3 => ['total_words' => 70, 'ec_words' => 26, 'blocks' => 1, 'align' => [6, 22]],
        4 => ['total_words' => 100, 'ec_words' => 36, 'blocks' => 2, 'align' => [6, 26]],
        5 => ['total_words' => 134, 'ec_words' => 48, 'blocks' => 2, 'align' => [6, 30]],
        6 => ['total_words' => 172, 'ec_words' => 64, 'blocks' => 4, 'align' => [6, 34]],
    ];

    private static array $gfExp = [];
    private static array $gfLog = [];
    private static bool $gfInit = false;

    private static function initGF(): void
    {
        if (self::$gfInit) return;
        $x = 1;
        for ($i = 0; $i < 255; $i++) {
            self::$gfExp[$i] = $x;
            self::$gfLog[$x] = $i;
            $x <<= 1;
            if ($x & 256) {
                $x ^= 285;
            }
        }
        for ($i = 255; $i < 512; $i++) {
            self::$gfExp[$i] = self::$gfExp[$i - 255];
        }
        self::$gfInit = true;
    }

    private static function gfMul(int $x, int $y): int
    {
        if ($x === 0 || $y === 0) return 0;
        return self::$gfExp[self::$gfLog[$x] + self::$gfLog[$y]];
    }

    private static function rsGeneratorPoly(int $ecCount): array
    {
        $g = [1];
        for ($i = 0; $i < $ecCount; $i++) {
            $factor = [1, self::$gfExp[$i]];
            $res = array_fill(0, count($g) + 1, 0);
            for ($j = 0; $j < count($g); $j++) {
                for ($k = 0; $k < count($factor); $k++) {
                    $res[$j + $k] ^= self::gfMul($g[$j], $factor[$k]);
                }
            }
            $g = $res;
        }
        return $g;
    }

    private static function rsCalculate(array $data, int $ecCount): array
    {
        self::initGF();
        $g = self::rsGeneratorPoly($ecCount);
        $res = array_merge($data, array_fill(0, $ecCount, 0));
        
        for ($i = 0; $i < count($data); $i++) {
            $coef = $res[$i];
            if ($coef !== 0) {
                for ($j = 0; $j < count($g); $j++) {
                    $res[$i + $j] ^= self::gfMul($g[$j], $coef);
                }
            }
        }
        return array_slice($res, count($data));
    }

    public static function createMatrix(string $text): array
    {
        self::initGF();
        $rawBytes = array_values(unpack('C*', $text));
        $len = count($rawBytes);

        $version = 1;
        $spec = self::$capacityTable[1];
        foreach (self::$capacityTable as $v => $s) {
            $dataCapacity = $s['total_words'] - $s['ec_words'];
            $neededBytes = $len + 2; 
            if ($neededBytes <= $dataCapacity) {
                $version = $v;
                $spec = $s;
                break;
            }
        }

        $totalDataWords = $spec['total_words'] - $spec['ec_words'];
        
        $bits = '0100';
        $bits .= str_pad(decbin($len), 8, '0', STR_PAD_LEFT);
        foreach ($rawBytes as $b) {
            $bits .= str_pad(decbin($b), 8, '0', STR_PAD_LEFT);
        }
        $bits .= '0000';
        $targetBitLen = $totalDataWords * 8;
        if (strlen($bits) > $targetBitLen) {
            $bits = substr($bits, 0, $targetBitLen);
        }
        while (strlen($bits) % 8 !== 0) {
            $bits .= '0';
        }
        $padBytes = ['11101100', '00010001'];
        $pIdx = 0;
        while (strlen($bits) < $targetBitLen) {
            $bits .= $padBytes[$pIdx % 2];
            $pIdx++;
        }

        $dataWords = [];
        for ($i = 0; $i < strlen($bits); $i += 8) {
            $dataWords[] = bindec(substr($bits, $i, 8));
        }

        $numBlocks = $spec['blocks'];
        $wordsPerBlock = intdiv($totalDataWords, $numBlocks);
        $ecPerBlock = intdiv($spec['ec_words'], $numBlocks);

        $dataBlocks = [];
        $ecBlocks = [];
        for ($b = 0; $b < $numBlocks; $b++) {
            $chunk = array_slice($dataWords, $b * $wordsPerBlock, $wordsPerBlock);
            $dataBlocks[] = $chunk;
            $ecBlocks[] = self::rsCalculate($chunk, $ecPerBlock);
        }

        $finalCodewords = [];
        for ($i = 0; $i < $wordsPerBlock; $i++) {
            for ($b = 0; $b < $numBlocks; $b++) {
                $finalCodewords[] = $dataBlocks[$b][$i];
            }
        }
        for ($i = 0; $i < $ecPerBlock; $i++) {
            for ($b = 0; $b < $numBlocks; $b++) {
                $finalCodewords[] = $ecBlocks[$b][$i];
            }
        }

        $codewordBits = '';
        foreach ($finalCodewords as $cw) {
            $codewordBits .= str_pad(decbin($cw), 8, '0', STR_PAD_LEFT);
        }
        $matrixSize = 17 + 4 * $version;
        $codewordBits = str_pad($codewordBits, $spec['total_words'] * 8, '0', STR_PAD_RIGHT);

        $matrix = array_fill(0, $matrixSize, array_fill(0, $matrixSize, null));
        $reserved = array_fill(0, $matrixSize, array_fill(0, $matrixSize, false));

        $finders = [[0, 0], [$matrixSize - 7, 0], [0, $matrixSize - 7]];
        foreach ($finders as [$fx, $fy]) {
            for ($dy = 0; $dy < 7; $dy++) {
                for ($dx = 0; $dx < 7; $dx++) {
                    $isBlack = ($dy === 0 || $dy === 6 || $dx === 0 || $dx === 6 || ($dy >= 2 && $dy <= 4 && $dx >= 2 && $dx <= 4));
                    $matrix[$fy + $dy][$fx + $dx] = $isBlack ? 1 : 0;
                    $reserved[$fy + $dy][$fx + $dx] = true;
                }
            }
            for ($dy = -1; $dy <= 7; $dy++) {
                for ($dx = -1; $dx <= 7; $dx++) {
                    $px = $fx + $dx;
                    $py = $fy + $dy;
                    if ($px >= 0 && $px < $matrixSize && $py >= 0 && $py < $matrixSize && !$reserved[$py][$px]) {
                        $matrix[$py][$px] = 0;
                        $reserved[$py][$px] = true;
                    }
                }
            }
        }

        $alignPos = $spec['align'];
        if (!empty($alignPos)) {
            foreach ($alignPos as $ay) {
                foreach ($alignPos as $ax) {
                    if ($reserved[$ay][$ax]) continue;
                    for ($dy = -2; $dy <= 2; $dy++) {
                        for ($dx = -2; $dx <= 2; $dx++) {
                            $isBlack = (abs($dx) === 2 || abs($dy) === 2 || ($dx === 0 && $dy === 0));
                            $matrix[$ay + $dy][$ax + $dx] = $isBlack ? 1 : 0;
                            $reserved[$ay + $dy][$ax + $dx] = true;
                        }
                    }
                }
            }
        }

        for ($i = 8; $i < $matrixSize - 8; $i++) {
            if (!$reserved[6][$i]) {
                $matrix[6][$i] = ($i % 2 === 0) ? 1 : 0;
                $reserved[6][$i] = true;
            }
            if (!$reserved[$i][6]) {
                $matrix[$i][6] = ($i % 2 === 0) ? 1 : 0;
                $reserved[$i][6] = true;
            }
        }

        $matrix[4 * $version + 9][8] = 1;
        $reserved[4 * $version + 9][8] = true;

        for ($i = 0; $i < 9; $i++) {
            $reserved[8][$i] = true;
            $reserved[$i][8] = true;
        }
        for ($i = 0; $i < 8; $i++) {
            $reserved[8][$matrixSize - 1 - $i] = true;
            $reserved[$matrixSize - 1 - $i][8] = true;
        }

        $bitIdx = 0;
        $bitLen = strlen($codewordBits);
        $right = $matrixSize - 1;
        $up = true;

        while ($right > 0) {
            if ($right === 6) $right--;
            $rows = $up ? range($matrixSize - 1, 0, -1) : range(0, $matrixSize - 1, 1);
            foreach ($rows as $y) {
                for ($col = 0; $col < 2; $col++) {
                    $x = $right - $col;
                    if (!$reserved[$y][$x]) {
                        $bit = ($bitIdx < $bitLen) ? ($codewordBits[$bitIdx] === '1' ? 1 : 0) : 0;
                        $bitIdx++;
                        if (($x + $y) % 2 === 0) {
                            $bit ^= 1;
                        }
                        $matrix[$y][$x] = $bit;
                    }
                }
            }
            $right -= 2;
            $up = !$up;
        }

        $formatBits = '101010000010010';
        $coords1 = [
            [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
            [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
        ];
        for ($i = 0; $i < 15; $i++) {
            $val = $formatBits[$i] === '1' ? 1 : 0;
            [$x, $y] = $coords1[$i];
            $matrix[$y][$x] = $val;
        }
        for ($i = 0; $i < 7; $i++) {
            $val = $formatBits[$i] === '1' ? 1 : 0;
            $matrix[$matrixSize - 1 - $i][8] = $val;
        }
        for ($i = 7; $i < 15; $i++) {
            $val = $formatBits[$i] === '1' ? 1 : 0;
            $matrix[8][$matrixSize - 15 + $i] = $val;
        }

        return $matrix;
    }

    public static function renderToGdImage(
        string $text, 
        int $targetSize = 240, 
        int $margin = 2,
        int $darkR = 15,
        int $darkG = 23,
        int $darkB = 42,
        int $lightR = 255,
        int $lightG = 255,
        int $lightB = 255
    ): \GdImage
    {
        $matrix = self::createMatrix($text);
        $modules = count($matrix);
        $totalModules = $modules + ($margin * 2);
        $scale = max(1, (int) floor($targetSize / $totalModules));
        $imgSize = $totalModules * $scale;

        $im = imagecreatetruecolor($imgSize, $imgSize);
        $lightColor = imagecolorallocate($im, $lightR, $lightG, $lightB);
        $darkColor = imagecolorallocate($im, $darkR, $darkG, $darkB);

        imagefilledrectangle($im, 0, 0, $imgSize, $imgSize, $lightColor);

        for ($y = 0; $y < $modules; $y++) {
            for ($x = 0; $x < $modules; $x++) {
                if ($matrix[$y][$x] === 1) {
                    $px = ($x + $margin) * $scale;
                    $py = ($y + $margin) * $scale;
                    imagefilledrectangle($im, $px, $py, $px + $scale - 1, $py + $scale - 1, $darkColor);
                }
            }
        }

        return $im;
    }
}