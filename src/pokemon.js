/* eslint-disable no-console */
/*
  This file holds the logic for each API endpoint.
*/

const { send, sendHead, readBody } = require('../utils/http');
const Store = require('../utils/store');

// GET/HEAD /api/pokemon  
function handleList(req, res, query, isHead) {
  let list = Store.all();

  // filter by partial name 
  if (query.name) {
    const n = String(query.name).toLowerCase();
    list = list.filter((p) => p.name && p.name.toLowerCase().includes(n));
  }

  // filter by exact match 
  if (query.type) {
    const t = String(query.type);
    list = list.filter((p) => Array.isArray(p.type) && p.type.includes(t));
  }

  const limit = Number(query.limit) || list.length;
  const out = { count: list.length, data: list.slice(0, limit) };

  //do we need this response?? --check for more information-- 
  return isHead ? sendHead(res, 200) : send(res, 200, out);
}

// POST /api/pokemon -- adding a new pokemon
async function handleAdd(req, res) {
  try {
    const body = await readBody(req);
    if (!body.name || !body.type) {
      return send(res, 400, { error: 'Please include "name" and "type" (string or array).' });
    }
    const id = Store.nextId();
    const doc = {
      id,
      num: String(id).padStart(3, '0'),
      name: String(body.name),
      img: body.img || '',
      type: Array.isArray(body.type) ? body.type : [String(body.type)],
      height: body.height || '',
      weight: body.weight || '',
      weaknesses: Array.isArray(body.weaknesses) ? body.weaknesses : [],
    };
    Store.add(doc);
    return send(res, 201, doc);
  } catch {
    return send(res, 400, { error: 'Bad request body or content type.' });
  }
}

// GET/HEAD /api/pokemon/
function handleGetOne(req, res, id, isHead) {
  const found = Store.findById(id);
  if (!found) return isHead ? sendHead(res, 404) : send(res, 404, { error: 'not found' });
  return isHead ? sendHead(res, 200) : send(res, 200, found);
}

// POST /api/pokemon/:id 
async function handleEdit(req, res, id) {
  const found = Store.findById(id);
  if (!found) return send(res, 404, { error: 'not found' });

  try {
    const body = await readBody(req);
    // only update known fields 
    ['name', 'img', 'type', 'height', 'weight', 'weaknesses'].forEach((k) => {
      if (body[k] !== undefined) found[k] = body[k];
    });
    return sendHead(res, 204); // success, no body
  } catch {
    return send(res, 400, { error: 'Bad request body or content type.' });
  }
}

/* extras)  */

// GET/HEAD /api/random  
function handleRandom(req, res, isHead) {
  const list = Store.all();
  if (!list.length) return isHead ? sendHead(res, 404) : send(res, 404, { error: 'empty dataset' });
  const pick = list[Math.floor(Math.random() * list.length)];
  return isHead ? sendHead(res, 200) : send(res, 200, pick);
}

// POST /api/delete/:id  
function handleDelete(req, res, id) {
  const found = Store.findById(id);
  if (!found) return send(res, 404, { error: 'not found' });
  Store.removeById(id);
  return sendHead(res, 204);
}

// GET/HEAD /api/types  
function handleTypes(req, res, isHead) {
  return isHead ? sendHead(res, 200) : send(res, 200, { data: Store.types() });
}

// GET/HEAD /api/weaknesses  
function handleWeak(req, res, isHead) {
  return isHead ? sendHead(res, 200) : send(res, 200, { data: Store.weaknesses() });
}

// POST/HEAD /api/save  
function handleSave(req, res, isHead) {
  const savedPath = Store.saveToRuntime();
  return isHead ? sendHead(res, 200) : send(res, 200, { saved: true, path: savedPath });
}

module.exports = {
  handleList,
  handleAdd,
  handleGetOne,
  handleEdit,
  handleRandom,
  handleDelete,
  handleTypes,
  handleWeak,
  handleSave,
};
