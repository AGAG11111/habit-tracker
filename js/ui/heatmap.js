import { buildHeatmap, HEATMAP_WEEKS } from '../logic/heatmap.js';
import { h } from './dom.js';

// GitHub-style grid for one habit: a square per day, colored with the habit's color when done.
// In RTL the oldest week is on the right and the current week on the left.
export function createHeatmap(dates, todayString) {
  const cells = buildHeatmap(dates, todayString);
  const doneCount = cells.filter((c) => c.state === 'done').length;
  return h('div', { class: 'heatmap-wrap' },
    h('div', { class: 'heatmap', role: 'img', 'aria-label': `${doneCount} ימי ביצוע ב-${HEATMAP_WEEKS} השבועות האחרונים` },
      cells.map((cell) => h('span', { class: `heat-cell ${cell.state}`, title: cell.date })),
    ),
    h('small', { class: 'heatmap-caption' }, `${HEATMAP_WEEKS} השבועות האחרונים`),
  );
}
