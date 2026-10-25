import { icon } from '../icons';
import { esc } from '../util';
import type { Link, Profile } from '../types';

export const renderHeader = (profile: Profile, links: Link[]): string => `
  <header class="site-header">
    <nav class="topbar" aria-label="Site">
      <a class="wordmark" href="/" aria-label="${esc(profile.name)} home">${esc(profile.name)}</a>
      <button class="nish-theme-btn pill" type="button" data-action="toggle-theme" aria-label="Theme"></button>
    </nav>
    <div class="hero">
      <p class="hero__tagline">${esc(profile.tagline)}</p>
      <ul class="hero__links" aria-label="Links">
        ${links
          .map(
            (l) => `
          <li><a class="nish-btn pill" href="${esc(l.href)}" target="_blank" rel="noopener">${icon(l.icon)}<span>${esc(l.label)}</span></a></li>`,
          )
          .join('')}
        <li><a class="nish-btn nish-btn--soft pill pill--accent" href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener">${icon('file')}<span>Resume</span></a></li>
      </ul>
    </div>
  </header>`;
