// Builds the hub and serves the build on FOLD_PORT (default 4173) for the Fold check.
// Stays in the foreground; works from PowerShell, Git Bash and CI.
import { spawn, spawnSync } from 'node:child_process';

const port = process.env.FOLD_PORT || '4173';

const build = spawnSync('npm run build', { stdio: 'inherit', shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn(`npx vite preview --host 127.0.0.1 --strictPort --port ${port}`, {
  stdio: 'inherit',
  shell: true,
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.kill(sig));
}
server.on('exit', (code) => process.exit(code ?? 0));
