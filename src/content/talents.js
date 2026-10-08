export const talents = [
  { id: 'iron_will', name: 'Voluntad férrea', description: '+7 vida, +1 resistencia.', stats: { hp: 7, resistance: 1 } },
  { id: 'quickstep', name: 'Paso fugaz', description: '+2 velocidad.', stats: { speed: 2 } },
  { id: 'brutality', name: 'Ímpetu', description: '+2 daño, -1 defensa.', stats: { damage: 2, defense: -1 } },
  { id: 'focus', name: 'Foco interior', description: '+3 energía, +1 resistencia.', stats: { energy: 3, resistance: 1 } },
  { id: 'renewal', name: 'Renovación', description: 'Recupera 2 de vida al final de cada ronda.', stats: {}, passives: [{ trigger: 'roundEnd', type: 'heal', amount: 2 }] }
];
