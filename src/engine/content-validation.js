import { content, get } from '../content/registry.js';
import { RULES } from './config.js';

export function validateContent() {
  const errors = [];
  const fail = (path, why) => errors.push(`${path}: ${why}`);
  const allowedEffects = ['status', 'heal', 'energy', 'damage'];
  for (const [kind, entries] of Object.entries(content)) {
    const seen = new Set();
    if (!Array.isArray(entries) || !entries.length) fail(kind, 'catálogo vacío');
    for (const entry of entries) {
      const path = `${kind}/${entry?.id ?? '?'}`;
      if (!entry?.id || typeof entry.id !== 'string' || !entry.name) fail(path, 'faltan ID o nombre');
      if (seen.has(entry.id)) fail(path, 'ID duplicado');
      seen.add(entry.id);
      for (const [key, value] of Object.entries(entry.stats ?? {})) if (!RULES.statKeys.includes(key) || !Number.isFinite(value)) fail(path, `modificador inválido: ${key}`);
      if (kind === 'items' && (!RULES.slots.includes(entry.slot) || typeof entry.sprite !== 'string' || !['common', 'rare', 'epic'].includes(entry.rarity))) fail(path, 'slot, sprite o rareza inválidos');
      if ((kind === 'classes' || kind === 'gifts') && (!Array.isArray(entry.abilities) || !entry.abilities.length)) fail(path, 'faltan habilidades');
      if (kind === 'abilities' && (!Number.isInteger(entry.cost) || entry.cost < 0 || !['self', 'enemy'].includes(entry.target) || !['attack', 'guard', 'support'].includes(entry.kind) || (entry.kind === 'attack' && !Number.isFinite(entry.power)))) fail(path, 'resolución o coste inválidos');
      if (kind === 'abilities' && entry.kind === 'guard' && entry.target !== 'self') fail(path, 'guardia debe apuntar a sí mismo');
      if (kind === 'abilities' && !Array.isArray(entry.effects)) fail(path, 'faltan efectos');
      if (entry.requirements?.classId && !get('classes', entry.requirements.classId)) fail(path, 'clase requerida inexistente');
      if (entry.requirements?.raceId && !get('races', entry.requirements.raceId)) fail(path, 'raza requerida inexistente');
      for (const passive of entry.passives ?? []) if (passive.trigger !== 'roundEnd') fail(path, 'disparador de pasiva inválido');
      for (const effect of [...(entry.effects ?? []), ...(entry.passives ?? []), ...(entry.tick ? [entry.tick] : [])]) {
        if (!allowedEffects.includes(effect.type) || (effect.type === 'status' && (!get('statuses', effect.statusId) || !Number.isInteger(effect.duration) || effect.duration <= 0)) || (effect.type !== 'status' && (!Number.isFinite(effect.amount) || effect.amount < 0))) fail(path, 'efecto inválido');
      }
      if (entry.abilities) for (const id of entry.abilities) if (!get('abilities', id)) fail(path, `habilidad inexistente: ${id}`);
    }
  }
  return errors;
}
