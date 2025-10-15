const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const POKE_PATH = path.join(DATA_DIR, 'pokedex.json');
const TYPES_PATH = path.join(DATA_DIR, 'types.json');
const WEAK_PATH = path.join(DATA_DIR, 'weaknesses.json');
const RUNTIME_PATH = path.join(DATA_DIR, 'pokedex.runtime.json');

let POKEMON = JSON.parse(fs.readFileSync(POKE_PATH, 'utf8'));
const TYPES = JSON.parse(fs.readFileSync(TYPES_PATH, 'utf8'));
const WEAKNESSES = JSON.parse(fs.readFileSync(WEAK_PATH, 'utf8'));

function all() { return POKEMON; }
function types() { return TYPES; }
function weaknesses() { return WEAKNESSES; }

function nextId() {
  const ids = POKEMON.map((p) => p.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

function add(doc) { POKEMON.push(doc); }
function findById(id) { return POKEMON.find((p) => p.id === id); }
function removeById(id) { POKEMON = POKEMON.filter((p) => p.id !== id); }

function saveToRuntime() {
  fs.writeFileSync(RUNTIME_PATH, JSON.stringify(POKEMON, null, 2), 'utf8');
  return RUNTIME_PATH;
}

module.exports = { all, types, weaknesses, nextId, add, findById, removeById, saveToRuntime };
