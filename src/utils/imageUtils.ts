import { Plant, WateringRecord } from '../types';

/**
 * Compresses an uploaded image File using HTML Canvas so it comfortably fits in localStorage.
 * Resizes down to max 800x800 and compresses as JPEG.
 */
export function compressImage(
  file: File,
  maxWidth = 720,
  maxHeight = 720,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Normalizes wateringHistory items (which can be ISO string or WateringRecord)
 * into a consistent array of WateringRecord.
 */
export function normalizeWateringHistory(plant: Plant): WateringRecord[] {
  if (!plant.wateringHistory || plant.wateringHistory.length === 0) {
    if (plant.lastWateredDate) {
      return [{ date: plant.lastWateredDate }];
    }
    return [];
  }

  return plant.wateringHistory.map((item) => {
    if (typeof item === 'string') {
      return { date: item };
    }
    return item;
  });
}

/**
 * Generates an elegant botanical SVG data URL for demo/starter plants
 */
function createSvgDataUrl(bgGrad: [string, string], iconSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad[0]}"/>
        <stop offset="100%" stop-color="${bgGrad[1]}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" rx="16" fill="url(#g)"/>
    <g transform="translate(140, 70) scale(1.5)">
      ${iconSvg}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_PLANT_PHOTOS = {
  monstera: createSvgDataUrl(
    ['#064e3b', '#047857'],
    `<path d="M40 90 C10 60 5 20 40 5 C75 20 70 60 40 90 Z" fill="#34d399" />
     <path d="M40 10 L40 85" stroke="#064e3b" stroke-width="2" />
     <path d="M22 35 C30 40 38 42 40 42" stroke="#064e3b" stroke-width="2" fill="none"/>
     <path d="M58 35 C50 40 42 42 40 42" stroke="#064e3b" stroke-width="2" fill="none"/>
     <path d="M20 55 C30 60 38 62 40 62" stroke="#064e3b" stroke-width="2" fill="none"/>
     <path d="M60 55 C50 60 42 62 40 62" stroke="#064e3b" stroke-width="2" fill="none"/>`
  ),
  calathea: createSvgDataUrl(
    ['#1e1b4b', '#4338ca'],
    `<ellipse cx="40" cy="45" rx="30" ry="42" fill="#818cf8"/>
     <path d="M40 5 L40 85" stroke="#312e81" stroke-width="2"/>
     <path d="M20 30 Q30 38 40 38 Q50 38 60 30" stroke="#c7d2fe" stroke-width="3" fill="none"/>
     <path d="M16 50 Q30 58 40 58 Q50 58 64 50" stroke="#c7d2fe" stroke-width="3" fill="none"/>
     <path d="M20 70 Q30 75 40 75 Q50 75 60 70" stroke="#c7d2fe" stroke-width="3" fill="none"/>`
  ),
  snakePlant: createSvgDataUrl(
    ['#14532d', '#15803d'],
    `<path d="M30 90 Q20 50 35 5 Q40 50 30 90 Z" fill="#86efac" stroke="#14532d" stroke-width="2"/>
     <path d="M50 90 Q60 45 45 10 Q35 50 50 90 Z" fill="#4ade80" stroke="#14532d" stroke-width="2"/>
     <path d="M40 90 Q40 40 40 0 Q40 40 40 90 Z" stroke="#166534" stroke-width="3"/>`
  ),
  pothos: createSvgDataUrl(
    ['#78350f', '#b45309'],
    `<path d="M40 85 C15 65 15 35 35 15 C45 25 55 15 65 35 C65 65 40 85 40 85 Z" fill="#fde047"/>
     <path d="M40 20 L40 80" stroke="#92400e" stroke-width="2"/>
     <circle cx="32" cy="40" r="4" fill="#65a30d"/>
     <circle cx="48" cy="55" r="5" fill="#65a30d"/>`
  ),
};
