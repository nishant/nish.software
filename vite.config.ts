import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig, type Plugin } from 'vite';
import { PRESETS } from '@nish/ui/theme';

const require = createRequire(import.meta.url);

/**
 * Runs before @nish/ui's theme-init: a choice saved under the hub's old localStorage
 * key ('theme') is copied to the shared 'nish-theme' key once, unless a shared choice
 * already exists. src/theme.ts then writes it to the shared cookie and removes the old key.
 */
const LEGACY_MIGRATION = `(function(){try{var o=localStorage.getItem('theme');if((o==='light'||o==='dark')&&!localStorage.getItem('nish-theme')&&!/(?:^|;\\s*)nish-theme=/.test(document.cookie))localStorage.setItem('nish-theme',o)}catch(e){}})();`;

const MARKER = '<!-- nish-theme-init -->';

/**
 * @nish/ui's theme-init.js. v0.1.0 ships with its `__THEMES__` placeholder replaced in
 * the header comment instead of the code, so the script throws as published; fill it in
 * from the package's own theme list until a fixed tag lands. A no-op once fixed.
 */
const themeInitSource = (): string => {
  // Leading line comments are for readers of the package, not for every page load.
  const src = readFileSync(require.resolve('@nish/ui/theme-init.js'), 'utf8').replace(/^\s*\/\/.*\n/gm, '');
  if (!/=\s*__THEMES__/.test(src)) return src;
  const schemes = Object.fromEntries(PRESETS.map((p) => [p.id, p.scheme]));
  return src.replace(/=\s*__THEMES__/, () => `= ${JSON.stringify(schemes)}`);
};

/**
 * Inlines @nish/ui's pre-paint theme script where index.html has the marker (after the
 * charset and viewport metas, before any stylesheet): render-blocking, so the first paint
 * already has the visitor's theme, and no extra request.
 */
const nishThemeInit = (): Plugin => ({
  name: 'nish-theme-init',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => {
      if (!html.includes(MARKER)) throw new Error(`index.html is missing ${MARKER}`);
      const init = themeInitSource();
      return html.replace(MARKER, () => `<script>\n${LEGACY_MIGRATION}\n${init}</script>`);
    },
  },
});

export default defineConfig({
  plugins: [nishThemeInit()],
});
