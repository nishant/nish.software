import '@nish/ui/nish.css';
import './styles/base.css';
import '@nish/ui/nish-components.css';
import './styles/layout.css';
import './styles/header.css';
import './styles/tiles.css';
import './styles/footer.css';

import { mountTooltips, showToast } from '@nish/ui/theme';

import { links, profile, tailnetNote, tiles } from './config';
import { probeAll } from './probe';
import { renderFooter } from './render/footer';
import { renderHeader } from './render/header';
import { renderTiles, setTileState } from './render/tiles';
import { setupTheme } from './theme';
import { hostOf } from './util';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app missing');

// vite.config.ts prerenders this markup into index.html; render here only if that did not happen.
if (app.childElementCount === 0) {
  app.innerHTML = `
    ${renderHeader(profile, links)}
    <main class="page">
      ${renderTiles(tiles, tailnetNote)}
    </main>
    ${renderFooter(profile, links)}
  `;
}

// Theme toggle -----------------------------------------------------------------
setupTheme(app.querySelector<HTMLButtonElement>('[data-action="toggle-theme"]'));

// The Tailnet badges' tips show on hover and focus in CSS; this adds Escape to hide one.
mountTooltips(app);

for (const el of app.querySelectorAll<HTMLElement>('[data-year]')) el.textContent = String(new Date().getFullYear());

// Tiles found unreachable or down: explain instead of navigating into a timeout.
// Tiles that could not be probed (tailnet hosts in Chrome) navigate normally.
app.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-tile-link]');
  if (!link) return;
  const tileEl = link.closest<HTMLElement>('.tile');
  const reach = tileEl?.dataset.reach;
  if (reach !== 'unreachable' && reach !== 'down') return;
  e.preventDefault();
  const tile = tiles.find((t) => t.id === tileEl?.dataset.tile);
  const why = tile?.tailnetOnly
    ? `${tailnetNote}. If you are on it, `
    : 'It did not answer just now. You can still ';
  // @nish/ui's showToast: one polite region, and the timer pauses on hover and focus so
  // a keyboard user can reach the link.
  const host = document.createElement('strong');
  host.textContent = hostOf(link.href);
  const open = document.createElement('a');
  open.href = link.href;
  open.textContent = 'open it anyway';
  const message = document.createDocumentFragment();
  message.append(
    host,
    reach === 'down' ? ' is down right now, per status.nish.software. You can still ' : ` is not reachable from here. ${why}`,
    open,
    '.',
  );
  showToast(message);
});

// Reachability -------------------------------------------------------------------
const recheck = app.querySelector<HTMLButtonElement>('[data-action="recheck"]');
let checking = false;
// @nish/ui's busy .nish-btn hides the label and shows a spinner in its place, and ignores
// pointer clicks; `checking` also ignores keyboard presses while a round runs.
const runProbes = async (): Promise<void> => {
  if (checking) return;
  checking = true;
  recheck?.setAttribute('aria-busy', 'true');
  try {
    await probeAll(tiles, (tile, state, health) => setTileState(app, tile, state, health));
  } finally {
    checking = false;
    recheck?.removeAttribute('aria-busy');
  }
};
recheck?.addEventListener('click', () => void runProbes());
void runProbes();
