import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/header.css';
import './styles/tiles.css';
import './styles/projects.css';
import './styles/footer.css';

import { links, profile, projects, tailnetNote, tiles } from './config';
import { probeAll } from './probe';
import { renderFooter } from './render/footer';
import { renderHeader } from './render/header';
import { renderProjects } from './render/projects';
import { renderTiles, setTileState } from './render/tiles';
import { currentTheme, followSystemTheme, toggleTheme } from './theme';
import { hostOf } from './util';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app missing');

app.innerHTML = `
  ${renderHeader(profile, links)}
  <main class="page">
    ${renderTiles(tiles, tailnetNote)}
    ${renderProjects(projects)}
  </main>
  ${renderFooter(profile, links, tailnetNote)}
  <div class="toast" role="status" aria-live="polite" hidden></div>
`;

// Theme toggle -----------------------------------------------------------------
const toggle = app.querySelector<HTMLButtonElement>('[data-action="toggle-theme"]');
const syncToggleLabel = (): void => {
  toggle?.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} theme`);
};
toggle?.addEventListener('click', () => {
  toggleTheme();
  syncToggleLabel();
});
syncToggleLabel();
followSystemTheme();

// Unreachable tiles: explain instead of navigating into a timeout ----------------
const toast = app.querySelector<HTMLDivElement>('.toast')!;
let toastTimer: number | undefined;
const showToast = (html: string): void => {
  toast.innerHTML = html;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.hidden = true), 6000);
};

app.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-tile-link]');
  if (!link) return;
  const tileEl = link.closest<HTMLElement>('.tile');
  if (tileEl?.dataset.reach !== 'unreachable') return;
  e.preventDefault();
  const tile = tiles.find((t) => t.id === tileEl.dataset.tile);
  const why = tile?.tailnetOnly
    ? `${tailnetNote}. If you are on it, `
    : 'It did not answer just now. You can still ';
  showToast(
    `<strong>${hostOf(link.href)}</strong> is not reachable from here. ${why}<a href="${link.href}">open it anyway</a>.`,
  );
});

// Reachability -------------------------------------------------------------------
probeAll(tiles, (tile, state) => setTileState(app, tile, state));
