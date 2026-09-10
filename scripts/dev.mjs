import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { serve } from './serve.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let running = false, queued = false, timer;
async function build() {
  if (running) { queued = true; return; }
  running = true;
  const code = await new Promise(resolve => {
    const child = spawn(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'inherit' });
    child.on('error', () => resolve(1)); child.on('exit', resolve);
  });
  running = false;
  if (code !== 0) console.error('Build failed. Fix the reported content error, then save again.');
  if (queued) { queued = false; await build(); }
}
await build();
serve();
for (const directory of ['src', 'content', 'assets']) watch(path.join(root, directory), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 200); });
console.log('Watching src, content and assets. Refresh your browser after a successful build.');
