export const statuses = [
  { id: 'burn', name: 'Quemadura', description: 'Hasta 3 de daño al terminar la ronda, mitigado por resistencia.', stats: {}, tick: { type: 'damage', amount: 3 } },
  { id: 'slow', name: 'Lentitud', description: '-2 velocidad temporal.', stats: { speed: -2 } },
  { id: 'ward', name: 'Bastión', description: '+4 defensa temporal.', stats: { defense: 4 } }
];
