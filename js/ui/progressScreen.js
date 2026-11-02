import { repository } from '../data/repository.js';
import { today } from '../logic/dates.js';
import { calcStreak, formatStreak } from '../logic/streaks.js';
import { describeSchedule } from '../logic/schedule.js';
import { formatDuration } from './habitForm.js';
import { h } from './dom.js';
import { createStreakBadge } from './streakBadge.js';
// Per-habit progress: a colorful badge for the current streak, plus the best streak.
// Shows every active habit, including ones with fixed days that aren't scheduled today.
export async function renderProgress(container) {
  const todayString = today();
  const habits = await repository.listHabits();
  const allCompletions = await repository.listCompletions();

  function row(habit) {
    const dates = new Set(allCompletions.filter((c) => c.habitId === habit.id).map((c) => c.date));
    const streak = calcStreak(habit, dates, todayString);
    return h('li', { class: 'habit-row', style: `--habit-color:${habit.color}; border-inline-start-color:${habit.color}` },
      h('span', { class: 'habit-icon', 'aria-hidden': 'true' }, habit.icon),
      h('div', { class: 'habit-info' },
        h('strong', {}, habit.name),
        h('small', {}, `יעד: ${describeSchedule(habit)}`),
        habit.durationMinutes ? h('small', {}, formatDuration(habit.durationMinutes)) : null,
        streak.best > 0 ? h('small', {}, `רצף שיא: ${formatStreak(streak.unit, streak.best)}`) : null,
      ),
      // Last child = far left in RTL.
      createStreakBadge(streak.unit, streak.current),    );
  }

  container.replaceChildren(
    h('div', { class: 'screen-head' }, h('h2', {}, 'ההתקדמות שלי')),
    habits.length
      ? h('ul', { class: 'habit-list' }, habits.map(row))
      : h('p', { class: 'placeholder' }, 'אין עדיין הרגלים. הוסף הרגל בלשונית "הרגלים".'),
  );
}
