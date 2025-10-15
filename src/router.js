/*
  (This keeps server.js tiny and avoids if/else.)
*/
const { send } = require('./utils/http');
const Poke = require('./controllers/pokemon');

function route(req, res, parsed) {
  const { pathname, query } = parsed;
  const method = req.method.toUpperCase();
  const isHead = method === 'HEAD';

  // list and add
  if (pathname === '/api/pokemon' && (method === 'GET' || isHead)) return Poke.handleList(req, res, query, isHead);
  if (pathname === '/api/pokemon' && method === 'POST') return Poke.handleAdd(req, res);

  // get/edit one by id
  if (pathname.startsWith('/api/pokemon/')) {
    const id = Number(pathname.split('/').pop());
    if (Number.isNaN(id)) return send(res, 400, { error: 'bad id' });
    if (method === 'GET' || isHead) return Poke.handleGetOne(req, res, id, isHead);
    if (method === 'POST') return Poke.handleEdit(req, res, id);
  }

  // lists (types/weaknesses)
  if (pathname === '/api/types' && (method === 'GET' || isHead)) return Poke.handleTypes(req, res, isHead);
  if (pathname === '/api/weaknesses' && (method === 'GET' || isHead)) return Poke.handleWeak(req, res, isHead);

  // above & beyond
  if (pathname === '/api/random' && (method === 'GET' || isHead)) return Poke.handleRandom(req, res, isHead);
  if (pathname.startsWith('/api/delete/')) {
    const id = Number(pathname.split('/').pop());
    if (Number.isNaN(id)) return send(res, 400, { error: 'bad id' });
    if (method === 'POST') return Poke.handleDelete(req, res, id);
  }
  if (pathname === '/api/save' && (method === 'POST' || isHead)) return Poke.handleSave(req, res, isHead);

  // we don't know this API path
  return send(res, 404, { error: 'not found' });
}

module.exports = { route };
