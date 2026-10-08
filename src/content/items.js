export const items = [
  { id: 'rust_sword', name: 'Hoja carmesí', slot: 'weapon', rarity: 'common', description: 'Acero probado en duelos.', stats: { damage: 2 }, sprite: 'sword_red' },
  { id: 'azure_sword', name: 'Filo azur', slot: 'weapon', rarity: 'rare', description: 'Un tajo preciso y veloz.', stats: { damage: 1, speed: 2 }, sprite: 'sword_blue' },
  { id: 'ember_staff', name: 'Báculo de brasas', slot: 'weapon', rarity: 'rare', description: 'Conduce el poder interior.', stats: { damage: 1, energy: 3 }, sprite: 'staff' },
  { id: 'stone_axe', name: 'Hacha de piedra', slot: 'weapon', rarity: 'common', description: 'Impacto pesado.', stats: { damage: 4, speed: -1 }, sprite: 'axe' },
  { id: 'leather_armor', name: 'Coraza viajera', slot: 'armor', rarity: 'common', description: 'Ligera y flexible.', stats: { defense: 2 }, sprite: 'leather' },
  { id: 'iron_armor', name: 'Arnés de hierro', slot: 'armor', rarity: 'rare', description: 'Protección a costa de velocidad.', stats: { defense: 4, speed: -1 }, sprite: 'iron' },
  { id: 'ember_armor', name: 'Manto de ceniza', slot: 'armor', rarity: 'rare', description: 'Revestimiento arcano.', stats: { defense: 1, resistance: 3 }, sprite: 'ember' },
  { id: 'swift_ring', name: 'Anillo del alba', slot: 'accessory', rarity: 'common', description: 'Una chispa antes del golpe.', stats: { speed: 1 }, sprite: 'ring_gold' },
  { id: 'heart_charm', name: 'Amuleto vital', slot: 'accessory', rarity: 'common', description: 'Fortalece el pulso.', stats: { hp: 6 }, sprite: 'charm_red' },
  { id: 'cinder_relic', name: 'Ascua eterna', slot: 'relic', rarity: 'epic', description: 'El calor persiste tras el golpe.', stats: { damage: 1 }, sprite: 'cinder', passives: [{ trigger: 'roundEnd', type: 'energy', amount: 1 }] },
  { id: 'moon_relic', name: 'Luna tallada', slot: 'relic', rarity: 'epic', description: 'Calma antes de la tormenta.', stats: { resistance: 2, energy: 1 }, sprite: 'moon' }
];
