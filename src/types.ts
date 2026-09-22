/** One accent hue per tile; the CSS in styles/tokens.css defines each in both themes. */
export type Accent = 'emerald' | 'indigo' | 'amber' | 'lime' | 'rose' | 'sky';

export type IconName =
  | 'trading'
  | 'startpage'
  | 'jobs'
  | 'minecraft'
  | 'monitor'
  | 'github'
  | 'linkedin'
  | 'file'
  | 'lock'
  | 'sun'
  | 'moon'
  | 'arrow'
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

/** Probe outcome for a tile. `idle` = never probed (probe: false); `soon` = not live yet. */
export type ReachState = 'idle' | 'probing' | 'ok' | 'unreachable' | 'soon';
