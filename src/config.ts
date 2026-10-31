/**
 * Page content edited here: profile, links and the tailnet note. The tiles come from hosting's
 * sites.yaml through ./tiles.generated.ts (see README, "Add a tile"). Types are in ./types.ts.
 */
import type { Link, Profile, Tile } from './types';
import { generatedTiles } from './tiles.generated';

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

export const tiles: Tile[] = generatedTiles;

/** Tooltip on the lock badge, and the explanation when a tailnet-only tile is tapped. */
export const tailnetNote = 'Only reachable on my tailnet';
