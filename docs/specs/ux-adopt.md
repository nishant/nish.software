# Hub: adopt @nish/ui v0.7.0

Status: in progress · Slug: ux-adopt · Date: 2026-10-28 · Size: medium
Repos: nish.software (this spec), checkout `C:\Code\nish.software-ux-adopt` on branch `ux-adopt`
ROADMAP: `ROADMAP.md` → "Adopt @nish/ui v0.7.0" (entry already exists; do not add another)

## Goal

The first UX pass (spec at `git show 58069c61:docs/specs/ux-overhaul.md`) is live: a phone row list
under 600px, cards from 600px, a prerendered page, head metadata and a Recheck control. It parked a
list of items for when @nish/ui v0.7.0 shipped. v0.7.0 is out and already installed on `master`
(`package.json` points at the `v0.7.0` tag). This pass moves the hub onto the v0.7.0 static
classes so the hub stops carrying its own copies, with no visible regression at 360, ~840 and
1440 in light and dark.

Outcomes:
1. Every tile link is a `.nish-link-card`, with its icon, name, blurb and host on the
   `.nish-link-card-icon` / `-title` / `-blurb` / `-meta` classes, and its accent passed through
   `--nish-card-accent`. Local declarations that duplicate the DS rules are deleted (listed per
   rule in T1), including the `--tile-hue-soft` variable and the soon-card dashed border and
   cursor rules. The row layout under 600px and the cards from 600px look the same as today.
2. The Recheck button uses v0.7.0's busy button (`.nish-btn[aria-busy="true"]`: label hidden,
   spinner in its place, width kept). The "Checking…" text swap and the `disabled` toggle are
   gone; a second click while running is still ignored.
3. The viewport meta is the one the v0.7.0 README asks for (`interactive-widget=resizes-content`).
4. The unreachable-tile toast sits at the bottom with no local offset (v0.7.0's `.nish-toast`
   `bottom` reads `--nish-bottom-inset`; the hub sets none, so it is 16px plus the safe area).
   Verified, no code.
5. README describes the v0.7.0 classes the hub uses.

## Out of scope

- React components (AppHeader, BottomNav, MoreSheet, NavRail, ResponsiveTable, CommandPalette,
  charts, `useDocumentTitle`): the hub is vanilla TS with no React. See Decisions for each.
- Content (`src/config.ts`), the probe logic (`src/probe.ts`), the prerender plugin
  (`vite.config.ts`), theme wiring (`src/theme.ts`), the hero and footer styles, icons, the
  manifest and images.
- design.nish.software (the @nish/ui repo owns it).

## Decisions

- **Tiles adopt `.nish-link-card` as the base class, not `.nish-link-card--row`.** `--row` is a
  fixed 64px row with a one-line blurb and no meta, chosen by class, so it cannot switch to cards at
  600px. The hub keeps its own media-query layouts on top of the base class. All DS rules are in
  `:where()` (zero specificity), so any hub class rule wins where they differ.
- **Accent:** the DS `data-accent` values are `chart-1…8 | accent`, not the hub's named hues. The
  hub keeps `data-accent="<hue>"` on the `<li>` and sets `--nish-card-accent: var(--tile-hue)` on
  `.tile__link`. The DS icon fill (`color-mix(in srgb, accent 14%, transparent)`) is exactly what
  every `--nish-<hue>-soft` token is in v0.7.0 (checked in `dist/nish.css`), so `--tile-hue-soft`
  is deleted with no color change.
- **Row-only overrides go in `@media (max-width: 599.98px)`.** The DS gives the card its 1px border,
  12px radius and card shadow; the rows must drop them, but the cards from 600px must keep the DS
  border so the DS dashed `aria-disabled` border applies to the soon card. Putting the row resets
  in a max-width block (instead of the mobile-first base) means the card layout inherits the DS
  border and shadow with nothing to undo.
- **Soon card:** the DS disabled look (dashed border, no shadow, `cursor: not-allowed`, title
  `--nish-hi2`) replaces the local dashed rule and `cursor: default`. The tile's `opacity: 0.6`
  stays. Small accepted changes: the soon card loses its shadow, and its cursor is not-allowed.
