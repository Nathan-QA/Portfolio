import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export const languages = ['fr', 'en'];
export const localize = (value, lang = 'fr') => value && typeof value === 'object' && !Array.isArray(value) ? value[lang] ?? value.fr ?? '' : value ?? '';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slugify = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
export function safeURL(value) {
  const url = String(value ?? '').trim();
  if (!url || /[\u0000-\u0020\\]/.test(url) || url.startsWith('//')) return '#';
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^(https?:|mailto:)/i.test(url)) return '#';
  return escapeHTML(url);
}
export const route = (kind, id = '', lang = 'fr') => {
  const segments = { home: '', projects: lang === 'fr' ? 'projets' : 'projects', articles: lang === 'fr' ? 'carnet' : 'journal', skills: 'skills', legal: lang === 'fr' ? 'mentions-legales' : 'legal' };
  if (!(kind in segments)) throw new Error(`Unknown route: ${kind}`);
  return (lang === 'en' ? '/en/' : '/') + (segments[kind] ? segments[kind] + '/' : '') + (id ? id + '/' : '');
};
export function categories(item) {
  if (Array.isArray(item.categories) && item.categories.length) return item.categories;
  const text = `${localize(item.role)} ${(Array.isArray(item.tags) ? item.tags : localize(item.tags) || []).join(' ')}`;
  const result = [];
  if (/level|movement|game design|greybox|physics/i.test(text)) result.push('level-design');
  if (/\bqa\b|certif|testing/i.test(text)) result.push('qa');
  if (/producer|production|scope|budget/i.test(text)) result.push('production');
  return result.length ? result : ['explorations'];
}
export function categoryLabel(key, lang) {
  return ({ 'level-design': ['Level design', 'Level design'], qa: ['QA & itération', 'QA & iteration'], production: ['Production', 'Production'], explorations: ['Explorations', 'Explorations'] }[key] || [key, key])[lang === 'en' ? 1 : 0];
}
export function readingTime(item, lang) {
  const body = item.markdown?.[lang] ?? localize(item.article, lang) ?? '';
  const words = (typeof body === 'string' ? body : JSON.stringify(body)).match(/[\p{L}\p{N}]+/gu) || [];
  return Math.max(1, Math.ceil(words.length / 220));
}
export function orderByIds(items, ids = []) {
  return [...items].sort((a, b) => {
    const ai = ids.indexOf(a.id), bi = ids.indexOf(b.id);
    if (ai >= 0 || bi >= 0) return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi);
    return (a.order ?? 999) - (b.order ?? 999) || String(b.date || '').localeCompare(String(a.date || '')) || a.id.localeCompare(b.id);
  });
}
async function json(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { throw new Error(`Cannot read ${file}: ${error.message}`); }
}
export async function loadContent(root) {
  const contentDir = path.join(root, 'content');
  const site = await json(path.join(contentDir, 'site.json'));
  const skills = await json(path.join(contentDir, 'skills.json'));
  async function collection(name) {
    const dir = path.join(contentDir, name);
    const names = (await readdir(dir)).filter(name => name.endsWith('.json')).sort();
    const data = [];
    for (const name of names) {
      const item = await json(path.join(dir, name));
      if (item.published === false) continue;
      if (item.body) {
        item.markdown = {};
        for (const lang of languages) {
          const relative = localize(item.body, lang);
          if (!relative || !/\.md$/i.test(relative)) throw new Error(`${name}: body.${lang} must reference a Markdown file`);
          const resolved = path.resolve(dir, relative);
          if (!resolved.startsWith(dir + path.sep)) throw new Error(`${name}: article body must stay inside content/${name}`);
          item.markdown[lang] = await readFile(resolved, 'utf8');
        }
      }
      data.push(item);
    }
    return data;
  }
  const projects = await collection('projects');
  const articles = await collection('articles');
  const data = { site, skills, projects, articles };
  validateContent(data);
  return { ...data, projects: orderByIds(projects, site.featuredProjects), articles: orderByIds(articles) };
}
export function validateContent({ site, projects, articles, skills }) {
  if (!site.name || !site.email || !/^https:\/\//.test(site.url || '')) throw new Error('site.json: name, email and HTTPS url are required');
  for (const [type, items] of Object.entries({ projects, articles })) {
    const seen = new Set();
    for (const item of items) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id || '')) throw new Error(`${type}: invalid id ${item.id}`);
      if (seen.has(item.id)) throw new Error(`${type}: duplicate id ${item.id}`);
      seen.add(item.id);
      for (const lang of languages) if (!localize(item.title, lang)) throw new Error(`${item.id}: missing ${lang} title`);
      if (item.date && (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date)))) throw new Error(`${item.id}: invalid date`);
      if (type === 'articles' && !item.article && !item.markdown) throw new Error(`${item.id}: article or Markdown body required`);
      if (type === 'projects' && !item.images?.cover) throw new Error(`${item.id}: project cover required`);
    }
  }
  const projectIds = new Set(projects.map(x => x.id)), articleIds = new Set(articles.map(x => x.id));
  for (const a of articles) for (const id of a.projects || []) if (!projectIds.has(id)) throw new Error(`${a.id}: unknown related project ${id}`);
  for (const p of projects) if (p.caseStudy && !articleIds.has(p.caseStudy)) throw new Error(`${p.id}: unknown case study ${p.caseStudy}`);
  for (const id of site.featuredProjects || []) if (!projectIds.has(id)) throw new Error(`Unknown featured project ${id}`);
  for (const id of site.featuredArticles || []) if (!articleIds.has(id)) throw new Error(`Unknown featured article ${id}`);
  for (const lang of languages) {
    if (!Array.isArray(skills[lang])) throw new Error(`skills.json: ${lang} must be an array`);
    for (const group of skills[lang]) for (const skill of group.items || []) {
      for (const id of skill.related?.projects || []) if (!projectIds.has(id)) throw new Error(`${skill.id}: unknown project ${id}`);
      for (const id of skill.related?.cases || []) if (!articleIds.has(id)) throw new Error(`${skill.id}: unknown article ${id}`);
    }
  }
}

