import { repository } from '../data/repository.js';
import { h } from './dom.js';

const ICONS = ['💧', '🏃', '📚', '🧘', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '💊', '🚶', '🧠', '☀️', '🦷', '⭐'];
const COLORS = ['#4f6bed', '#e5484d', '#f08c00', '#2f9e44', '#12b886', '#1c7ed6', '#ae3ec9', '#868e96'];

// Replaces the container's content with the add/edit form. `habit` is null for a new one.
export function openHabitForm(container, habit, onDone) {
  let icon = habit?.icon ?? ICONS[0];
  let color = habit?.color ?? COLORS[0];
  let type = habit?.type ?? 'daily';

  const nameInput = h('input', { class: 'field', type: 'text', required: true, maxlength: 60, value: habit?.name ?? '', placeholder: 'למשל: לשתות מים' });
  const targetInput = h('input', { class: 'field', type: 'number', min: 1, max: 7, value: habit?.weeklyTarget && type === 'weekly' ? habit.weeklyTarget : 3 });
  const anchorInput = h('input', { class: 'field', type: 'text', maxlength: 120, value: habit?.anchor ?? '', placeholder: 'אחרי שאני… אני…' });
  const notesInput = h('textarea', { class: 'field', rows: 3, maxlength: 500, placeholder: 'הערות חופשיות' }, habit?.notes ?? '');

  const targetRow = h('label', { class: 'form-row' }, h('span', {}, 'כמה פעמים בשבוע?'), targetInput);
  const typeButtons = {};
  const iconButtons = {};
  const colorButtons = {};

  function pick(buttons, selected) {
    for (const [key, btn] of Object.entries(buttons)) btn.setAttribute('aria-pressed', String(key === selected));
  }
  function refresh() {
    targetRow.hidden = type !== 'weekly';
    pick(typeButtons, type);
    pick(iconButtons, icon);
    pick(colorButtons, color);
  }

  for (const [value, label] of [['daily', 'יומי'], ['weekly', 'שבועי']]) {
    typeButtons[value] = h('button', { class: 'chip', type: 'button', onclick: () => { type = value; refresh(); } }, label);
  }
  for (const value of ICONS) {
    iconButtons[value] = h('button', { class: 'chip icon-chip', type: 'button', 'aria-label': value, onclick: () => { icon = value; refresh(); } }, value);
  }
  for (const value of COLORS) {
    colorButtons[value] = h('button', { class: 'chip swatch', type: 'button', 'aria-label': `צבע ${value}`, style: `background:${value}`, onclick: () => { color = value; refresh(); } });
  }

  const form = h('form', { class: 'habit-form' },
    h('h2', {}, habit ? 'עריכת הרגל' : 'הרגל חדש'),
    h('label', { class: 'form-row' }, h('span', {}, 'שם'), nameInput),
    h('div', { class: 'form-row' }, h('span', {}, 'סוג'), h('div', { class: 'chip-row' }, Object.values(typeButtons))),
    targetRow,
    h('div', { class: 'form-row' }, h('span', {}, 'אייקון'), h('div', { class: 'chip-row' }, Object.values(iconButtons))),
    h('div', { class: 'form-row' }, h('span', {}, 'צבע'), h('div', { class: 'chip-row' }, Object.values(colorButtons))),
    h('label', { class: 'form-row' }, h('span', {}, 'עוגן'), anchorInput),
    h('label', { class: 'form-row' }, h('span', {}, 'הערות'), notesInput),
    h('div', { class: 'form-actions' },
      h('button', { class: 'btn primary', type: 'submit' }, 'שמירה'),
      h('button', { class: 'btn', type: 'button', onclick: onDone }, 'ביטול'),
    ),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    await repository.saveHabit({
      ...(habit ? { id: habit.id } : {}),
      name,
      icon,
      color,
      type,
      weeklyTarget: type === 'weekly' ? Math.min(7, Math.max(1, Number(targetInput.value) || 1)) : 7,
      anchor: anchorInput.value.trim(),
      notes: notesInput.value.trim(),
    });
    onDone();
  });

  refresh();
  container.replaceChildren(form);
  nameInput.focus();
}
