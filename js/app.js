import { repository } from './data/repository.js';

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
