/* eslint-disable no-console */
/*
  This file is a few tiny helpers for HTTP stuff:
  - send(): 
  - sendHead(): 
  - readBody(): 
  - serveStatic(): 
*/

const fs = require('fs');
const path = require('path');

// simple list of file extensions
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

// send a normal response
function send(res, status, data, type = 'application/json; charset=utf-8', extraHeaders = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

// send only headers (for HEAD)
function sendHead(res, status, type = 'application/json; charset=utf-8', extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': 0,
    ...extraHeaders,
  });
  res.end();
}

// read POST body as JSON 

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      const ct = (req.headers['content-type'] || '').split(';')[0].trim();
      try {
        if (ct === 'application/json') return resolve(JSON.parse(raw));


        /* might take it out */

        if (ct === 'application/x-www-form-urlencoded') {
          const querystring = require('querystring');
          return resolve(querystring.parse(raw));
        }
        return reject(new Error('Unsupported Content-Type'));
      } catch {
        return reject(new Error('Invalid request body'));
      }
    });
    req.on('error', reject);
  });
 }

// serve a file 
function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const candidates = [
    path.join(__dirname, '..', '..', 'public', rel), // first choice
    path.join(__dirname, '..', '..', rel),           // fallback
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const buf = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'text/plain; charset=utf-8',
        'Content-Length': buf.length,
      });
      res.end(buf);
      return true; // we handled it
    }
  }
  return false; // not found here
}

module.exports = { send, sendHead, readBody, serveStatic };

