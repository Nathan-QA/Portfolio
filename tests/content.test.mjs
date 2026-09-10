import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, validateContent, escapeHTML, safeURL, markdown, route, readingTime, orderByIds, categories } from '../scripts/content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = await loadContent(root);
test('all migrated projects and studies are present in both languages', () => {
  for(const id of ['distant-shore-bretagne','dordogne','pyla','ltag-ltdc']) assert.ok(data.projects.some(p=>p.id===id));
  for(const id of ['distant-shore-readability','dordogne-feedback-loop','pyla-production-scope']) assert.ok(data.articles.some(a=>a.id===id));
  for (const item of [...data.projects, ...data.articles]) for (const lang of ['fr','en']) assert.ok(item.title[lang]);
  for (const a of data.articles.filter(a=>a.article)) for (const lang of ['fr','en']) assert.ok(a.article[lang].sections.length >= 7);
});
test('routes have stable, language-specific URLs', () => {
  assert.equal(route('home'), '/'); assert.equal(route('home', '', 'en'), '/en/');
  assert.equal(route('projects','dordogne'), '/projets/dordogne/');
  assert.equal(route('articles','test','en'), '/en/journal/test/');
  assert.throws(() => route('unknown'));
});
test('escapes HTML and rejects dangerous link protocols', () => {
  assert.equal(escapeHTML('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;');
  for (const url of ['javascript:alert(1)', 'data:text/html,x', '//evil.test', 'java\nscript:foo', 'https:\\evil.test']) assert.equal(safeURL(url), '#');
  assert.equal(safeURL('/projets/dordogne/'), '/projets/dordogne/');
  assert.equal(safeURL('https://example.com/?a=1&b=2'), 'https://example.com/?a=1&amp;b=2');
});
test('Markdown safely renders prose, lists, code and repeated headings', () => {
  const result = markdown('Intro **fort** et *italique*\n\n## Idée\n\nTexte `code`\n\n- Un\n- Deux\n\n## Idée\n\n> Citation\n\n```js\n<script>\n```');
  assert.deepEqual(result.toc.map(x=>x.id), ['idee','idee-2']);
  assert.match(result.html, /<strong>fort<\/strong>/); assert.match(result.html, /<em>italique<\/em>/);
  assert.match(result.html, /<ul><li>Un<\/li><li>Deux<\/li><\/ul>/);
  assert.match(result.html, /&lt;script&gt;/); assert.doesNotMatch(result.html, /<script>/);
});
test('raw HTML and hostile Markdown links do not execute', () => {
  const {html} = markdown('<img src=x onerror=alert(1)>\n\n[click](javascript:evil)\n\n![x](javascript:evil)');
  assert.doesNotMatch(html, /href="javascript:|src="javascript:|<img src=x/);
  assert.match(html, /&lt;img/);
});
test('validation catches duplicate IDs and broken relationships', () => {
  const duplicate = structuredClone(data); duplicate.projects.push(duplicate.projects[0]);
  assert.throws(()=>validateContent(duplicate), /duplicate id/);
  const bad = structuredClone(data); bad.articles[0].projects=['does-not-exist'];
  assert.throws(()=>validateContent(bad), /unknown related project/);
  const badFeature = structuredClone(data); badFeature.site.featuredArticles=['missing'];
  assert.throws(()=>validateContent(badFeature), /Unknown featured article/);
});
test('draft JSON and its unpublished Markdown do not enter the public model', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(),'portfolio-'));
  try {
    await cp(path.join(root,'content'),path.join(temp,'content'),{recursive:true});
    await writeFile(path.join(temp,'content/articles/secret-draft.json'),JSON.stringify({id:'secret-draft',published:false,body:{fr:'missing.md'}}));
    const copy = await loadContent(temp);
    assert.equal(copy.articles.length, data.articles.length);
  } finally { await rm(temp,{recursive:true,force:true}); }
});
test('Markdown body paths cannot escape the content directory', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(),'portfolio-'));
  try {
    await cp(path.join(root,'content'),path.join(temp,'content'),{recursive:true});
    await writeFile(path.join(temp,'content/articles/path-test.json'), JSON.stringify({id:'path-test',title:{fr:'Test',en:'Test'},body:{fr:'../../outside.md',en:'../../outside.md'}}));
    await assert.rejects(loadContent(temp), /must stay inside/);
  } finally { await rm(temp,{recursive:true,force:true}); }
});
test('unrelated Markdown articles are supported without a project', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(),'portfolio-'));
  try {
    await cp(path.join(root,'content'),path.join(temp,'content'),{recursive:true});
    const directory=path.join(temp,'content/articles');
    await writeFile(path.join(directory,'free-note.json'),JSON.stringify({id:'free-note',title:{fr:'Essai',en:'Essay'},projects:[],body:{fr:'free.fr.md',en:'free.en.md'}}));
    await writeFile(path.join(directory,'free.fr.md'),'## Essai\n\nUn texte.');
    await writeFile(path.join(directory,'free.en.md'),'## Essay\n\nSome text.');
    const model=await loadContent(temp);
    assert.equal(model.articles.length,data.articles.length+1);
    assert.equal(model.articles.find(a=>a.id==='free-note').markdown.en,'## Essay\n\nSome text.');
  } finally { await rm(temp,{recursive:true,force:true}); }
});
test('ordering, categories and reading times are predictable', () => {
  assert.deepEqual(orderByIds([{id:'a'},{id:'b'},{id:'c'}],['c','a']).map(x=>x.id),['c','a','b']);
  assert.ok(categories(data.projects.find(x=>x.id==='dordogne')).includes('qa'));
  assert.equal(readingTime({markdown:{fr:'mot '.repeat(440)}},'fr'),2);
});
test('generated HTML contains content, metadata, safe paths and no third-party runtime', async () => {
  const report=JSON.parse(await readFile(path.join(root,'dist/build-report.json'),'utf8'));
  assert.equal(report.pages.length,2*(5+data.projects.length+data.articles.length));
  for (const url of report.pages) {
    const html=await readFile(path.join(root,'dist',url,'index.html'),'utf8');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,url);
    assert.match(html, /rel="canonical"/); assert.match(html, /hreflang="en"/);
    assert.doesNotMatch(html,/accounts\.google|emailjs|<script src="https:/);
    assert.doesNotMatch(html,/>undefined<|>\[object Object\]</);
    const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(new Set(ids).size,ids.length,`Duplicate HTML IDs on ${url}`);
    for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^"]*"/g)) {
      const local=match[1];
      if(local==='/'||local.endsWith('/')) assert.ok(report.pages.includes(local),`Missing page ${local} on ${url}`);
      else await readFile(path.join(root,'dist',local));
    }
  }
});
