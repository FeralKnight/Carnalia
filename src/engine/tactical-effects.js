import { get } from '../content/registry.js';
import { activeBuild,baseBuild,maxStats,battleStats,has,SPECIMENS } from './tactical.js';

export function tacticalEffects(env){
 const {players:p,combat:c,events,damage,heal,energy,status}=env;
 const owns=(i,k)=>has(p,c,i,k),t=i=>c.fighters[i].tactic,f=i=>c.fighters[i],log=(i,s)=>events.push(p[i].name+' '+s),round=c.round;
 function changeEquipment(i,slot,value){f(i).build=structuredClone(baseBuild(p,c,i));f(i).build.equipment[slot]=value;}
 function mutateBuild(i,fn){f(i).build=structuredClone(baseBuild(p,c,i));fn(f(i).build);}
 function healShared(i,amount){if(c.field.duel===round){heal(i,amount);return;}if(t(i).woundUntil>=round){log(i,'no puede curarse durante el pacto de heridas.');return;}if(c.field.inversion===round){damage(i,amount,{periodic:true});log(i,'sufre la curación invertida.');return;}if(t(1-i).miracle&&owns(1-i,'miracle')){const stolen=Math.floor(amount/2);heal(1-i,stolen);amount-=stolen;t(1-i).miracle=null;log(1-i,'roba parte de la curación.');}heal(i,amount);if(c.field.chainUntil>=round)heal(1-i,Math.floor(amount/2));}
 function receive(i,amount,meta={}){
  const x=t(i);let dealt=amount;if(c.field.duel===round)return dealt;
  if(!meta.periodic){
   if(owns(i,'learn')&&meta.abilityId){if(!x.learned)x.learned=meta.abilityId;else if(x.learned===meta.abilityId)dealt=Math.floor(dealt*.75);}
   if(x.debtArmed){const delay=Math.floor(dealt/2);dealt-=delay;x.debts.push({amount:delay,round:round+1});x.debtArmed=false;log(i,'aplaza '+delay+' de daño hasta ronda '+(round+1)+'.');}
   if(x.scarArmed){const delay=Math.min(Math.floor(dealt/2),maxStats(p,c,i).hp-1);dealt-=delay;x.scarAmount=delay;x.debts.push({amount:delay,round:round+2,scar:true});x.scarArmed=false;f(i).hp=Math.min(f(i).hp,maxStats(p,c,i).hp);log(i,'sella '+delay+' de daño y reduce su vida máxima.');}
   if(x.mirror){x.mirrorAmount=Math.floor(dealt/2);x.mirrorType=meta.damageType;x.mirror=false;log(i,'captura '+x.mirrorAmount+' de potencia en el espejo.');}
   if(x.woundUntil>=round)x.woundAmount=(x.woundAmount??0)+Math.floor(dealt/2);
   if(x.fortress>0){dealt=Math.max(0,dealt-12);x.fortress--;log(i,'pierde una placa de asedio.');}
  }
  return dealt;
 }
 function fatal(i){const x=t(i),b=baseBuild(p,c,i);
  if(owns(i,'ironResurrection')&&!f(i).uses.ironResurrection&&b.equipment.armor){f(i).uses.ironResurrection=1;changeEquipment(i,'armor',null);f(i).hp=Math.min(15,maxStats(p,c,i).hp);log(i,'destruye su armadura y resiste con '+f(i).hp+' vida.');return;}
  if(owns(i,'phoenix')&&!f(i).uses.phoenix){f(i).uses.phoenix=1;x.eggUntil=round+1;f(i).hp=18;f(i).statuses=[];f(i).shield=0;log(i,'se convierte en un huevo de Fénix de 18 vida.');return;}
  const testament=x.private.testament;if(owns(i,'testament')&&testament&&!f(i).uses.testament){f(i).uses.testament=1;const a=get('abilities',testament);const raw=Math.max(1,battleStats(p,c,i).damage+a.power-battleStats(p,c,1-i).defense*.75*(1-(a.penetration??0)));damage(1-i,Math.floor(raw),{abilityId:a.id,damageType:a.damageType,retaliation:true});log(i,'ejecuta su Testamento del guerrero: '+a.name+'.');}
 }
 function attackBonus(i,a){const x=t(i);let bonus=0,power=0,ignoreGuard=!!a.ignoreGuard;if(c.field.duel===round)return {bonus,power,ignoreGuard};
  if(owns(i,'bell')&&round%3===0)bonus+=.25;if(c.field.pact===round)bonus+=.3;if(x.throneUntil>=round)bonus+=.35;
  if(x.coin){bonus+=.4;}if(x.devoured)bonus+=.3;
  if(x.inherited&&!x.inheritArmed)power+=x.inherited;
  if(x.inheritArmed)power-=Math.floor((battleStats(p,c,i).damage+a.power)/2);
  if(a.operation==='parasite_attack')power+=(x.parasite??0)*4;
  if(a.operation==='mirror_return')power+=(x.mirrorAmount??0)-battleStats(p,c,i).damage;
  if(a.operation==='wound_strike')power+=x.woundAmount??0;
  if(a.operation==='powder_burst')power+=(x.powder??0)*12;
  return {bonus,power,ignoreGuard};
 }
 function afterAttack(i,a,hit,enemyGuarded){const x=t(i);if(c.field.duel===round)return;
  if(x.coin){if(!hit)x.coinExposed=round+1;x.coin=false;}
  x.devoured=false;
  if(x.inheritArmed){if(hit)x.inherited=Math.floor((battleStats(p,c,i).damage+a.power)/2);x.inheritArmed=false;}else x.inherited=0;
  if(owns(i,'parasite'))x.parasite=Math.max(0,Math.min(3,(x.parasite??0)+(hit?1:-1)));
  if(owns(i,'beast')&&hit)x.beast=Math.min(3,(x.beast??0)+1);
  if(owns(i,'nameSword')&&hit)x.names=Math.min(3,(x.names??0)+1);
  if(owns(i,'crown')&&hit){if(enemyGuarded)x.crown.guard=true;if(a.id!=='strike')x.crown.technique=true;}
  if(x.hunt&&hit&&x.hunt.actions.includes(a.id)){x.hunt.hits=[...new Set([...x.hunt.hits,a.id])];if(x.hunt.hits.length===2){x.huntReady=true;x.hunt=null;}}
  switch(a.operation){
   case 'pattern_strike':x.patternReady=false;break;case 'parasite_attack':x.parasite=0;break;case 'mirror_return':x.mirrorAmount=0;break;case 'wound_strike':x.woundAmount=0;x.woundUntil=0;break;case 'hunt_finish':x.huntReady=false;break;case 'certain_strike':x.certainty=0;break;case 'cannon_fire':x.cannon=null;break;case 'name_strike':x.names=0;break;case 'powder_shot':x.powder--;break;case 'powder_burst':x.powder=0;break;case 'beast':if(hit)damage(1-i,Math.max(1,18-Math.floor(battleStats(p,c,1-i).defense*.75)),{abilityId:a.id,damageType:'physical'});x.beast=0;break;
  }
 }
 function act(i,a,choice){const x=t(i),other=t(1-i);switch(a.operation){
 case 'debt':x.debtArmed=true;break;
 case 'pact':c.field.pact=round+1;log(i,'anuncia el pacto para ronda '+(round+1)+'.');break;
 case 'hourglass':f(i).cooldowns[choice]=Math.max(0,f(i).cooldowns[choice]-2);break;
 case 'coin':x.coin=true;break;
 case 'steal':{const s=f(1-i).statuses.find(s=>s.id===choice);if(s){f(1-i).statuses=f(1-i).statuses.filter(b=>b!==s);f(i).statuses.push(structuredClone(s));log(i,'roba '+get('statuses',s.id).name+'.');}break;}
 case 'discord':other.discord={round:round+1,previous:f(1-i).talents.previousAction};break;
 case 'anchor':x.anchor={hp:f(i).hp,round:round+2};break;
 case 'inherit':x.inheritArmed=true;break;
 case 'prison':{const s=f(1-i).statuses.find(s=>s.id===choice);if(s){other.prison=structuredClone(s);f(1-i).statuses=f(1-i).statuses.filter(b=>b!==s);}break;}
 case 'exchange':c.field.exchange=round+1;break;
 case 'devour':f(i).statuses=f(i).statuses.filter(s=>s.id!==choice);x.devoured=true;break;
 case 'territory':c.field.territoryUntil=round+3;for(const f of c.fighters)f.tactic.territory=0;break;
 case 'scar':x.scarArmed=true;break;
 case 'parasite_heal':healShared(i,x.parasite*4);x.parasite=0;break;
 case 'chain':c.field.chainUntil=round+2;break;
 case 'certainty':x.certainty=round+1;break;
 case 'inversion':c.field.inversion=round+1;break;
 case 'specimen_trophy':case 'specimen_grave':{const sample=SPECIMENS[choice],technique=get('abilities',sample.ability);const amount=Math.max(1,battleStats(p,c,i).damage+technique.power-Math.floor(battleStats(p,c,1-i).defense*.75));damage(1-i,amount,{abilityId:technique.id,damageType:technique.damageType});for(const e of technique.effects)if(e.type==='status')status(1-i,e);log(i,'invoca '+sample.name+' y ejecuta '+technique.name+'.');break;}
 case 'delay_victory':x.delayVictory=true;break;
 case 'coronation':{const sacrifice=activeBuild(p,c,i).talentIds.find(id=>get('talents',id).mechanic!=='coronation');x.disabled.push(sacrifice);x.coronationUntil=round+2;log(i,'sacrifica '+get('talents',sacrifice).name+'.');break;}
 case 'testament':x.private.testament=choice;log(i,'prepara un testamento secreto.');break;
 case 'mirror':x.mirror=true;break;
 case 'usurp':x.usurpUntil=round+2;break;
 case 'fourth':{const records=x.records.slice(0,3);x.records=[];for(const id of records){const technique=get('abilities',id);if(technique.kind==='attack')damage(1-i,Math.max(1,Math.floor((battleStats(p,c,i).damage+technique.power-battleStats(p,c,1-i).defense*.75)/2)),{abilityId:a.id,damageType:technique.damageType});for(const e of technique.effects)if(e.type==='heal')healShared(i,Math.ceil(e.amount/2));else if(e.type==='energy')energy(i,Math.ceil(e.amount/2));else if(e.type==='shield')f(i).shield=Math.min(maxStats(p,c,i).hp,f(i).shield+Math.ceil(e.amount/2));else if(e.type==='status')status(technique.target==='self'?i:1-i,{...e,duration:1});}break;}
 case 'throne':x.throneUntil=round+2;break;
 case 'hunt':x.hunt={actions:choice.split(','),hits:[],until:round+3};break;
 case 'decree':c.field.decree={action:choice,round:round+1};break;
 case 'inventory':{const item=get('items',baseBuild(p,c,i).equipment[choice]);changeEquipment(i,choice,null);if(choice==='weapon')damage(1-i,12+(item.stats?.damage??0)*3,{abilityId:a.id,damageType:'physical'});else if(choice==='armor')f(i).shield=Math.min(maxStats(p,c,i).hp,f(i).shield+14+(item.stats?.defense??0));else energy(i,7);log(i,'destruye '+item.name+'.');break;}
 case 'eclipse':c.field.eclipse=round+1;break;
 case 'duel':c.field.duel=round+1;break;
 case 'wound':x.woundUntil=round+2;x.woundAmount=0;break;
 case 'dragon':x.dragonUntil=round+2;break;
 case 'cannon_load':x.cannon={readyRound:round+1};break;
 case 'dragon_summon':x.dragonStrike=round+1;break;
 case 'second_phase':{const classId=baseBuild(p,c,i).talentConfig?.secondClass??'arcanist';mutateBuild(i,b=>b.classId=classId);f(i).energy=Math.min(f(i).energy,maxStats(p,c,i).energy);log(i,'adopta '+get('classes',classId).name+' sin recuperar vida.');break;}
 case 'fortress':x.fortress=3;break;case 'fortress_eject':x.fortress=0;break;
 case 'sun':x.sun={power:8,born:round};break;
 case 'sun_burst':{const amount=x.sun.power;x.sun=null;damage(1-i,Math.max(0,amount-maxStats(p,c,1-i).resistance),{periodic:true});damage(i,Math.max(0,amount-maxStats(p,c,i).resistance),{periodic:true});break;}
 case 'sun_consume':energy(i,Math.ceil(x.sun.power/2));x.sun=null;break;
 case 'specimen_king':{const s=SPECIMENS[choice];x.server={...s,id:choice};x.spentSpecimens??=[];x.spentSpecimens.push(choice);log(i,'invoca '+s.name+'.');break;}
 case 'chains':c.field.chains=true;break;
 case 'powder':x.powder=3;break;
 case 'miracle':x.miracle={reserved:3};break;case 'miracle_release':energy(i,3);x.miracle=null;break;
 case 'gate':x.portal={round:round+1};x.private.portal=choice;break;
 case 'reward':if(choice==='hp')healShared(i,14);else energy(i,5);break;
 case 'scavenge':if(choice==='hp')healShared(i,10);else if(choice==='energy')energy(i,5);else f(i).shield=Math.min(maxStats(p,c,i).hp,f(i).shield+12);break;
 case 'interfere':switch(choice){case 'chains':c.field.chains=false;break;case 'prison':if(x.prison){f(i).statuses.push(x.prison);x.prison=null;}break;case 'sun':if(other.sun){const amount=other.sun.power;other.sun=null;damage(i,Math.max(0,amount-maxStats(p,c,i).resistance),{periodic:true});damage(1-i,Math.max(0,amount-maxStats(p,c,1-i).resistance),{periodic:true});}break;case 'portal':other.portal=null;delete other.private.portal;break;case 'server':other.server.hp-=12;if(other.server.hp<=0)other.server=null;break;case 'names':other.names=Math.max(0,other.names-1);break;case 'powder':other.powder=Math.max(0,other.powder-1);break;case 'beast':other.beast=Math.max(0,other.beast-1);break;case 'throneUntil':other.throneUntil=0;break;case 'cannon':other.cannon=null;break;}log(i,'interfiere: '+choice+'.');break;
 }
 }
 function start(){for(let i=0;i<2;i++){const input=c.pending[i],x=t(i),choices=input.choices??{};
  if(choices.weapon&&owns(i,'arsenal'))changeEquipment(i,'weapon',choices.weapon);
  if(choices.mask&&owns(i,'mask')&&!f(i).uses.mask){x.mask={action:choices.mask,round:round+1};f(i).uses.mask=1;log(i,'anuncia '+get('abilities',choices.mask).name+' mediante Máscara de intención.');}
  if(choices.prediction&&owns(i,'oracle')){const hit=choices.prediction===c.pending[1-i].abilityId;energy(i,hit?3:-2);log(i,(hit?'acierta':'falla')+' su predicción.');}
  if(choices.prediction&&choices.prediction2&&owns(i,'pattern')&&!x.private.pattern)x.private.pattern={actions:[choices.prediction,choices.prediction2],hits:[],round};
  if(owns(i,'pattern')&&x.private.pattern){const step=round-x.private.pattern.round;if(step<2)x.private.pattern.hits.push(c.pending[1-i].abilityId===x.private.pattern.actions[step]);if(step===1){x.patternReady=x.private.pattern.hits.every(Boolean);log(i,x.patternReady?'completa el patrón.':'falla el patrón.');delete x.private.pattern;}}
 }}
 function end(){for(let i=0;i<2;i++){const x=t(i);if(f(i).hp<=0)continue;
  if(x.discord?.round===round){if(c.pending[i].abilityId===x.discord.previous)damage(i,12,{periodic:true});x.discord=null;}
  for(const debt of x.debts.filter(d=>d.round===round)){if(debt.scar)x.scarAmount=0;damage(i,debt.amount,{periodic:true});log(i,'paga '+debt.amount+' de deuda.');}x.debts=x.debts.filter(d=>d.round>round);
  if(f(i).hp<=0)continue;
  if(x.anchor?.round===round){f(i).hp=Math.min(x.anchor.hp,maxStats(p,c,i).hp);x.anchor=null;log(i,'regresa a la vida guardada por Ancla del alma.');}
  if(x.eggUntil===round){delete x.eggUntil;f(i).hp=Math.min(25,maxStats(p,c,i).hp);log(i,'renace del Fénix de guerra.');}
  if(owns(i,'sun')&&x.sun&&x.sun.born<round)x.sun.power+=6;
  if(owns(i,'dragonSummon')&&x.dragonStrike===round){if(c.pending[1-i].abilityId!=='take_cover')damage(1-i,Math.max(1,32-maxStats(p,c,1-i).resistance),{periodic:true});else log(1-i,'evita el aliento poniéndose a cubierto.');delete x.dragonStrike;}
  if(owns(i,'gate')&&x.portal?.round===round){const choice=x.private.portal;x.portal=null;delete x.private.portal;if(choice==='bastion')f(i).shield=Math.min(maxStats(p,c,i).hp,f(i).shield+24);else damage(1-i,Math.max(1,(choice==='arcane'?26:22)-battleStats(p,c,1-i).defense*.75),{abilityId:'talent_gate',damageType:choice==='arcane'?'magical':'physical'});log(i,'revela '+choice+' desde el portal.');}
  if(owns(i,'deadKing')&&x.server&&f(1-i).hp>0){const a=get('abilities',x.server.ability);damage(1-i,Math.max(1,Math.floor(6+a.power-battleStats(p,c,1-i).defense*.75)),{abilityId:a.id,damageType:a.damageType});log(i,x.server.name+' ataca como servidor.');}
  if(x.hunt?.until<=round)x.hunt=null;
 }}
 return {act,start,end,receive,fatal,attackBonus,afterAttack,healShared};
}
