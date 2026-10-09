// Approved common talents. Numbers are initial beta balance; rules remain data.
const talent = (id, name, category, description, rules = [], extra = {}) => ({
  id, name, category, description, rarity: 'common', availability: 'duel', stats: {}, rules, ...extra
});
export const talents = [
  talent('counterattacker', 'Contraatacante', 'defense', 'Al recibir un ataque en Guardia, tu siguiente ataque causa un 25% más de daño. No se acumula.', [
    { trigger: 'guardedHit', effects: [{ type: 'charge', key: 'counter' }] },
    { trigger: 'attack', conditions: { charge: 'counter' }, modifiers: { damageBonus: 0.25 }, consume: 'counter' }
  ]),
  talent('armor_breaker', 'Rompearmaduras', 'offense', 'Los ataques potentes ignoran el 35% de la defensa del rival.', [
    { trigger: 'attack', conditions: { tag: 'powerful' }, modifiers: { defenseIgnore: 0.35 } }
  ]),
  talent('calculated_step', 'Paso calculado', 'strategy', 'Una Evasión exitosa da +15 puntos de precisión a tu siguiente ataque. No se acumula.', [
    { trigger: 'evaded', effects: [{ type: 'charge', key: 'calculated' }] },
    { trigger: 'attack', conditions: { charge: 'calculated' }, modifiers: { accuracyBonus: 0.15 }, consume: 'calculated' }
  ]),
  talent('hidden_reserve', 'Reserva oculta', 'resource', 'Una vez por combate, recupera 4 de energía al bajar del 50% de vida.', [
    { trigger: 'healthChanged', conditions: { hpBelow: 0.5 }, once: true, effects: [{ type: 'energy', amount: 4 }] }
  ]),
  talent('predator', 'Depredador', 'offense', 'Tus ataques causan un 25% más de daño a enemigos con un 30% de vida o menos.', [
    { trigger: 'attack', conditions: { enemyHpAtMost: 0.3 }, modifiers: { damageBonus: 0.25 } }
  ]),
  talent('last_effort', 'Último esfuerzo', 'resource', 'Con un 30% de vida o menos, todas las acciones que consumen energía cuestan 1 menos, con mínimo 0. Todo o nada devuelve la diferencia después de invertir toda la energía.', [
    { trigger: 'cost', conditions: { hpAtMost: 0.3 }, modifiers: { costDelta: -1 } }
  ]),
  talent('adaptation', 'Adaptación', 'defense', 'Recibir daño físico o mágico da +3 defensa contra ese tipo hasta el final de la próxima ronda. No se acumula.', [
    { trigger: 'damaged', effects: [{ type: 'adaptation', amount: 3, duration: 1 }] }
  ]),
  talent('combat_rhythm', 'Ritmo de combate', 'strategy', 'La secuencia ataque → Guardia o Evasión → ataque potencia ese último ataque un 20%.', [
    { trigger: 'attack', conditions: { previousCategory: 'defense', priorCategory: 'attack' }, modifiers: { damageBonus: 0.2 } }
  ]),
  talent('rhythm_breaker', 'Ruptura de ritmo', 'strategy', 'Tus ataques causan un 20% más de daño si el rival repite su acción de la ronda anterior.', [
    { trigger: 'attack', conditions: { enemyRepeated: true }, modifiers: { damageBonus: 0.2 } }
  ]),
  talent('double_edge', 'Doble filo', 'offense', 'Los ataques potentes causan un 30% más de daño y cuestan 5 de vida adicional. Debes conservar al menos 1 de vida.', [
    { trigger: 'attack', conditions: { tag: 'powerful' }, modifiers: { damageBonus: 0.3 } },
    { trigger: 'cost', conditions: { tag: 'powerful' }, modifiers: { healthCost: 5 } }
  ]),
  talent('discipline', 'Disciplina', 'resource', 'Guardia recupera 2 de energía adicional si tu acción anterior no fue Guardia.', [
    { trigger: 'acted', conditions: { kind: 'guard', previousActionNot: 'guard' }, effects: [{ type: 'recovery', amount: 2 }] }
  ]),
  talent('versatility', 'Versatilidad', 'strategy', 'Alternar ataques físicos y mágicos potencia el segundo un 20%. Requiere acceso a ambos tipos de daño.', [
    { trigger: 'attack', conditions: { differentDamageType: true, mixedDamage: true }, modifiers: { damageBonus: 0.2 } }
  ]),
  talent('fierce_initiative', 'Iniciativa feroz', 'resource', 'El primer ataque de cada combate cuesta 1 de energía menos, con mínimo 0.', [
    { trigger: 'cost', conditions: { kind: 'attack', firstAttack: true }, modifiers: { costDelta: -1 } }
  ]),
  talent('steady_pulse', 'Pulso firme', 'strategy', 'Tras fallar un ataque, el siguiente gana +15 puntos de precisión. No se acumula.', [
    { trigger: 'missed', effects: [{ type: 'charge', key: 'steady' }] },
    { trigger: 'attack', conditions: { charge: 'steady' }, modifiers: { accuracyBonus: 0.15 }, consume: 'steady' }
  ]),
  talent('read_opponent', 'Lectura del rival', 'strategy', 'Si el rival repite su acción anterior, tu ataque gana +15 puntos de precisión.', [
    { trigger: 'attack', conditions: { enemyRepeated: true }, modifiers: { accuracyBonus: 0.15 } }
  ]),
  talent('punish_evasion', 'Castigo al evasivo', 'offense', 'Si conectas un ataque contra un rival en Evasión, causas un 25% más de daño.', [
    { trigger: 'attack', conditions: { enemyKind: 'evade' }, modifiers: { damageBonus: 0.25 } }
  ]),
  talent('reactive_guard', 'Guardia reactiva', 'resource', 'Recibir un ataque potente en Guardia recupera 2 de energía adicional esa ronda.', [
    { trigger: 'guardedHit', conditions: { enemyTag: 'powerful' }, effects: [{ type: 'recovery', amount: 2 }] }
  ]),
  talent('inner_fortitude', 'Fortaleza interior', 'defense', 'Guardia reduce un 50% el daño de venenos y quemaduras de esa ronda, después de la resistencia.', [
    { trigger: 'statusTick', conditions: { kind: 'guard', statusTag: 'damageOverTime' }, modifiers: { tickMultiplier: -0.5 } }
  ]),
  talent('second_wind', 'Segundo aire', 'resource', 'Una vez por combate, al quedarte sin energía recuperas 3 de energía.', [
    { trigger: 'energyChanged', conditions: { emptyEnergy: true }, once: true, effects: [{ type: 'energy', amount: 3 }] }
  ]),
  talent('movement_economy', 'Economía de movimiento', 'resource', 'La primera Evasión de cada combate no consume energía.', [
    { trigger: 'cost', conditions: { kind: 'evade', firstEvade: true }, modifiers: { freeCost: 1 } }
  ]),
  talent('constant_pressure', 'Presión constante', 'offense', 'Acertar un ataque rápido reduce en 1 la energía que el rival recupera al terminar esa ronda, con mínimo 0.', [
    { trigger: 'hit', conditions: { tag: 'quick' }, effects: [{ type: 'recoveryPenalty', target: 'enemy', amount: 1 }] }
  ]),
  talent('patient_preparation', 'Preparación paciente', 'strategy', 'Completar una ronda sin atacar potencia tu siguiente ataque un 25%. No se acumula.', [
    { trigger: 'roundEnd', conditions: { notAttacking: true }, effects: [{ type: 'charge', key: 'patient' }] },
    { trigger: 'attack', conditions: { charge: 'patient' }, modifiers: { damageBonus: 0.25 }, consume: 'patient' }
  ]),
  talent('physical_affinity', 'Afinidad física', 'resource', 'Los ataques físicos cuestan 1 de energía menos y los mágicos 1 más, con mínimo 0.', [
    { trigger: 'cost', conditions: { damageType: 'physical' }, modifiers: { costDelta: -1 } },
    { trigger: 'cost', conditions: { damageType: 'magical' }, modifiers: { costDelta: 1 } }
  ]),
  talent('arcane_affinity', 'Afinidad arcana', 'resource', 'Los ataques mágicos cuestan 1 de energía menos y los físicos 1 más, con mínimo 0.', [
    { trigger: 'cost', conditions: { damageType: 'magical' }, modifiers: { costDelta: -1 } },
    { trigger: 'cost', conditions: { damageType: 'physical' }, modifiers: { costDelta: 1 } }
  ]),
  talent('blood_for_power', 'Sangre por poder', 'resource', 'Desbloquea una maniobra que sacrifica 8 de vida para recuperar 4 de energía. Debes conservar al menos 1 de vida.', [], { abilities: ['blood_power'] }),
  talent('vengeful_wound', 'Herida vengativa', 'offense', 'Recibir un golpe crítico potencia tu siguiente ataque un 25%. No se acumula.', [
    { trigger: 'damaged', conditions: { critical: true }, effects: [{ type: 'charge', key: 'revenge' }] },
    { trigger: 'attack', conditions: { charge: 'revenge' }, modifiers: { damageBonus: 0.25 }, consume: 'revenge' }
  ]),
  talent('growing_resistance', 'Resistencia creciente', 'defense', 'Cada reaplicación de un mismo estado negativo reduce su nueva duración en 1 ronda adicional, con mínimo 1 ronda.', [
    { trigger: 'statusApplied', conditions: { negativeStatus: true }, modifiers: { durationReduction: 1 }, scale: 'applications' }
  ]),
  talent('victorious_impulse', 'Impulso victorioso', 'adventure', 'Derrotar un monstruo permite recuperar vida o energía. Sin efecto en duelos: requiere el futuro modo con monstruos.', [], { availability: 'adventure' }),
  talent('scavenger', 'Carroñero', 'adventure', 'Tras vencer a un monstruo, cambia una de tres opciones de botín por otra al azar, una vez por recompensa. Sin efecto en duelos.', [], { availability: 'adventure' }),
  talent('all_or_nothing', 'Todo o nada', 'offense', 'Desbloquea un ataque que invierte toda tu energía restante y causa un 8% más de daño por cada punto gastado. Los descuentos se devuelven; el daño usa el gasto neto. Requiere al menos 1 de energía.', [], { abilities: ['all_in'] })
];