// Intentionally small, safe Markdown subset. Raw HTML is displayed as text.
// Supports headings, paragraphs, links, images, bold, italic, code, quotes and lists.
export function markdown(source, renderImage = (src, alt) => `<img src="${safeURL(src)}" alt="${escapeHTML(alt)}" loading="lazy">`) {
  const toc = [], ids = new Map();
  function inline(text) {
    const slots = [];
    const stash = html => `\u0000${slots.push(html) - 1}\u0000`;
    let value = String(text).replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHTML(code)}</code>`));
    value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => stash(`<a href="${safeURL(url)}"${/^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHTML(label)}</a>`));
    value = escapeHTML(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return value.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]);
  }
  const blocks = [], lines = String(source).replace(/\r/g, '').split('\n');
  let i = 0;
  const isStart = line => /^(#{1,6}\s|```|>\s?|[-*]\s|\d+\.\s|!\[|---+$)/.test(line);
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith('```')) {
      const code = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++; blocks.push(`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`); continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.max(2, heading[1].length), base = slugify(heading[2]);
      const count = (ids.get(base) || 0) + 1; ids.set(base, count);
      const id = base + (count > 1 ? '-' + count : '');
      if (level === 2) toc.push({ id, title: heading[2] });
      blocks.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`); i++; continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/);
    if (image) { blocks.push(`<figure>${renderImage(image[2], image[1])}${image[3] ? `<figcaption>${inline(image[3])}</figcaption>` : ''}</figure>`); i++; continue; }
    if (/^---+$/.test(line)) { blocks.push('<hr>'); i++; continue; }
    if (/^>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>/.test(lines[i].trim())) quote.push(lines[i++].trim().replace(/^>\s?/, ''));
      blocks.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`); continue;
    }
    if (/^([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\d/.test(line), list = [], pattern = ordered ? /^\d+\.\s/ : /^[-*]\s/;
      while (i < lines.length && pattern.test(lines[i].trim())) list.push(`<li>${inline(lines[i++].trim().replace(pattern, ''))}</li>`);
      blocks.push(`<${ordered ? 'ol' : 'ul'}>${list.join('')}</${ordered ? 'ol' : 'ul'}>`); continue;
    }
    const paragraph = [line]; i++;
    while (i < lines.length && lines[i].trim() && !isStart(lines[i].trim())) paragraph.push(lines[i++].trim());
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return { html: blocks.join('\n'), toc };
}
