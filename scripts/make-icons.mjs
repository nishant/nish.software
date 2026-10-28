// One-off: regenerates the PNG icons and og:image in public/ from the favicon artwork.
// Run from the repo root: node scripts/make-icons.mjs
// Uses Playwright from C:\Code\ui\node_modules (not a dependency of this repo).
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let chromium;
try {
  ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'file:///C:/Code/ui/node_modules/playwright/index.mjs'));
} catch {
  console.error('Playwright not found; set PLAYWRIGHT_MODULE to its index.mjs file URL');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const favicon = readFileSync(join(pub, 'favicon.svg'), 'utf8');
const fontDir = join(root, 'node_modules/@nish/ui/dist/fonts');
const fontFile = readdirSync(fontDir).find((f) => /^inter-latin-wght-normal\..*\.woff2$/.test(f));
if (!fontFile) {
  console.error(`Inter font not found in ${fontDir}; run npm ci first`);
  process.exit(1);
}
// Inlined as a data URL: setContent pages (about:blank) cannot load file:// fonts.
const fontUrl = `data:font/woff2;base64,${readFileSync(join(fontDir, fontFile)).toString('base64')}`;

const BG = '#0a0b0f';
// The "N" artwork from favicon.svg without its background rect.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b93ff"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs>
  <path d="M20 46V18l24 28V18" fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const reset = 'html,body{margin:0;padding:0;}';

// Full-bleed square with the N at `pct` of the size, centered.
const solid = (size, pct) => `<style>${reset}body{width:${size}px;height:${size}px;background:${BG};display:grid;place-items:center;}
svg{width:${pct}%;height:${pct}%;}</style>${mark}`;

// The favicon as is (rounded square), scaled; transparent outside the corners.
const rounded = (size) => `<style>${reset}svg{display:block;width:${size}px;height:${size}px;}</style>${favicon}`;

const og = `<style>
@font-face{font-family:Inter;src:url("${fontUrl}") format("woff2");font-weight:100 900;}
${reset}
body{width:1200px;height:630px;position:relative;overflow:hidden;background:${BG};font-family:Inter,sans-serif;}
.glow{position:absolute;inset:0;background:
  radial-gradient(60% 45% at 15% 0%, rgba(139,147,255,0.22), transparent 70%),
  radial-gradient(50% 40% at 90% 10%, rgba(52,211,153,0.16), transparent 70%);}
.logo{position:absolute;left:96px;top:96px;width:120px;height:120px;}
.logo svg{display:block;width:120px;height:120px;}
.name{position:absolute;left:96px;top:236px;margin:0;font-size:120px;font-weight:700;letter-spacing:-0.04em;line-height:1.1;color:#f2f3f7;}
.sub{position:absolute;left:96px;top:390px;margin:0;font-size:44px;font-weight:600;line-height:1.2;color:#a9adbd;}
.host{position:absolute;left:96px;top:464px;margin:0;font-family:ui-monospace,Consolas,'Courier New',monospace;font-size:28px;line-height:1.2;color:#7c8194;}
</style>
<div class="glow"></div>
<div class="logo">${favicon}</div>
<p class="name">Nish</p>
<p class="sub">Software hub</p>
<p class="host">nish.software</p>`;

const images = [
  { file: 'apple-touch-icon.png', w: 180, h: 180, html: solid(180, 62) },
  { file: 'icon-192.png', w: 192, h: 192, html: rounded(192), transparent: true },
  { file: 'icon-512.png', w: 512, h: 512, html: rounded(512), transparent: true },
  { file: 'icon-maskable-512.png', w: 512, h: 512, html: solid(512, 50) },
  { file: 'og-image.png', w: 1200, h: 630, html: og },
];

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { file, w, h, html, transparent } of images) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<!doctype html><meta charset="utf-8">${html}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(pub, file), omitBackground: !!transparent });
    console.log(`wrote public/${file} (${w}x${h})`);
  }
} finally {
  await browser.close();
}