- **Title stays an `<h3>`** with the DS title class (the DS sample uses a span; the hub keeps its
  heading outline). Its line-height becomes the DS 1.375 (was 1.5 inherited); accepted.
- **Recheck busy:** `aria-busy="true"` only, no `disabled`: `:disabled` paints `.nish-btn` with a
  filled `--nish-elevated` background, which looks wrong on the ghost button, and the DS busy rule
  already sets `pointer-events: none`; the existing `checking` guard ignores keyboard presses. The
  label stays "Recheck" in the DOM (the DS hides it) so the button keeps its width and name. The
  per-tile status labels ("Checking", "Reachable") still announce progress. One local rule stays:
  `.section__action` sets `color`, which beats the DS `:where()` busy `color: transparent`, so
  `.section__action[aria-busy='true'] { color: transparent; }` is needed.
- **No sticky chrome, no `.nish-sticky` / `mountStuck`:** the hub is a short landing page (about
  1150px at 360) and its topbar scrolls away with the hero; a sticky bar would take 56px of a 780px
  cover screen for one theme button. Nothing is sticky or fixed except the DS toast, so the
  layout contract has nothing to publish (`--nish-header-h`, `--nish-bottom-inset` stay unset).
- **No `.nish-skeleton`:** the page is prerendered, so there is no loading state; the probe's
  in-progress state is the pulsing `nish-dot--warn nish-dot--pulse` dot, which already is DS.
- **`.nish-spinner` used only through the busy button**; no standalone spinner.
- **`@nish/ui/format`: not used.** It has no host or year helper; `hostOf` (`src/util.ts`) and the
  `[data-year]` refresh stay. No "checked N ago" line is added (no `ago()`).
- **`useDocumentTitle`: not applicable.** One page, static `<title>Nish</title>` in
  `index.html`, unchanged.
- **AppHeader, BottomNav/MoreSheet/NavRail (`.nish-bottom-nav`), ResponsiveTable, CommandPalette,
  LineChart/BarChart: not adopted** (no React; one page with no sections, no tables, nine tiles,
  no charts), as the first-pass spec already concluded.
- **Toaster offset:** no local toast CSS exists (`grep -rn "nish-toast" src/styles` is empty);
  verify only.
- **Viewport meta:** add `interactive-widget=resizes-content` now, as the v0.7.0 README asks for
  every app, even though the hub has no input yet (harmless, keeps apps consistent).
- **Local sr-only rules stay:** v0.7.0 ships no visually-hidden utility class.

## Current state

- `src/render/tiles.ts:47-81` `renderTile` renders `li.tile[data-tile][data-accent][data-reach][data-tailnet?]`
  with `.tile__link` (`<a data-tile-link>`, or `<div data-tile-link aria-disabled="true">` for
  soon) holding `.tile__icon`, `.tile__arrow` or `.nish-badge.tile__badge` ("Soon"), `h3.tile__name`,
  `.status` (dot + label, not for soon), `p.tile__blurb`, `.tile__host`, `.tile__chevron` (not for
  soon), and after the link the Tailnet badge `span.nish-badge.nish-tooltip….tile__tailnet`.
- `src/styles/tiles.css` (388 lines): accent map (lines 1-10), mobile-first row layout (base rules),
  reach states, Tailnet badge, `@media (min-width: 600px)` cards, `(min-width: 600px) and
  (hover: hover)` lift and glow, `(min-width: 1024px)` 3 columns.
- `src/main.ts:58-80` `runProbes` toggles `recheck.disabled`, `aria-busy` and the text
  "Checking…" / "Recheck". `src/styles/layout.css:23-34` `.section__action` and its
  `[aria-busy='true']` rule (`cursor: progress; opacity: 0.7`).
