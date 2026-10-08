import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContent } from '../src/engine/content-validation.js';
import { createBuild, changeBuild, rollBuild, validateBuild } from '../src/engine/build.js';
import { calculateStats } from '../src/engine/stats.js';
import { beginCombat, resolveRound, validateAction } from '../src/engine/combat.js';
import { createGame, updatePlayerBuild, rollPlayerBuild, confirmPlayer, continuePreparation, submitAction, continueCombat, validateGameState, rematch } from '../src/engine/game-state.js';
import { loadGame, saveGame } from '../src/engine/storage.js';
import { get } from '../src/content/registry.js';
import { assetManifest } from '../src/assets/manifest.js';

test('all content references and visual IDs are valid', () => {
  assert.deepEqual(validateContent(), []);
  for (const item of ['rust_sword', 'azure_sword', 'ember_staff', 'iron_armor']) assert.ok(assetManifest[get('items', item).sprite]);
});

test('stats have one source of truth; replacing and removing gear removes old modifiers', () => {
  let build = createBuild();
  const original = calculateStats(build);
  build = changeBuild(build, { type: 'equip', slot: 'weapon', id: 'azure_sword' });
  assert.equal(calculateStats(build).speed, original.speed + 2);
  assert.equal(calculateStats(build).damage, original.damage - 1);
  assert.equal(assetManifest[get('items', build.equipment.weapon).sprite].shape, 'sword');
  build = changeBuild(build, { type: 'equip', slot: 'weapon', id: null });
  assert.equal(calculateStats(build).damage, original.damage - 2);
  assert.throws(() => changeBuild(build, { type: 'equip', slot: 'armor', id: 'stone_axe' }));
  build = changeBuild(build, { type: 'talent', id: 'quickstep' });
  assert.equal(calculateStats(build).speed, original.speed + 2);
  build = changeBuild(build, { type: 'talent', id: 'quickstep' });
  assert.equal(calculateStats(build).speed, original.speed);
});

test('build validates slots, duplicate talents and random rolls reproduce from seed', () => {
  const build = createBuild();
  assert.deepEqual(rollBuild(build, 1337), rollBuild(build, 1337));
  assert.throws(() => validateBuild({ ...build, talentIds: ['focus', 'focus'] }));
  assert.throws(() => validateBuild({ ...build, equipment: { ...build.equipment, exotic: null } }));
  assert.throws(() => changeBuild(build, { type: 'appearance', key: 'hair', value: 'invalid' }));
});

test('selection preparation, hidden action relay, resolution, saving and victory', () => {
  let game = createGame(['Ale', 'Juan'], 'selection', 21);
  game = updatePlayerBuild(game, { type: 'equip', slot: 'weapon', id: 'stone_axe' });
  game = confirmPlayer(game);
  assert.equal(game.preparation.handoff, true);
  assert.throws(() => updatePlayerBuild(game, { type: 'race', id: 'emberkin' }));
  game = continuePreparation(game);
  game = confirmPlayer(game);
  assert.equal(game.phase, 'combat');
  assert.throws(() => submitAction(game, 'unknown'));
  game = submitAction(game, 'strike');
  assert.equal(game.combat.handoff, true);
  assert.deepEqual(game.combat.pending, [{ abilityId: 'strike' }, null]);
  assert.throws(() => submitAction(game, 'guard'));
  game = continueCombat(game);
  game = submitAction(game, 'guard');
  assert.equal(game.combat.round, 2);
  assert.equal(game.combat.history.length, 1);
  assert.equal(game.combat.pending[0], null);
  assert.ok(game.combat.fighters[1].hp < calculateStats(game.players[1].build).hp);
  assert.equal(validateGameState(game), true);
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
  saveGame(game, storage);
  assert.deepEqual(loadGame(storage).state, game);
  while (game.phase === 'combat') {
    game = submitAction(game, 'strike');
    game = continueCombat(game);
    game = submitAction(game, 'strike');
  }
  assert.equal(game.phase, 'result');
  assert.ok(game.result.winnerId);
  assert.equal(rematch(game).phase, 'preparation');
});

test('chance requires roll and allows exactly three reproducible attempts', () => {
  let game = createGame(['Uno', 'Dos'], 'chance', 9);
  assert.throws(() => confirmPlayer(game));
  assert.throws(() => updatePlayerBuild(game, { type: 'talent', id: 'focus' }));
  for (let i = 0; i < 3; i++) game = rollPlayerBuild(game);
  assert.equal(game.preparation.rollsRemaining[0], 0);
  assert.throws(() => rollPlayerBuild(game));
  game = confirmPlayer(game);
  game = continuePreparation(game);
  game = rollPlayerBuild(game);
  game = confirmPlayer(game);
  assert.equal(game.phase, 'combat');
});

test('combat validates energy, guard, statuses, defense and death', () => {
  const state = createGame(['Fuego', 'Escudo'], 'selection', 1);
  state.players.forEach(p => { p.ready = true; });
  state.players[0].build = changeBuild(state.players[0].build, { type: 'class', id: 'arcanist' });
  state.players[1].build = changeBuild(state.players[1].build, { type: 'equip', slot: 'armor', id: 'iron_armor' });
  let combat = beginCombat(state.players);
  combat.fighters[0].energy = 0;
  assert.throws(() => validateAction(state.players, combat, 0, 'ember_bolt'));
  combat.fighters[0].energy = 10;
  combat.pending = [{ abilityId: 'ember_bolt' }, { abilityId: 'guard' }];
  const before = combat.fighters[1].hp;
  const result = resolveRound(state.players, combat);
  assert.equal(combat.fighters[1].hp, before); // pure resolver
  assert.ok(result.combat.fighters[1].hp < before);
  assert.ok(result.combat.lastEvents.some(line => line.includes('guardia')));
  assert.ok(result.combat.lastEvents.some(line => line.includes('quemadura')));
  assert.equal(result.combat.fighters[1].statuses[0].duration, 1);
  assert.equal(calculateStats(state.players[1].build, [{ id: 'ward', duration: 1 }]).defense, calculateStats(state.players[1].build).defense + 4);
  let lethal = beginCombat(state.players);
  lethal.fighters[1].hp = 1;
  lethal.pending = [{ abilityId: 'strike' }, { abilityId: 'strike' }];
  const ended = resolveRound(state.players, lethal);
  assert.equal(ended.finished, true);
  assert.equal(ended.winnerIndex, 0);
  assert.equal(ended.combat.fighters[1].hp, 0);
});

test('corrupted and incompatible saves fail with a user-facing recovery path', () => {
  const storage = { getItem: () => '{bad json' };
  assert.match(loadGame(storage).error, /partida guardada/);
  const state = createGame(['Uno', 'Dos'], 'selection', 4);
  assert.throws(() => validateGameState({ ...state, schemaVersion: 99 }), /otra versión/);
  assert.throws(() => validateGameState({ ...state, players: [] }), /dañada/);
});
