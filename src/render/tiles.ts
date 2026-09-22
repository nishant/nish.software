import { icon } from '../icons';
import { esc, hostOf } from '../util';
import type { ReachState, Tile } from '../types';

const STATUS_LABEL: Record<ReachState, string> = {
  idle: '',
  probing: 'Checking',
  ok: 'Online',
  unreachable: 'Not reachable from here',
  soon: 'Coming soon',
};

const initialState = (t: Tile): ReachState => (t.soon ? 'soon' : t.probe ? 'probing' : 'idle');

export const renderTiles = (tiles: Tile[], tailnetNote: string): string => `
  <section class="section" id="apps" aria-labelledby="apps-heading">
    <div class="section__head">
      <h2 class="section__title" id="apps-heading">Apps</h2>
    </div>
    <ul class="tiles">
      ${tiles.map((t, i) => renderTile(t, i, tailnetNote)).join('')}
    </ul>
  </section>`;

const renderTile = (t: Tile, i: number, tailnetNote: string): string => {
  const state = initialState(t);
  // A tile that is not live yet is not a link; everything else navigates.
  const open = t.soon
    ? `<div class="tile__link" data-tile-link aria-disabled="true">`
    : `<a class="tile__link" href="${esc(t.href)}" data-tile-link>`;
  const close = t.soon ? '</div>' : '</a>';
  return `
  <li class="tile" data-tile="${esc(t.id)}" data-accent="${t.accent}" data-reach="${state}" ${t.tailnetOnly ? 'data-tailnet' : ''} style="--i:${i}">
    ${open}
      <div class="tile__top">
        <span class="tile__icon">${icon(t.icon)}</span>
        ${t.tailnetOnly ? `<span class="badge badge--lock" title="${esc(tailnetNote)}">${icon('lock', 'icon icon--xs')}<span>Tailnet</span></span>` : ''}
        ${t.soon ? `<span class="badge badge--muted">Soon</span>` : ''}
        <span class="tile__arrow">${icon('arrow')}</span>
      </div>
      <h3 class="tile__name">${esc(t.name)}</h3>
      <p class="tile__blurb">${esc(t.blurb)}</p>
      <div class="tile__foot">
        <span class="tile__host">${esc(hostOf(t.href))}</span>
        <span class="status" data-status>
          <span class="status__dot"></span>
          <span class="status__label">${STATUS_LABEL[state]}</span>
        </span>
      </div>
    ${close}
  </li>`;
};

/** Reflects a probe result on the tile: the data attribute drives the CSS, the label the text. */
export const setTileState = (root: ParentNode, tile: Tile, state: ReachState): void => {
  const el = root.querySelector<HTMLElement>(`[data-tile="${tile.id}"]`);
  if (!el) return;
  el.dataset.reach = state;
  const label = el.querySelector<HTMLElement>('.status__label');
  if (label) {
    label.textContent = state === 'unreachable' && tile.tailnetOnly ? 'Tailnet only' : STATUS_LABEL[state];
  }
};