- `index.html` viewport: `width=device-width, initial-scale=1.0, viewport-fit=cover`.
- v0.7.0 rules this builds on (`node_modules/@nish/ui/dist/nish-components.css`, source
  `C:\Code\ui\src\css\components.css:1921-2067` link card, `:1528-1595` spinner and busy button,
  `:1233` toast):
  - `:where(.nish-link-card)`: `--nish-card-accent: var(--nish-accent)`, `position: relative`,
    `display: grid`, `grid-template-columns: 40px 1fr`, areas `icon title / blurb blurb / meta meta`,
    `align-items: center`, `column-gap: 12px`, `row-gap: 4px`, `min-height: 44px`, `padding: 16px`,
    `border: 1px solid var(--nish-line)`, `border-radius: var(--nish-radius-card)` (12px),
    `background: var(--nish-surface)`, `box-shadow: var(--nish-shadow-card)`, `color: var(--nish-hi2)`,
    `font-size: var(--nish-text-sm)`, `text-decoration: none`, `cursor: pointer`, a 150ms
    transform/box-shadow/border-color transition.
  - `@media (hover: hover) :where(a.nish-link-card:hover)`: `border-color: var(--nish-line-strong)`,
    `box-shadow: var(--nish-shadow-pop)`, `transform: translateY(-2px)`.
  - `:where(.nish-link-card:focus-visible)`: outline in `--nish-focus` (the hub's own
    `:focus-visible` rule in `base.css` wins and keeps the tile hue).
  - `:where(.nish-link-card-icon)`: `grid-area: icon`, grid, centered, 40x40,
    `border-radius: var(--nish-radius-md)` (14px), background accent 14%, color accent.
  - `:where(.nish-link-card-title)`: `grid-area: title`, `min-width: 0`, `color: var(--nish-hi)`,
    `font-size: var(--nish-text-base)`, semibold, `line-height: 1.375`, `overflow-wrap: anywhere`.
  - `:where(.nish-link-card-blurb)`: `grid-area: blurb`, `-webkit-box`, vertical, 3-line clamp
    (`-webkit-line-clamp: 3; line-clamp: 3`), `overflow: hidden`, `margin-top: 4px`,
    `color: var(--nish-hi3)`.
  - `:where(.nish-link-card-meta)`: `grid-area: meta`, `margin-top: 4px`, `color: var(--nish-hi3)`,
    `font-size: var(--nish-text-xs)`, tabular-nums.
  - `:where(.nish-link-card[aria-disabled='true'])`: `border-style: dashed`, `box-shadow: none`,
    `color: var(--nish-hi3)`, `cursor: not-allowed`, `transform: none`; its title `--nish-hi2`.
  - `:where(.nish-btn[aria-busy='true'])`: `position: relative; color: transparent;
    pointer-events: none`, children hidden, a 16px spinner in `::after` (`--nish-hi3` ring,
    `--nish-hi` arc), a slow pulse under reduced motion.
  - `:where(.nish-btn:disabled)`: filled `--nish-elevated` background, `--nish-ghost` text.
  - `.nish-toast` `bottom: max(calc(var(--nish-bottom-inset, 0px) + 8px), calc(16px + env(safe-area-inset-bottom)))`.
