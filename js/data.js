import { state } from './state.js';

const tryPaths=['content/content_manifest.json','content/manifest.json','content_manifest.json'];
async function j(u){try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw 0;return await r.json()}catch{return null}}
const isHttp=u=>/^https?:\/\//i.test(u);
const dir=p=>{const m=p.match(/^(.*)\/[^/]+$/);return m?m[1]:''};
const join=(d,f)=>isHttp(f)?f:(f.includes('/')?f:(d?`${d}/${f}`:f));

export async function loadContent(){
  let mf=null,url=null; 
  for(const p of tryPaths){const m=await j(p); if(m){mf=m; url=p; break}}
  if(!mf) return {projects:[], cases:[]};
  const base=dir(url);
  const pfiles=(mf.projects||[]).map(f=>join(base,f));
  const cfiles=(mf.cases||[]).map(f=>join(base,f));
  const projects=(await Promise.all(pfiles.map(j))).filter(x=>x && x.published!==false);
  const cases=(await Promise.all(cfiles.map(j))).filter(x=>x && x.published!==false);
  return {projects, cases};
}
