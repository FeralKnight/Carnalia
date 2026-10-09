import { actionInput,initializeTactics,maxStats } from './tactical.js';
import { RULES, GAME_VERSION, SCHEMA_VERSION, CONTENT_VERSION } from './config.js';
import { get } from '../content/registry.js';
import { calculateStats } from './stats.js';
import { createBuild, changeBuild, rollBuild, validateBuild } from './build.js';
import { beginCombat, resolveRound, validateAction } from './combat.js';
import { requireGame } from './errors.js';

export function createGame(names, mode, seed = Date.now() >>> 0) {
  requireGame(Array.isArray(names) && names.length === 2 && names.every(name => typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 18), 'Escribe dos nombres de 2 a 18 caracteres.');
  requireGame(['selection', 'chance'].includes(mode), 'Elige Selección o Azar.');
  const state = {
    gameVersion: GAME_VERSION, schemaVersion: SCHEMA_VERSION, contentVersion: CONTENT_VERSION, revision: 0,
    room: { id: `local-${seed.toString(36)}`, capacity: 2, transport: 'local' }, phase: 'preparation', mode, seed,
    players: names.map((name, index) => ({ id: `p${index + 1}`, name: name.trim(), build: createBuild(), ready: false })),
    preparation: { index: 0, rollsRemaining: [RULES.maxRerolls, RULES.maxRerolls], hasRolled: [false, false], handoff: false },
    combat: null, result: null
  };
  return state;
}

function next(state) { const copy = structuredClone(state); copy.revision++; return copy; }
function requirePrep(state) { requireGame(state.phase === 'preparation', 'La preparación ya terminó.'); }

export function updatePlayerBuild(state, change) {
  requirePrep(state);
  requireGame(state.mode === 'selection' || change.type === 'appearance', 'En Azar, las estadísticas y el equipo vienen de la tirada.');
  const copy = next(state);
  const index = copy.preparation.index;
  requireGame(!copy.preparation.handoff && !copy.players[index].ready, 'Espera el relevo del jugador.');
  copy.players[index].build = changeBuild(copy.players[index].build, change);
  return copy;
}

export function rollPlayerBuild(state) {
  requirePrep(state);
  requireGame(state.mode === 'chance', 'Esta partida usa Selección.');
  const copy = next(state);
  const index = copy.preparation.index;
  requireGame(!copy.preparation.handoff && copy.preparation.rollsRemaining[index] > 0, 'No quedan tiradas disponibles.');
  const result = rollBuild(copy.players[index].build, copy.seed);
  copy.players[index].build = result.build;
  copy.seed = result.seed;
  copy.preparation.hasRolled[index] = true;
  copy.preparation.rollsRemaining[index]--;
  return copy;
}

export function confirmPlayer(state) {
  requirePrep(state);
  const copy = next(state);
  const index = copy.preparation.index;
  requireGame(!copy.preparation.handoff && !copy.players[index].ready, 'Ya confirmaste este personaje.');
  requireGame(copy.mode !== 'chance' || copy.preparation.hasRolled[index], 'Primero gira el azar.');
  validateBuild(copy.players[index].build);
  copy.players[index].ready = true;
  if (index === 0) copy.preparation.handoff = true;
  else {
    copy.phase = 'combat';
    copy.combat = beginCombat(copy.players,copy.seed);
  }
  return copy;
}

export function continuePreparation(state) {
  requirePrep(state);
  requireGame(state.preparation.handoff && state.preparation.index === 0, 'No hay relevo pendiente.');
  const copy = next(state);
  copy.preparation.index = 1;
  copy.preparation.handoff = false;
  return copy;
}

export function submitAction(state, abilityId) {
  requireGame(state.phase === 'combat' && !!state.combat, 'No hay combate activo.');
  requireGame(!state.combat.handoff, 'Primero entrega el turno al rival.');
  const index = state.combat.selectionIndex;
  validateAction(state.players, state.combat, index, abilityId);
  const copy = next(state);
  copy.combat.pending[index] = typeof abilityId==='string'?{abilityId}:actionInput(abilityId);
  if (index === 0) copy.combat.handoff = true;
  else {
    const resolved = resolveRound(copy.players, copy.combat);
    copy.combat = resolved.combat;
    if (resolved.finished) {
      copy.phase = 'result';
      copy.result = { winnerId: resolved.winnerIndex === null ? null : copy.players[resolved.winnerIndex].id, reason: 'combat', rounds: copy.combat.round };
    }
  }
  return copy;
}

export function continueCombat(state) {
  requireGame(state.phase === 'combat' && state.combat.handoff && state.combat.selectionIndex === 0, 'No hay relevo pendiente.');
  const copy = next(state);
  copy.combat.handoff = false;
  copy.combat.selectionIndex = 1;
  return copy;
}

export function rematch(state) {
  requireGame(state.phase === 'result', 'Termina el duelo para volver a empezar.');
  return createGame(state.players.map(player => player.name), state.mode, (state.seed + 1) >>> 0);
}

