import { get, content } from '../content/registry.js';
import { calculateStats } from './stats.js';
import { availableAbilities } from './build.js';
import { createTalentState } from './talents.js';
import { requireGame } from './errors.js';

export const COMMON_ACTIONS=['strike','guard','evade','potion','ether'];
export const SPECIMENS={golem:{name:'Gólem de prueba',hp:20,ability:'heavy_strike'},basilisk:{name:'Basilisco de prueba',hp:14,ability:'venom'},wisp:{name:'Lumbre de prueba',hp:12,ability:'ember_bolt'}};
export function baseBuild(players,c,i){return c.fighters[i].build??players[i].build;}
export function activeBuild(players,c,i){const b=structuredClone(baseBuild(players,c,i)),f=c.fighters[i];b.talentIds=b.talentIds.filter(id=>!f.tactic?.disabled?.includes(id));if(c.field?.duel===c.round)b.talentIds=[];return b;}
export function has(players,c,i,mechanic){return activeBuild(players,c,i).talentIds.some(id=>get('talents',id).mechanic===mechanic);}
export function maxStats(players,c,i){const s=calculateStats(activeBuild(players,c,i));const t=c.fighters[i].tactic??{};if(t.usurpUntil>=c.round&&has(players,c,i,'usurp')){const own=get('races',baseBuild(players,c,i).raceId).stats,other=get('races',baseBuild(players,c,1-i).raceId).stats;s.energy+=(other.energy??0)-(own.energy??0);}s.energy=Math.max(1,s.energy);s.hp=c.fighters[i].originalMaxHp??s.hp;s.hp=Math.max(1,s.hp-(c.fighters[i].tactic?.scarAmount??0));return s;}
export function battleStats(players,c,i){const f=c.fighters[i],b=activeBuild(players,c,i),s=calculateStats(b,f.statuses);s.hp=maxStats(players,c,i).hp;
 const t=f.tactic??{};
 if(has(players,c,i,'oath')){s.damage+=2;s.defense+=3;}
 if(has(players,c,i,'bell')&&c.round%3===0)s.defense-=3;
 if(has(players,c,i,'coronation')&&t.coronationUntil>=c.round){s.damage+=6;s.defense+=3;s.speed+=2;}
 if(t.coinExposed===c.round)s.defense-=3;
 if(has(players,c,i,'crown')&&t.crown){s.damage+=t.crown.guard?2:0;s.defense+=t.crown.evade?2:0;}
 if(has(players,c,i,'usurp')&&t.usurpUntil>=c.round){const own=get('races',b.raceId).stats,other=get('races',baseBuild(players,c,1-i).raceId).stats;for(const key of ['damage','defense','speed','energy','resistance'])s[key]+=(other[key]??0)-(own[key]??0);}
 if(c.field?.exchange===c.round){const other=calculateStats(activeBuild(players,c,1-i),c.fighters[1-i].statuses);s.defense=other.defense;}
 s.physicalDamage=s.damage;s.magicalDamage=s.damage;s.physicalDefense=s.defense;s.magicalDefense=s.defense+s.resistance;
 for(const type of ['physical','magical']){const adaptation=f.talents.adaptations[type];if(adaptation?.expiresRound>=c.round&&c.field?.duel!==c.round)s[type+'Defense']+=adaptation.amount;}
 if(c.field?.eclipse===c.round){[s.physicalDamage,s.magicalDamage]=[s.magicalDamage,s.physicalDamage];[s.physicalDefense,s.magicalDefense]=[s.magicalDefense,s.physicalDefense];}
 return Object.fromEntries(Object.entries(s).map(([k,v])=>[k,Math.max(k==='hp'||k==='energy'?1:0,v)]));
}
export function initializeTactics(players,c){c.field??={};c.rngSeed??=1;for(let i=0;i<2;i++){const f=c.fighters[i];f.talents??=createTalentState();f.tactic??={disabled:[],private:{},parasite:0,names:0,beast:0,records:[],crown:{},debts:[]};f.tactic.private??={};f.shield??=0;f.cooldowns??={};f.uses??={};f.originalMaxHp??=calculateStats(players[i].build).hp;}
}
export function actionInput(input){return typeof input==='string'?{abilityId:input,choices:{}}:{abilityId:input?.abilityId,choices:input?.choices??{}};}
export function choicesFor(players,c,i,id){const a=get('abilities',id),f=c.fighters[i],e=c.fighters[1-i],own=activeBuild(players,c,i),pairs=availableAbilities(own).map(id=>get('abilities',id)).filter(a=>a.kind==='attack'&&!a.operation);
 const ids=(xs)=>xs.map(id=>({id,name:get('abilities',id)?.name??id}));
 switch(a?.choice){
 case 'cooldown':return ids(Object.keys(f.cooldowns??{}).filter(id=>f.cooldowns[id]>0));
 case 'classCooldown':return ids(get('classes',own.classId).abilities.filter(id=>f.cooldowns?.[id]>0&&!get('abilities',id).ultimate&&!get('abilities',id).consumable));
 case 'buff':return e.statuses.filter(s=>!get('statuses',s.id).negative&&Object.keys(get('statuses',s.id).stats??{}).length).map(s=>({id:s.id,name:get('statuses',s.id).name}));
 case 'curse':return f.statuses.filter(s=>get('statuses',s.id).negative).map(s=>({id:s.id,name:get('statuses',s.id).name}));
 case 'future':return [{id:'guard_on_attack',name:'Guardia si ataca; Ataque si no'},{id:'attack_on_attack',name:'Ataque si ataca; Guardia si no'}];
 case 'specimen':return Object.entries(SPECIMENS).filter(([id])=>!f.tactic?.spentSpecimens?.includes(id)).map(([id,s])=>({id,name:s.name}));
 case 'ownAttack':return pairs.filter(a=>!a.ultimate&&!a.consumable).map(a=>({id:a.id,name:a.name}));
 case 'attackPair':return pairs.flatMap((a,j)=>pairs.slice(j+1).map(b=>({id:a.id+','+b.id,name:a.name+' + '+b.name})));
 case 'common':return ids(COMMON_ACTIONS);
 case 'equipment':return Object.entries(own.equipment).filter(([slot,id])=>id&&slot!=='relic').map(([id,item])=>({id,name:get('items',item).name}));
 case 'portal':return [{id:'beast',name:'Bestia'},{id:'arcane',name:'Descarga arcana'},{id:'bastion',name:'Bastión'}];
 case 'reward':return [{id:'hp',name:'Recompensa · 14 vida'},{id:'energy',name:'Recompensa · 5 energía'}];
 case 'loot':return [{id:'shield',name:'Botín · Escudo de 12'},{id:'energy',name:'Botín · 5 energía'},{id:'hp',name:'Botín · 10 vida'}];
 case 'device':{const xs=[];if(c.field?.chains)xs.push({id:'chains',name:'Romper cadenas'});if(f.tactic?.prison)xs.push({id:'prison',name:'Liberar bendición'});for(const [key,name]of [['cannon','Sabotear cañón'],['throneUntil','Expulsar del trono'],['beast','Dispersar bestia'],['sun','Detonar sol'],['names','Borrar inscripción'],['powder','Sabotear dragón mecánico'],['portal','Cerrar portal'],['server','Atacar servidor']])if(e.tactic?.[key])xs.push({id:key,name});return xs;}
 default:return [];
 }
}
export function specialBlocked(players,c,i,a,choices={}){const f=c.fighters[i],t=f.tactic??{},round=c.round;
 if(t.eggUntil)return 'Estás incubando: esta ronda solo puedes esperar con Guardia.';
 if(a.id==='evade'&&(c.field?.chains||t.cannon||t.throneUntil>=round||t.fortress>0))return 'No puedes usar Evasión mientras permanezca este efecto.';
 if(has(players,c,i,'oath')&&a.id===(baseBuild(players,c,i).talentConfig?.oath??'evade'))return 'Esta acción está prohibida por tu Juramento de hierro.';
 if(c.field?.decree?.round===round&&a.id===c.field.decree.action)return 'El Decreto del tirano prohíbe esta acción para ambos.';
 if(c.field?.duel===round&&!COMMON_ACTIONS.includes(a.id))return 'El duelo interior permite únicamente acciones comunes.';
 if(a.once&&f.uses[a.id])return 'Ya usaste este poder en el duelo.';
 const conditions={echo:!!c.fighters[1-i].talents.previousAction,pattern_strike:t.patternReady,parasite_heal:t.parasite>0,parasite_attack:t.parasite>0,certain_strike:t.certainty===round,mirror_return:t.mirrorAmount>0,fourth:(t.records?.length??0)>=3,hunt_finish:t.huntReady,beast:t.beast>=3,wound_strike:t.woundUntil>=round,cannon_fire:t.cannon?.readyRound<=round,second_phase:f.hp/maxStats(players,c,i).hp<=.4,fortress_shot:t.fortress>0,fortress_eject:t.fortress>0,sun_burst:!!t.sun,sun_consume:!!t.sun,name_strike:t.names>=3,powder_shot:t.powder>0,powder_burst:t.powder>0,miracle_release:!!t.miracle,specimen_king:!t.server};
 if(Object.hasOwn(conditions,a.operation)&&!conditions[a.operation])return 'Todavía no se cumple la condición de este talento.';
 if(a.operation==='coronation'&&activeBuild(players,c,i).talentIds.length<2)return 'Necesitas otro talento para sacrificar.';
 if(a.operation==='echo'){const echoed=get('abilities',c.fighters[1-i].talents.previousAction);if(!echoed||echoed.operation||echoed.ultimate||echoed.consumable)return 'El eco necesita una técnica normal del rival.';}
 if(a.choice){const options=choicesFor(players,c,i,a.id);if(!options.length)return 'No hay un objetivo válido para esta técnica.';if(choices.target!==undefined&&!options.some(o=>o.id===choices.target))return 'Objetivo inválido.';}
 return null;
}
export function predictionOptions(players,c,i){return availableAbilities(activeBuild(players,c,1-i)).filter(id=>!get('abilities',id).operation).map(id=>({id,name:get('abilities',id).name}));}
export function validateChoices(players,c,i,input){requireGame(input.choices&&typeof input.choices==='object'&&!Array.isArray(input.choices),'Decisiones inválidas.');requireGame(Object.keys(input.choices).every(k=>['target','prediction','prediction2','weapon','mask'].includes(k))&&Object.values(input.choices).every(v=>typeof v==='string'&&v.length<=90),'Decisiones inválidas.');
 for(const key of ['prediction','prediction2'])if(input.choices[key])requireGame((has(players,c,i,'oracle')||has(players,c,i,'pattern'))&&predictionOptions(players,c,i).some(o=>o.id===input.choices[key]),'Predicción inválida.');
 if(input.choices.mask)requireGame(has(players,c,i,'mask')&&COMMON_ACTIONS.includes(input.choices.mask)&&!c.fighters[i].uses.mask,'Anuncio inválido.');
 if(input.choices.weapon){const b=baseBuild(players,c,i);requireGame(has(players,c,i,'arsenal')&&[players[i].build.equipment.weapon,b.talentConfig?.secondaryWeapon??'azure_sword'].includes(input.choices.weapon),'Arma fuera del arsenal preparado.');}
}
export function publicTalentState(players,c,i){const f=c.fighters[i],t=f.tactic??{},out=[];
 if(has(players,c,i,'oath'))out.push('Juramento: renuncia a '+get('abilities',baseBuild(players,c,i).talentConfig?.oath??'evade').name);
 if(has(players,c,i,'secondPhase'))out.push('Segunda fase preparada: '+get('classes',baseBuild(players,c,i).talentConfig?.secondClass??'arcanist').name);
 if(has(players,c,i,'crown'))out.push('Hazañas: golpear Guardia · esquivar · acertar técnica');
 for(const [key,label]of [['parasite','Cargas parasitarias'],['names','Inscripciones'],['beast','Bestia'],['fortress','Placas'],['powder','Pólvora']])if(t[key])out.push(label+': '+t[key]);
 if(t.sun)out.push('Sol cautivo: '+t.sun.power+' potencia');if(t.cannon)out.push('Cañón '+(t.cannon.readyRound<=c.round?'cargado':'cargando'));if(t.portal)out.push('Portal: emerge en ronda '+t.portal.round);if(t.server)out.push(t.server.name+': '+t.server.hp+' vida');if(t.eggUntil)out.push('Huevo del Fénix · renace al final de ronda '+t.eggUntil);if(t.prison)out.push('Mejora encerrada: '+get('statuses',t.prison.id).name);if(t.mask)out.push('Anuncio de Máscara: '+get('abilities',t.mask.action).name);if(t.hunt)out.push('Cacería: '+t.hunt.actions.map(id=>get('abilities',id).name).join(' + '));
 for(const [key,label]of [['pact','Pacto del verdugo'],['exchange','Intercambio de defensas'],['inversion','Curación invertida'],['eclipse','Eclipse'],['duel','Duelo interior']])if(c.field?.[key]>=c.round)out.push(label+' · ronda '+c.field[key]);if(c.field?.chains)out.push('Cadenas del coloso activas');if(c.field?.decree)out.push('Decreto: '+get('abilities',c.field.decree.action).name+' · ronda '+c.field.decree.round);if(t.dragonStrike)out.push('Aliento anunciado · ronda '+t.dragonStrike);if(t.certainty>=c.round)out.push('Golpe certero · ronda '+t.certainty);
 return out;
}
