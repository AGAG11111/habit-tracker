import { repository } from './data/repository.js';
import { h } from './ui/dom.js';
import { renderHabitsList } from './ui/habitsList.js';

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function currentIsDark() {
  const forced = document.documentElement.dataset.theme;
  if (forced) return forced === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const settings = await repository.getSettings();
applyTheme(settings.theme);

document.getElementById('theme-toggle').addEventListener('click', async () => {
  const next = currentIsDark() ? 'light' : 'dark';
  applyTheme(next);
  await repository.saveSettings({ theme: next });
});

// Each screen is a function that fills the container. Adding a screen = adding a line here.
const screens = {
  today: (container) => container.replaceChildren(h('p', { class: 'placeholder' }, 'בקרוב: מסך "היום".')),
  habits: renderHabitsList,
};

const main = document.getElementById('screen');
const tabs = document.querySelectorAll('.tab');

function showScreen(name) {
  tabs.forEach((tab) => tab.setAttribute('aria-current', String(tab.dataset.screen === name)));
  screens[name](main);
}

tabs.forEach((tab) => tab.addEventListener('click', () => showScreen(tab.dataset.screen)));
showScreen('habits');
