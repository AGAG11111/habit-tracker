import { addDays, weekStart } from './dates.js';

export const HEATMAP_WEEKS = 12;

// Cells for a GitHub-style grid: `weeks` whole Sunday-based weeks ending with the current one,
// ordered week by week (Sunday first), so a 7-row column grid lays them out directly.
// state: 'done' | 'missed' | 'future'
export function buildHeatmap(dates, todayString, weeks = HEATMAP_WEEKS) {
  const firstDay = addDays(weekStart(todayString), -7 * (weeks - 1));
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(firstDay, i);
    const state = date > todayString ? 'future' : dates.has(date) ? 'done' : 'missed';
    return { date, state };
  });
}
