import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
const info=JSON.parse(await fs.readFile(path.join(root,'build-info.json'),'utf8'));
const errors=[];let links=0,images=0;
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
for(const page of info.pages){
 const html=await fs.readFile(path.join(root,page,'index.html'),'utf8');
 if((html.match(/<h1[\s>]/g)||[]).length!==1)errors.push(`${page}: expected exactly one H1`);
 if(/undefined|\[object Object\]/.test(html))errors.push(`${page}: unrendered value`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push(`${page}: duplicate element IDs`);
 if(!html.includes('rel="canonical"')||!html.includes('hreflang="en"')||!html.includes('hreflang="fr"'))errors.push(`${page}: incomplete metadata`);
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const href=decode(match[1]);if(!href.startsWith('/')&&!href.startsWith('#'))continue;
  const u=new URL(href,'https://local.test'+page);let target=path.join(root,u.pathname);
  if(u.pathname.endsWith('/'))target=path.join(target,'index.html');
  try{
   await fs.access(target);links++;
   if(u.hash){const other=await fs.readFile(target,'utf8');const id=decodeURIComponent(u.hash.slice(1));if(!other.includes(`id="${id}"`))errors.push(`${page}: missing fragment ${href}`)}
  }catch{errors.push(`${page}: missing local target ${href}`)}
 }
 for(const match of html.matchAll(/<img\b[^>]*>/g)){images++;if(!/\balt=/.test(match[0])||!/\bwidth=/.test(match[0])||!/\bheight=/.test(match[0]))errors.push(`${page}: image missing dimensions or alt`)}
 if(/accounts\.google|emailjs|googletagmanager|google-analytics/.test(html))errors.push(`${page}: unexpected third-party integration`);
}
assert.equal(errors.length,0,errors.join('\n'));
console.log(`PASS: ${info.pages.length} pages, ${links} local links/assets, ${images} image elements, metadata, one H1, IDs and no third-party scripts`);
