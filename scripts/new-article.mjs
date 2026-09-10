import {readFile,writeFile,access} from 'node:fs/promises';
const slug=process.argv[2];
if(!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Usage: npm run new:article -- mon-sujet');
const name=`content_cases_${slug}.json`,path=`content/${name}`;
try{await access(path);throw new Error('An article already exists at '+path)}catch(e){if(e.code!=='ENOENT')throw e}
const title={fr:'Titre de l’article',en:'Article title'};
await writeFile(path,JSON.stringify({id:slug,published:false,projects:[],title,abstract:{fr:'Résumé court',en:'Short summary'},tags:[],media:{images:[]},article:{fr:{intro:['Introduction'],sections:[{heading:'Mon sujet',paragraphs:['Texte']} ]},en:{intro:['Introduction'],sections:[{heading:'My subject',paragraphs:['Text']}]}}},null,2)+'\n');
const manifestPath='content/content_manifest.json',manifest=JSON.parse(await readFile(manifestPath,'utf8'));
manifest.cases.push(name);await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(`${path} created as an unpublished draft. Complete it, then set published to true`);
