import {
  TOGGLE_ORDER as ORDER,
  cycleTheme,
  getThemeChoice,
  initTheme,
  onThemeChange,
  resolveTheme,
  setThemeChoice,
} from '@nish/ui/theme';
import type { ThemeChoice } from '@nish/ui/theme';

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

const LABEL: Record<string, string> = { system: 'System', light: 'Light', dark: 'Dark' };

/** The hub offers system, light and dark; a preset chosen on another site reads as system here. */
const shownChoice = (): ThemeChoice => {
  const c = getThemeChoice();
  return ORDER.includes(c) ? c : 'system';
};

/** Wires the header toggle: shows the active choice and steps system → light → dark. */
export const setupTheme = (toggle: HTMLButtonElement | null): void => {
  migrateLegacyTheme();
  initTheme();
  if (!toggle) return;
  const sync = (): void => {
    const choice = shownChoice();
    const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
    const shown = choice === 'system' ? `System (${LABEL[resolveTheme('system')].toLowerCase()})` : LABEL[choice];
    toggle.dataset.choice = choice;
    toggle.setAttribute('aria-label', `Theme: ${shown}. Switch to ${LABEL[next]}`);
    toggle.title = `Theme: ${shown}`;
    const label = toggle.querySelector('.theme-toggle__label');
    if (label) label.textContent = LABEL[choice];
  };
  toggle.addEventListener('click', () => {
    cycleTheme();
    sync();
  });
  onThemeChange(sync);
  sync();
};
