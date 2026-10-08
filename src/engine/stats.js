import { get } from '../content/registry.js';
import { RULES } from './config.js';
import { validateBuild } from './build.js';

export function calculateStats(build, statuses = []) {
  validateBuild(build);
  const sources = [
    get('races', build.raceId), get('classes', build.classId), get('gifts', build.giftId),
    ...build.talentIds.map(id => get('talents', id)),
    ...RULES.slots.map(slot => get('items', build.equipment[slot])),
    ...statuses.map(status => get('statuses', status.id))
  ];
  const stats = { ...RULES.baseStats };
  for (const source of sources) for (const [stat, value] of Object.entries(source?.stats ?? {})) stats[stat] += value;
  for (const stat of RULES.statKeys) stats[stat] = Math.max(stat === 'hp' || stat === 'energy' ? 1 : 0, stats[stat]);
  return stats;
}

export function passiveEffects(build, trigger) {
  const sources = [get('gifts', build.giftId), ...build.talentIds.map(id => get('talents', id)), ...RULES.slots.map(slot => get('items', build.equipment[slot]))];
  return sources.flatMap(source => (source?.passives ?? []).filter(passive => passive.trigger === trigger));
}
