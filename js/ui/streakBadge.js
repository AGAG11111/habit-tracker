import { formatStreak, getStreakTier } from '../logic/streaks.js';
import { h } from './dom.js';

const unitWord = (unit, count) => (unit === 'weeks' ? (count === 1 ? 'שבוע' : 'שבועות') : (count === 1 ? 'יום' : 'ימים'));

// Colorful badge for the current streak: emoji, big number, "days in a row",
// an encouraging title and the distance to the next milestone. Colors come from .tier-N.
export function createStreakBadge(unit, current) {
  const tier = getStreakTier(unit, current);
  // No hint at all while there is no streak yet.
  const next = current === 0 ? null
    : tier.nextTarget === null ? 'הגעת לשיא היעדים!'
      : `עוד ${formatStreak(unit, tier.remaining)} ל-${tier.nextTarget}`;

  return h('div', { class: `streak-badge tier-${tier.level}`, role: 'img', 'aria-label': `${current} ${unitWord(unit, current)} ברצף. ${tier.title}` },
    h('span', { class: 'badge-emoji', 'aria-hidden': 'true' }, tier.emoji),
    h('span', { class: 'badge-number' }, current),
    h('span', { class: 'badge-unit' }, `${unitWord(unit, current)} ברצף`),
    h('span', { class: 'badge-title' }, tier.title),
    next ? h('small', { class: 'badge-next' }, next) : null,
  );
}
