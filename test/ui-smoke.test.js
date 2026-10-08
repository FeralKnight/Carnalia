import test from 'node:test';
import assert from 'node:assert/strict';
import { createBuild, changeBuild } from '../src/engine/build.js';
import { composeSprite } from '../src/ui/sprite-composer.js';

test('sprite composer layers react to equipped weapon and armor', () => {
  const paint = build => {
    const calls = [];
    const ctx = { fillStyle: '', fillRect(...rect) { calls.push([this.fillStyle, ...rect]); }, clearRect() {}, save() {}, restore() {}, translate() {}, scale() {} };
    composeSprite({ getContext: () => ctx }, build);
    return calls;
  };
  const base = createBuild();
  const changed = changeBuild(changeBuild(base, { type: 'equip', slot: 'weapon', id: 'ember_staff' }), { type: 'equip', slot: 'armor', id: 'iron_armor' });
  assert.notDeepEqual(paint(base), paint(changed));
  assert.ok(paint(changed).some(([color]) => color === '#f7bb65'));
  assert.ok(paint(changed).some(([color]) => color === '#bdc6c7'));
});

test('the actual UI bootstraps and progresses from form to a resolved round', async () => {
  const handlers = {};
  const root = { innerHTML: '', addEventListener: (name, cb) => { handlers[name] = cb; }, querySelectorAll: () => [] };
  const saved = new Map();
  globalThis.document = { querySelector: () => root };
  globalThis.location = { hostname: 'example.test' };
  globalThis.localStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
  globalThis.FormData = class { constructor() {} get(key) { return { player1: 'Ale', player2: 'Juan', mode: 'selection' }[key]; } };
  globalThis.window = { confirm: () => true };
  await import('../src/ui/app.js?smoke');
  assert.match(root.innerHTML, /CREAR PARTIDA/);
  handlers.submit({ target: { id: 'new-game' }, preventDefault() {} });
  assert.match(root.innerHTML, /forja tu héroe/);
  const click = (action, id) => handlers.click({ target: { closest: () => ({ disabled: false, dataset: { action, id } }) } });
  click('confirm-build');
  assert.match(root.innerHTML, /Entrega la arena/);
  click('continue-prep');
  click('confirm-build');
  assert.match(root.innerHTML, /El duelo/);
  click('ability', 'strike'); click('confirm-action');
  assert.match(root.innerHTML, /TURNO RESERVADO/);
  click('continue-combat'); click('ability', 'guard'); click('confirm-action');
  assert.match(root.innerHTML, /Última ronda/);
  const state = JSON.parse([...saved.values()][0]);
  assert.equal(state.combat.round, 2);
  assert.equal(state.combat.history.length, 1);
});
