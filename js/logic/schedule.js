import { parseDate } from './dates.js';

// Days are numbered like Date.getDay(): 0 = Sunday ... 6 = Saturday.
export const DAY_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
export const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// A habit with no fixed days ("flexible") is scheduled every day.
export function isScheduledOn(habit, dateString) {
  const days = habit.days ?? [];
  return days.length === 0 || days.includes(parseDate(dateString).getDay());
}

export function formatFrequency(timesPerWeek) {
  if (timesPerWeek === 7) return 'כל יום';
  if (timesPerWeek === 1) return 'פעם בשבוע';
  if (timesPerWeek === 2) return 'פעמיים בשבוע';
  return `${timesPerWeek} פעמים בשבוע`;
}

// e.g. "פעם בשבוע · שבת" or "3 פעמים בשבוע".
export function describeSchedule(habit) {
  const frequency = formatFrequency(habit.type === 'weekly' ? habit.weeklyTarget : 7);
  const days = [...(habit.days ?? [])].sort((a, b) => a - b);
  if (days.length === 0 || days.length === 7) return frequency;
  return `${frequency} · ${days.map((day) => DAY_NAMES[day]).join(', ')}`;
}
