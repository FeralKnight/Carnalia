import { content, get } from '../content/registry.js';
import { TALENT_TIERS } from '../content/talents.js';
import { TALENT_TRIGGERS, TALENT_MODIFIERS, TALENT_CONDITIONS, TALENT_EFFECTS } from './talents.js';
import { RULES } from './config.js';
import { assetManifest } from '../assets/manifest.js';

export function validateContent() {
  const errors = [];
  const fail = (path, why) => errors.push(`${path}: ${why}`);
  const allowedEffects = ['status', 'heal', 'energy', 'damage', 'shield', 'cleanse'];
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
      if (kind === 'items' && !Object.hasOwn(assetManifest, entry.sprite)) fail(path, 'sprite inexistente');
      if ((kind === 'classes' || kind === 'gifts') && (!Array.isArray(entry.abilities) || !entry.abilities.length)) fail(path, 'faltan habilidades');
      if (kind === 'abilities' && (!Number.isInteger(entry.cost) || entry.cost < 0 || !['self', 'enemy'].includes(entry.target) || !['attack', 'guard', 'evade', 'support'].includes(entry.kind) || (entry.kind === 'attack' && !Number.isFinite(entry.power)))) fail(path, 'resolución o coste inválidos');
      if (kind === 'abilities' && entry.kind === 'guard' && entry.target !== 'self') fail(path, 'guardia debe apuntar a sí mismo');
      if (kind === 'abilities' && !Array.isArray(entry.effects)) fail(path, 'faltan efectos');
      if (entry.tags !== undefined && (!Array.isArray(entry.tags) || entry.tags.some(tag => typeof tag !== 'string' || !tag.trim()) || new Set(entry.tags).size !== entry.tags.length)) fail(path, 'etiquetas inválidas');
      if (entry.requirements?.classId && !get('classes', entry.requirements.classId)) fail(path, 'clase requerida inexistente');
      if (entry.requirements?.raceId && !get('races', entry.requirements.raceId)) fail(path, 'raza requerida inexistente');
      for (const passive of entry.passives ?? []) {
        if (!['roundEnd', 'onHit'].includes(passive.trigger)) fail(path, 'disparador de pasiva inválido');
        if (passive.abilityTag !== undefined && (passive.trigger !== 'onHit' || typeof passive.abilityTag !== 'string' || !passive.abilityTag.trim() || !content.abilities.some(ability => ability.tags?.includes(passive.abilityTag)))) fail(path, 'etiqueta de pasiva inválida');
      }
      for (const effect of [...(entry.effects ?? []), ...(entry.passives ?? []), ...(entry.tick ? [entry.tick] : [])]) {
        if (!allowedEffects.includes(effect.type) || (effect.type === 'status' && (!get('statuses', effect.statusId) || !Number.isInteger(effect.duration) || effect.duration <= 0)) || (!['status', 'cleanse'].includes(effect.type) && (!Number.isFinite(effect.amount) || effect.amount < 0))) fail(path, 'efecto inválido');
      }
      if(kind==='talents'){if(!TALENT_TIERS.includes(entry.tier))fail(path,'rareza de talento inválida');for(const r of entry.rules??[]){if(!TALENT_TRIGGERS.includes(r.trigger))fail(path,'disparador de talento inválido');for(const key of Object.keys(r.conditions??{}))if(!TALENT_CONDITIONS.includes(key))fail(path,'condición de talento inválida');for(const [key,v]of Object.entries(r.modifiers??{}))if(!TALENT_MODIFIERS.includes(key)||!Number.isFinite(v))fail(path,'modificador de talento inválido');for(const e of r.effects??[])if(!TALENT_EFFECTS.includes(e.type))fail(path,'efecto de talento inválido');}}
      if (entry.abilities) for (const id of entry.abilities) if (!get('abilities', id)) fail(path, `habilidad inexistente: ${id}`);
    }
  }
  return errors;
}
