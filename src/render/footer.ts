import { esc } from '../util';
import type { Link, Profile } from '../types';

export const renderFooter = (profile: Profile, links: Link[]): string => `
  <footer class="site-footer">
    <ul class="site-footer__links">
      ${links.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}
      <li><a href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener">Resume</a></li>
    </ul>
    <p class="site-footer__copy">&copy; ${new Date().getFullYear()} ${esc(profile.fullName)}</p>
  </footer>`;
