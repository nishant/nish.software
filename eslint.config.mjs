import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import nish from '@nish/ui/eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'src/tiles.generated.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // The hub UI: theme-class rules also scan the HTML class strings and template literals it renders.
  ...nish.configs.react.map((c) => ({ ...c, files: ['src/**/*.ts'] })),
  { files: ['src/**/*.ts'], languageOptions: { globals: globals.browser } },
  // Build config and scripts.
  ...nish.configs.node.map((c) => ({ ...c, files: ['vite.config.ts', 'vitest.config.ts', 'scripts/**', 'tools/**'] })),
  { files: ['vite.config.ts', 'vitest.config.ts', 'scripts/**', 'tools/**'], languageOptions: { globals: globals.node } },
  // make-icons.mjs runs page.evaluate callbacks in the browser.
  { files: ['scripts/make-icons.mjs'], languageOptions: { globals: globals.browser } },
);
