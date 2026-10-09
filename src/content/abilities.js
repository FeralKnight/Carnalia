import { talentAbilities } from './talent-abilities.js';
// Effects are processed by the generic resolver; content carries no executable code.
export const abilities = [
  { id: 'strike', name: 'Ataque', description: 'Un golpe directo.', cost: 0, target: 'enemy', kind: 'attack', tags: ['weapon'], power: 2, effects: [] },
  { id: 'guard', name: 'Guardia', description: 'Reduce a la mitad el daño recibido esta ronda.', cost: 0, target: 'self', kind: 'guard', effects: [{ type: 'energy', amount: 1 }] },
  { id: 'heavy_strike', name: 'Quebranto', description: 'Un ataque fuerte que consume energía.', cost: 3, target: 'enemy', kind: 'attack', tags: ['weapon'], power: 8, effects: [] },
  { id: 'fortify', name: 'Bastión', description: 'Refuerza la defensa durante dos rondas.', cost: 3, target: 'self', kind: 'support', effects: [{ type: 'status', statusId: 'ward', duration: 2 }] },
  { id: 'ember_bolt', name: 'Rayo ígneo', description: 'Ataque mágico que aplica quemadura.', cost: 4, target: 'enemy', kind: 'attack', power: 5, effects: [{ type: 'status', statusId: 'burn', duration: 2 }] },
  { id: 'mend', name: 'Restaurar', description: 'Recupera 14 de vida.', cost: 4, target: 'self', kind: 'support', effects: [{ type: 'heal', amount: 14 }] },
  { id: 'cinder_mark', name: 'Marca ardiente', description: 'Ataque y quemadura persistente.', cost: 3, target: 'enemy', kind: 'attack', power: 3, effects: [{ type: 'status', statusId: 'burn', duration: 2 }] },
  { id: 'echo_bind', name: 'Atadura de eco', description: 'Ataque que reduce la velocidad.', cost: 3, target: 'enemy', kind: 'attack', power: 3, effects: [{ type: 'status', statusId: 'slow', duration: 2 }] }
];

