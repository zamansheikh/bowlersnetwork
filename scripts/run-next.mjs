import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv[2];

if (!mode || (mode !== 'dev' && mode !== 'start')) {
  console.error('Usage: node scripts/run-next.mjs <dev|start>');
  process.exit(1);
}

const readPortFromEnvFiles = () => {
  const envFiles = ['.env.local', '.env'];

  for (const fileName of envFiles) {
    const filePath = resolve(process.cwd(), fileName);
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');
    const match = content.match(/^\s*PORT\s*=\s*(.+?)\s*$/m);
    if (!match) {
      continue;
    }

    const value = match[1].replace(/^['\"]|['\"]$/g, '');
    if (value) {
      return value;
    }
  }

  return undefined;
};

const port = process.env.PORT || readPortFromEnvFiles() || '5444';
const args = ['next', mode, '-p', port];

if (mode === 'dev') {
  args.splice(2, 0, '--turbopack');
}

const child = spawn('bunx', args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: port,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
