import { spawn } from 'node:child_process';
import { serve } from './serve.mjs';
const server = serve();
server.once('listening', () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  const [command, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  const browser = spawn(command, args, { stdio: 'ignore' });
  browser.on('error', () => console.log(`Ouvrir le navigateur sur ${url}`));
});
