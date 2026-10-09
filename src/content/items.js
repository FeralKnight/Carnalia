export const items = [
  { id: 'rust_sword', name: 'Hoja carmesí', slot: 'weapon', rarity: 'common', description: 'Acero probado en duelos.', stats: { damage: 2 }, sprite: 'sword_red' },
  { id: 'azure_sword', name: 'Filo azur', slot: 'weapon', rarity: 'rare', description: 'Un tajo preciso y veloz.', stats: { damage: 1, speed: 2 }, sprite: 'sword_blue' },
  { id: 'ember_staff', name: 'Báculo de brasas', slot: 'weapon', rarity: 'rare', description: 'Conduce el poder interior.', stats: { damage: 1, energy: 3 }, sprite: 'staff' },
  { id: 'stone_axe', name: 'Hacha de piedra', slot: 'weapon', rarity: 'common', description: 'Impacto pesado.', stats: { damage: 4, speed: -1 }, sprite: 'axe' },
  { id: 'poison_dagger', name: 'Daga envenenada', slot: 'weapon', rarity: 'rare', description: 'Los ataques de arma aplican veneno: hasta 4 de daño al final de cada ronda durante 3 rondas, reducido por resistencia. Reaplicar renueva la duración sin acumular daño.', stats: { damage: 1, speed: 1 }, sprite: 'dagger_poison', passives: [{ trigger: 'onHit', abilityTag: 'weapon', type: 'status', statusId: 'poison', duration: 3 }] },
  { id: 'leather_armor', name: 'Coraza viajera', slot: 'armor', rarity: 'common', description: 'Ligera y flexible.', stats: { defense: 2 }, sprite: 'leather' },
  { id: 'iron_armor', name: 'Arnés de hierro', slot: 'armor', rarity: 'rare', description: 'Protección a costa de velocidad.', stats: { defense: 4, speed: -1 }, sprite: 'iron' },
  { id: 'ember_armor', name: 'Manto de ceniza', slot: 'armor', rarity: 'rare', description: 'Revestimiento arcano.', stats: { defense: 1, resistance: 3 }, sprite: 'ember' },
  { id: 'swift_ring', name: 'Anillo del alba', slot: 'accessory', rarity: 'common', description: 'Una chispa antes del golpe.', stats: { speed: 1 }, sprite: 'ring_gold' },
  { id: 'heart_charm', name: 'Amuleto vital', slot: 'accessory', rarity: 'common', description: 'Fortalece el pulso.', stats: { hp: 6 }, sprite: 'charm_red' },
  { id: 'cinder_relic', name: 'Ascua eterna', slot: 'relic', rarity: 'epic', description: 'El calor persiste tras el golpe.', stats: { damage: 1 }, sprite: 'cinder', passives: [{ trigger: 'roundEnd', type: 'energy', amount: 1 }] },
  { id: 'moon_relic', name: 'Luna tallada', slot: 'relic', rarity: 'epic', description: 'Calma antes de la tormenta.', stats: { resistance: 2, energy: 1 }, sprite: 'moon' }
];

items.push(
 {id:'blood_sword',name:'Hoja dentada',slot:'weapon',rarity:'rare',description:'Los golpes de arma causan sangrado durante 2 rondas.',stats:{damage:2},sprite:'sword_red',passives:[{trigger:'onHit',abilityTag:'weapon',type:'status',statusId:'bleed',duration:2}]},
 {id:'fire_blade',name:'Filo de ascuas',slot:'weapon',rarity:'rare',description:'Los golpes de arma queman durante 2 rondas.',stats:{damage:1,energy:1},sprite:'sword_red',passives:[{trigger:'onHit',abilityTag:'weapon',type:'status',statusId:'burn',duration:2}]},
 {id:'crystal_staff',name:'Báculo cristalino',slot:'weapon',rarity:'rare',description:'Concede Barrera.',stats:{energy:4},sprite:'staff',abilities:['barrier']},
 {id:'duelist_blade',name:'Estoque del duelo',slot:'weapon',rarity:'rare',description:'Concede Estocada.',stats:{speed:2},sprite:'sword_blue',abilities:['pierce']},
 {id:'guardian_plate',name:'Placas del custodio',slot:'armor',rarity:'rare',description:'Gran defensa, menor velocidad.',stats:{defense:6,speed:-2},sprite:'iron'},
 {id:'silk_robe',name:'Túnica del flujo',slot:'armor',rarity:'common',description:'Reserva de energía.',stats:{energy:4,resistance:1},sprite:'ember'},
 {id:'hunter_coat',name:'Chaqueta de acecho',slot:'armor',rarity:'common',description:'Movilidad y defensa.',stats:{speed:2,defense:1},sprite:'leather'},
 {id:'renewal_relic',name:'Semilla inmortal',slot:'relic',rarity:'rare',description:'Recupera 3 vida por ronda.',stats:{},sprite:'moon',passives:[{trigger:'roundEnd',type:'heal',amount:3}]},
 {id:'battery_relic',name:'Núcleo de éter',slot:'relic',rarity:'rare',description:'Recupera 2 energía adicional por ronda.',stats:{},sprite:'cinder',passives:[{trigger:'roundEnd',type:'energy',amount:2}]},
 {id:'purity_relic',name:'Sello puro',slot:'relic',rarity:'rare',description:'Concede Purificar y resistencia.',stats:{resistance:2},sprite:'moon',abilities:['cleanse']}
);
