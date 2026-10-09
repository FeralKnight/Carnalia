import { options, get } from '../content/registry.js';
import { changeBuild } from './build.js';
import { pick } from './rng.js';
import { requireGame } from './errors.js';

export const PREPARATION_PHASES = [
 {name:'Raza',kind:'races',type:'race'},
 {name:'Clase',kind:'classes',type:'class'},
 {name:'Talento 1',kind:'talents',type:'talent'},
 {name:'Talento 2',kind:'talents',type:'talent'},
 {name:'Arma',kind:'items',type:'equip',slot:'weapon'},
 {name:'Armadura',kind:'items',type:'equip',slot:'armor'},
 {name:'Reliquia',kind:'items',type:'equip',slot:'relic'},
 {name:'Don Primordial',kind:'gifts',type:'gift'}
];
export function initializePreparation(state) {
 state.preparation.steps=[0,0]; state.preparation.offers=[null,null];
 state.preparation.selected=[false,false]; state.preparation.completed=[[],[]];
 return state;
}
export function phaseOptions(state,index) {
 const phase=PREPARATION_PHASES[state.preparation.steps[index]];
 if(!phase) return [];
 return options(phase.kind,e=>(!phase.slot || e.slot===phase.slot)&&
   (phase.type!=='talent'|| e.id===state.preparation.completed[index][state.preparation.steps[index]]||!state.players[index].build.talentIds.includes(e.id)));
}
export function drawPhase(state,index) {
 requireGame(state.phase==='preparation'&&!state.players[index].ready,'La preparación terminó.');
 requireGame(state.mode==='chance'&&!state.preparation.offers[index], 'La fase ya tiene resultados.');
 const copy=structuredClone(state); let pool=phaseOptions(copy,index);
 const ids=[];
 for(let i=0;i<3 && pool.length;i++) {const r=pick(pool,copy.seed);copy.seed=r.seed;ids.push(r.value.id);pool=pool.filter(e=>e.id!==r.value.id);}
 copy.preparation.offers[index]=ids;copy.revision++; return copy;
}
export function choosePhase(state,index,id) {
 requireGame(state.phase==='preparation'&&!state.players[index].ready,'La preparación terminó.');
 if(state.preparation.completed[index][state.preparation.steps[index]]===id) return structuredClone(state);
 const phase=PREPARATION_PHASES[state.preparation.steps[index]];
 requireGame(phase && phaseOptions(state,index).some(e=>e.id===id),'Opción inválida para esta fase.');
 requireGame(state.mode==='selection'||state.preparation.offers[index]?.includes(id),'Elige uno de los tres resultados.');
 const copy=structuredClone(state);let build=copy.players[index].build;
 // Replacing a talent in the current phase doesn't modify an earlier phase.
 if(phase.type==='talent') {const previous=copy.preparation.completed[index][copy.preparation.steps[index]];if(previous) build=changeBuild(build,{type:'talent',id:previous});}
 copy.players[index].build=changeBuild(build,{type:phase.type,slot:phase.slot,id});
 copy.preparation.completed[index][copy.preparation.steps[index]]=id;
 copy.preparation.selected[index]=true;copy.revision++;return copy;
}
export function advancePhase(state,index) {
 requireGame(state.phase==='preparation'&&!state.players[index].ready&&state.preparation.selected[index], 'Selecciona una opción antes de continuar.');
 const copy=structuredClone(state);copy.preparation.steps[index]++;copy.preparation.offers[index]=null;copy.preparation.selected[index]=false;copy.revision++;return copy;
}
