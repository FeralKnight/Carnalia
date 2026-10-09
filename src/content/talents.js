import { talents as common } from './talents-common.js';
import { talents as legacy } from './talents-legacy.js';
import { expandedTalents } from './talents-expanded.js';
import { talentAbilities } from './talent-abilities.js';
export const TALENT_TIERS=['Común','Inusual','Raro','Épico','Legendario'];
export const talents=[
 ...common.map(t=>({...t,tier:'Común',mechanic:t.id==='victorious_impulse'?'reward':t.id==='scavenger'?'scavenge':undefined,availability:'duel',sample:t.availability==='adventure',description:t.availability==='adventure'?t.description.replace(/Sin efecto en duelos[^.]*\./,'')+' Prueba: recompensa de un espécimen preparada antes del duelo.':t.description})),
 ...expandedTalents,
 ...legacy.map(t=>({...t,tier:t.tier==='Poco común'?'Inusual':t.tier,rules:[],legacy:true}))
];
for(const t of talents)t.abilities=[...new Set([...(t.abilities??[]),...talentAbilities.filter(a=>a.talent===t.mechanic).map(a=>a.id)])];
