import { Plant } from '../types';
import { DEMO_PLANT_PHOTOS } from './imageUtils';

export const STORAGE_KEY = 'plant_tracker_data';

export function getPlants(): Plant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (p) =>
          p &&
          typeof p.id === 'string' &&
          typeof p.name === 'string' &&
          typeof p.location === 'string' &&
          typeof p.waterIntervalDays === 'number' &&
          typeof p.lastWateredDate === 'string'
      );
    }
    return [];
  } catch (err) {
    console.error('Error reading plants from localStorage:', err);
    return [];
  }
}

export function savePlants(plants: Plant[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  } catch (err) {
    console.error('Error saving plants to localStorage:', err);
  }
}

export function generatePlantId(): string {
  return `plant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function getStarterPlants(): Plant[] {
  const now = new Date();
  
  // Monstera: interval 7. Past waterings: 29 days ago, 22 days ago, 15 days ago, 8 days ago
  const dMonstera = new Date(now.getTime() - 8 * 86400000);
  const monsteraHistory = [
    { date: new Date(now.getTime() - 29 * 86400000).toISOString() },
    { date: new Date(now.getTime() - 22 * 86400000).toISOString() },
    {
      date: new Date(now.getTime() - 15 * 86400000).toISOString(),
      imageUrl: DEMO_PLANT_PHOTOS.monstera,
      note: 'Huge new fenestrated leaf opened! 🌿',
    },
    { date: dMonstera.toISOString() },
  ];
  
  // Calathea: interval 3. Past waterings: 12 days ago, 9 days ago, 6 days ago, 3 days ago
  const dCalathea = new Date(now.getTime() - 3 * 86400000);
  const calatheaHistory = [
    { date: new Date(now.getTime() - 12 * 86400000).toISOString() },
    { date: new Date(now.getTime() - 9 * 86400000).toISOString() },
    {
      date: new Date(now.getTime() - 6 * 86400000).toISOString(),
      imageUrl: DEMO_PLANT_PHOTOS.calathea,
      note: 'Vibrant purple undersides, soil misted gently.',
    },
    { date: dCalathea.toISOString() },
  ];
  
  // Snake Plant: interval 14. Past waterings: 32 days ago, 18 days ago, 4 days ago
  const dSnake = new Date(now.getTime() - 4 * 86400000);
  const snakeHistory = [
    { date: new Date(now.getTime() - 32 * 86400000).toISOString() },
    {
      date: new Date(now.getTime() - 18 * 86400000).toISOString(),
      imageUrl: DEMO_PLANT_PHOTOS.snakePlant,
      note: 'New pup emerging at the base 🌱',
    },
    { date: dSnake.toISOString() },
  ];
  
  // Golden Pothos: interval 7. Past waterings: 22 days ago, 15 days ago, 8 days ago, 1 day ago
  const dPothos = new Date(now.getTime() - 1 * 86400000);
  const pothosHistory = [
    { date: new Date(now.getTime() - 22 * 86400000).toISOString() },
    { date: new Date(now.getTime() - 15 * 86400000).toISOString() },
    {
      date: new Date(now.getTime() - 8 * 86400000).toISOString(),
      imageUrl: DEMO_PLANT_PHOTOS.pothos,
      note: 'Vine trailed onto the shelf, looking lush! ✨',
    },
    { date: dPothos.toISOString() },
  ];

  return [
    {
      id: `plant_${Date.now()}_1`,
      name: 'Monstera Deliciosa',
      location: 'Living Room',
      waterIntervalDays: 7,
      lastWateredDate: dMonstera.toISOString(),
      wateringHistory: monsteraHistory,
    },
    {
      id: `plant_${Date.now()}_2`,
      name: 'Calathea Orbifolia',
      location: 'Bathroom',
      waterIntervalDays: 3,
      lastWateredDate: dCalathea.toISOString(),
      wateringHistory: calatheaHistory,
    },
    {
      id: `plant_${Date.now()}_3`,
      name: 'Snake Plant',
      location: 'Bedroom',
      waterIntervalDays: 14,
      lastWateredDate: dSnake.toISOString(),
      wateringHistory: snakeHistory,
    },
    {
      id: `plant_${Date.now()}_4`,
      name: 'Golden Pothos',
      location: 'Kitchen',
      waterIntervalDays: 7,
      lastWateredDate: dPothos.toISOString(),
      wateringHistory: pothosHistory,
    },
  ];
}
