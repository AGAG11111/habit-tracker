import { repository } from '../data/repository.js';
import { today } from '../logic/dates.js';
import { h } from './dom.js';
import { confirmDialog } from './confirmDialog.js';

// Manual backup: download everything as a JSON file, or restore from one.
// This is also how data moves between devices until cloud sync exists.
export function createBackupSection(onRestored) {
  const message = h('p', { class: 'backup-message', role: 'status', hidden: true });
  const show = (text, isError = false) => {
    message.textContent = text;
    message.classList.toggle('form-error', isError);
    message.hidden = false;
  };

  async function exportBackup() {
    const data = await repository.exportAll();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = h('a', { href: url, download: `habit-backup-${today()}.json` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    show('הגיבוי ירד כקובץ. שמור אותו במקום בטוח.');
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ok = await confirmDialog({
        message: 'לשחזר מהגיבוי?\nכל הנתונים הנוכחיים באפליקציה יוחלפו בנתונים מהקובץ.',
        confirmLabel: 'שחזור',
      });
      if (!ok) return;
      await repository.importAll(data);
      onRestored();
    } catch {
      show('הקובץ לא תקין. בחר קובץ גיבוי שנוצר באפליקציה.', true);
    }
  }

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: (event) => importBackup(event.target.files[0]) });

  return h('section', { class: 'backup' },
    h('h3', {}, 'גיבוי'),
    h('p', {}, 'הנתונים נשמרים רק במכשיר הזה. גיבוי ידני מאפשר לשמור עותק ולהעביר נתונים בין מכשירים.'),
    h('div', { class: 'form-actions' },
      h('button', { class: 'btn', type: 'button', onclick: exportBackup }, 'ייצוא גיבוי'),
      h('button', { class: 'btn', type: 'button', onclick: () => fileInput.click() }, 'ייבוא גיבוי'),
    ),
    fileInput,
    message,
  );
}
