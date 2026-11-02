import { repository } from '../data/repository.js';
import { h } from './dom.js';
import { DAY_LETTERS, DAY_NAMES } from '../logic/schedule.js';

// Short labels for the frequency chips; the row title already says "per week".
const chipLabel = (times) => (times === 7 ? 'כל יום' : times === 1 ? 'פעם אחת' : times === 2 ? 'פעמיים' : `${times} פעמים`);

const ICONS = ['💧', '🏃', '📚', '🧘', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '💊', '🚶', '🧠', '☀️', '🦷', '⭐'];
const COLORS = ['#4f6bed', '#e5484d', '#f08c00', '#2f9e44', '#12b886', '#1c7ed6', '#ae3ec9', '#868e96'];

export function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (hours === 1) parts.push('שעה');
  else if (hours > 1) parts.push(`${hours} שעות`);
  if (minutes) parts.push(`${minutes} דקות`);
  return parts.join(' ו-');
}

// Replaces the container's content with the add/edit form. `habit` is null for a new one.
export function openHabitForm(container, habit, onDone) {
  let icon = habit?.icon ?? ICONS[0];
  let color = habit?.color ?? COLORS[0];
  // One frequency control: 1-6 times a week, or 7 = every day (stored as type 'daily').
  let frequency = habit ? (habit.type === 'daily' ? 7 : habit.weeklyTarget) : 7;
  // Optional fixed weekdays. When any are chosen they decide the frequency.
  const days = new Set(habit?.days ?? []);

  const nameInput = h('input', { class: 'field', type: 'text', required: true, maxlength: 60, value: habit?.name ?? '', placeholder: 'למשל: לשתות מים' });
  // Free-form duration entered as hours + minutes, stored as total minutes (0 = none).
  const savedMinutes = habit?.durationMinutes ?? 0;
  const hoursInput = h('input', { class: 'field', type: 'number', inputmode: 'numeric', min: 0, max: 99, placeholder: '0', value: savedMinutes >= 60 ? Math.floor(savedMinutes / 60) : '' });
  const minutesInput = h('input', { class: 'field', type: 'number', inputmode: 'numeric', min: 0, max: 59, placeholder: '0', value: savedMinutes % 60 || '' });
  const durationRow = h('div', { class: 'form-row' }, h('span', {}, 'כמה זמן?'),
    h('div', { class: 'duration-inputs' },
      h('label', {}, hoursInput, h('small', {}, 'שעות')),
      h('label', {}, minutesInput, h('small', {}, 'דקות')),
    ));
  const anchorInput = h('input', { class: 'field', type: 'text', maxlength: 120, value: habit?.anchor ?? '', placeholder: 'אחרי שאני… אני…' });
  const notesInput = h('textarea', { class: 'field', rows: 3, maxlength: 500, placeholder: 'הערות חופשיות' }, habit?.notes ?? '');

  const errorBox = h('p', { class: 'form-error', role: 'alert', hidden: true });
  const frequencyHint = h('small', { class: 'hint' }, 'מספר הפעמים נקבע לפי הימים שבחרת. כדי לשנות אותו ידנית, בטל את בחירת הימים.');
  const frequencyButtons = {};
  const dayButtons = {};
  const iconButtons = {};
  const colorButtons = {};

  function pick(buttons, selected) {
    for (const [key, btn] of Object.entries(buttons)) btn.setAttribute('aria-pressed', String(key === String(selected)));
  }
  function refresh() {
    if (days.size > 0) frequency = days.size;
    pick(frequencyButtons, frequency);
    for (const btn of Object.values(frequencyButtons)) btn.disabled = days.size > 0;
    frequencyHint.hidden = days.size === 0;
    for (const [day, btn] of Object.entries(dayButtons)) btn.setAttribute('aria-pressed', String(days.has(Number(day))));
    pick(iconButtons, icon);
    pick(colorButtons, color);
  }

  for (const value of [1, 2, 3, 4, 5, 6, 7]) {
    frequencyButtons[value] = h('button', { class: 'chip', type: 'button', onclick: () => { frequency = value; refresh(); } }, chipLabel(value));
  }
  DAY_LETTERS.forEach((letter, day) => {
    dayButtons[day] = h('button', {
      class: 'chip day-chip',
      type: 'button',
      'aria-label': `יום ${DAY_NAMES[day]}`,
      onclick: () => { if (days.has(day)) days.delete(day); else days.add(day); refresh(); },
    }, letter);
  });
  for (const value of ICONS) {
    iconButtons[value] = h('button', { class: 'chip icon-chip', type: 'button', 'aria-label': value, onclick: () => { icon = value; refresh(); } }, value);
  }
  for (const value of COLORS) {
    colorButtons[value] = h('button', { class: 'chip swatch', type: 'button', 'aria-label': `צבע ${value}`, style: `background:${value}`, onclick: () => { color = value; refresh(); } });
  }

  const form = h('form', { class: 'habit-form' },
    h('h2', {}, habit ? 'עריכת הרגל' : 'הרגל חדש'),
    h('label', { class: 'form-row' }, h('span', {}, 'שם'), nameInput),
    h('div', { class: 'form-row' }, h('span', {}, 'כמה פעמים בשבוע?'), h('div', { class: 'chip-row' }, Object.values(frequencyButtons)),
      frequencyHint),
    h('div', { class: 'form-row' }, h('span', {}, 'באילו ימים? (לא חובה, אפשר לבחור כמה)'), h('div', { class: 'chip-row' }, Object.values(dayButtons))),
    h('div', { class: 'form-row' }, h('span', {}, 'אייקון'), h('div', { class: 'chip-row' }, Object.values(iconButtons))),
    h('div', { class: 'form-row' }, h('span', {}, 'צבע'), h('div', { class: 'chip-row' }, Object.values(colorButtons))),
    h('label', { class: 'form-row' }, h('span', {}, 'עוגן'), anchorInput),
    durationRow,
    h('label', { class: 'form-row' }, h('span', {}, 'הערות'), notesInput),
    errorBox,
    h('div', { class: 'form-actions' },
      h('button', { class: 'btn primary', type: 'submit' }, 'שמירה'),
      h('button', { class: 'btn', type: 'button', onclick: onDone }, 'ביטול'),
    ),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    errorBox.hidden = true;
    try {
      await saveFromForm(name);
      onDone();
    } catch (error) {
      // Shown on screen so a failure on a phone (no console) is visible and reportable.
      errorBox.textContent = `השמירה נכשלה: ${error.name}: ${error.message}`;
      errorBox.hidden = false;
    }
  });

  async function saveFromForm(name) {
    await repository.saveHabit({
      ...(habit ? { id: habit.id } : {}),
      name,
      icon,
      color,
      type: frequency === 7 ? 'daily' : 'weekly',
      weeklyTarget: frequency,
      days: [...days].sort((a, b) => a - b),
      durationMinutes: Math.max(0, Math.floor(Number(hoursInput.value) || 0)) * 60 + Math.max(0, Math.floor(Number(minutesInput.value) || 0)),
      anchor: anchorInput.value.trim(),
      notes: notesInput.value.trim(),
    });
  }

  refresh();
  container.replaceChildren(form);
  nameInput.focus();
}
