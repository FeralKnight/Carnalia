// Effects are processed by the generic resolver; content carries no executable code.
export const abilities = [
  { id: 'strike', name: 'Ataque', description: 'Un golpe directo.', cost: 0, target: 'enemy', kind: 'attack', power: 2, effects: [] },
  { id: 'guard', name: 'Guardia', description: 'Reduce a la mitad el daño recibido esta ronda.', cost: 0, target: 'self', kind: 'guard', effects: [{ type: 'energy', amount: 1 }] },
  { id: 'heavy_strike', name: 'Quebranto', description: 'Un ataque fuerte que consume energía.', cost: 3, target: 'enemy', kind: 'attack', power: 8, effects: [] },
  { id: 'fortify', name: 'Bastión', description: 'Refuerza la defensa durante dos rondas.', cost: 3, target: 'self', kind: 'support', effects: [{ type: 'status', statusId: 'ward', duration: 2 }] },
  { id: 'ember_bolt', name: 'Rayo ígneo', description: 'Ataque mágico que aplica quemadura.', cost: 4, target: 'enemy', kind: 'attack', power: 5, effects: [{ type: 'status', statusId: 'burn', duration: 2 }] },
  { id: 'mend', name: 'Restaurar', description: 'Recupera 14 de vida.', cost: 4, target: 'self', kind: 'support', effects: [{ type: 'heal', amount: 14 }] },
  { id: 'cinder_mark', name: 'Marca ardiente', description: 'Ataque y quemadura persistente.', cost: 3, target: 'enemy', kind: 'attack', power: 3, effects: [{ type: 'status', statusId: 'burn', duration: 2 }] },
  { id: 'echo_bind', name: 'Atadura de eco', description: 'Ataque que reduce la velocidad.', cost: 3, target: 'enemy', kind: 'attack', power: 3, effects: [{ type: 'status', statusId: 'slow', duration: 2 }] }
];
