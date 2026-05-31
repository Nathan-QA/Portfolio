const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = process.cwd();
const port = 4192;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

function serveFile(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  let filePath = path.normalize(path.join(root, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
}

async function captureViewport(name, width, height, offset) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--disable-gpu', '--disable-dev-shm-usage']
  });
  const browserProcess = browser.process();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded', timeout: 12000 });
  await page.waitForSelector('.section h2', { timeout: 8000 });
  await page.evaluate((topOffset) => window.scrollTo(0, Math.max(0, document.querySelector('.hero').offsetTop - topOffset)), offset);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(root, 'tmp-review', `${name}.png`), fullPage: false });
  const info = await page.evaluate(() => {
    const overflow = Array.from(document.querySelectorAll('body *')).filter((el) => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return el.scrollWidth > el.clientWidth + 2;
    }).slice(0, 10).map((el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${String(el.className).trim().replace(/\s+/g, '.')}` : ''));
    return {
      title: document.title,
      h1: document.querySelector('.hero h1')?.textContent.trim(),
      h1Rect: rectOf(document.querySelector('.hero h1')),
      roles: document.querySelector('.hero-roles')?.textContent.trim(),
      heroDesc: document.querySelector('#heroDesc')?.textContent.trim(),
      profile: Array.from(document.querySelectorAll('.hero-profile > div')).map((el) => el.textContent.trim().replace(/\s+/g, ' ')),
      sections: Array.from(document.querySelectorAll('.section h2')).slice(0, 4).map((el) => ({ text: el.textContent.trim(), rect: rectOf(el) })),
      bodyScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      overflow
    };
  });
  if (browserProcess && !browserProcess.killed) browserProcess.kill();
  return info;
}

(async () => {
  const server = http.createServer(serveFile);
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

  const desktopInfo = await captureViewport('hero-desktop', 1440, 1100, 110);
  const mobileInfo = await captureViewport('hero-mobile', 390, 1050, 92);
  console.log(JSON.stringify({ desktopInfo, mobileInfo }, null, 2));
  server.close();
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
