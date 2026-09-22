import { icon } from '../icons';
import { esc, hostOf } from '../util';
import type { ReachState, Tile } from '../types';

const STATUS_LABEL: Record<ReachState, string> = {
  idle: '',
  probing: 'Checking',
  ok: 'Online',
  unreachable: 'Not reachable from here',
};

export const renderTiles = (tiles: Tile[], tailnetNote: string): string => `
  <section class="section" id="apps" aria-labelledby="apps-heading">
    <div class="section__head">
      <h2 class="section__title" id="apps-heading">Apps</h2>
      <p class="section__hint">${icon('lock', 'icon icon--inline')} ${esc(tailnetNote)}</p>
    </div>
    <ul class="tiles">
      ${tiles.map((t, i) => renderTile(t, i, tailnetNote)).join('')}
    </ul>
  </section>`;

const renderTile = (t: Tile, i: number, tailnetNote: string): string => `
  <li class="tile" data-tile="${esc(t.id)}" data-accent="${t.accent}" data-reach="${t.probe ? 'probing' : 'idle'}" ${t.tailnetOnly ? 'data-tailnet' : ''} style="--i:${i}">
    <a class="tile__link" href="${esc(t.href)}" data-tile-link>
      <div class="tile__top">
        <span class="tile__icon">${icon(t.icon)}</span>
        ${t.tailnetOnly ? `<span class="badge badge--lock" title="${esc(tailnetNote)}">${icon('lock', 'icon icon--xs')}<span>Tailnet</span></span>` : ''}
        <span class="tile__arrow">${icon('arrow')}</span>
      </div>
      <h3 class="tile__name">${esc(t.name)}</h3>
      <p class="tile__blurb">${esc(t.blurb)}</p>
      <div class="tile__foot">
        <span class="tile__host">${esc(hostOf(t.href))}</span>
        <span class="status" data-status>
          <span class="status__dot"></span>
          <span class="status__label">${STATUS_LABEL[t.probe ? 'probing' : 'idle']}</span>
        </span>
      </div>
      ${t.tailnetOnly ? `<p class="tile__note">${esc(tailnetNote)}</p>` : ''}
    </a>
  </li>`;

/** Reflects a probe result on the tile: the data attribute drives the CSS, the label the text. */
export const setTileState = (root: ParentNode, tile: Tile, state: ReachState): void => {
  const el = root.querySelector<HTMLElement>(`[data-tile="${tile.id}"]`);
  if (!el) return;
  el.dataset.reach = state;
  const label = el.querySelector<HTMLElement>('.status__label');
  if (label) {
    label.textContent =
      state === 'unreachable' && tile.tailnetOnly ? 'Tailnet only' : STATUS_LABEL[state];
  }
  const link = el.querySelector<HTMLAnchorElement>('[data-tile-link]');
  if (link) link.setAttribute('aria-describedby', state === 'unreachable' ? 'reach-legend' : '');
};
