/** One accent hue per tile; styles/tiles.css maps each to its @nish/ui --nish-<hue> and --nish-<hue>-soft. */
export type Accent = 'emerald' | 'indigo' | 'amber' | 'lime' | 'rose' | 'sky' | 'violet' | 'teal';

export type IconName =
  | 'trading'
  | 'startpage'
  | 'jobs'
  | 'minecraft'
  | 'trips'
  | 'monitor'
  | 'flow'
  | 'play'
  | 'pulse'
  | 'chart'
  | 'palette'
  | 'github'
  | 'linkedin'
  | 'file'
  | 'lock'
  | 'arrow'
  | 'chevron'
  | 'refresh'
  | 'code';

export interface Profile {
  /** Wordmark text. */
  name: string;
  /** Full name, for the copyright line. */
  fullName: string;
  /** One line under the wordmark. */
  tagline: string;
  /** Path or URL to the resume PDF. */
  resumeUrl: string;
}

export interface Link {
  label: string;
  href: string;
  icon: IconName;
}

export interface Tile {
  /** Stable id, also used in the DOM. */
  id: string;
  name: string;
  /** One sentence, shown under the name. */
  blurb: string;
  /** Where the tile goes. Also what gets probed. */
  href: string;
  icon: IconName;
  accent: Accent;
  /**
   * The app is only reachable from Nish's tailnet. Always shows the lock badge and
   * the explanation; combined with the probe result to decide the dimmed state.
   */
  tailnetOnly: boolean;
  /** Ping the URL on load and reflect whether it answered. */
  probe: boolean;
  /** Not live yet: shown muted with a "Coming soon" label, not a link. Set probe: false. */
  soon?: boolean;
}

/** Probe outcome for a tile. `idle` = no dot (probe: false, or a tailnet host that could not be checked);
 *  `ok` | `degraded` | `down` = what status.nish.software reports (`ok` also = the fallback probe got an answer);
 *  `unreachable` = the fallback probe got no answer; `soon` = not live yet. */
export type ReachState = 'idle' | 'probing' | 'ok' | 'degraded' | 'down' | 'unreachable' | 'soon';

/** One host as status.nish.software reports it. */
export interface SiteHealth {
  state: 'ok' | 'degraded' | 'down';
  /** Fraction 0..1 of checks that passed in the last 24 h; null when status has no data. */
  uptime24h: number | null;
  /** Epoch ms of the check this state comes from. */
  checkedAt: number;
}
