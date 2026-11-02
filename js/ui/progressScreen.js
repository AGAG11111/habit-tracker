import { repository } from '../data/repository.js';
import { today, weekDays } from '../logic/dates.js';
import { formatDuration } from './habitForm.js';
import { h } from './dom.js';
import { createRing } from './ring.js';

// Per-habit progress for the current week (Sunday to Saturday), one ring per habit.
export async function renderProgress(container) {
  const week = weekDays(today());
  const habits = await repository.listHabits();
  const completions = await repository.listCompletions({ from: week[0], to: week[6] });

  function row(habit) {
    const count = completions.filter((c) => c.habitId === habit.id).length;
    const target = habit.type === 'weekly' ? habit.weeklyTarget : 7;
    const frequency = habit.type === 'weekly' ? `יעד: ${target} פעמים בשבוע` : 'יעד: כל יום';
    return h('li', { class: 'habit-row', style: `--habit-color:${habit.color}; border-inline-start-color:${habit.color}` },
      h('span', { class: 'habit-icon', 'aria-hidden': 'true' }, habit.icon),
      h('div', { class: 'habit-info' },
        h('strong', {}, habit.name),
        h('small', {}, frequency),
        habit.durationMinutes ? h('small', {}, formatDuration(habit.durationMinutes)) : null,
      ),
      // Last child = far left in RTL.
      h('div', { class: 'ring-wrap small' },
        createRing(Math.min(count, target), target),
        h('div', { class: 'ring-label' }, `${count} מתוך ${target}`)),
    );
  }

  container.replaceChildren(
    h('div', { class: 'screen-head' }, h('h2', {}, 'ההתקדמות שלי השבוע')),
    habits.length
      ? h('ul', { class: 'habit-list' }, habits.map(row))
      : h('p', { class: 'placeholder' }, 'אין עדיין הרגלים. הוסף הרגל בלשונית "הרגלים".'),
  );
}
