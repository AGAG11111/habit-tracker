import { repository } from '../data/repository.js';
import { today, weekDays } from '../logic/dates.js';
import { calcStreak, formatStreak } from '../logic/streaks.js';
import { formatDuration } from './habitForm.js';
import { h } from './dom.js';
import { createHabitRing } from './ring.js';

// Per-habit progress: this week's ring plus the current and best streak.
export async function renderProgress(container) {
  const todayString = today();
  const week = weekDays(todayString);
  const habits = await repository.listHabits();
  const allCompletions = await repository.listCompletions();

  function row(habit) {
    const dates = new Set(allCompletions.filter((c) => c.habitId === habit.id).map((c) => c.date));
    const count = week.filter((day) => dates.has(day)).length;
    const target = habit.type === 'weekly' ? habit.weeklyTarget : 7;
    const frequency = habit.type === 'weekly' ? `יעד: ${target} פעמים בשבוע` : 'יעד: כל יום';
    const streak = calcStreak(habit, dates, todayString);
    return h('li', { class: 'habit-row', style: `--habit-color:${habit.color}; border-inline-start-color:${habit.color}` },
      h('span', { class: 'habit-icon', 'aria-hidden': 'true' }, habit.icon),
      h('div', { class: 'habit-info' },
        h('strong', {}, habit.name),
        h('small', {}, frequency),
        habit.durationMinutes ? h('small', {}, formatDuration(habit.durationMinutes)) : null,
        h('small', { class: 'streak' }, streak.current > 0
          ? `עמדת ביעד כבר ${formatStreak(streak.unit, streak.current)} ברצף`
          : 'עדיין אין רצף'),
        streak.best > 0 ? h('small', {}, `רצף שיא: ${formatStreak(streak.unit, streak.best)}`) : null,
      ),
      // Last child = far left in RTL.
      createHabitRing(count, target, 'ימים'),
    );
  }

  container.replaceChildren(
    h('div', { class: 'screen-head' }, h('h2', {}, 'ההתקדמות שלי')),
    habits.length
      ? h('ul', { class: 'habit-list' }, habits.map(row))
      : h('p', { class: 'placeholder' }, 'אין עדיין הרגלים. הוסף הרגל בלשונית "הרגלים".'),
  );
}
