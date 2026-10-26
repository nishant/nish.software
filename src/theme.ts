import { getThemeChoice, initTheme, mountThemeToggle, setThemeChoice } from '@nish/ui/theme';

/**
 * Theme switching comes from @nish/ui: the choice ('system', 'light' or 'dark') lives in
 * the shared `nish-theme` cookie on .nish.software (and localStorage), so it matches
 * every other subdomain. The pre-paint script in index.html is @nish/ui's theme-init.js,
 * inlined at build time by vite.config.ts.
 */

/** Before @nish/ui the hub kept its choice under this localStorage key. */
export const LEGACY_KEY = 'theme';

/**
 * Carries a choice made under the old key over to the shared one, once. The inline
 * pre-paint snippet already copied it into localStorage so the first paint is right;
 * this saves it through setThemeChoice so the shared cookie gets it too, then drops the
 * old key.
 */
const migrateLegacyTheme = (): void => {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === null) return;
    localStorage.removeItem(LEGACY_KEY);
    if (legacy === 'light' || legacy === 'dark') setThemeChoice(getThemeChoice());
  } catch {
    /* storage blocked: nothing was saved under the old key either */
  }
};

/**
 * Wires the header toggle: @nish/ui's mountThemeToggle with showLabel renders the icons,
 * the visible word (System, Light, Dark, or a preset's name such as "Mocha" when one was
 * picked on another site), the labels, cycling and cross-tab sync.
 */
export const setupTheme = (toggle: HTMLButtonElement | null): void => {
  migrateLegacyTheme();
  initTheme();
  if (toggle) mountThemeToggle(toggle, { showLabel: true });
};
