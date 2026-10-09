import { get } from '../content/registry.js';

// Shared primitives: status renewal, periodic damage, healing, resources,
// shields and dispels. Effects may exist without an item using them.
export function dealDamage(target, amount) {
  const shield = target.shield ?? 0;
  const absorbed = Math.min(shield, Math.max(0, amount));
  if (target.shield !== undefined) target.shield -= absorbed;
  const dealt = Math.min(target.hp, Math.max(0, amount - absorbed));
  target.hp -= dealt;
  return { dealt, absorbed };
}
export function applyEffect(effect, target, max, events, targetName) {
  switch (effect.type) {
    case 'status': {
      if (target.immunities?.includes(effect.statusId)) { events.push(`${targetName} es inmune.`); break; }
      const existing = target.statuses.find(s => s.id === effect.statusId);
      if (existing) existing.duration = Math.max(existing.duration, effect.duration);
      else target.statuses.push({id:effect.statusId,duration:effect.duration});
      events.push(`${targetName} ${existing ? 'renueva' : 'recibe'} ${get('statuses',effect.statusId).name.toLowerCase()}.`);
      break;
    }
    case 'heal': {
      const gain = Math.min(effect.amount, max.hp - target.hp);
      target.hp += gain;
      if (gain) events.push(`${targetName} recupera ${gain} de vida.`);
      break;
    }
    case 'energy': target.energy = Math.min(max.energy,target.energy + effect.amount); break;
    case 'shield': target.shield = Math.min(max.hp,(target.shield ?? 0)+effect.amount); events.push(`${targetName} obtiene ${effect.amount} de escudo.`); break;
    case 'cleanse': target.statuses=target.statuses.filter(s=>!get('statuses',s.id).negative); events.push(`${targetName} elimina sus estados negativos.`); break;
    case 'damage': dealDamage(target,Math.max(0,effect.amount-max.resistance)); break;
    default: throw new Error('Efecto no validado.');
  }
}
