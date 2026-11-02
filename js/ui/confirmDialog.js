import { h } from './dom.js';

// In-page confirmation (a <dialog>) instead of window.confirm, which some webviews and
// installed web apps suppress and auto-answer. Resolves true only on the confirm button.
export function confirmDialog({ message, confirmLabel }) {
  return new Promise((resolve) => {
    const dialog = h('dialog', { class: 'confirm-dialog' },
      h('form', { method: 'dialog' },
        h('p', { class: 'confirm-message' }, message),
        h('div', { class: 'form-actions' },
          h('button', { class: 'btn danger', type: 'submit', value: 'yes' }, confirmLabel),
          h('button', { class: 'btn', type: 'submit', value: 'no' }, 'ביטול'),
        ),
      ),
    );
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'yes');
      dialog.remove();
    });
    document.body.append(dialog);
    dialog.showModal();
  });
}
