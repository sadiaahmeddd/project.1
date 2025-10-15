/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function send(res, status, data, type = 'application/json; charset=utf-8', extra = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body), ...extra });
  res.end(body);
}

function sendHead(res, status, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': 0, ...extra });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      if (!raw) return resolve({});
      const ct = (req.headers['content-type'] || '').split(';')[0];
      try {
        if (ct === 'application/json') return resolve(JSON.parse(raw));
        if (ct === 'application/x-www-form-urlencoded') {
          const querystring = require('querystring'); // lazy load
          return resolve(querystring.parse(raw));
        }
        return reject(new Error('Unsupported Content-Type'));
      } catch {
        return reject(new Error('Invalid body'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const candidates = [
    path.join(__dirname, '..', '..', 'public', rel),
    path.join(__dirname, '..', '..', rel),
  ];
  for (const fp of candidates) {
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      const ext = path.extname(fp).toLowerCase();
      const buf = fs.readFileSync(fp);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain; charset=utf-8', 'Content-Length': buf.length });
      res.end(buf);
      return true;
    }
  }
  return false;
}

module.exports = { send, sendHead, readBody, serveStatic };
