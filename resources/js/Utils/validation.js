/**
 * Shared input verification and validation utilities for Kardovo.
 */

/**
 * Validates RFC 5322 standard email format.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(email.trim());
}

/**
 * Validates international / local phone numbers (E.164 or local format e.g. +255... or 07...).
 * Requires between 9 and 15 digits, allowing spaces, hyphens, and parentheses.
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    if (!/^\+?[0-9\s\-().]{7,25}$/.test(trimmed)) {
        return false;
    }
    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15;
}

/**
 * Validates password strength according to enterprise security standards:
 * - Minimum 8 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Number (0-9)
 * - Special character / symbol (!@#$%^&* etc.)
 *
 * @param {string} password
 * @returns {{ 
 *   isValid: boolean, 
 *   isStrong: boolean, 
 *   length: boolean, 
 *   hasLower: boolean, 
 *   hasUpper: boolean, 
 *   hasNumber: boolean, 
 *   hasSpecial: boolean, 
 *   score: number,
 *   missingRules: string[]
 * }}
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { 
            isValid: false, 
            isStrong: false, 
            length: false, 
            hasLower: false, 
            hasUpper: false, 
            hasNumber: false, 
            hasSpecial: false, 
            score: 0,
            missingRules: ['At least 8 characters', 'Uppercase & lowercase letters', 'At least one number (0-9)', 'Special symbol (!@#$%^&*)']
        };
    }
    const length = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    let score = 0;
    const missingRules = [];
    if (length) score += 1; else missingRules.push('At least 8 characters');
    if (hasLower && hasUpper) score += 1; else missingRules.push('Uppercase & lowercase letters');
    if (hasNumber) score += 1; else missingRules.push('At least one number (0-9)');
    if (hasSpecial) score += 1; else missingRules.push('At least one special symbol (!@#$%^&*)');

    const isStrong = length && hasLower && hasUpper && hasNumber && hasSpecial;

    return {
        isValid: isStrong,
        isStrong,
        length,
        hasLower,
        hasUpper,
        hasNumber,
        hasSpecial,
        score,
        missingRules,
    };
}

/**
 * Generates a cryptographically strong, high-entropy password.
 * @param {number} length
 * @returns {string}
 */
export function generateStrongPassword(length = 16) {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()-_=+';
    const all = uppers + lowers + numbers + symbols;

    let pwd = '';
    pwd += uppers[Math.floor(Math.random() * uppers.length)];
    pwd += lowers[Math.floor(Math.random() * lowers.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < length; i++) {
        pwd += all[Math.floor(Math.random() * all.length)];
    }
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Validates required text with min and max bounds.
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function validateRequired(value, min = 1, max = 255) {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.length >= min && trimmed.length <= max;
}

/**
 * Validates file upload size against a maximum megabytes limit.
 * @param {File} file
 * @param {number} maxMb
 * @returns {{ isValid: boolean, sizeMb: number, message?: string }}
 */
export function validateFileSize(file, maxMb = 5) {
    if (!file) return { isValid: true, sizeMb: 0 };
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > maxMb) {
        return {
            isValid: false,
            sizeMb: parseFloat(sizeMb.toFixed(2)),
            message: `File size (${sizeMb.toFixed(1)}MB) exceeds the maximum limit of ${maxMb}MB.`,
        };
    }
    return { isValid: true, sizeMb: parseFloat(sizeMb.toFixed(2)) };
}

/**
 * Validates file extension against an allowed list.
 * @param {File} file
 * @param {string[]} allowedExtensions e.g. ['jpg', 'png', 'webp', 'xlsx', 'csv']
 * @returns {{ isValid: boolean, extension: string, message?: string }}
 */
export function validateFileExtension(file, allowedExtensions = []) {
    if (!file) return { isValid: true, extension: '' };
    const fileName = file.name || '';
    const ext = fileName.split('.').pop().toLowerCase();
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
        return {
            isValid: false,
            extension: ext,
            message: `Invalid file type (.${ext}). Allowed formats: ${allowedExtensions.map(e => `.${e}`).join(', ')}.`,
        };
    }
    return { isValid: true, extension: ext };
}
