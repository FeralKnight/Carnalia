import { get } from '../content/registry.js';
import { RULES } from './config.js';
import { availableAbilities } from './build.js';
import { calculateStats, passiveEffects } from './stats.js';
import { requireGame } from './errors.js';

export function beginCombat(players) {
  requireGame(players.length === 2 && players.every(player => player.ready), 'Faltan jugadores preparados.');
  return {
    round: 1, selectionIndex: 0, handoff: false, pending: [null, null],
    fighters: players.map(player => {
      const stats = calculateStats(player.build);
      return { playerId: player.id, hp: stats.hp, energy: stats.energy, statuses: [] };
    }),
    lastEvents: [], history: []
  };
}

export function validateAction(players, combat, index, abilityId) {
  requireGame(index === 0 || index === 1, 'Jugador inválido.');
  requireGame(!combat.pending[index], 'Esta acción ya está confirmada.');
  requireGame(combat.fighters[index].hp > 0, 'El personaje ya ha caído.');
  requireGame(availableAbilities(players[index].build).includes(abilityId), 'Esa habilidad no pertenece a tu build.');
  const ability = get('abilities', abilityId);
  requireGame(combat.fighters[index].energy >= ability.cost, 'No tienes energía suficiente.');
  return ability;
}

function addStatus(fighter, statusId, duration) {
  const existing = fighter.statuses.find(status => status.id === statusId);
  if (existing) existing.duration = Math.max(existing.duration, duration);
  else fighter.statuses.push({ id: statusId, duration });
}

function applyEffect(effect, target, max, events, targetName) {
  switch (effect.type) {
    case 'status':
      addStatus(target, effect.statusId, effect.duration);
      events.push(`${targetName} recibe ${get('statuses', effect.statusId).name.toLowerCase()}.`);
      break;
    case 'heal': {
      const gain = Math.min(effect.amount, max.hp - target.hp);
      target.hp += gain;
      if (gain) events.push(`${targetName} recupera ${gain} de vida.`);
      break;
    }
    case 'energy': target.energy = Math.min(max.energy, target.energy + effect.amount); break;
    case 'damage': target.hp = Math.max(0, target.hp - Math.max(0, effect.amount - max.resistance)); break;
    default: throw new Error('Efecto no validado.');
  }
}

export function resolveRound(players, current) {
  requireGame(current.pending.length === 2 && current.pending.every(Boolean), 'Ambos jugadores deben confirmar su acción.');
  // Never mutate the state supplied by the UI or the saved history.
  const combat = structuredClone(current);
  const events = [`RONDA ${combat.round}`];
  const guarded = combat.pending.map(action => action.abilityId === 'guard');
  const speeds = combat.fighters.map((fighter, index) => calculateStats(players[index].build, fighter.statuses).speed);
  const order = speeds[0] === speeds[1] ? (combat.round % 2 ? [0, 1] : [1, 0]) : (speeds[0] > speeds[1] ? [0, 1] : [1, 0]);
  for (const index of order) {
    const actor = combat.fighters[index];
    if (actor.hp <= 0) continue;
    const enemyIndex = 1 - index;
    const defender = combat.fighters[enemyIndex];
    const ability = validateAction(players, { ...combat, pending: [null, null] }, index, combat.pending[index].abilityId);
    actor.energy -= ability.cost;
    events.push(`${players[index].name} usa ${ability.name}.`);
    if (ability.kind === 'attack') {
      const attack = calculateStats(players[index].build, actor.statuses).damage + ability.power;
      const defense = calculateStats(players[enemyIndex].build, defender.statuses).defense;
      const raw = Math.max(1, Math.floor(attack - defense * RULES.defenseFactor));
      const dealt = Math.max(1, Math.floor(raw * (guarded[enemyIndex] ? RULES.guardMultiplier : 1)));
      defender.hp = Math.max(0, defender.hp - dealt);
      events.push(`${players[enemyIndex].name} pierde ${dealt} de vida${guarded[enemyIndex] ? ' (guardia)' : ''}.`);
      if (defender.hp === 0) break;
    }
    const targetIndex = ability.target === 'self' ? index : enemyIndex;
    const target = combat.fighters[targetIndex];
    const max = calculateStats(players[targetIndex].build);
    for (const effect of ability.effects) applyEffect(effect, target, max, events, players[targetIndex].name);
  }
  // Statuses tick once per completed round. A newly applied status counts this round.
  for (let index = 0; index < 2; index++) {
    const fighter = combat.fighters[index];
    if (fighter.hp <= 0) continue;
    const max = calculateStats(players[index].build);
    for (const status of fighter.statuses) {
      const tick = get('statuses', status.id).tick;
      if (tick) {
        const before = fighter.hp;
        applyEffect(tick, fighter, max, events, players[index].name);
        if (tick.type === 'damage') {
          const damage = before - fighter.hp;
          events.push(damage
            ? `${players[index].name} sufre ${damage} por ${get('statuses', status.id).name.toLowerCase()}.`
            : `${players[index].name} resiste ${get('statuses', status.id).name.toLowerCase()}.`);
        }
      }
      status.duration--;
    }
    fighter.statuses = fighter.statuses.filter(status => status.duration > 0);
    if (fighter.hp === 0) continue;
    for (const passive of passiveEffects(players[index].build, 'roundEnd')) applyEffect(passive, fighter, max, events, players[index].name);
    fighter.energy = Math.min(max.energy, fighter.energy + RULES.energyPerRound);
  }
  const alive = combat.fighters.map(fighter => fighter.hp > 0);
  let winnerIndex = null;
  let finished = !alive[0] || !alive[1] || combat.round >= RULES.maxRounds;
  if (finished) {
    if (alive[0] !== alive[1]) winnerIndex = alive[0] ? 0 : 1;
    else if (alive[0] && alive[1]) {
      const ratios = combat.fighters.map((fighter, i) => fighter.hp / calculateStats(players[i].build).hp);
      if (ratios[0] !== ratios[1]) winnerIndex = ratios[0] > ratios[1] ? 0 : 1;
    }
    events.push(winnerIndex === null ? 'El duelo termina en empate.' : `${players[winnerIndex].name} gana el duelo.`);
  }
  combat.history.push({ round: combat.round, actions: current.pending.map(action => action.abilityId), events: [...events], fighters: structuredClone(combat.fighters) });
  combat.lastEvents = events;
  combat.pending = [null, null];
  combat.selectionIndex = 0;
  combat.handoff = false;
  if (!finished) combat.round++;
  return { combat, finished, winnerIndex };
}
