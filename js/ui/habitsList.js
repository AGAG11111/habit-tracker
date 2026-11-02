import { repository } from '../data/repository.js';
import { h } from './dom.js';
import { openHabitForm, formatDuration } from './habitForm.js';

const describe = (habit) => {
  const frequency = habit.type === 'weekly' ? `${habit.weeklyTarget} פעמים בשבוע` : 'כל יום';
  return habit.durationMinutes ? `${frequency} · ${formatDuration(habit.durationMinutes)}` : frequency;
};

export async function renderHabitsList(container) {
  let showArchived = false;

  async function draw() {
    const habits = await repository.listHabits({ includeArchived: true });
    const active = habits.filter((x) => x.status === 'active');
    const archived = habits.filter((x) => x.status === 'archived');

    async function toggleArchive(habit) {
      await repository.archiveHabit(habit.id, habit.status === 'active');
      draw();
    }

    function row(habit) {
      const isArchived = habit.status === 'archived';
      return h('li', { class: `habit-row${isArchived ? ' archived' : ''}`, style: `border-inline-start-color:${habit.color}` },
        h('span', { class: 'habit-icon', 'aria-hidden': 'true' }, habit.icon),
        h('div', { class: 'habit-info' },
          h('strong', {}, habit.name),
          h('small', {}, describe(habit)),
          habit.anchor ? h('small', {}, habit.anchor) : null,
        ),
        h('button', { class: 'btn', type: 'button', onclick: () => openHabitForm(container, habit, draw) }, 'עריכה'),
        h('button', { class: 'btn', type: 'button', onclick: () => toggleArchive(habit) }, isArchived ? 'שחזור' : 'העבר לארכיון'),
      );
    }

    container.replaceChildren(...[
      h('div', { class: 'screen-head' },
        h('h2', {}, 'ההרגלים שלי'),
        h('button', { class: 'btn primary', type: 'button', onclick: () => openHabitForm(container, null, draw) }, '+ הרגל חדש'),
      ),
      active.length
        ? h('ul', { class: 'habit-list' }, active.map(row))
        : h('p', { class: 'placeholder' }, 'עדיין אין הרגלים. הוסף את הראשון!'),
      archived.length
        ? h('button', { class: 'btn link', type: 'button', onclick: () => { showArchived = !showArchived; draw(); } },
            showArchived ? 'הסתר ארכיון' : `הצג ארכיון (${archived.length})`)
        : null,
      showArchived ? h('ul', { class: 'habit-list' }, archived.map(row)) : null,
    ].filter(Boolean)); // replaceChildren would print "null" for empty slots
  }

  await draw();
}
