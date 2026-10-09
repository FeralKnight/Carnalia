import { CONTENT_VERSION } from './config.js';
import { initializeTactics } from './tactical.js';
import { validateGameState } from './game-state.js';
const KEY = 'carnalia:local:v1';

export function loadGame(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return { state: null, error: null };
    const state = JSON.parse(raw);
    if(state.schemaVersion===2&&state.contentVersion===2){state.contentVersion=CONTENT_VERSION;if(state.combat)initializeTactics(state.players,state.combat);}
    validateGameState(state);
    return { state, error: null };
  } catch {
    return { state: null, error: 'No se pudo recuperar la partida guardada. Puedes empezar una nueva.' };
  }
}
export function saveGame(state, storage = globalThis.localStorage) {
  validateGameState(state);
  storage.setItem(KEY, JSON.stringify(state));
}
export function clearGame(storage = globalThis.localStorage) { storage.removeItem(KEY); }
