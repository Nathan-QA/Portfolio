import { readFile, writeFile, mkdir, rm, readdir, cp, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, languages, route, escapeHTML, safeURL } from './content.mjs';
import { createTemplates } from '../src/templates.mjs';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist'), cache = path.join(root, '.cache', 'images');
const data = await loadContent(root);
const assets = new Set(['assets/bannerD.png', 'assets/bannerN.png', 'assets/leaf_right.png', 'assets/leaf_rightN.png', 'assets/PP.png', 'assets/leaf_cliff_particles_grid_export.png', 'assets/leafN_cliff_particles_grid_export.png']);
const imagePattern = /^\/?assets\/.+\.(?:png|jpg|jpeg|webp|avif)$/i;
function discover(value) {
  if (typeof value === 'string') {
    if (imagePattern.test(value)) assets.add(value.replace(/^\//, ''));
    for (const match of value.matchAll(/!\[[^\]]*\]\((\/?assets\/[^\s)]+)(?:\s+"[^"]*")?\)/g)) assets.add(match[1].replace(/^\//, ''));
  } else if (Array.isArray(value)) value.forEach(discover);
  else if (value && typeof value === 'object') Object.values(value).forEach(discover);
}
discover(data);
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets', 'img'), { recursive: true });
await mkdir(cache, { recursive: true });
const records = new Map();
let originalBytes = 0, optimizedBytes = 0;
async function optimize(src) {
  const absolute = path.resolve(root, src);
  if (!absolute.startsWith(path.join(root, 'assets') + path.sep)) throw new Error(`Unsafe image path: ${src}`);
  let buffer;
  try { buffer = await readFile(absolute); } catch { throw new Error(`Missing image: ${src}`); }
  originalBytes += buffer.length;
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) throw new Error(`Cannot determine image size: ${src}`);
  const sprite = /particles_grid/.test(src), tree = /leaf_right/.test(src), avatar = /PP\.png$/.test(src);
  const maximum = sprite ? 300 : tree ? 960 : avatar ? 320 : 2400;
  const widths = [...new Set([...(sprite ? [300] : avatar ? [128, 320] : tree ? [480, 960] : [480, 960, 1600, 2400])].map(w => Math.min(w, meta.width, maximum)))].sort((a, b) => a - b);
  const digest = createHash('sha256').update(buffer).update('portfolio-image-v1-q84').digest('hex').slice(0, 12);
  const basename = path.basename(src, path.extname(src)).replace(/[^a-zA-Z0-9-]/g, '-');
  const variants = [];
  for (const width of widths) {
    const filename = `${basename}-${digest}-${width}.webp`, cached = path.join(cache, filename);
    try { await stat(cached); } catch {
      await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: sprite ? 94 : 84, effort: 4, alphaQuality: 90 }).toFile(cached);
    }
    await cp(cached, path.join(dist, 'assets', 'img', filename));
    const outputSize = (await stat(cached)).size;
    optimizedBytes += outputSize;
    variants.push({ width, url: `/assets/img/${filename}` });
  }
  records.set(src, { width: meta.width, height: meta.height, variants });
}
const pending = [...assets];
await Promise.all(Array.from({ length: 4 }, async () => { while (pending.length) await optimize(pending.pop()); }));
const record = src => records.get(String(src).replace(/^\//, ''));
function imageURL(src, width = 1600) {
  if (!src) return '';
  const item = record(src);
  if (!item) {
    // External Markdown images can be linked, but never silently accepted as local.
    if (/^https:\/\//.test(src) && safeURL(src) !== '#') return src;
    throw new Error(`Image was not collected: ${src}`);
  }
  return (item.variants.find(v => v.width >= width) || item.variants.at(-1)).url;
}
function image(src, { alt = '', className = '', sizes = '100vw', eager = false, priority = false } = {}) {
  const item = record(src);
  if (!item) {
    if (/^https:\/\//.test(src) && safeURL(src) !== '#') return `<img src="${safeURL(src)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async">`;
    throw new Error(`Missing image record: ${src}`);
  }
  return `<img src="${imageURL(src, 960)}" srcset="${item.variants.map(v => `${v.url} ${v.width}w`).join(', ')}" sizes="${escapeHTML(sizes)}" width="${item.width}" height="${item.height}" alt="${escapeHTML(alt)}"${className ? ` class="${escapeHTML(className)}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${priority ? ' fetchpriority="high"' : ''}>`;
}
for (const file of ['favicon.svg', path.basename(data.site.cv)]) {
  const source = file === 'favicon.svg' ? path.join(root, 'assets', file) : path.resolve(root, data.site.cv);
  if (!source.startsWith(path.join(root, 'assets') + path.sep)) throw new Error('CV must be inside assets');
  await cp(source, path.join(dist, 'assets', file));
}
await cp(path.join(root, 'src', 'site.css'), path.join(dist, 'assets', 'site.css'));
const routes = Object.fromEntries(['projects', 'articles'].map(kind => [kind, data[kind].map(item => item.id)]));
await writeFile(path.join(dist, 'assets', 'site.js'), `window.PORTFOLIO_ROUTES=${JSON.stringify(routes)};\n` + await readFile(path.join(root, 'src', 'site.js'), 'utf8'));
const templates = createTemplates(data, { image, imageURL });
const pages = [];
async function page(url, html) {
  const file = path.join(dist, url, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  pages.push(url);
}
for (const lang of languages) {
  await page(route('home', '', lang), templates.home(lang));
  for (const kind of ['projects', 'articles']) {
    await page(route(kind, '', lang), templates.archive(kind, lang));
    for (const item of data[kind]) await page(route(kind, item.id, lang), kind === 'projects' ? templates.projectPage(item, lang) : templates.articlePage(item, lang));
  }
  await page(route('skills', '', lang), templates.skillsPage(lang));
  await page(route('legal', '', lang), templates.legalPage(lang));
}
await writeFile(path.join(dist, '404.html'), templates.notFound());
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(url => `<url><loc>${escapeHTML(data.site.url + url)}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(dist, 'robots.txt'), process.env.VERCEL_ENV === 'preview' ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${data.site.url}/sitemap.xml\n`);
const report = { pages, projects: data.projects.length, articles: data.articles.length, images: records.size, originalBytes, optimizedVariantBytes: optimizedBytes, generatedAt: new Date().toISOString() };
await writeFile(path.join(dist, 'build-report.json'), JSON.stringify(report, null, 2));
console.log(`Built ${pages.length} pages, ${data.projects.length} projects, ${data.articles.length} articles, ${records.size} image sources`);
console.log(`Original images: ${(originalBytes / 1048576).toFixed(2)} MiB. All responsive variants: ${(optimizedBytes / 1048576).toFixed(2)} MiB.`);
