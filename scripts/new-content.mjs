import fs from 'node:fs/promises';
import path from 'node:path';
const [type,id]=process.argv.slice(2);
if(!['article','project'].includes(type)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id||'')){
 console.error('Usage: npm run new:article -- mon-sujet\n       npm run new:project -- mon-projet');process.exit(1);
}
const file=`${type}s_${id}.json`, dest=path.join('content',file);
const bilingual=(fr='',en='')=>({fr,en});
const data=type==='article'?{
 id,published:false,type:'note',category:'notes',projects:[],title:bilingual('Titre de l’article','Article title'),abstract:bilingual('Résumé en une ou deux phrases','A one or two sentence summary'),tags:[],cover:'assets/bannerD.png',
 article:{fr:{intro:['Introduction'],sections:[{heading:'Premier sujet',paragraphs:['Votre texte'],bullets:[]}],blocks:[],closing:''},en:{intro:['Introduction'],sections:[{heading:'First topic',paragraphs:['Your text'],bullets:[]}],blocks:[],closing:''}}
}:{id,published:false,title:bilingual('Nom du projet','Project name'),role:bilingual('Mon rôle','My role'),summary:bilingual('Résumé du projet et de ma contribution','Project and contribution summary'),category:'design',tags:bilingual([],[]),facts:bilingual([],[]),projectInfo:{developer:'',description:bilingual()},overview:bilingual([],[]),contribution:bilingual([],[]),images:{cover:'assets/bannerD.png',gallery:[]},links:[]};
await fs.writeFile(dest,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
const manifestFile='content/content_manifest.json';
const manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));
const key=type==='article'?'articles':'projects';manifest[key]||=[];manifest[key].push(file);
await fs.writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
console.log(`Created ${dest}. Draft only: set published to true when ready. Existing content was not changed.`);
