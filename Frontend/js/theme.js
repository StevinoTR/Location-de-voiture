const themeStorageKey = 'carrent_theme';

const getSavedTheme = () => localStorage.getItem(themeStorageKey);
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggle.title = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
  }
};

const initTheme = () => {
  const savedTheme = getSavedTheme();
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
};

const toggleTheme = () => {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
};

window.toggleTheme = toggleTheme;
window.addEventListener('DOMContentLoaded', initTheme);