- Tests: the repo has no unit or e2e tests. Checks are `npm run typecheck` and `npm run build`
  (what CI's `deploy.yml` runs), plus the visual check `C:\Code\ui\tools\visual-check.mjs` with
  `tools/hub.visual.json` (expects `npm run preview` on port 4173). No test files change.

## Design

### Data
Not affected.

### UI

#### Tile markup (T1)
Live tile (attribute order free; only classes and one `aria-hidden` change):

```html
<li class="tile" data-tile="trading" data-accent="emerald" data-reach="idle" data-tailnet style="--i:0">
  <a class="nish-link-card tile__link" href="https://trading.nish.software" data-tile-link>
    <span class="nish-link-card-icon tile__icon" aria-hidden="true">{icon(t.icon)}</span>
    <span class="tile__arrow">{icon('arrow')}</span>
    <h3 class="nish-link-card-title tile__name">Trading</h3>
    <span class="status" data-status>…unchanged…</span>
    <p class="nish-link-card-blurb tile__blurb">…</p>
    <span class="nish-link-card-meta tile__host">trading.nish.software</span>
    <span class="tile__chevron" aria-hidden="true">{icon('chevron')}</span>
  </a>
  <!-- Tailnet badge unchanged -->
</li>
```
Soon tile: `<div class="nish-link-card tile__link" data-tile-link aria-disabled="true">`, same
child classes, still no arrow, status or chevron, still the `Soon` badge.

#### Tile CSS per width (T1)
Unchanged look at every width, except the accepted soon-card changes in Decisions. Under 600px:
one opaque list card of 72px+ rows (no per-row border, radius or shadow, no lift on hover, flat
`--nish-elevated` tint on hover). 600-1023px: 2 columns of cards with the DS border and shadow;
the soon card dashed. From 1024px: 3 columns. Hover lift, accent border and glow on live cards
from 600px exactly as today.

#### Recheck (T2)
Idle: ghost text button "Recheck", 44px tall. Running: same size, label invisible, 16px spinner
centered (`--nish-hi3` ring, `--nish-hi` arc), clicks ignored. After: "Recheck" again. Light and
dark both use the roles above. Under reduced motion the spinner pulses (DS rule).

### Security
Not affected: static public page, no new input, no new requests.

### Performance
Not affected: CSS shrinks slightly (deleted duplicate declarations); no new JS. `dist/index.html`
grows by the added class names (under 1 kB).

### Mobile, light and dark
360: rows as today, 72px+ each, whole row is the link, Tailnet lock 44x44 hit area, no horizontal
scroll. ~840: 2 columns, Nishboard (soon) spans both, dashed. 1440: 3x3. Every color is a
`--nish-*` role, so light and dark follow the theme. Toast at 360: full width minus 16px gutters,
16px above the bottom edge plus the safe area.

### Ops
None. Push to `master` deploys as today.

## Tasks

Both tasks work in `C:\Code\nish.software-ux-adopt` (dependencies installed, `@nish/ui` 0.7.0 in
`node_modules`). Do not commit; the integrate step commits.

### T1 Tiles on `.nish-link-card`
- Repo / checkout: nish.software at `C:\Code\nish.software-ux-adopt`
- Owns: `src/render/tiles.ts`, `src/styles/tiles.css`
- Reads (does not edit): `src/styles/base.css`, `src/styles/layout.css`,
  `node_modules/@nish/ui/dist/nish-components.css` (search `nish-link-card`), `src/main.ts`
- Depends on: none
- Change:
  1. `src/render/tiles.ts` `renderTile`: add the DS classes per Design → Tile markup:
     `nish-link-card` before `tile__link` on both the `<a>` and the soon `<div>`;
     `nish-link-card-icon tile__icon` plus `aria-hidden="true"` on the icon span;
     `nish-link-card-title tile__name` on the `h3`; `nish-link-card-blurb tile__blurb` on the `p`;
     `nish-link-card-meta tile__host` on the host span. Update the comment above `live` to say
     "One flat grid on @nish/ui's .nish-link-card: tiles.css lays the same children out as a phone
     row or as a card." Nothing else in the file changes (`STATUS_LABEL`, `DOT_CLASS`,
     `setTileState`, sorting, the Recheck button markup stay).
  2. `src/styles/tiles.css`, accent map (lines 1-10): drop `--tile-hue-soft` from every line, so
     each reads e.g. `[data-accent='emerald'] { --tile-hue: var(--nish-emerald); }`. Update the
     comment above it to "map it to the @nish/ui hue; .tile__link passes it to the link card as
     --nish-card-accent."
  3. Update the file's header comment (the "Mobile first…" block) to add: "Each link is @nish/ui's
     .nish-link-card (zero-specificity rules): it supplies the grid, the icon fill and color, the
     title and blurb type, the card border and shadow, and the dashed soon card; this file only
     sets the hub's two layouts on top."
  4. Base `.tile__link` rule: add `--nish-card-accent: var(--tile-hue);`. Delete
     `position: relative`, `display: grid`, `column-gap: 12px` and `align-items: center` (the DS
     sets the same). Keep `grid-template-columns`, `grid-template-areas`, `row-gap: 0`,
     `height: 100%`, `min-height: 72px`, `padding: 10px 16px`, `overflow: hidden`, `background`,
     `transition`.
  5. Move the row-only chrome into a new block placed right after the base `.tile__link::after`
     rule:
     ```css
     /* Rows only: the list card (.tiles) is the card, so each link drops the link card's own
        border, radius, shadow and hover lift. From 600px the DS card chrome applies as is. */
     @media (max-width: 599.98px) {
       .tile__link {
         border: 0;
         border-radius: 0;
         box-shadow: none;
       }
       .tile + .tile {
         border-top: 1px solid var(--nish-line);
       }
       .tile:first-child,
       .tile:first-child .tile__link {
         border-top-left-radius: calc(var(--nish-radius-lg) - 1px);
         border-top-right-radius: calc(var(--nish-radius-lg) - 1px);
       }
       .tile:last-child,
       .tile:last-child .tile__link {
         border-bottom-left-radius: calc(var(--nish-radius-lg) - 1px);
         border-bottom-right-radius: calc(var(--nish-radius-lg) - 1px);
       }
     }
     ```
     and delete the existing base `.tile + .tile { border-top: … }`, `.tile:first-child…` and
     `.tile:last-child…` rules (they move into this block). Note the `.tile:first-child` rule already wins over `.tile__link`'s
     `border-radius: 0` by specificity.
  6. Base `.tile__icon`: keep only `border-radius: 11px;` and
     `border: 1px solid color-mix(in oklab, var(--tile-hue) 28%, transparent);`. Delete
     `grid-area`, `width`, `height`, `display`, `place-items`, `color`, `background` (DS). Keep the
     600px rule (`width/height: 42px; border-radius: 12px; align-self: center`).
  7. Base `.tile__name`: keep `grid-area: name`, `letter-spacing`, `white-space: nowrap`,
     `overflow: hidden`, `text-overflow: ellipsis`. Delete `margin: 0` (base.css resets `h3`),
     `font-size` and `font-weight` (DS). The 600px rule stays as is.
  8. Base `.tile__blurb`: keep `grid-area: blurb` (it is the same name as the DS but keep it for
     readability), `-webkit-line-clamp: 2`, add `line-clamp: 2;`, keep `margin: 0` (beats the DS
     `margin-top: 4px`), `font-size`, `line-height`, `color: var(--nish-hi2)`. Delete `display`,
     `-webkit-box-orient`, `overflow` (DS). In the 600px rule add `line-clamp: unset;` next to
     `-webkit-line-clamp: unset;`.
  9. Base `.tile__host`: keep `grid-area: host`, `display: none`, `font-family`,
     `overflow`, `text-overflow`, `white-space`, add `margin-top: 0;`. Delete `font-size` and
     `color` (DS meta sets `--nish-text-xs` and `--nish-hi3`).
  10. Row hover block (`@media (hover: hover)`, the flat tint): change the media query to
      `@media (max-width: 599.98px) and (hover: hover)` and add a second rule inside it:
      ```css
      .tile__link:hover:not(:active) {
        transform: none;
        box-shadow: none;
      }
      ```
      (cancels the DS `a.nish-link-card:hover` lift and pop shadow on rows, including unreachable
      rows). The existing tint rule `.tile:not([data-reach='soon'], [data-reach='unreachable']) .tile__link:hover { background-color: var(--nish-elevated); }` stays inside it. Then the 600px+
      hover block no longer needs `.tile:not(…) .tile__link:hover { background-color: var(--hub-surface); }`: delete that rule.
  11. Reach states: delete `.tile[data-reach='soon'] .tile__link { cursor: default; }` (the DS
      disabled card sets `cursor: not-allowed`). Keep every other reach rule.
  12. `@media (min-width: 600px)` block:
      - `.tile__link`: delete `border: 1px solid var(--nish-line);` and
        `box-shadow: var(--nish-shadow-card);` (DS). Keep everything else, including
        `border-radius: inherit` and `background`.
      - Delete the rule resetting `.tile:first-child, .tile:first-child .tile__link,
        .tile:last-child, .tile:last-child .tile__link { border-radius: var(--nish-radius-lg); }`
        (the radii now live in the max-width block; `.tile { border-radius: var(--nish-radius-lg) }`
        and the link's `inherit` cover the cards).
      - Delete `.tile + .tile { border-top: 0; }` (the row divider now only exists in the
        max-width block from step 5).
      - Delete `.tile[data-reach='soon'] .tile__link { border-style: dashed; }` (DS).
  13. Everything else stays: `.tiles` rules, `.tile` rules, `::before` hairline, `::after` glow,
      `:active` scale, arrow, chevron, badge, status and sr-only rules, Tailnet badge rules, the
      `(min-width: 600px) and (hover: hover)` lift, border tint and glow on `.tile:hover .tile__link`
      (it outranks the DS hover), the 1024px block.
- Edge cases:
  - Unreachable card at 600px+ on hover: no lift (existing `transform: none` rule), no DS lift.
  - Soon card at 600px+: dashed border from the DS, no shadow, dimmed by `opacity: 0.6`, not a link.
  - Soon row under 600px: no border (the max-width `border: 0` outranks the DS dashed rule).
  - Keyboard focus on a row or card: the hub's `:focus-visible` outline in the tile hue (the DS
    focus rule loses on specificity). Not clipped (`.tiles` has no overflow).
  - Tailnet badge positions are unchanged (row padding 10px 16px and card padding 18px unchanged;
    the card's 1px border now comes from the DS).
  - A tile name longer than the row: still one line with an ellipsis (`white-space: nowrap`
    beats the DS `overflow-wrap: anywhere`).
- Acceptance (in the checkout):
  - `npm run typecheck && npm run build` pass.
  - `grep -c 'nish-link-card tile__link' dist/index.html` prints 1 and
    `grep -o 'nish-link-card tile__link' dist/index.html | wc -l` prints 9.
  - `grep -c 'tile-hue-soft' src/styles/tiles.css` prints 0; `grep -c 'border-style: dashed' src/styles/tiles.css` prints 0.
  - `npm run preview` (port 4173), then from `C:\Code\ui`:
    `node tools/visual-check.mjs C:/Code/nish.software-ux-adopt/tools/hub.visual.json --out C:/Users/nish5/AppData/Local/Temp/hub-adopt-visual`
    passes (no horizontal overflow, no tap-target violations). Compare `phone-small-*`, `fold-*`,
    `desktop-*` in dark and light against the live https://nish.software: rows with no per-row
    border or shadow at 360 and one rounded list card around them; 2 columns at 840 with the
    dashed Nishboard card spanning both; 3x3 at 1440; icons the same tint as live.
  - In a browser at 360: every `.tile__link` is at least 72px tall; computed `border-top-width`
    of a middle `.tile__link` is `0px`; at 840 a live `.tile__link` has `border-top-width: 1px`
    and the soon one `border-top-style: dashed`.

### T2 Recheck busy spinner, viewport, README
- Repo / checkout: nish.software at `C:\Code\nish.software-ux-adopt`
- Owns: `src/main.ts`, `src/styles/layout.css`, `index.html`, `README.md`
- Reads (does not edit): `src/render/tiles.ts`, `node_modules/@nish/ui/dist/nish-components.css`
  (search `aria-busy`)
- Depends on: none
- Change:
  1. `src/main.ts`, replace the body of `runProbes` so it reads:
     ```ts
     // @nish/ui's busy .nish-btn hides the label and shows a spinner in its place, and ignores
     // pointer clicks; `checking` also ignores keyboard presses while a round runs.
     const runProbes = async (): Promise<void> => {
       if (checking) return;
       checking = true;
       recheck?.setAttribute('aria-busy', 'true');
       try {
         await probeAll(tiles, (tile, state) => setTileState(app, tile, state));
       } finally {
         checking = false;
         recheck?.removeAttribute('aria-busy');
       }
     };
     ```
     Nothing else in `main.ts` changes (the `recheck` query, `let checking`, the click listener and
     the initial `void runProbes()` stay).
  2. `src/styles/layout.css`: replace the `.section__action[aria-busy='true']` rule with
     ```css
     /* Busy: @nish/ui's .nish-btn[aria-busy] draws the spinner; this rule's color would
        otherwise outrank its transparent label. */
     .section__action[aria-busy='true'] {
       color: transparent;
     }
     ```
  3. `index.html`: the viewport meta becomes
     `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content" />`.
     Nothing else changes; `<div id="app"></div>` must stay byte-for-byte (the prerender plugin
     matches it).
  4. `README.md`, the `src/styles/*.css` row: change the class list to "(`nish-btn`, `nish-badge`,
     `nish-dot`, `nish-theme-btn`, `nish-tooltip` on the Tailnet badges, `nish-link-card` on the
     tiles, and the busy `nish-btn[aria-busy]` spinner on Recheck)" and change "`tiles.css` maps
     each tile's `data-accent` to `--tile-hue` / `--tile-hue-soft`" to "`tiles.css` maps each
     tile's `data-accent` to `--tile-hue`, which it passes to the link card as `--nish-card-accent`".
     In the `src/probe.ts` row, "The Recheck button in the Apps header runs it again." becomes "The
     Recheck button in the Apps header runs it again (it shows a spinner while it runs)."
