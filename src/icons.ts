import type { IconName } from './types';

const attrs =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

const paths: Record<IconName, string> = {
  trading:
    '<path d="M4 19h16"/><path d="M7 15V9"/><path d="M5.5 11h3v3h-3z" fill="currentColor" stroke="none"/><path d="M12 13V5"/><path d="M10.5 7h3v5h-3z" fill="currentColor" stroke="none"/><path d="M17 16V8"/><path d="M15.5 10h3v4h-3z" fill="currentColor" stroke="none"/>',
  startpage:
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><path d="M7 13h4"/><path d="M7 16h7"/><circle cx="6.5" cy="6.5" r=".6" fill="currentColor" stroke="none"/><circle cx="8.8" cy="6.5" r=".6" fill="currentColor" stroke="none"/>',
  jobs: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h18"/><path d="M10.5 12v2h3v-2"/>',
  minecraft:
    '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5"/><path d="M12 12v9"/><path d="M8 5.75 16 10.25" opacity=".5"/>',
  trips:
    '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="12" rx="2.5"/><path d="M8 20h8"/><path d="M12 16v4"/><path d="M7 12.5 9.5 9l2 2.5L14 8l3 4.5" opacity=".8"/>',
  flow: '<circle cx="5.5" cy="6" r="2.25"/><circle cx="5.5" cy="18" r="2.25"/><circle cx="18.5" cy="12" r="2.25"/><path d="M7.75 6H10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7.75"/><path d="M12 12h4.25"/>',
  pulse: '<path d="M3 12h3.5l2-5 3.5 10 2.5-7 1.5 2H21"/>',
  chart: '<path d="M4 4v16h16"/><path d="m7 9 4 4 3-3 5 6"/><circle cx="19" cy="16" r="1.2" fill="currentColor" stroke="none"/>',
  palette:
    '<path d="M12 21a9 9 0 1 1 9-9 4 4 0 0 1-4 4h-1.75a1.75 1.75 0 0 0-1.3 2.92A1.25 1.25 0 0 1 12 21z"/><circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="9.75" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.25" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="16.75" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
  github:
    '<path fill="currentColor" stroke="none" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/>',
  linkedin:
    '<path fill="currentColor" stroke="none" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.34-5.66L20 8.5"/><path d="M20 3.5v5h-5"/>',
  code: '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 5-4 14"/>',
};

export const icon = (name: IconName, className = 'icon'): string =>
  `<svg class="${className}" ${attrs}>${paths[name]}</svg>`;
