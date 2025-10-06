/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

/* -Data files- */
const DATA_DIR = path.join(__dirname, 'data');
const POKE_PATH = path.join(DATA_DIR, 'pokedex.json');       // full objects
const TYPES_PATH = path.join(DATA_DIR, 'types.json');         // "Grass","Fire
const WEAK_PATH = path.join(DATA_DIR, 'weaknesses.json');     // "Fire","Rock"
//read files
let POKEMON = JSON.parse(fs.readFileSync(POKE_PATH, 'utf8'));
const TYPES = JSON.parse(fs.readFileSync(TYPES_PATH, 'utf8'));
const WEAKNESSES = JSON.parse(fs.readFileSync(WEAK_PATH, 'utf8'));

/* - tiny helpers - */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};
//normaak response by default
//took help from copilot to properly write this
function send(res, status, obj, type = 'application/json; charset=utf-8') {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}
//head response
function head(res, status, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': 0 });
  res.end();
}
//did get stuck and took help from youtube tutorials 
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      if (!raw) return resolve({});
      const ct = (req.headers['content-type'] || '').split(';')[0];
      try {
        if (ct === 'application/json') return resolve(JSON.parse(raw));
        if (ct === 'application/x-www-form-urlencoded') return resolve(querystring.parse(raw));
        return reject(new Error('bad content-type'));
      } catch { return reject(new Error('bad body')); }
    });
  });
}

/* -API -*/
async function handleApi(req, res, parsed) {
  const { pathname, query } = parsed;
  const isHEAD = req.method === 'HEAD';

  // GET/HEAD /api/pokemon  
  if (pathname === '/api/pokemon' && (req.method === 'GET' || isHEAD)) {
    let data = POKEMON;
    if (query.name) data = data.filter(p => p.name.toLowerCase().includes(String(query.name).toLowerCase()));
    if (query.type) data = data.filter(p => (p.type || []).includes(String(query.type)));
    const limit = Number(query.limit) || data.length;
    const out = { count: data.length, data: data.slice(0, limit) };
    return isHEAD ? head(res, 200) : send(res, 200, out);
  }

  // POST /api/pokemon  (add)
  if (pathname === '/api/pokemon' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.name || !body.type) return send(res, 400, { error: 'name and type are required' });
      const nextId = Math.max(...POKEMON.map(p => p.id)) + 1;
      const doc = {
        id: nextId,
        num: String(nextId).padStart(3, '0'),
        name: String(body.name),
        img: body.img || '',
        type: Array.isArray(body.type) ? body.type : [String(body.type)],
        height: body.height || '',
        weight: body.weight || '',
        weaknesses: Array.isArray(body.weaknesses) ? body.weaknesses : []
      };
      POKEMON.push(doc); // in-memory only (ok per rubric)
      return send(res, 201, doc, 'application/json; charset=utf-8');
    } catch { return send(res, 400, { error: 'bad body or content-type' }); }
  }

  // GET/HEAD /api/pokemon/:id
  if (pathname.startsWith('/api/pokemon/')) {
    const id = Number(pathname.split('/').pop());
    const found = POKEMON.find(p => p.id === id);
    if (!found) return isHEAD ? head(res, 404) : send(res, 404, { error: 'not found' });

    if (req.method === 'GET' || isHEAD) return isHEAD ? head(res, 200) : send(res, 200, found);

    // POST /api/pokemon/:id (edit simple fields)
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        ['name','img','type','height','weight','weaknesses'].forEach(k => {
          if (body[k] !== undefined) found[k] = body[k];
        });
        return head(res, 204); // success, no body
      } catch { return send(res, 400, { error: 'bad body or content-type' }); }
    }
  }

  // GET/HEAD /api/types
  if (pathname === '/api/types' && (req.method === 'GET' || isHEAD)) {
    return isHEAD ? head(res, 200) : send(res, 200, { data: TYPES });
  }

  // GET/HEAD /api/weaknesses
  if (pathname === '/api/weaknesses' && (req.method === 'GET' || isHEAD)) {
    return isHEAD ? head(res, 200) : send(res, 200, { data: WEAKNESSES });
  }

  // Unknown API
  return isHEAD ? head(res, 404) : send(res, 404, { error: 'not found' });
}

/* static files  */
function handleStatic(req, res, parsed) {
    const rel = parsed.pathname === '/' ? 'index.html' : parsed.pathname.replace(/^\//, '');
    const tryPaths = [
      path.join(__dirname, 'public', rel), // preferred
      path.join(__dirname, rel),           // fallback to project root
    ];
  
    for (const filePath of tryPaths) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const buf = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'text/plain; charset=utf-8',
          'Content-Length': buf.length,
        });
        res.end(buf);
        return;
      }
    }
    //no file found
    send(res, 404, { error: 'not found' });
  }
  
/* - server - */
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname.startsWith('/api/')) return handleApi(req, res, parsed);
  return handleStatic(req, res, parsed);
});

//http://localhost:3000/
server.listen(port, () => {
    console.log(`Server running at http://localhost:${3000}/`);
})