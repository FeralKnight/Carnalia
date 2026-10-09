import { get, options } from '../content/registry.js';
import { RULES } from './config.js';
import { requireGame } from './errors.js';
import { pick } from './rng.js';

export const DEFAULT_APPEARANCE = Object.freeze({ skin: 'warm', hair: 'dark', style: 'short', cape: 'none' });
export function createBuild() {
  return {
    raceId: 'human', classId: 'vanguard', talentIds: [], giftId: 'cinder_gift',
    equipment: { weapon: 'rust_sword', armor: 'leather_armor', accessory: null, relic: null },
    appearance: { ...DEFAULT_APPEARANCE }
  };
}

export function validateBuild(build) {
  requireGame(build && typeof build === 'object', 'La configuración del personaje es inválida.');
  requireGame(get('races', build.raceId), 'Selecciona una raza válida.');
  requireGame(get('classes', build.classId), 'Selecciona una clase válida.');
  requireGame(get('gifts', build.giftId), 'Selecciona un don válido.');
  requireGame(Array.isArray(build.talentIds) && build.talentIds.length <= RULES.maxTalents && new Set(build.talentIds).size === build.talentIds.length, 'Puedes elegir hasta dos talentos diferentes.');
  for (const id of build.talentIds) requireGame(get('talents', id), 'La build contiene un talento desconocido.');
  requireGame(build.equipment && typeof build.equipment === 'object' && Object.keys(build.equipment).every(slot => RULES.slots.includes(slot)), 'La distribución del equipo es inválida.');
  for (const slot of RULES.slots) {
    const id = build.equipment[slot];
    requireGame(id === null || (get('items', id)?.slot === slot), `El objeto del espacio ${slot} no es válido.`);
    const requirements = get('items', id)?.requirements;
    if (requirements?.classId) requireGame(requirements.classId === build.classId, 'Tu clase no puede equipar ese objeto.');
    if (requirements?.raceId) requireGame(requirements.raceId === build.raceId, 'Tu raza no puede equipar ese objeto.');
  }
  if(build.talentConfig){const c=build.talentConfig;requireGame(typeof c==='object'&&!Array.isArray(c)&&Object.keys(c).every(k=>['oath','secondaryWeapon','secondClass'].includes(k)),'Configuración de talentos inválida.');if(c.oath)requireGame(['strike','guard','evade','potion','ether'].includes(c.oath),'Juramento inválido.');if(c.secondaryWeapon)requireGame(get('items',c.secondaryWeapon)?.slot==='weapon','Arma secundaria inválida.');if(c.secondClass)requireGame(get('classes',c.secondClass),'Segunda clase inválida.');}
  const look = build.appearance;
  requireGame(look && ['warm', 'light', 'deep'].includes(look.skin) && ['dark', 'silver', 'flame'].includes(look.hair) && ['short', 'long'].includes(look.style) && ['none', 'red', 'blue'].includes(look.cape), 'La apariencia no es válida.');
  return true;
}

export function changeBuild(build, change) {
  const next = structuredClone(build);
  switch (change.type) {
    case 'race': next.raceId = change.id; break;
    case 'class': next.classId = change.id; break;
    case 'gift': next.giftId = change.id; break;
    case 'talent': {
      const selected = new Set(next.talentIds);
      if (selected.has(change.id)) selected.delete(change.id);
      else {
        requireGame(selected.size < RULES.maxTalents, 'Solo puedes llevar dos talentos.');
        selected.add(change.id);
      }
      next.talentIds = [...selected];
      break;
    }
    case 'equip':
      requireGame(RULES.slots.includes(change.slot), 'Ese espacio de equipo no existe.');
      next.equipment[change.slot] = change.id;
      break;
    case 'talent-config': next.talentConfig={...(next.talentConfig??{}),[change.key]:change.id}; break;
    case 'appearance':
      requireGame(Object.hasOwn(DEFAULT_APPEARANCE, change.key), 'Esa opción visual no existe.');
      next.appearance[change.key] = change.value;
      break;
    default: throw new Error('Cambio de build desconocido.');
  }
  validateBuild(next);
  return next;
}

export function rollBuild(build, initialSeed) {
  let seed = initialSeed;
  const choose = entries => { const result = pick(entries, seed); seed = result.seed; return result.value.id; };
  const next = structuredClone(build);
  next.raceId = choose(options('races'));
  next.classId = choose(options('classes'));
  next.giftId = choose(options('gifts'));
  const first = choose(options('talents'));
  next.talentIds = [first, choose(options('talents', t => t.id !== first))];
  for (const slot of RULES.slots) next.equipment[slot] = choose(options('items', item => item.slot === slot));
  validateBuild(next);
  return { build: next, seed };
}

export function availableAbilities(build) {
  validateBuild(build);
  return [...new Set(['strike', 'guard', 'evade', 'potion', 'ether', 'interfere', 'take_cover', ...get('classes', build.classId).abilities, get('classes', build.classId).ultimate, ...get('gifts', build.giftId).abilities, ...build.talentIds.flatMap(id=>get('talents',id).abilities??[]), ...Object.values(build.equipment).flatMap(id => get('items', id)?.abilities ?? [])].filter(Boolean))];
}
