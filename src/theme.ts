export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
const THEME_COLORS: Record<Theme, string> = { dark: '#0a0b0f', light: '#f7f6f3' };

export const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

/** Applies the theme to <html> and the browser chrome, and remembers it when asked. */
export const applyTheme = (theme: Theme, persist = false): void => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode or blocked storage: the choice just does not survive a reload */
    }
  }
};

export const toggleTheme = (): Theme => {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
  return next;
};

/** Follow OS changes only while the visitor has not picked a theme themselves. */
export const followSystemTheme = (): void => {
  let hasChoice = false;
  try {
    hasChoice = localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    /* ignore */
  }
  if (hasChoice) return;
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    applyTheme(e.matches ? 'light' : 'dark');
  });
};
