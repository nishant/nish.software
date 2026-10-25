import {
  PRESETS,
  TOGGLE_ORDER,
  getThemeChoice,
  initTheme,
  mountThemeToggle,
  onThemeChange,
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

const WORD: Record<string, string> = { system: 'System', light: 'Light', dark: 'Dark' };

/** The word the button shows: System, Light, Dark, or a preset's name ("Mocha") when one was picked on another site. */
const wordFor = (choice: ThemeChoice): string =>
  (TOGGLE_ORDER as readonly string[]).includes(choice)
    ? WORD[choice]
    : (PRESETS.find((p) => p.id === choice)?.label ?? choice);

/**
 * Wires the header toggle. @nish/ui's mountThemeToggle does the work (icons, labels,
 * cycling, cross-tab sync); the hub only adds the visible word next to the icon, which
 * the shared helper does not render. Local until @nish/ui grows a labelled variant.
 */
export const setupTheme = (toggle: HTMLButtonElement | null): void => {
  migrateLegacyTheme();
  initTheme();
  if (!toggle) return;
  mountThemeToggle(toggle);
  const word = document.createElement('span');
  word.setAttribute('aria-hidden', 'true');
  toggle.append(word);
  const sync = (choice: ThemeChoice): void => {
    word.textContent = wordFor(choice);
  };
  onThemeChange(sync);
  sync(getThemeChoice());
};
