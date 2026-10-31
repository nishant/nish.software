import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts so the prerender plugin does not run under test.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
