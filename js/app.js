const THEME_KEY = 'theme';

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

// Temporary: theme is stored directly here. In a later step it moves into
// the repository (settings) so all persistence goes through one layer.
applyTheme(localStorage.getItem(THEME_KEY));

document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = currentIsDark() ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});