abilities.push(
 {id:'pierce',name:'Estocada',description:'Ignora la mitad de la defensa. Recarga 1 ronda.',cost:3,target:'enemy',kind:'attack',tags:['weapon'],power:5,penetration:0.5,cooldown:1,effects:[]},
 {id:'venom',name:'Inyección tóxica',description:'Veneno durante 3 rondas.',cost:3,target:'enemy',kind:'attack',power:2,effects:[{type:'status',statusId:'poison',duration:3}]},
 {id:'bleeding_cut',name:'Corte hemorrágico',description:'Arma y sangrado durante 3 rondas.',cost:4,target:'enemy',kind:'attack',tags:['weapon'],power:3,effects:[{type:'status',statusId:'bleed',duration:3}]},
 {id:'haste',name:'Paso acelerado',description:'+3 velocidad durante 3 rondas.',cost:2,target:'self',kind:'support',effects:[{type:'status',statusId:'haste',duration:3}]},
 {id:'rage',name:'Desatar furia',description:'+4 daño, -2 defensa durante 3 rondas.',cost:2,target:'self',kind:'support',effects:[{type:'status',statusId:'rage',duration:3}]},
 {id:'regrowth',name:'Reverdecer',description:'Regenera 5 vida durante 3 rondas.',cost:3,target:'self',kind:'support',effects:[{type:'status',statusId:'regen',duration:3}]},
 {id:'cleanse',name:'Purificar',description:'Elimina estados negativos.',cost:3,target:'self',kind:'support',cooldown:1,effects:[{type:'cleanse'}]},
 {id:'focus_energy',name:'Concentración',description:'Recupera 5 energía.',cost:0,target:'self',kind:'support',effects:[{type:'energy',amount:5}]},
 {id:'drain',name:'Drenaje vital',description:'Ataque y recuperación de 6 vida.',cost:4,target:'enemy',kind:'attack',power:4,effects:[{type:'heal',target:'self',amount:6}]},
 {id:'shatter',name:'Romper defensa',description:'Debilita la defensa durante 3 rondas.',cost:3,target:'enemy',kind:'attack',tags:['weapon'],power:3,effects:[{type:'status',statusId:'vulnerable',duration:3}]},
 {id:'hex',name:'Maleficio',description:'Reduce el daño rival durante 3 rondas.',cost:3,target:'enemy',kind:'attack',power:2,effects:[{type:'status',statusId:'weakness',duration:3}]},
 {id:'barrier',name:'Barrera',description:'Escudo de 14 puntos. Recarga 2 rondas.',cost:4,target:'self',kind:'support',cooldown:2,effects:[{type:'shield',amount:14}]},
 {id:'mute',name:'Sello de silencio',description:'Bloquea magia durante la próxima ronda.',cost:4,target:'enemy',kind:'attack',power:1,cooldown:2,effects:[{type:'status',statusId:'silence',duration:2}]},
 {id:'stun_blow',name:'Impacto aturdidor',description:'Aturde al rival la próxima ronda. Recarga 3.',cost:5,target:'enemy',kind:'attack',tags:['weapon'],power:1,cooldown:3,effects:[{type:'status',statusId:'stun',duration:2}]},
 {id:'ultimate_blade',name:'Ultimate · Ruptura',description:'Gran golpe de arma, una vez por duelo, desde ronda 3.',cost:7,target:'enemy',kind:'attack',tags:['weapon'],power:18,ultimate:true,minRound:3,effects:[]},
 {id:'ultimate_arcane',name:'Ultimate · Cataclismo',description:'Explosión y quemadura, una vez, desde ronda 3.',cost:8,target:'enemy',kind:'attack',power:14,ultimate:true,minRound:3,effects:[{type:'status',statusId:'burn',duration:3}]},
 {id:'potion',name:'Objeto · Poción vital',description:'Recupera 20 vida. Una carga por duelo.',cost:0,target:'self',kind:'support',consumable:true,effects:[{type:'heal',amount:20}]},
 {id:'ether',name:'Objeto · Éter',description:'Recupera 7 energía. Una carga por duelo.',cost:0,target:'self',kind:'support',consumable:true,effects:[{type:'energy',amount:7}]}
);
for(const a of abilities) if(a.kind==='attack'&&!a.tags?.includes('weapon')) a.tags=['magic'];

abilities.push(...talentAbilities,
 {id:'evade',name:'Evasión',description:'Reduce en 35 puntos la precisión rival esta ronda.',cost:2,target:'self',kind:'evade',effects:[]},
 {id:'interfere',name:'Interferir',description:'Gasta tu acción para romper una cadena, liberar una mejora o sabotear una construcción rival visible.',cost:2,target:'self',kind:'support',effects:[],choice:'device',operation:'interfere'},
 {id:'take_cover',name:'Ponerse a cubierto',description:'Sacrifica tu acción y evita un aliento anunciado del dragón.',cost:3,target:'self',kind:'guard',effects:[]},
 {id:'blood_power',name:'Sangre por poder',description:'Sacrifica 8 vida y recupera 4 energía. Conserva al menos 1 vida.',cost:0,healthCost:8,target:'self',kind:'support',effects:[{type:'energy',amount:4}]},
 {id:'all_in',name:'Todo o nada',description:'Invierte toda tu energía: +8% daño por punto gastado.',cost:0,energyCost:'all',minEnergy:1,damagePerEnergy:.08,target:'enemy',kind:'attack',power:3,tags:['weapon','powerful'],effects:[]}
);
for(const a of abilities){a.tags??=[];if(a.kind==='attack'){if(!a.tags.includes('weapon')&&!a.tags.includes('magic'))a.tags.push('magic');a.damageType=a.tags.includes('weapon')?'physical':'magical';a.accuracy=a.power>=8?.9:1;}if(['heavy_strike','ultimate_blade','ultimate_arcane'].includes(a.id))a.tags.push('powerful');if(a.id==='strike')a.tags.push('quick');}
