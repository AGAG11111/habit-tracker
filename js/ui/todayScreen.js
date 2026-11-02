import { repository } from '../data/repository.js';
import { today, parseDate } from '../logic/dates.js';
import { h } from './dom.js';

// Check-in only. Progress (rings, streaks) lives in the Progress tab.
export async function renderToday(container) {
  const date = today();
  let justChecked = null; // habit id that was just ticked, to play the check animation once

  async function toggle(habit, isDone) {
    justChecked = isDone ? null : habit.id;
    await repository.setCompletion(habit.id, date, !isDone);
    draw();
  }

  async function draw() {
    const habits = await repository.listHabits();
    const completions = await repository.listCompletions({ from: date, to: date });
    const doneToday = new Set(completions.map((c) => c.habitId));

    function row(habit) {
      const isDone = doneToday.has(habit.id);
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
        ),
      );
    }

    const dateLabel = parseDate(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

    container.replaceChildren(
      h('div', { class: 'today-head' },
        h('h2', {}, 'איזה הרגל כבר ביצעת היום?'),
        h('small', {}, dateLabel),
      ),
      habits.length
        ? h('ul', { class: 'habit-list' }, habits.map(row))
        : h('p', { class: 'placeholder' }, 'אין עדיין הרגלים. הוסף הרגל בלשונית "הרגלים".'),
    );
    justChecked = null;
  }

  await draw();
}
