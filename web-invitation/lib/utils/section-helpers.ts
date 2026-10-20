export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
  totalMilliseconds: number;
}

/**
 * Calculates time remaining until target ISO datetime string.
 * Timezone-aware using standard ISO-8601 UTC epoch comparisons.
 */
export function calculateTimeRemaining(
  targetDateIso: string,
  nowDate: Date = new Date()
): TimeRemaining {
  const targetMs = new Date(targetDateIso).getTime();
  const nowMs = nowDate.getTime();

  if (isNaN(targetMs)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isCompleted: true,
      totalMilliseconds: 0,
    };
  }

  const diffMs = targetMs - nowMs;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isCompleted: true,
      totalMilliseconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isCompleted: false,
    totalMilliseconds: diffMs,
  };
}

/**
 * Generates Google Maps embed URL safely from address or latitude/longitude coordinates
 */
export function buildMapEmbedUrl(params: {
  embedUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): string {
  if (params.embedUrl && params.embedUrl.trim().length > 0) {
    return params.embedUrl;
  }

  if (params.lat !== undefined && params.lng !== undefined) {
    return `https://maps.google.com/maps?q=${params.lat},${params.lng}&hl=en&z=15&output=embed`;
  }

  if (params.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(params.address)}&hl=en&z=15&output=embed`;
  }

  return 'https://maps.google.com/maps?q=London&hl=en&z=12&output=embed';
}

/**
 * Builds Google Maps directions navigation URL
 */
export function buildDirectionsUrl(params: {
  directionsUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): string {
  if (params.directionsUrl && params.directionsUrl.trim().length > 0) {
    return params.directionsUrl;
  }
  if (params.lat !== undefined && params.lng !== undefined) {
    return `https://www.google.com/maps/dir/?api=1&destination=${params.lat},${params.lng}`;
  }
  if (params.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(params.address)}`;
  }
  return 'https://maps.google.com';
}
