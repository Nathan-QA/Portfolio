import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [kind, id] = process.argv.slice(2);
if (!['article', 'project'].includes(kind) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')) {
  console.error('Usage: npm run new -- article mon-sujet\n       npm run new -- project mon-projet'); process.exit(1);
}
const directory = path.join(root, 'content', kind === 'article' ? 'articles' : 'projects');
await mkdir(directory, { recursive: true });
const files = kind === 'article' ? [`${id}.json`, `${id}.fr.md`, `${id}.en.md`] : [`${id}.json`];
for (const file of files) {
  try { await access(path.join(directory, file)); console.error(`Already exists: ${file}. Nothing was overwritten.`); process.exit(1); } catch {}
}
const translated = (fr, en) => ({ fr, en });
const item = kind === 'article' ? {
  id, published: false, title: translated('Titre de l’article', 'Article title'), summary: translated('Le sujet, en deux phrases.', 'The topic, in two sentences.'),
  categories: ['explorations'], projects: [], tags: [], cover: 'assets/bannerD.png', body: translated(`${id}.fr.md`, `${id}.en.md`)
} : {
  id, published: false, title: translated('Nom du projet', 'Project name'), role: translated('Mon rôle', 'My role'), summary: translated('Le projet et ma contribution.', 'The project and my contribution.'),
  categories: ['level-design'], tags: translated([], []), facts: translated([], []), projectInfo: { developer: '', engine: '' },
  overview: translated([], []), contribution: translated([], []), images: { cover: 'assets/bannerD.png', gallery: [] }, links: []
};
await writeFile(path.join(directory, `${id}.json`), JSON.stringify(item, null, 2) + '\n', { flag: 'wx' });
if (kind === 'article') {
  await writeFile(path.join(directory, `${id}.fr.md`), 'Une courte introduction.\n\n## Le point de départ\n\nDécrire le contexte.\n\n## Ce que j’ai essayé\n\nDécrire la démarche et ajouter des visuels.\n\n## Ce que j’en retiens\n\nConclure avec les enseignements.\n', { flag: 'wx' });
  await writeFile(path.join(directory, `${id}.en.md`), 'A short introduction.\n\n## Starting point\n\nDescribe the context.\n\n## What I tried\n\nDescribe the approach and add visuals.\n\n## What I learned\n\nClose with the lessons learned.\n', { flag: 'wx' });
}
console.log(`Draft created: content/${kind === 'article' ? 'articles' : 'projects'}/${id}.json\nEdit the content, then set published to true. Drafts are never included in the website build.`);
