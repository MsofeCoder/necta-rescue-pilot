import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const docs = path.join(root, 'docs');
export const prefix = '/necta-rescue-pilot/';
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
export function startPreview({port=4173,tls,read}={}) {
  const files = new Set(fs.readdirSync(docs));
  const handler = (req,res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
    if (pathname === '/') { res.writeHead(302,{Location:prefix}).end(); return; }
    const name = pathname.slice(prefix.length) || 'index.html';
    if (!pathname.startsWith(prefix) || !files.has(name) || !types[path.extname(name)] || req.method !== 'GET') { res.writeHead(404).end('Not found'); return; }
    try {
      const body = read ? read(name) : fs.readFileSync(path.join(docs,name));
      if (body == null) { res.writeHead(404).end('Not found'); return; }
      res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store'}).end(body);
    } catch { res.writeHead(404).end('Not found'); }
  };
  const server = tls ? https.createServer(tls,handler) : http.createServer(handler);
  return new Promise(resolve => server.listen(port,'127.0.0.1',() => resolve(server)));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startPreview();
  console.log('Local: http://127.0.0.1:4173' + prefix);
}
