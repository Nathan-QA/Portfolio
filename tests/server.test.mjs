import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { serve } from '../scripts/serve.mjs';
const server=serve(0);
await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
test.after(()=>new Promise(resolve=>server.close(resolve)));
test('every generated page returns HTML with a successful HTTP status',async()=>{
  const report=await(await fetch(base+'/build-report.json')).json();
  for(const url of report.pages){const response=await fetch(base+url);assert.equal(response.status,200,url);assert.match(response.headers.get('content-type'),/text\/html/);assert.match(await response.text(),/<h1[ >]/);}
});
test('missing pages return an actual 404 with a usable HTML page',async()=>{
  const response=await fetch(base+'/missing-page/');assert.equal(response.status,404);assert.match(await response.text(),/404|Ce chemin/);
});
test('HEAD returns headers but no body and non-read methods are rejected',async()=>{
  const head=await fetch(base+'/',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  const post=await fetch(base+'/',{method:'POST'});assert.equal(post.status,405);
});
test('stylesheet, script, icon and existing French CV are served with correct MIME types',async()=>{
  for(const [url,mime]of [['/assets/site.css','text/css'],['/assets/site.js','text/javascript'],['/assets/favicon.svg','image/svg+xml'],['/assets/Nathan_Tandille_CV_2026.pdf','application/pdf']]){
    const response=await fetch(base+url);assert.equal(response.status,200);assert.ok(response.headers.get('content-type').includes(mime));assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  }
});
