import { icon } from '../icons';
import { esc } from '../util';
import type { Link, Profile } from '../types';

export const renderHeader = (profile: Profile, links: Link[]): string => `
  <header class="site-header">
    <nav class="topbar" aria-label="Site">
      <a class="wordmark" href="/" aria-label="${esc(profile.name)} home">${esc(profile.name)}</a>
      <button class="theme-toggle" type="button" data-action="toggle-theme" data-choice="system" aria-label="Theme: System. Switch to Light">
        <span class="theme-toggle__icons" aria-hidden="true">
          <span class="theme-toggle__icon theme-toggle__icon--system">${icon('system')}</span>
          <span class="theme-toggle__icon theme-toggle__icon--light">${icon('sun')}</span>
          <span class="theme-toggle__icon theme-toggle__icon--dark">${icon('moon')}</span>
        </span>
        <span class="theme-toggle__label" aria-hidden="true">System</span>
      </button>
    </nav>
    <div class="hero">
      <p class="hero__tagline">${esc(profile.tagline)}</p>
      <ul class="hero__links" aria-label="Links">
        ${links
          .map(
            (l) => `
          <li><a class="pill" href="${esc(l.href)}" target="_blank" rel="noopener">${icon(l.icon)}<span>${esc(l.label)}</span></a></li>`,
          )
          .join('')}
        <li><a class="pill pill--accent" href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener">${icon('file')}<span>Resume</span></a></li>
      </ul>
    </div>
  </header>`;