export function validateGameState(state) {
  requireGame(state && state.schemaVersion === SCHEMA_VERSION && state.contentVersion === CONTENT_VERSION, 'Esta partida guardada pertenece a otra versión. Inicia una nueva partida.', 'INCOMPATIBLE_SAVE');
  requireGame(['preparation', 'combat', 'result'].includes(state.phase) && state.room?.capacity === 2 && state.room?.transport === 'local' && Array.isArray(state.players) && state.players.length === 2, 'La partida guardada está dañada.', 'INVALID_SAVE');
  requireGame(state.players[0].id === 'p1' && state.players[1].id === 'p2' && state.players.every(p => typeof p.name === 'string' && p.name.length >= 2 && p.name.length <= 18 && typeof p.ready === 'boolean' && validateBuild(p.build)), 'La partida guardada contiene personajes inválidos.', 'INVALID_SAVE');
  requireGame(Number.isInteger(state.revision) && Number.isInteger(state.seed) && state.seed >= 0 && ['selection', 'chance'].includes(state.mode), 'La partida guardada contiene datos inválidos.', 'INVALID_SAVE');
  if(state.preparation?.steps) {
    requireGame(Array.isArray(state.preparation.steps)&&state.preparation.steps.length===2&&state.preparation.steps.every(n=>Number.isInteger(n)&&n>=0&&n<=8)&&Array.isArray(state.preparation.selected)&&state.preparation.selected.length===2&&state.preparation.selected.every(x=>typeof x==='boolean')&&Array.isArray(state.preparation.offers)&&state.preparation.offers.length===2&&state.preparation.offers.every(x=>x===null||(Array.isArray(x)&&x.length<=3&&x.every(id=>typeof id==='string')))&&Array.isArray(state.preparation.completed)&&state.preparation.completed.length===2&&state.preparation.completed.every(x=>Array.isArray(x)&&x.length<=8), 'Las fases guardadas son inválidas.', 'INVALID_SAVE');
  }
  if (state.phase === 'preparation') {
    requireGame(state.combat === null && state.result === null && [0, 1].includes(state.preparation?.index) && Array.isArray(state.preparation.rollsRemaining) && state.preparation.rollsRemaining.length === 2 && state.preparation.rollsRemaining.every(n => Number.isInteger(n) && n >= 0 && n <= RULES.maxRerolls) && Array.isArray(state.preparation.hasRolled) && state.preparation.hasRolled.length === 2 && state.preparation.hasRolled.every(value => typeof value === 'boolean') && typeof state.preparation.handoff === 'boolean' && !state.players[1].ready && (state.preparation.index === 0 || state.players[0].ready), 'La preparación guardada es inválida.', 'INVALID_SAVE');
  } else {
    const c = state.combat;
    requireGame(state.players.every(p => p.ready) && c && Number.isInteger(c.round) && c.round >= 1 && c.round <= RULES.maxRounds && [0, 1].includes(c.selectionIndex) && Array.isArray(c.pending) && c.pending.length === 2 && Array.isArray(c.fighters) && c.fighters.length === 2 && Array.isArray(c.history) && (state.phase !== 'combat' || state.result === null), 'El combate guardado es inválido.', 'INVALID_SAVE');
    for (let i = 0; i < 2; i++) {
      const f = c.fighters[i];
      const stats = maxStats(state.players,c,i);
      requireGame(f.playerId === state.players[i].id && Number.isFinite(f.hp) && f.hp >= 0 && f.hp <= (f.tactic?.eggUntil?Math.max(18,stats.hp):stats.hp) && Number.isFinite(f.energy) && f.energy >= 0 && f.energy <= stats.energy && Array.isArray(f.statuses) && f.statuses.every(s => get('statuses', s.id) && Number.isInteger(s.duration) && s.duration > 0), 'El estado del combatiente es inválido.', 'INVALID_SAVE');
      requireGame(Number.isFinite(f.shield??0)&&(f.shield??0)>=0&&(f.shield??0)<=stats.hp&&Object.entries(f.cooldowns??{}).every(([id,n])=>get('abilities',id)&&Number.isInteger(n)&&n>=0)&&Object.entries(f.uses??{}).every(([id,n])=>(get('abilities',id)||['mask','lastWord','phoenix','ironResurrection','testament'].includes(id))&&n===1),'Los recursos guardados son inválidos.','INVALID_SAVE');
      if (c.pending[i]) requireGame(typeof c.pending[i].abilityId === 'string' && get('abilities', c.pending[i].abilityId), 'Una acción guardada es inválida.', 'INVALID_SAVE');
    }
    if (state.phase === 'result') requireGame(state.result && (state.result.winnerId === null || state.players.some(p => p.id === state.result.winnerId)), 'El resultado guardado es inválido.', 'INVALID_SAVE');
  }
  return true;
}
