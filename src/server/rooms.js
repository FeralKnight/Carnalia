import { actionInput,initializeTactics } from '../engine/tactical.js';
import { randomBytes, randomInt } from 'node:crypto';
import { createGame, rematch } from '../engine/game-state.js';
import { initializePreparation, choosePhase, drawPhase, advancePhase } from '../engine/preparation.js';
import { beginCombat, resolveRound, validateAction } from '../engine/combat.js';
import { createBuild, changeBuild } from '../engine/build.js';
import { requireGame } from '../engine/errors.js';
const secret = () => randomBytes(24).toString('hex');
export class RoomService {
 constructor(){this.rooms=new Map();}
 create(name,mode){
  for(const [id,r] of this.rooms) if(Date.now()-r.touched>6*3600*1000) this.rooms.delete(id);
  requireGame(this.rooms.size<200,'Hay demasiadas salas. Inténtalo más tarde.');
  const state=initializePreparation(createGame([name,'Esperando rival'],mode,randomInt(0,0xffffffff)));
  let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(this.rooms.has(code));
  state.room.id=code;state.room.transport='online';
  const token=secret();const room={state,tokens:[token,null],joined:false,touched:Date.now(),requests:[new Map(),new Map()]};
  this.rooms.set(code,room);return {code,token,index:0,view:this.view(room,0)};
 }
 join(code,name){
  const room=this.rooms.get(String(code).toUpperCase());requireGame(room,'Sala no encontrada.');
  requireGame(!room.joined,'La sala ya tiene dos jugadores.');
  requireGame(typeof name==='string'&&name.trim().length>=2&&name.trim().length<=18,'Nombre de 2 a 18 caracteres.');
  room.tokens[1]=secret();room.joined=true;room.state.players[1].name=name.trim();room.state.revision++;room.touched=Date.now();
  return {code:room.state.room.id,token:room.tokens[1],index:1,view:this.view(room,1)};
 }
 authenticate(code,token){
  const room=this.rooms.get(String(code).toUpperCase());requireGame(room,'La sala expiró o el servidor se reinició.');
  const index=room.tokens.indexOf(token);requireGame(typeof token==='string'&&index>=0,'No tienes acceso a esta sala.');
  room.touched=Date.now();return {room,index};
 }
 view(room,index){
  const state=structuredClone(room.state);state.seed=0;
  if(state.combat){state.combat.rngSeed=0;for(const record of [state.combat,...state.combat.history])for(const [i,f] of record.fighters.entries())if(i!==index&&f.tactic)f.tactic.private={};}
  if(state.combat) state.combat.pending=state.combat.pending.map((action,i)=>action?(i===index?action:{confirmed:true}):null);
  state.preparation.offers[1-index]=null;
  state.preparation.index=index;state.preparation.handoff=false;
  if(state.combat){state.combat.selectionIndex=index;state.combat.handoff=false;}
  return {state,index,joined:room.joined};
 }
 command(code,token,request){
  const {room,index}=this.authenticate(code,token);
  requireGame(room.joined,'Espera a que entre el rival.');
  requireGame(request&&typeof request.requestId==='string'&&request.requestId.length<=80,'Solicitud inválida.');
  if(room.requests[index].has(request.requestId)) return this.view(room,index);
  requireGame(request.revision===room.state.revision,'La partida cambió. Actualiza y vuelve a intentarlo.','STALE_STATE');
  let state=room.state;
  switch(request.command){
   case 'choose':state=choosePhase(state,index,request.arg);break;
   case 'draw':state=drawPhase(state,index);break;
   case 'advance':state=advancePhase(state,index);break;
   case 'appearance':
    requireGame(state.phase==='preparation'&&!state.players[index].ready,'La preparación terminó.');
    state=structuredClone(state);state.players[index].build=changeBuild(state.players[index].build,{type:'appearance',...request.arg});state.revision++;break;
   case 'configure':
    requireGame(state.phase==='preparation'&&state.preparation.steps[index]===8&&!state.players[index].ready,'Configura el talento antes de confirmar la build.');
    state=structuredClone(state);state.players[index].build=changeBuild(state.players[index].build,{type:'talent-config',...request.arg});state.revision++;break;
   case 'restart':
    requireGame(state.phase==='preparation'&&!state.players[index].ready,'La preparación terminó.');
    state=structuredClone(state);state.players[index].build=createBuild();state.preparation.steps[index]=0;state.preparation.offers[index]=null;state.preparation.selected[index]=false;state.preparation.completed[index]=[];state.revision++;break;
   case 'ready':
    requireGame(state.phase==='preparation'&&state.preparation.steps[index]===8&&!state.players[index].ready,'Completa las ocho fases.');
    state=structuredClone(state);state.players[index].ready=true;state.revision++;
    if(state.players.every(p=>p.ready)){state.phase='combat';state.combat=beginCombat(state.players,state.seed);}break;
   case 'action':{
    requireGame(state.phase==='combat'&&request.round===state.combat.round,'La ronda ya terminó.');
    validateAction(state.players,state.combat,index,request.arg);
    state=structuredClone(state);state.combat.pending[index]=actionInput(request.arg);state.revision++;
    if(state.combat.pending.every(Boolean)){
     const result=resolveRound(state.players,state.combat);state.combat=result.combat;
     if(result.finished){state.phase='result';state.result={winnerId:result.winnerIndex===null?null:state.players[result.winnerIndex].id,reason:'combat',rounds:state.combat.round};}
    }break;}
   case 'rematch':{
    requireGame(state.phase==='result','El duelo no ha terminado.');
    const previousRevision=state.revision;
    state=initializePreparation(rematch(state));state.revision=previousRevision+1;state.room=structuredClone(room.state.room);break;}
   default:requireGame(false,'Acción desconocida.');
  }
  room.state=state;room.requests[index].set(request.requestId,true);
  if(room.requests[index].size>200)room.requests[index].delete(room.requests[index].keys().next().value);
  return this.view(room,index);
 }
}
