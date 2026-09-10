import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf'};
createServer(async(req,res)=>{
 try{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let path=resolve(root,'.'+relative);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}`));
