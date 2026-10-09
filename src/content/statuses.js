export const statuses = [
  { id: 'burn', name: 'Quemadura', description: 'Hasta 3 de daño al terminar la ronda, mitigado por resistencia.', stats: {}, tick: { type: 'damage', amount: 3 } },
  { id: 'poison', name: 'Veneno', description: 'Hasta 4 de daño al final de cada ronda, reducido por resistencia. Los ataques de arma de la daga renuevan sus 3 rondas sin acumular daño.', stats: {}, tick: { type: 'damage', amount: 4 } },
  { id: 'slow', name: 'Lentitud', description: '-2 velocidad temporal.', stats: { speed: -2 } },
  { id: 'ward', name: 'Bastión', description: '+4 defensa temporal.', stats: { defense: 4 } }
];

statuses.push(
 {id:'bleed',name:'Sangrado',description:'5 daño periódico, mitigado por resistencia.',negative:true,stats:{},tick:{type:'damage',amount:5}},
 {id:'haste',name:'Celeridad',description:'+3 velocidad.',stats:{speed:3}},
 {id:'rage',name:'Furia',description:'+4 daño y -2 defensa.',stats:{damage:4,defense:-2}},
 {id:'regen',name:'Regeneración',description:'Recupera 5 vida por ronda.',stats:{},tick:{type:'heal',amount:5}},
 {id:'weakness',name:'Debilidad',description:'-3 daño.',negative:true,stats:{damage:-3}},
 {id:'vulnerable',name:'Vulnerabilidad',description:'-3 defensa.',negative:true,stats:{defense:-3}},
 {id:'silence',name:'Silencio',description:'Bloquea habilidades mágicas.',negative:true,stats:{}},
 {id:'stun',name:'Aturdimiento',description:'Pierde su próxima acción si persiste al inicio de ronda.',negative:true,stats:{}}
);
for(const s of statuses) if(['burn','poison','slow'].includes(s.id)) s.negative=true;

for(const s of statuses)if(s.tick?.type==='damage')s.tags=['damageOverTime'];
