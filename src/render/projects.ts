import { icon } from '../icons';
import { esc } from '../util';
import type { Project } from '../types';

export const renderProjects = (projects: Project[]): string => `
  <section class="section" id="projects" aria-labelledby="projects-heading">
    <div class="section__head">
      <h2 class="section__title" id="projects-heading">Projects</h2>
      <p class="section__hint">What is under the tiles, plus the desktop stuff.</p>
    </div>
    <ul class="projects">
      ${projects.map((p, i) => renderProject(p, i)).join('')}
    </ul>
  </section>`;

const renderProject = (p: Project, i: number): string => {
  const isPrivate = p.source === 'private';
  const primary = isPrivate ? p.href : p.source;
  return `
  <li class="project" style="--i:${i}">
    <div class="project__body">
      <h3 class="project__name">${esc(p.name)}</h3>
      <p class="project__blurb">${esc(p.blurb)}</p>
      <ul class="chips" aria-label="Stack">
        ${p.stack.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}
      </ul>
    </div>
    <div class="project__foot">
      ${
        isPrivate
          ? `<span class="badge badge--muted" title="The source is not public">${icon('lock', 'icon icon--xs')}<span>Private source</span></span>`
          : `<a class="project__action" href="${esc(p.source)}" target="_blank" rel="noopener">${icon('github', 'icon icon--sm')}<span>Source</span></a>`
      }
      ${
        p.href && primary
          ? `<a class="project__action project__action--primary" href="${esc(p.href)}">${icon('arrow', 'icon icon--sm')}<span>Open app</span></a>`
          : ''
      }
    </div>
  </li>`;
};