- Edge cases:
  - Recheck clicked or Enter pressed while running: ignored (`checking`), no second round.
  - A probe throws: `probe` catches; `finally` clears `aria-busy`.
  - No Recheck button (no probe-able tiles): `runProbes` still runs once.
  - Reduced motion: the spinner pulses instead of spinning (DS rule).
- Acceptance (in the checkout):
  - `npm run typecheck && npm run build` pass.
  - `grep -c 'Checking…' src/main.ts` prints 0; `grep -c 'disabled' src/main.ts` prints 0.
  - `grep -c 'interactive-widget=resizes-content' dist/index.html` prints 1.
  - On `npm run preview` at 360 in light and dark: click Recheck; while probes run the button
    shows a spinner, no "Recheck" text, and keeps its width (compare `getBoundingClientRect().width`
    before and during); afterwards it reads "Recheck". Force an unreachable tile (DevTools request
    blocking for one tile host, or Playwright `page.route(url, r => r.abort())`), tap it: the toast
    shows 16px above the bottom edge, full width minus the gutters.

## Waves

W1: T1, T2 (owned files disjoint, no shared contract beyond class names already in the DOM).
Integrate after W1: `npm run typecheck && npm run build`, then the T1 and T2 grep checks on
`dist/index.html`.

## Review focus

- 360 light and dark: rows must look exactly like live (no stray 1px borders, 12px radii or card
  shadows on rows; no hover lift on a desktop window narrowed under 600px). Icon tint identical.
- 840 and 1440: card borders, shadows and hover lift and glow identical to live; soon card dashed.
- Specificity traps: any place the DS `:where()` rule now applies because a local declaration was
  deleted (blurb clamp count, title color and line-height, host color, soon-card color).
- Recheck: spinner visible in both themes on the ghost button, label hidden, no width jump, double
  activation ignored.
- Toast at 360 with no bottom bar: 16px above the bottom plus safe area.

## Release

Single repo. PR `ux-adopt` → `master`, merge commit, which runs `deploy.yml`. Verify live:
https://nish.software returns 200; `curl -s https://nish.software/ | grep -o 'nish-link-card tile__link' | wc -l`
prints 9; screenshots at 360x780, 840x900 and 1440x900 in light and dark (`tools/hub.visual.json`
with the page URL pointed at https://nish.software/); Recheck spinner seen once live. Mark the
ROADMAP entry "Adopt @nish/ui v0.7.0" done following the file's convention and delete this spec in
the release commit.

## Open questions for the research phase

None.
