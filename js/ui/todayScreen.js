import { repository } from '../data/repository.js';
import { today, weekDays, parseDate } from '../logic/dates.js';
import { h } from './dom.js';
import { createRing } from './ring.js';

export async function renderToday(container) {
  const date = today();
  const week = weekDays(date);
  let justChecked = null; // habit id that was just ticked, to play the check animation once

  async function toggle(habit, isDone) {
    justChecked = isDone ? null : habit.id;
    await repository.setCompletion(habit.id, date, !isDone);
    draw();
  }

  async function draw() {
    const habits = await repository.listHabits();
    const completions = await repository.listCompletions({ from: week[0], to: week[6] });
    const doneToday = new Set(completions.filter((c) => c.date === date).map((c) => c.habitId));
    const weekCount = (habitId) => completions.filter((c) => c.habitId === habitId).length;
    const doneTotal = habits.filter((habit) => doneToday.has(habit.id)).length;

    function row(habit) {
      const isDone = doneToday.has(habit.id);
      const weekly = habit.type === 'weekly';
      const count = weekCount(habit.id);
      return h('li', { class: 'today-row', style: `--habit-color:${habit.color}` },
        h('button', {
          class: `check${isDone ? ' done' : ''}${justChecked === habit.id ? ' pop' : ''}`,
          type: 'button',
          'aria-pressed': String(isDone),
          'aria-label': habit.name,
          onclick: () => toggle(habit, isDone),
        }, '✓'),
        h('div', { class: 'habit-info' },
          h('strong', {}, `${habit.icon} ${habit.name}`),
          habit.anchor ? h('small', {}, habit.anchor) : null,
          weekly ? h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': habit.weeklyTarget, 'aria-valuenow': count },
            h('div', { class: 'progress-fill', style: `width:${Math.min(100, (count / habit.weeklyTarget) * 100)}%` })) : null,
          weekly ? h('small', {}, `${count} מתוך ${habit.weeklyTarget} השבוע`) : null,
        ),
      );
    }

    const dateLabel = parseDate(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

    container.replaceChildren(...[
      h('div', { class: 'today-head' },
        h('div', { class: 'ring-wrap' },
          createRing(doneTotal, habits.length),
          h('div', { class: 'ring-label' }, `${doneTotal} מתוך ${habits.length}`)),
        h('h2', {}, dateLabel),
      ),
      habits.length
        ? h('ul', { class: 'habit-list' }, habits.map(row))
        : h('p', { class: 'placeholder' }, 'אין עדיין הרגלים. הוסף הרגל בלשונית "הרגלים".'),
    ]);
    justChecked = null;
  }

  await draw();
}
