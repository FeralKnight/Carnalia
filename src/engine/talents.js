import { get } from '../content/registry.js';
import { calculateStats } from './stats.js';
import { availableAbilities } from './build.js';

export const TALENT_TRIGGERS = ['cost', 'attack', 'guardedHit', 'evaded', 'healthChanged', 'damaged', 'acted', 'missed', 'statusTick', 'energyChanged', 'hit', 'roundEnd', 'statusApplied'];
export const TALENT_MODIFIERS = ['damageBonus', 'defenseIgnore', 'accuracyBonus', 'costMultiplier', 'costDelta', 'healthCost', 'tickMultiplier', 'freeCost', 'durationReduction'];
export const TALENT_CONDITIONS = ['charge', 'hpBelow', 'hpAtMost', 'enemyHpAtMost', 'tag', 'previousCategory', 'priorCategory', 'enemyRepeated', 'kind', 'previousActionNot', 'differentDamageType', 'mixedDamage', 'firstAttack', 'enemyKind', 'enemyTag', 'statusTag', 'emptyEnergy', 'firstEvade', 'notAttacking', 'damageType', 'critical', 'negativeStatus'];
export const TALENT_EFFECTS = ['charge', 'energy', 'adaptation', 'recovery', 'recoveryPenalty'];

export function createTalentState() {
  return { previousAction: null, previousCategory: null, priorCategory: null, previousDamageType: null,
    hasAttacked: false, hasEvaded: false, charges: {}, used: {}, adaptations: {}, statusApplications: {} };
}

export function validTalentState(build, memory, round) {
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  if (!record(memory) || !record(memory.charges) || !record(memory.used) || !record(memory.adaptations) || !record(memory.statusApplications)) return false;
  const selected = build.talentIds.map(id => get('talents', id));
  const charges = new Set(selected.flatMap(t => (t.rules??[]).flatMap(r => (r.effects ?? []).filter(e => e.type === 'charge').map(e => e.key))));
  const onceKeys = new Set(selected.flatMap(t => (t.rules??[]).flatMap((r, i) => r.once ? [`${t.id}:${i}`] : [])));
  return typeof memory.hasAttacked === 'boolean' && typeof memory.hasEvaded === 'boolean'
    && [null, 'attack', 'defense', 'other'].includes(memory.previousCategory) && [null, 'attack', 'defense', 'other'].includes(memory.priorCategory)
    && [null, 'physical', 'magical'].includes(memory.previousDamageType)
    // A remembered move may belong to a previous class or weapon after transformation.
    && (memory.previousAction === null || Boolean(get('abilities', memory.previousAction)))
    && Object.entries(memory.charges).every(([key, value]) => charges.has(key) && value === true)
    && Object.entries(memory.used).every(([key, value]) => onceKeys.has(key) && value === true)
    && Object.entries(memory.adaptations).every(([type, bonus]) => ['physical', 'magical'].includes(type) && record(bonus) && Number.isFinite(bonus.amount) && bonus.amount >= 0 && Number.isInteger(bonus.expiresRound) && bonus.expiresRound >= round)
    && Object.entries(memory.statusApplications).every(([id, amount]) => get('statuses', id) && Number.isInteger(amount) && amount >= 1);
}

function matches(conditions, context) {
  const { actor, enemy, stats, enemyStats, ability, enemyAbility } = context;
  const memory = actor.talents;
  const tests = {
    charge: value => memory.charges[value] === true,
    hpBelow: value => actor.hp / stats.hp < value,
    hpAtMost: value => actor.hp / stats.hp <= value,
    enemyHpAtMost: value => enemy.hp / enemyStats.hp <= value,
    tag: value => ability?.tags?.includes(value),
    kind: value => ability?.kind === value,
    damageType: value => ability?.kind === 'attack' && ability.damageType === value,
    previousCategory: value => memory.previousCategory === value,
    priorCategory: value => memory.priorCategory === value,
    previousActionNot: value => memory.previousAction !== value,
    enemyRepeated: value => (enemyAbility != null && enemy.talents.previousAction === enemyAbility.id) === value,
    differentDamageType: value => (memory.previousDamageType !== null && memory.previousDamageType !== ability?.damageType) === value,
    mixedDamage: value => {
      const types = new Set(availableAbilities(context.build).map(id => get('abilities', id)).filter(a => a.kind === 'attack').map(a => a.damageType));
      return (types.has('physical') && types.has('magical')) === value;
    },
    firstAttack: value => !memory.hasAttacked === value,
    firstEvade: value => !memory.hasEvaded === value,
    enemyKind: value => enemyAbility?.kind === value,
    enemyTag: value => enemyAbility?.tags?.includes(value),
    statusTag: value => context.status?.tags?.includes(value),
    emptyEnergy: value => (actor.energy === 0) === value,
    notAttacking: value => (ability?.kind !== 'attack' && context.acted === true) === value,
    critical: value => context.critical === value,
    negativeStatus: value => context.status?.negative === value
  };
  return Object.entries(conditions ?? {}).every(([key, value]) => tests[key]?.(value) === true);
}

export function matchingRules(trigger, context) {
  return context.build.talentIds.flatMap(id => {
    const talent = get('talents', id);
    return (talent.rules ?? []).flatMap((rule, index) => {
      const key = `${id}:${index}`;
      return rule.trigger === trigger && !(rule.once && context.actor.talents.used[key]) && matches(rule.conditions, context)
        ? [{ talent, rule, key }] : [];
    });
  });
}

