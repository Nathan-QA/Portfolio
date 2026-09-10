import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.json':'application/json','.xml':'application/xml','.txt':'text/plain'};
try{await fs.access(path.join(root,'index.html'))}catch{console.error('Build first: npm run build');process.exit(1)}
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  let stat;try{stat=await fs.stat(file)}catch{}
  if(stat?.isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'}).end();return}
   file=path.join(file,'index.html');
  }
  let body,status=200;try{body=await fs.readFile(file)}catch{file=path.join(root,'404.html');body=await fs.readFile(file);status=404}
  res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
 }catch{res.writeHead(400).end('Bad request')}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://localhost:${port}`));
