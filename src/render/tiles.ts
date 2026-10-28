import { icon } from '../icons';
import { esc, hostOf } from '../util';
import type { ReachState, Tile } from '../types';

const STATUS_LABEL: Record<ReachState, string> = {
  idle: '',
  probing: 'Checking',
  ok: 'Reachable',
  unreachable: 'Not reachable from here',
  soon: '',
};

/** @nish/ui status dot per state (nish-components.css): fills, halo and pulse come from there. */
const DOT_CLASS: Record<ReachState, string> = {
  idle: 'nish-dot',
  probing: 'nish-dot nish-dot--warn nish-dot--pulse',
  ok: 'nish-dot nish-dot--ok nish-dot--halo',
  unreachable: 'nish-dot',
  soon: 'nish-dot',
};

// Tailnet tiles start without a dot: probe.ts decides whether pinging them is possible.
const initialState = (t: Tile): ReachState =>
  t.soon ? 'soon' : t.probe && !t.tailnetOnly ? 'probing' : 'idle';

export const renderTiles = (tiles: Tile[], tailnetNote: string): string => {
  // Soon tiles go last; Array.prototype.sort is stable, so the config order holds otherwise.
  const sorted = [...tiles].sort((a, b) => Number(!!a.soon) - Number(!!b.soon));
  const recheck = tiles.some((t) => t.probe && !t.soon)
    ? `<button class="nish-btn nish-btn--ghost section__action" type="button" data-action="recheck">Recheck</button>`
    : '';
  return `
  <section class="section" id="apps" aria-labelledby="apps-heading">
    <div class="section__head">
      <h2 class="section__title" id="apps-heading">Apps</h2>
      ${recheck}
    </div>
    <ul class="tiles">
      ${sorted.map((t, i) => renderTile(t, i, tailnetNote)).join('')}
    </ul>
  </section>`;
};

const renderTile = (t: Tile, i: number, tailnetNote: string): string => {
  const state = initialState(t);
  // A tile that is not live yet is not a link; everything else navigates.
  const open = t.soon
    ? `<div class="tile__link" data-tile-link aria-disabled="true">`
    : `<a class="tile__link" href="${esc(t.href)}" data-tile-link>`;
  const close = t.soon ? '</div>' : '</a>';
  // One flat grid: tiles.css lays the same children out as a phone row or as a card.
  const live = t.soon
    ? `<span class="nish-badge tile__badge">Soon</span>`
    : `<span class="tile__arrow">${icon('arrow')}</span>`;
  const status = t.soon
    ? ''
    : `<span class="status" data-status>
          <span class="status__dot ${DOT_CLASS[state]}" aria-hidden="true"></span>
          <span class="status__label">${STATUS_LABEL[state]}</span>
        </span>`;
  const chevron = t.soon ? '' : `<span class="tile__chevron" aria-hidden="true">${icon('chevron')}</span>`;
  return `
  <li class="tile" data-tile="${esc(t.id)}" data-accent="${t.accent}" data-reach="${state}" ${t.tailnetOnly ? 'data-tailnet' : ''} style="--i:${i}">
    ${open}
      <span class="tile__icon">${icon(t.icon)}</span>
      ${live}
      <h3 class="tile__name">${esc(t.name)}</h3>
      ${status}
      <p class="tile__blurb">${esc(t.blurb)}</p>
      <span class="tile__host">${esc(hostOf(t.href))}</span>
      ${chevron}
    ${close}
    ${
      // Outside the link: a focusable badge cannot sit inside an <a>, and the link's
      // overflow:hidden would clip the tip. CSS places it over the link's top-right.
      t.tailnetOnly
        ? `<span class="nish-badge nish-tooltip nish-tooltip--bottom nish-tooltip--end tile__tailnet" tabindex="0" aria-describedby="tip-tailnet-${esc(t.id)}">${icon('lock', 'icon icon--xs')}<span class="tile__tailnet-text">Tailnet</span><span class="nish-tooltip-content" role="tooltip" id="tip-tailnet-${esc(t.id)}">${esc(tailnetNote)}</span></span>`
        : ''
    }
  </li>`;
};

/** Reflects a probe result on the tile: the data attribute drives the CSS, the label the text. */
export const setTileState = (root: ParentNode, tile: Tile, state: ReachState): void => {
  const el = root.querySelector<HTMLElement>(`[data-tile="${tile.id}"]`);
  if (!el) return;
  el.dataset.reach = state;
  const dot = el.querySelector<HTMLElement>('.status__dot');
  if (dot) dot.className = `status__dot ${DOT_CLASS[state]}`;
  const label = el.querySelector<HTMLElement>('.status__label');
  if (label) {
    label.textContent = state === 'unreachable' && tile.tailnetOnly ? 'Tailnet only' : STATUS_LABEL[state];
  }
};
