import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig, type Plugin } from 'vite';

const require = createRequire(import.meta.url);

/**
 * Runs before @nish/ui's theme-init: a choice saved under the hub's old localStorage
 * key ('theme') is copied to the shared 'nish-theme' key once, unless a shared choice
 * already exists. src/theme.ts then writes it to the shared cookie and removes the old key.
 */
const LEGACY_MIGRATION = `(function(){try{var o=localStorage.getItem('theme');if((o==='light'||o==='dark')&&!localStorage.getItem('nish-theme')&&!/(?:^|;\\s*)nish-theme=/.test(document.cookie))localStorage.setItem('nish-theme',o)}catch(e){}})();`;

const MARKER = '<!-- nish-theme-init -->';

/** @nish/ui's theme-init.js, minus its leading comments (they are for readers of the package, not every page load). */
const themeInitSource = (): string =>
  readFileSync(require.resolve('@nish/ui/theme-init.js'), 'utf8').replace(/^\s*\/\/.*\n/gm, '');

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
