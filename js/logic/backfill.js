import { addDays, weekStart } from './dates.js';

const DAYS_PER_UNIT = { days: 1, weeks: 7, months: 30 };

// For a habit the user has already been keeping: the past completion dates that recreate
// that history, ending yesterday (today is marked normally). Real completion records mean
// streaks, best streak and anything built later work without special cases.
//   daily habit  -> the last N days
//   weekly habit -> the last N whole weeks, each with its target days filled
//                   (its fixed weekdays, or the first days of the week)
export function buildBackfillDates(habit, amount, unit, todayString) {
  const totalDays = Math.floor(amount * DAYS_PER_UNIT[unit]);
  if (!(totalDays > 0)) return [];

  if (habit.type !== 'weekly') {
    return Array.from({ length: totalDays }, (_, i) => addDays(todayString, -(i + 1)));
  }

  const weeks = Math.floor(totalDays / 7);
  const fixedDays = habit.days ?? [];
  const offsets = fixedDays.length > 0
    ? fixedDays
    : Array.from({ length: habit.weeklyTarget }, (_, i) => i);
  const thisWeek = weekStart(todayString);
  const dates = [];
  for (let w = 1; w <= weeks; w += 1) {
    for (const offset of offsets) dates.push(addDays(thisWeek, -7 * w + offset));
  }
  return dates;
}
