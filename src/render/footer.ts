import { icon } from '../icons';
import { esc } from '../util';
import type { Link, Profile } from '../types';

export const renderFooter = (profile: Profile, links: Link[], tailnetNote: string): string => `
  <footer class="site-footer">
    <p class="legend" id="reach-legend">
      <span class="legend__item"><span class="status__dot status__dot--ok"></span> answering</span>
      <span class="legend__item"><span class="status__dot status__dot--off"></span> not reachable from where you are</span>
      <span class="legend__item">${icon('lock', 'icon icon--xs')} ${esc(tailnetNote)}</span>
    </p>
    <ul class="site-footer__links">
      ${links.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}
      <li><a href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener">Resume</a></li>
      <li><a href="https://github.com/nishant/nish.software" target="_blank" rel="noopener">This site</a></li>
    </ul>
    <p class="site-footer__copy">&copy; ${new Date().getFullYear()} ${esc(profile.name)}</p>
  </footer>`;
