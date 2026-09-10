import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const path of ['index.html','style.css','ux.css','js','content','assets'])await cp(path,`dist/${path}`,{recursive:true});
console.log('Built dist from the existing static site, without changing its assets');
