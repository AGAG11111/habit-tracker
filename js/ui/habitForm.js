import { repository } from '../data/repository.js';
import { h } from './dom.js';
import { DAY_LETTERS, DAY_NAMES } from '../logic/schedule.js';
import { buildBackfillDates } from '../logic/backfill.js';
import { today } from '../logic/dates.js';

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
  // The chosen weekdays are the only frequency control: their count is the weekly target
  // and all 7 means a daily habit. Older habits with "N times a week, any day" have no days;
  // they keep their stored target until the user picks days.
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
  const legacyTarget = habit && habit.type === 'weekly' && !habit.days?.length ? habit.weeklyTarget : 0;
  const days = new Set(habit?.days?.length ? habit.days : legacyTarget ? [] : ALL_DAYS);
  const frequencyOf = () => (days.size || legacyTarget);

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
  // Only when adding a habit: how long the user has already kept it up. Saved as past
  // completions, so Progress (streak, badge) reflects it with no special handling.
  const priorAmountInput = h('input', { class: 'field', type: 'number', inputmode: 'numeric', min: 0, max: 3650, placeholder: '0' });
  const priorUnitSelect = h('select', { class: 'field' },
    h('option', { value: 'days' }, 'ימים'),
    h('option', { value: 'weeks' }, 'שבועות'),
    h('option', { value: 'months' }, 'חודשים'),
  );
  const priorRow = habit ? null : h('div', { class: 'form-row' },
    h('span', {}, 'הרגל ישן? כמה זמן אתה כבר מתמיד בו? (לא חובה)'),
    h('div', { class: 'duration-inputs' }, priorAmountInput, priorUnitSelect),
    h('small', { class: 'hint' }, 'נוסיף את התקופה הזו כביצועים קודמים (עד אתמול), כדי שהרצף וההתקדמות יתחילו מהמקום הנכון.'),
  );
  const anchorInput = h('input', { class: 'field', type: 'text', maxlength: 120, value: habit?.anchor ?? '', placeholder: 'אחרי שאני… אני…' });
  const notesInput = h('textarea', { class: 'field', rows: 3, maxlength: 500, placeholder: 'הערות חופשיות' }, habit?.notes ?? '');

  const errorBox = h('p', { class: 'form-error', role: 'alert', hidden: true });
  const dayButtons = {};
  const iconButtons = {};
  const colorButtons = {};

  function pick(buttons, selected) {
    for (const [key, btn] of Object.entries(buttons)) btn.setAttribute('aria-pressed', String(key === String(selected)));
  }
  function refresh() {
    for (const [day, btn] of Object.entries(dayButtons)) btn.setAttribute('aria-pressed', String(days.has(Number(day))));
    everyDayButton.setAttribute('aria-pressed', String(days.size === 7));
    pick(iconButtons, icon);
    pick(colorButtons, color);
  }

  // "Every day" toggles all seven weekdays on, or clears them when they are all on.
  const everyDayButton = h('button', {
    class: 'chip',
    type: 'button',
    onclick: () => { if (days.size === 7) days.clear(); else ALL_DAYS.forEach((d) => days.add(d)); refresh(); },
  }, 'כל יום');
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
    h('div', { class: 'form-row' }, h('span', {}, 'באילו ימים? (מספר הימים הוא כמה פעמים בשבוע)'),
      h('div', { class: 'chip-row' }, everyDayButton, Object.values(dayButtons))),
    h('div', { class: 'form-row' }, h('span', {}, 'אייקון'), h('div', { class: 'chip-row' }, Object.values(iconButtons))),
    h('div', { class: 'form-row' }, h('span', {}, 'צבע'), h('div', { class: 'chip-row' }, Object.values(colorButtons))),
    h('label', { class: 'form-row' }, h('span', {}, 'עוגן'), anchorInput),
    durationRow,
    priorRow,
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
      errorBox.textContent = error.name === 'Error' ? error.message : `השמירה נכשלה: ${error.name}: ${error.message}`;
      errorBox.hidden = false;
    }
  });

  async function saveFromForm(name) {
    const frequency = frequencyOf();
    if (frequency === 0) throw new Error('צריך לבחור לפחות יום אחד');
    const priorAmount = habit ? 0 : Number(priorAmountInput.value) || 0;
    const priorDates = priorAmount > 0
      ? buildBackfillDates({ type: frequency === 7 ? 'daily' : 'weekly', weeklyTarget: frequency, days: [...days] }, priorAmount, priorUnitSelect.value, today())
      : [];
    if (priorAmount > 0 && priorDates.length === 0) throw new Error('להרגל שבועי צריך להזין לפחות שבוע של ותק');
    const saved = await repository.saveHabit({
      ...(habit ? { id: habit.id } : {}),
      name,
      icon,
      color,
      type: frequency === 7 ? 'daily' : 'weekly',
      weeklyTarget: frequency,
      // All seven days is stored as "no fixed days" (= every day).
      days: days.size === 7 ? [] : [...days].sort((a, b) => a - b),
      durationMinutes: Math.max(0, Math.floor(Number(hoursInput.value) || 0)) * 60 + Math.max(0, Math.floor(Number(minutesInput.value) || 0)),
      anchor: anchorInput.value.trim(),
      notes: notesInput.value.trim(),
    });
    if (priorDates.length > 0) await repository.setCompletions(saved.id, priorDates);
  }

  refresh();
  container.replaceChildren(form);
  nameInput.focus();
}
