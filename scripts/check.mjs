import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {CONFIG} from '../js/config.js';
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const baseline={
 'style.css':'2bcf9d15c47abf5012fef3d687b2fbe2b2420e5e',
 'assets/bannerD.png':'9020242d68f8e875c6bcab5a805bc9ffe4512a31',
 'assets/bannerN.png':'48490016bc5d43b1d2ab66d379693c6ee3912c62',
 'assets/leaf_right.png':'3fb54dffecd323433953cc25dc48fd3a05b4a504',
 'assets/leaf_rightN.png':'d104c2b07fb2fbffc135887d9bb6493bb6404fb7',
 'assets/leaf_cliff_particles_grid_export.png':'8dee9a5ce5a7a8089ea87d0971b18f5e6ad0937a',
 'assets/leafN_cliff_particles_grid_export.png':'eaee20badf8df6d80737f219783d311e82ee923a'
};
for(const [path,sha] of Object.entries(baseline))assert.equal(blob(await readFile(path)),sha,`${path} differs from approved main`);
// Copy may change with the owner's positioning; scenery parameters may not.
assert.deepEqual(CONFIG.CURTAIN,{leftImg:'assets/leaf_left_off.png',rightImg:'assets/leaf_right.png',leafSize:'contain',maxScrollVh:94,baseGapVW:1,tightGapVW:260,easing:'smooth',followHz:5,wobbleGain:.018,wobbleFreq:5.5,wobbleDecay:4,desync:.06,scaleDelta:.10,darkDelta:.50});
const manifest=JSON.parse(await readFile('content/content_manifest.json','utf8'));
const ids=new Set();let count=0;
for(const file of [...manifest.projects,...manifest.cases]){
 const data=JSON.parse(await readFile('content/'+file,'utf8'));
 assert.ok(data.id&&!ids.has(data.id));ids.add(data.id);
 assert.ok(data.title.fr&&data.title.en);count++;
}
const html=await readFile('index.html','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
for(const key of ['hero-banner','curtain','leafLayer','projects','cases','about','contact','skillsDetails','careerDetails','articleTools'])assert.ok(html.includes(`id="${key}"`));
for(const path of ['js/main.js','js/ux.js','js/hover-preview.js','js/router.js','ux.css'])await readFile(path);
const ui=await readFile('js/ui.js','utf8');
assert.equal(createHash('sha256').update(ui.slice(ui.indexOf('export function startCurtain'))).digest('hex'),'318dc68d7c865c0d9dba4b67eb2c8a7db3a5a557266f1d268862a9a4d63c931e');
console.log(`PASS: original stylesheet, scenery configuration, 6 scenery assets and curtain/particle implementation unchanged; ${count} bilingual contents validated`);