export function talentModifiers(trigger, context) {
  const rules = matchingRules(trigger, context);
  const modifiers = Object.fromEntries(TALENT_MODIFIERS.map(key => [key, 0]));
  for (const { rule } of rules) for (const [key, amount] of Object.entries(rule.modifiers ?? {})) {
    modifiers[key] += amount * (rule.scale === 'applications' ? context.applications ?? 0 : 1);
  }
  return { ...modifiers, rules };
}

export function talentContext(players, combat, index, extra = {}) {
  return {
    build: players[index].build, actor: combat.fighters[index], enemy: combat.fighters[1 - index],
    stats: calculateStats(players[index].build), enemyStats: calculateStats(players[1 - index].build),
    ability: get('abilities', combat.pending[index]?.abilityId),
    enemyAbility: get('abilities', combat.pending[1 - index]?.abilityId),
    round: combat.round, ...extra
  };
}

// This profile is shared by validation, the UI and the resolver. No UI cost arithmetic.
export function actionDetails(players, combat, index, abilityId) {
  const ability = get('abilities', abilityId);
  if (!ability) return null;
  const context = talentContext(players, combat, index, { ability, enemyAbility: null });
  const modifiers = talentModifiers('cost', context);
  const base = ability.energyCost === 'all' ? context.actor.energy : ability.cost;
  const adjusted = modifiers.freeCost ? 0 : Math.max(0, Math.ceil(Math.max(0, base + modifiers.costDelta) * Math.max(0, 1 + modifiers.costMultiplier)));
  const cost = ability.energyCost === 'all' ? Math.min(base, adjusted) : adjusted;
  const healthCost = (ability.healthCost ?? 0) + modifiers.healthCost;
  const eligible = availableAbilities(context.build).includes(abilityId);
  const enoughEnergy = context.actor.energy >= cost && context.actor.energy >= (ability.minEnergy ?? 0);
  const enoughLife = context.actor.hp > healthCost;
  return { ability, cost, healthCost, exhaustsEnergy: ability.energyCost === 'all', refund: ability.energyCost === 'all' ? base - cost : 0,
    available: eligible && enoughEnergy && enoughLife,
    reason: !eligible ? 'Esa habilidad no pertenece a tu build.' : !enoughEnergy ? 'No tienes energía suficiente.' : !enoughLife ? 'Necesitas conservar al menos 1 de vida después del sacrificio.' : null };
}

export function activateTalents(trigger, context, events, actorName, enemyName) {
  if (context.actor.hp <= 0) return;
  for (const { talent, rule, key } of matchingRules(trigger, context)) {
    if (!rule.effects?.length) continue;
    let changed = false;
    for (const effect of rule.effects) {
      const target = effect.target === 'enemy' ? context.enemy : context.actor;
      const maximum = effect.target === 'enemy' ? context.enemyStats : context.stats;
      switch (effect.type) {
        case 'charge':
          changed ||= target.talents.charges[effect.key] !== true;
          target.talents.charges[effect.key] = true;
          break;
        case 'energy': {
          const gain = Math.min(effect.amount, maximum.energy - target.energy);
          target.energy += gain;
          if (gain) events.push(`${actorName} activa ${talent.name}: recupera ${gain} de energía.`);
          changed = false; // A precise resource event was already recorded.
          break;
        }
        case 'adaptation':
          if (!['physical', 'magical'].includes(context.damageType)) break;
          target.talents.adaptations[context.damageType] = { amount: effect.amount, expiresRound: context.round + effect.duration };
          events.push(`${actorName} activa ${talent.name}: +${effect.amount} defensa ${context.damageType === 'physical' ? 'física' : 'mágica'}.`);
          break;
        case 'recovery': target.roundRecovery += effect.amount; changed = true; break;
        case 'recoveryPenalty':
          target.recoveryPenalty += effect.amount;
          events.push(`${actorName} activa ${talent.name}: ${enemyName} recuperará ${effect.amount} menos de energía.`);
          break;
        default: throw new Error('Efecto de talento no validado.');
      }
    }
    if (rule.once) context.actor.talents.used[key] = true;
    if (changed) events.push(`${actorName} activa ${talent.name}.`);
  }
}

export function consumeAttackBonuses(modifiers, actor, events, name) {
  for (const { talent, rule } of modifiers.rules) {
    if (rule.consume) delete actor.talents.charges[rule.consume];
    if (rule.modifiers) events.push(`${name} aplica ${talent.name}.`);
  }
}

export function rememberAction(fighter, ability) {
  const memory = fighter.talents;
  memory.priorCategory = memory.previousCategory;
  memory.previousCategory = ability.kind === 'attack' ? 'attack' : ['guard', 'evade'].includes(ability.kind) ? 'defense' : 'other';
  memory.previousAction = ability.id;
  if (ability.kind === 'attack') { memory.hasAttacked = true; memory.previousDamageType = ability.damageType; }
  if (ability.kind === 'evade') memory.hasEvaded = true;
}

export function activeTalentDescriptions(build, fighter, round) {
  const descriptions = [];
  for (const id of build.talentIds) {
    const talent = get('talents', id);
    if ((talent.rules??[]).some(rule => rule.consume && fighter.talents.charges[rule.consume])) descriptions.push(`${talent.name} preparado`);
  }
  for (const [type, bonus] of Object.entries(fighter.talents.adaptations)) {
    if (bonus.expiresRound >= round) descriptions.push(`+${bonus.amount} defensa ${type === 'physical' ? 'física' : 'mágica'}`);
  }
  return descriptions;
}
