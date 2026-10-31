import { nishThemeInit } from '@nish/ui/vite';
import { defineConfig, type Plugin } from 'vite';

import { links, profile, tailnetNote, tiles } from './src/config';
import { renderFooter } from './src/render/footer';
import { renderHeader } from './src/render/header';
import { renderTiles } from './src/render/tiles';

/**
 * Passed as the plugin's prelude, so it runs before @nish/ui's theme-init: a choice saved under the hub's old localStorage
 * key ('theme') is copied to the shared 'nish-theme' key once, unless a shared choice
 * already exists. src/theme.ts then writes it to the shared cookie and removes the old key.
 */
const LEGACY_MIGRATION = `(function(){try{var o=localStorage.getItem('theme');if((o==='light'||o==='dark')&&!localStorage.getItem('nish-theme')&&!/(?:^|;\\s*)nish-theme=/.test(document.cookie))localStorage.setItem('nish-theme',o)}catch(e){}})();`;

const APP_MARKER = '<div id="app"></div>';

/**
 * Renders the page from src/config.ts at build time (and in dev), so the first paint is the
 * page; src/main.ts only wires behavior. Vite restarts the dev server when these imports change.
 */
const hubPrerender = (): Plugin => ({
  name: 'hub-prerender',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => {
      if (!html.includes(APP_MARKER)) throw new Error(`index.html is missing ${APP_MARKER}`);
      const page = `<div id="app">${renderHeader(profile, links)}<main class="page">${renderTiles(tiles, tailnetNote)}</main>${renderFooter(profile, links)}</div>`;
      return html.replace(APP_MARKER, () => page);
    },
  },
});

export default defineConfig({
  plugins: [nishThemeInit({ position: 'after-charset', prelude: LEGACY_MIGRATION }), hubPrerender()],
});
