export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
const THEME_COLORS: Record<Theme, string> = { dark: '#0a0b0f', light: '#f7f6f3' };

export const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

/**
 * Applies the theme to <html> and the browser chrome and remembers it. Dark is the
 * default for everyone (the inline script in index.html applies it before first paint);
 * the OS preference is deliberately not consulted.
 */
export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode or blocked storage: the choice just does not survive a reload */
  }
};

export const toggleTheme = (): Theme => {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};
