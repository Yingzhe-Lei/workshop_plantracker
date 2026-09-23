import { Plant, PlantCalculatedStatus, PlantWithStatus } from '../types';

export const MS_PER_DAY = 86400000;

/**
 * Calculates next due date and status according to specifications:
 * Next Due Date = Last Watered Date + (Water Interval Days * 86,400,000 ms)
 */
export function calculatePlantStatus(plant: Plant, referenceDate: Date = new Date()): PlantCalculatedStatus {
  const lastWatered = new Date(plant.lastWateredDate);
  const nextDueTimestamp = lastWatered.getTime() + plant.waterIntervalDays * MS_PER_DAY;
  const nextDueDate = new Date(nextDueTimestamp);

  // Normalize dates to midnight for calendar-day comparison
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();
  const dueMidnight = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth(), nextDueDate.getDate()).getTime();

  // daysDiff in whole calendar days:
  // positive = days remaining until due
  // 0 = due today
  // negative = days overdue
  const diffDays = Math.round((dueMidnight - refMidnight) / MS_PER_DAY);

  // Percentage of watering cycle that has elapsed
  const totalDuration = plant.waterIntervalDays * MS_PER_DAY;
  const elapsed = referenceDate.getTime() - lastWatered.getTime();
  const percentElapsed = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);

  let status: 'overdue' | 'due_today' | 'healthy';
  let statusLabel: string;

  if (diffDays < 0) {
    status = 'overdue';
    const overdueDays = Math.abs(diffDays);
    statusLabel = overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`;
  } else if (diffDays === 0) {
    status = 'due_today';
    statusLabel = 'Needs water today';
  } else {
    status = 'healthy';
    if (diffDays === 1) {
      statusLabel = 'Due tomorrow';
    } else {
      statusLabel = `Due in ${diffDays} days`;
    }
  }

  const formattedLastWatered = formatFriendlyDate(lastWatered, referenceDate);
  const formattedNextDue = nextDueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return {
    status,
    nextDueDate,
    daysDiff: diffDays,
    statusLabel,
    percentElapsed,
    formattedLastWatered,
    formattedNextDue,
  };
}

export function formatFriendlyDate(date: Date, referenceDate: Date = new Date()): string {
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();
  const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((refMidnight - targetMidnight) / MS_PER_DAY);

  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== referenceDate.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Sorts plants by urgency:
 * 1. Overdue plants first (most overdue top)
 * 2. Due today
 * 3. Up to date (soonest due first)
 */
export function sortPlantsByUrgency(plants: Plant[], referenceDate: Date = new Date()): PlantWithStatus[] {
  const withStatus: PlantWithStatus[] = plants.map((plant) => ({
    ...plant,
    computed: calculatePlantStatus(plant, referenceDate),
  }));

  return withStatus.sort((a, b) => {
    // Sort logic:
    // Smallest daysDiff first (e.g. -3 before -1 before 0 before 1 before 5)
    if (a.computed.daysDiff !== b.computed.daysDiff) {
      return a.computed.daysDiff - b.computed.daysDiff;
    }
    // Secondary tie-breaker: alphabetical by name
    return a.name.localeCompare(b.name);
  });
}
