/**
 * Everything on the page lives here. Edit this file to add a tile, a project or a
 * link; nothing else needs to change. Types are in ./types.ts.
 */
import type { Link, Profile, Project, Tile } from './types';

export const profile: Profile = {
  name: 'Nish',
  tagline: 'Software engineer. This is where the things I build for myself live.',
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
    blurb: 'Options analyzer: a watchlist, transparent multi-factor scoring, and a paper ledger.',
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
    blurb: 'A job board that builds itself: sweeps 235+ company boards daily and scores every posting.',
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
];

export const projects: Project[] = [
  {
    name: 'Options Trading Analyzer',
    blurb:
      'Watchlist-driven options analysis with every score factor shown, self-collected IV history, and an installable PWA. 900+ tests.',
    stack: ['TypeScript', 'React', 'Fastify', 'SQLite', 'Turborepo'],
    source: 'private',
    href: 'https://trading.nish.software',
  },
  {
    name: 'Job Apps',
    blurb:
      'An AI job-hunting copilot for the family. Sweeps 13 sources and 235+ career pages, dedupes, then has Claude read each posting against a resume.',
    stack: ['TypeScript', 'React 19', 'Hono', 'PostgreSQL', 'Claude'],
    source: 'private',
    href: 'https://jobs.nish.software',
  },
  {
    name: 'Nishboard',
    blurb:
      'Ambient desktop dashboard for a second monitor: weather, Spotify, markets, machine vitals, and who is live on Twitch.',
    stack: ['Electron', 'React', 'Vite', 'Fastify'],
    source: 'https://github.com/nishant/nishboard',
  },
];

/** Shown on tailnet-only tiles and in the footer legend. */
export const tailnetNote = 'Only reachable on my tailnet';
