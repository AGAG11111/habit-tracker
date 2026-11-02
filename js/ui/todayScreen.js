import { repository } from '../data/repository.js';
import { today, addDays, weekDays, parseDate } from '../logic/dates.js';
import { isScheduledOn } from '../logic/schedule.js';
import { h } from './dom.js';
import { createHabitRing } from './ring.js';

// Check-in for one day (today by default). Past days can be browsed and marked too;
// future days can't. Streaks and rings live in the Progress tab / per-habit ring.
export async function renderToday(container) {
  const todayString = today();
  let date = todayString;
  let justChecked = null; // habit id that was just ticked, to play the check animation once

  function goTo(newDate) {
    // An empty or future value is ignored, but redrawing resets the date input to the real date.
    if (newDate && newDate <= todayString) date = newDate;
    draw();
  }

  async function toggle(habit, isDone) {
    justChecked = isDone ? null : habit.id;
    await repository.setCompletion(habit.id, date, !isDone);
    draw();
  }

  async function draw() {
    const week = weekDays(date);
    // Habits with fixed weekdays only show up on those days.
    const habits = (await repository.listHabits()).filter((habit) => isScheduledOn(habit, date));
    const completions = await repository.listCompletions({ from: week[0], to: week[6] });
    const doneOnDate = new Set(completions.filter((c) => c.date === date).map((c) => c.habitId));
    const weekCount = (habitId) => completions.filter((c) => c.habitId === habitId).length;

    function row(habit) {
      const isDone = doneOnDate.has(habit.id);
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
        // Last child = far left in RTL. Both kinds are measured in days done that week.
        createHabitRing(weekCount(habit.id), habit.type === 'weekly' ? habit.weeklyTarget : 7, 'ימים'),
      );
    }

    const isToday = date === todayString;
    const dateLabel = parseDate(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

    container.replaceChildren(
      h('div', { class: 'day-nav' },
        // In RTL the first child sits on the right, so "previous day" points right.
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'היום הקודם', onclick: () => goTo(addDays(date, -1)) }, '→'),
        h('input', { class: 'field date-input', type: 'date', max: todayString, value: date, 'aria-label': 'בחירת תאריך', onchange: (event) => goTo(event.target.value) }),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'היום הבא', disabled: isToday, onclick: () => goTo(addDays(date, 1)) }, '←'),
      ),
      h('div', { class: 'today-head' },
        h('h2', {}, isToday ? 'איזה הרגל כבר ביצעת היום?' : `איזה הרגל ביצעת ב${dateLabel}?`),
        isToday ? h('small', {}, dateLabel) : h('button', { class: 'btn link', type: 'button', onclick: () => goTo(todayString) }, 'חזרה להיום'),
      ),
      habits.length
        ? h('ul', { class: 'habit-list' }, habits.map(row))
        : h('p', { class: 'placeholder' }, 'אין הרגלים ליום הזה. אפשר להוסיף הרגל בלשונית "הרגלים".'),
    );
    justChecked = null;
  }

  await draw();
}
