import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {makePages} from '../src/pages.mjs';
import {escape} from '../src/lib.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(ROOT,'dist'), CACHE=path.join(ROOT,'.cache','images');
const readJSON=async file=>{try{return JSON.parse(await fs.readFile(path.join(ROOT,file),'utf8'))}catch(error){throw new Error(`${file}: ${error.message}`)}};
const site=await readJSON('content/site.json'), editorial=await readJSON('content/editorial.json');
const manifest=await readJSON('content/content_manifest.json'), skills=await readJSON('content/skills.json');
const load=async names=>Promise.all(names.map(async name=>{
 if(name.includes('..')||path.isAbsolute(name)||!name.endsWith('.json'))throw new Error(`Invalid content path: ${name}`);
 return {...await readJSON(`content/${name}`),_file:name};
}));
const allProjects=await load(manifest.projects||[]);
const allArticles=await load([...new Set([...(manifest.cases||[]),...(manifest.articles||[])])]);
const errors=[];
function validate(items,type){
 const ids=new Set();
 for(const item of items){
  const where=`${item._file} (${type})`;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id||''))errors.push(`${where}: invalid id`);
  if(ids.has(item.id))errors.push(`${where}: duplicate id ${item.id}`);ids.add(item.id);
  for(const lang of ['fr','en']){
   if(!item.title?.[lang])errors.push(`${where}: missing title.${lang}`);
   if(type==='article'&&!item.article?.[lang])errors.push(`${where}: missing article.${lang}`);
  }
  if(item.published===false)continue;
  if(type==='project'&&!item.images?.cover)errors.push(`${where}: missing images.cover`);
  if(type==='project'&&(!Array.isArray(item.tags?.fr)||!Array.isArray(item.tags?.en)))errors.push(`${where}: tags must be bilingual arrays`);
  if(type==='article'){
   for(const id of item.projects||[]){if(!allProjects.some(p=>p.id===id&&p.published!==false))errors.push(`${where}: unknown or unpublished project ${id}`)}
   if(item.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||Number.isNaN(Date.parse(item.date))))errors.push(`${where}: date must be YYYY-MM-DD`);
  }
 }
}
validate(allProjects,'project');validate(allArticles,'article');
if(errors.length)throw new Error(`Content validation failed:\n${errors.join('\n')}`);
const projects=allProjects.filter(p=>p.published!==false);
const articles=allArticles.filter(a=>a.published!==false).map(a=>({...a,type:editorial.articles[a.id]?.type||a.type||'case-study'}));
for(const lang of ['fr','en']){
 if(!Array.isArray(skills[lang]))throw new Error(`skills.${lang} must be an array`);
 for(const group of skills[lang])for(const item of group.items||[]){
  for(const id of item.related?.projects||[])if(!projects.some(p=>p.id===id))errors.push(`Skill ${item.id}: unknown project ${id}`);
  for(const id of item.related?.cases||[])if(!articles.some(a=>a.id===id))errors.push(`Skill ${item.id}: unknown article ${id}`);
 }
}
if(errors.length)throw new Error(errors.join('\n'));
await fs.rm(OUT,{recursive:true,force:true});await fs.mkdir(path.join(OUT,'media'),{recursive:true});await fs.mkdir(CACHE,{recursive:true});
const assets=new Set();
function collect(value){if(typeof value==='string'&&value.startsWith('assets/'))assets.add(value);else if(value&&typeof value==='object')Object.values(value).forEach(collect)}
collect({site,projects,articles,skills});assets.add('assets/favicon.svg');
const imageMap=new Map();let inputBytes=0,outputBytes=0;
for(const asset of assets){
 const full=path.resolve(ROOT,asset);
 if(!full.startsWith(path.join(ROOT,'assets')+path.sep))throw new Error(`Invalid asset: ${asset}`);
 let buffer;try{buffer=await fs.readFile(full)}catch{throw new Error(`Missing asset: ${asset}`)}
 inputBytes+=buffer.length;
 if(!/\.(png|jpe?g|webp|avif)$/i.test(asset)){
  const dest=path.join(OUT,asset);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,buffer);outputBytes+=buffer.length;continue;
 }
 const meta=await sharp(buffer).metadata();
 const isHero=asset===site.artwork.day||asset===site.artwork.night;
 const isTree=asset===site.artwork.treeDay||asset===site.artwork.treeNight;
 const widths=[...new Set((isHero?[800,1400,2200]:isTree?[500,800]:[480,960,1600]).map(w=>Math.min(meta.width,w)))];
 const variants=[];
 for(const width of widths){
  const hash=createHash('sha256').update(buffer).update(`${width}:webp:84:v1`).digest('hex').slice(0,16);
  const name=`${path.basename(asset,path.extname(asset))}-${width}-${hash}.webp`;
  const cached=path.join(CACHE,name);
  try{await fs.access(cached)}catch{await sharp(buffer).rotate().resize({width,withoutEnlargement:true}).webp({quality:84,alphaQuality:95,effort:4}).toFile(cached)}
  await fs.copyFile(cached,path.join(OUT,'media',name));outputBytes+=(await fs.stat(cached)).size;
  variants.push({width,url:`/media/${name}`});
 }
 imageMap.set(asset,{width:meta.width,height:meta.height,variants});
}
function media(asset,{alt='',className='',sizes='100vw',priority=false}={}){
 const img=imageMap.get(asset);if(!img)throw new Error(`Image not registered: ${asset}`);
 const src=img.variants.find(v=>v.width>=900)||img.variants.at(-1);
 return `<img src="${src.url}" srcset="${img.variants.map(v=>`${v.url} ${v.width}w`).join(', ')}" sizes="${escape(sizes)}" width="${img.width}" height="${img.height}" alt="${escape(alt)}"${className?` class="${escape(className)}"`:''} loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}>`;
}
media.url=asset=>imageMap.get(asset)?.variants.at(-1).url||`/${asset}`;
const pages=makePages({site,projects,articles,skills,editorial},media);
for(const page of pages){const dir=path.join(OUT,page.path);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),page.html)}
await fs.copyFile(path.join(ROOT,'src/style.css'),path.join(OUT,'style.css'));
await fs.copyFile(path.join(ROOT,'src/app.js'),path.join(OUT,'app.js'));
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${site.url}${p.path}</loc></url>`).join('')}</urlset>`;
await fs.writeFile(path.join(OUT,'sitemap.xml'),sitemap);
await fs.writeFile(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await fs.writeFile(path.join(OUT,'404.html'),`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page introuvable | Nathan Tandille</title><link rel="stylesheet" href="/style.css"></head><body><main class="wrap section"><p class="eyebrow">404 · Hors du sentier</p><h1>Cette page n’est pas ici</h1><p class="lead">Le lien a peut-être changé. Les projets et le journal vous attendent à l’accueil.</p><p class="lead"><a class="button button-primary" href="/">Retour au portfolio</a> <a class="button" href="/en/">English portfolio</a></p></main></body></html>`);
await fs.writeFile(path.join(OUT,'build-info.json'),JSON.stringify({pages:pages.map(p=>p.path),projects:projects.length,articles:articles.length,drafts:allProjects.length+allArticles.length-projects.length-articles.length,assets:{sourceBytes:inputBytes,outputBytes,images:imageMap.size},generatedAt:new Date().toISOString()},null,2));
console.log(`Built ${pages.length} pages, ${projects.length} projects, ${articles.length} articles (${allProjects.length+allArticles.length-projects.length-articles.length} drafts excluded)`);
console.log(`Assets: ${(inputBytes/1048576).toFixed(2)} MB source → ${(outputBytes/1048576).toFixed(2)} MB responsive output`);
