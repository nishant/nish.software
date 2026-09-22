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
    href: 'https://startpage.nish.software',
    icon: 'startpage',
    accent: 'indigo',
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
    id: 'minecraft',
    name: 'Minecraft',
    blurb: 'Bedrock enchantment loadouts for the server crew, on one page.',
    href: 'https://mc.nish.software',
    icon: 'minecraft',
    accent: 'lime',
    tailnetOnly: false,
    probe: true,
  },
  {
    id: 'nishboard',
    name: 'Nishboard',
    blurb:
      'Ambient dashboard for a second monitor: weather, Spotify, markets, machine vitals, and who is live on Twitch.',
    href: 'https://nishboard.nish.software',
    icon: 'monitor',
    accent: 'sky',
    tailnetOnly: false,
    probe: false,
    soon: true,
  },
];

/** Tooltip on the lock badge, and the explanation when a tailnet-only tile is tapped. */
export const tailnetNote = 'Only reachable on my tailnet';
