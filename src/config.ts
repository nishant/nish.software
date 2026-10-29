/**
 * Everything on the page lives here. Edit this file to add a tile or a link; nothing
 * else needs to change. Types are in ./types.ts.
 */
import type { Link, Profile, Tile } from './types';

export const profile: Profile = {
  name: 'Nish',
  fullName: 'Nishant Arora',
  tagline: 'Software hub',
  resumeUrl: '/resume.pdf',
};

export const links: Link[] = [
  { label: 'GitHub', href: 'https://github.com/nishant', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nish1997', icon: 'linkedin' },
];

/** Tiles are shown in this order. Hosts come from nishant/hosting sites.yaml. */
export const tiles: Tile[] = [
  {
    id: 'trading',
    name: 'Trading',
    blurb:
      'Watchlist-driven options analysis with every score factor shown, self-collected IV history, and an installable PWA.',
    href: 'https://trading.nish.software',
    icon: 'trading',
    accent: 'emerald',
    tailnetOnly: true,
    probe: true,
  },
  {
    id: 'startpage',
    name: 'Startpage',
    blurb: 'The browser start page I open a hundred times a day. Links, notes, weather, mail.',
    href: 'https://start.nish.software',
    icon: 'startpage',
    accent: 'indigo',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'trackers',
    name: 'Trackers',
    blurb: 'Price and fare trackers: one item across every store, flights per trip, each with its full price history.',
    href: 'https://trackers.nish.software',
    icon: 'chart',
    accent: 'violet',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'jobs',
    name: 'Jobs',
    blurb:
      'A job board that builds itself: sweeps 13 sources and 235+ career pages daily, dedupes, and has Claude read each posting against a resume.',
    href: 'https://jobs.nish.software',
    icon: 'jobs',
    accent: 'amber',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'trips',
    name: 'Trips',
    blurb:
      'Every trip I plan, as its own page: day-by-day itinerary, map, food, bookings and costs, plus a calendar of what is coming up.',
    href: 'https://trips.nish.software',
    icon: 'trips',
    accent: 'rose',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    blurb:
      'Guides for my Bedrock realm: houses, monuments and survival farms built layer by layer in 3D, reference charts, and my own add-on packs.',
    href: 'https://minecraft.nish.software',
    icon: 'minecraft',
    accent: 'lime',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'status',
    name: 'Status',
    blurb: 'Uptime and health for every nish.software site and the PC that runs them.',
    href: 'https://status.nish.software',
    icon: 'pulse',
    accent: 'teal',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'workflows',
    name: 'Workflows',
    blurb: 'Live view of Claude sessions: what each one is doing, its plan, workflows and agents.',
    href: 'https://workflows.nish.software',
    icon: 'flow',
    accent: 'indigo',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'design',
    name: 'Design system',
    blurb: 'The shared theme and components every nish.software app is built from.',
    href: 'https://design.nish.software',
    icon: 'palette',
    accent: 'indigo',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'demos',
    name: 'Demos',
    blurb: 'Short narrated videos of every app, with sound and subtitles.',
    href: 'https://demos.nish.software',
    icon: 'play',
    accent: 'indigo',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'nishboard',
    name: 'Nishboard',
    blurb:
      'Ambient dashboard for a second monitor: weather, Spotify, markets, machine vitals, and who is live on Twitch.',
    href: 'https://dash.nish.software',
    icon: 'monitor',
    accent: 'sky',
    tailnetOnly: false,
    probe: false,
    soon: true,
  },
];

/** Tooltip on the lock badge, and the explanation when a tailnet-only tile is tapped. */
export const tailnetNote = 'Only reachable on my tailnet';
