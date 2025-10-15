/* eslint-disable no-console */
const { send, sendHead, readBody } = require('../utils/http');
const Store = require('../utils/store');

function handleList(req, res, query, isHead) {
  let list = Store.all();
  if (query.name) {
    const n = String(query.name).toLowerCase();
    list = list.filter((p) => p.name && p.name.toLowerCase().includes(n));
  }
  if (query.type) {
    const t = String(query.type);
    list = list.filter((p) => Array.isArray(p.type) && p.type.includes(t));
  }
  const limit = Number(query.limit) || list.length;
  const out = { count: list.length, data: list.slice(0, limit) };
  return isHead ? sendHead(res, 200) : send(res, 200, out);
}

async function handleAdd(req, res) {
  try {
    const body = await readBody(req);
    if (!body.name || !body.type) return send(res, 400, { error: 'name and type required' });
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
    return send(res, 400, { error: 'bad body' });
  }
}

function handleGetOne(req, res, id, isHead) {
  const found = Store.findById(id);
  if (!found) return isHead ? sendHead(res, 404) : send(res, 404, { error: 'not found' });
  return isHead ? sendHead(res, 200) : send(res, 200, found);
}

async function handleEdit(req, res, id) {
  const found = Store.findById(id);
  if (!found) return send(res, 404, { error: 'not found' });
  try {
    const body = await readBody(req);
    ['name', 'img', 'type', 'height', 'weight', 'weaknesses'].forEach((k) => {
      if (body[k] !== undefined) found[k] = body[k];
    });
    return sendHead(res, 204);
  } catch {
    return send(res, 400, { error: 'bad body' });
  }
}

/* --------- Above & Beyond --------- */
function handleRandom(req, res, isHead) {
  const list = Store.all();
  if (!list.length) return isHead ? sendHead(res, 404) : send(res, 404, { error: 'empty' });
  const pick = list[Math.floor(Math.random() * list.length)];
  return isHead ? sendHead(res, 200) : send(res, 200, pick);
}

async function handleDelete(req, res, id) {
  const found = Store.findById(id);
  if (!found) return send(res, 404, { error: 'not found' });
  Store.removeById(id);
  return sendHead(res, 204);
}

function handleTypes(req, res, isHead) {
  const list = Store.types();
  return isHead ? sendHead(res, 200) : send(res, 200, { data: list });
}

function handleWeak(req, res, isHead) {
  const list = Store.weaknesses();
  return isHead ? sendHead(res, 200) : send(res, 200, { data: list });
}

function handleSave(req, res, isHead) {
  const path = Store.saveToRuntime();
  return isHead ? sendHead(res, 200) : send(res, 200, { saved: true, path });
}

module.exports = {
  handleList, handleAdd, handleGetOne, handleEdit,
  handleRandom, handleDelete, handleTypes, handleWeak, handleSave,
};
