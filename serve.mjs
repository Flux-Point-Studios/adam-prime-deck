import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('docs');
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': `${types[extname(path)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') res.writeHead(404).end('Not found');
    else { console.error('Static server read failed:', error.message); res.writeHead(500).end('Unable to read file'); }
  }
});
server.listen(4178, '127.0.0.1', () => console.log('ADAM deck: http://127.0.0.1:4178'));
