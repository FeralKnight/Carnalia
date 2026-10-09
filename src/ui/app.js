import { composeCharacter } from './character-composer.js';
import { content, get } from '../content/registry.js';
import { validateContent } from '../engine/content-validation.js';
import { RULES, GAME_VERSION } from '../engine/config.js';
import { createBuild, changeBuild, availableAbilities } from '../engine/build.js';
import { calculateStats } from '../engine/stats.js';
import { TALENT_TIERS } from '../content/talents.js';
import { activeBuild,baseBuild,maxStats,battleStats,has,choicesFor,predictionOptions,publicTalentState,COMMON_ACTIONS } from '../engine/tactical.js';
import { validateAction,actionProfile } from '../engine/combat.js';
import { createGame, confirmPlayer, continuePreparation, submitAction, continueCombat, rematch } from '../engine/game-state.js';
import { PREPARATION_PHASES, initializePreparation, phaseOptions, choosePhase, drawPhase, advancePhase } from '../engine/preparation.js';
import { loadGame, saveGame, clearGame } from '../engine/storage.js';

const root=document.querySelector('#app');
const loaded=loadGame();let game=loaded.state, error=loaded.error, session=null, joined=true, selected=null, busy=false;
let lastRevision=-1, networkWarning='',talentTier='',talentSearch='',decisions={};
try{session=JSON.parse(sessionStorage.getItem('carnalia-room')??'null');}catch{}
if(session)game=null;
if(game&&!game.preparation.steps)game=null;
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={hp:'Vida',damage:'Daño',defense:'Defensa',speed:'Velocidad',energy:'Energía',resistance:'Resistencia'};
const slots={weapon:'Arma',armor:'Armadura',accessory:'Accesorio',relic:'Reliquia'};
const index=()=>session?session.index:(game?.phase==='preparation'?game.preparation.index:game?.combat?.selectionIndex??0);
const stats=b=>`<div class="stat-grid">${Object.entries(calculateStats(b)).map(([k,v])=>`<div class="stat"><span>${labels[k]}</span><strong>${v}</strong></div>`).join('')}</div>`;
const portrait=(i)=>`<div class="avatar-shell layered-character"><div class="avatar-halo"></div>${composeCharacter(game.combat?baseBuild(game.players,game.combat,i):game.players[i].build,{id:`player-${i}`,name:game.players[i].name})}<div class="avatar-ground"></div></div>`;
const mods=e=>Object.entries(e.stats??{}).map(([k,v])=>`${v>0?'+':''}${v} ${labels[k]}`).join(' · ');
function inventory(b){return `<div class="inventory-list"><span><b>Raza</b>${h(get('races',b.raceId).name)}</span><span><b>Clase</b>${h(get('classes',b.classId).name)}</span><span><b>Don</b>${h(get('gifts',b.giftId).name)}</span><span><b>Talentos</b>${b.talentIds.map(id=>h(get('talents',id).name)).join(' · ')||'—'}</span>${RULES.slots.map(s=>`<span><b>${slots[s]}</b>${h(get('items',b.equipment[s])?.name??'Ninguno')}</span>`).join('')}</div>`;}
function shell(body,step=0){return `<div class="app-shell"><header class="topbar"><div class="brand"><span class="brand-symbol">✧</span><span>CARNALIA</span><small>BETA DE PRUEBAS</small></div><div class="top-right"><span class="edition">v${GAME_VERSION}</span>${game||session?'<button class="quiet-link" data-action="leave">Salir</button>':''}</div></header>${step?`<div class="phase-line"><span class="${step===1?'active':''}">01 / PREPARAR</span><span class="${step===2?'active':''}">02 / COMBATIR</span><span class="${step===3?'active':''}">03 / RESULTADO</span></div>`:''}${error?`<div class="alert" role="alert">${h(error)}</div>`:''}${networkWarning?`<div class="notice" role="status">${h(networkWarning)}</div>`:''}${body}<footer class="footer">DOS VOLUNTADES · UNA ARENA · ${session?'SALA '+h(session.code):'DUELO LOCAL'} · CONTENIDO PROVISIONAL</footer></div>`;}
function landing(){return shell(`<main class="landing"><div class="landing-copy"><span class="eyebrow">EL UMBRAL ESTÁ ABIERTO</span><h1>Forja tu<br><em>destino.</em></h1><p>Ocho decisiones construyen tu combatiente. Elige tu camino o confía en tres resultados del azar. Después, enfrenta tu build a la de tu rival.</p><div class="feature-line"><span>20 RAZAS</span><span>30 CLASES</span><span>20 DONES</span><span>102 TALENTOS</span></div><p>Sin monstruos. Sin progresión permanente. 102 talentos: catálogo original y talentos de la beta. Cinco rarezas, de Común a Legendario.</p></div><div class="start-card"><form id="new-game"><span class="card-kicker">CREAR PARTIDA</span><h2>Entra en Carnalia</h2><label>TU NOMBRE<input name="player1" minlength="2" maxlength="18" placeholder="Combatiente" required autocomplete="off"></label><label>NOMBRE DEL RIVAL (LOCAL)<input name="player2" minlength="2" maxlength="18" placeholder="Rival" value="Rival" autocomplete="off"></label><fieldset><legend>MODO</legend><label class="mode-choice"><input type="radio" name="mode" value="selection" checked><span><b>Selección</b><small>Todo el catálogo en cada fase.</small></span></label><label class="mode-choice"><input type="radio" name="mode" value="chance"><span><b>Azar</b><small>Elige uno de tres resultados por fase.</small></span></label></fieldset><div class="result-actions"><button class="primary" name="transport" value="local" type="submit">DUELO LOCAL →</button><button class="secondary" name="transport" value="online" type="submit">CREAR SALA</button></div></form><div class="divider"></div><form id="join-game"><h3>Entrar a una sala</h3><label>NOMBRE<input name="name" required minlength="2" maxlength="18"></label><label>CÓDIGO<input name="code" required maxlength="6" placeholder="A1B2C3" value="${h(new URLSearchParams(location.search).get('room')??'')}"></label><button class="secondary full">ENTRAR →</button></form><p class="helper">Prueba online: crea una sala y comparte el código. Cada jugador usa su propio dispositivo.</p></div></main>`);}
function waiting(title,text,action=''){return shell(`<main class="handoff"><div class="seal">✧</div><h1>${title}</h1><p>${text}</p>${action}</main>`,game?.phase==='combat'?2:1);}
function preparation(){
 const i=index(),p=game.players[i],b=p.build,step=game.preparation.steps[i],phase=PREPARATION_PHASES[step];
 if(session&&!joined)return waiting('Tu sala está lista',`Comparte el código <strong>${h(session.code)}</strong>. El rival entra desde esta dirección y pulsa Entrar a una sala.<br><code>${h(location.origin+'/?room='+session.code)}</code>`);
 if(!session&&game.preparation.handoff)return waiting('Turno de '+h(game.players[1].name),'Entrega el dispositivo al segundo jugador.','<button class="primary" data-action="continue-prep">CONTINUAR →</button>');
 if(p.ready)return waiting('Build confirmada','Esperando a que el rival termine su preparación.');
 let editor;
 if(step===8){editor=`<span class="eyebrow">OCHO FASES COMPLETADAS</span><h2>Revisa tu build</h2>${inventory(b)}${talentConfiguration(b)}<h3>Técnicas disponibles</h3><div class="chips">${availableAbilities(b).map(id=>`<span class="chip" title="${h(get('abilities',id).description)}">${h(get('abilities',id).name)}</span>`).join('')}</div><p>Ultimate desde ronda 3, una vez por duelo. Poción y éter tienen una carga cada uno. El equipo modifica estadísticas, técnicas y apariencia.</p><div class="result-actions"><button class="secondary" data-action="restart">REHACER BUILD</button><button class="primary" data-action="ready">CONFIRMAR BUILD →</button></div>`;}
 else{
 const offers=game.preparation.offers[i];let entries=phaseOptions(game,i);
 const chosenId=game.preparation.completed[i][step];
 if(chosenId&&!entries.some(e=>e.id===chosenId))entries.unshift(get(phase.kind,chosenId));
 if(game.mode==='chance')entries=offers?entries.filter(e=>offers.includes(e.id)):[];
 else if(phase.kind==='talents')entries=entries.filter(e=>(!talentTier||e.tier===talentTier)&&(!talentSearch||(e.name+' '+e.description).toLocaleLowerCase('es').includes(talentSearch.toLocaleLowerCase('es'))));
 editor=`<span class="eyebrow">FASE ${step+1} DE 8 · ${game.mode==='chance'?'AZAR':'SELECCIÓN'}</span><h2>${phase.name}</h2><nav class="phase-chips" aria-label="Fases">${PREPARATION_PHASES.map((s,k)=>`<span class="chip ${k===step?'chosen':''}">${k<step?'✓ ':''}${s.name}</span>`).join('')}</nav>${phase.kind==='talents'?`<p>Dos talentos distintos. Las cantidades son balance inicial de prueba.</p>${game.mode==='selection'?`<div class="catalog-tools"><label>Rareza<select id="talent-tier"><option value="">Todas</option>${TALENT_TIERS.map(t=>`<option ${talentTier===t?'selected':''}>${h(t)}</option>`).join('')}</select></label><label>Buscar talento<input id="talent-search" value="${h(talentSearch)}" placeholder="Nombre o efecto; Enter para buscar"></label></div>`:''}`:''}${game.mode==='chance'&&!offers?'<div class="roll-area"><p>Tres resultados distintos. Una elección para esta fase.</p><button class="primary" data-action="draw">✦ GIRAR RULETA</button></div>':''}<div class="choices phase-catalog">${entries.map(e=>`<button class="choice ${chosenId===e.id?'chosen':''}" data-action="choose" data-id="${e.id}" aria-pressed="${chosenId===e.id}"><span class="choice-title">${h(e.name)}</span>${e.tier?`<span class="tier" data-tier="${h(e.tier)}">${h(e.tier)}</span>`:''}<small>${h(e.description)}</small>${e.sample?'<small class="sample-tag">Espécimen de prueba · adaptación de aventura</small>':''}<span class="choice-stats">${h(mods(e))}</span>${e.abilities?`<small>${e.abilities.map(id=>h(get('abilities',id).name)).join(' · ')}</small>`:''}</button>`).join('')}</div><div class="editor-footer"><span>${chosenId?'Elegido: '+h(get(phase.kind,chosenId).name):'Elige una opción para continuar.'}</span><button class="primary" data-action="advance" ${!game.preparation.selected[i]?'disabled':''}>SIGUIENTE FASE →</button></div>`;
 }
 return shell(`<main class="preparation"><div class="section-heading"><div><span class="eyebrow">PREPARACIÓN</span><h1>${h(p.name)}, <em>forja tu héroe.</em></h1></div><span class="counter">JUGADOR ${i+1} / 2</span></div><div class="prep-grid"><aside class="character-panel"><div class="visual-scene">${portrait(i)}<span class="scene-caption">RAZA · CLASE · EQUIPO</span></div><div class="character-details"><h2>${h(p.name)}</h2>${stats(b)}${inventory(b)}</div></aside><section class="editor-panel">${editor}</section></div></main>`,1);
}
function fighter(i){const p=game.players[i],f=game.combat.fighters[i],s=maxStats(game.players,game.combat,i);return `<div class="fighter-card"><div class="fighter-name"><span>JUGADOR ${i+1}</span><strong>${h(p.name)}</strong></div><div class="meter-label"><span>VIDA · ESCUDO ${f.shield??0}</span><b>${f.hp}/${s.hp}</b></div><div class="meter"><i style="width:${f.hp/s.hp*100}%"></i></div><div class="meter-label"><span>ENERGÍA</span><b>${f.energy}/${s.energy}</b></div><div class="meter energy"><i style="width:${f.energy/s.energy*100}%"></i></div><div class="status-list">${publicTalentState(game.players,game.combat,i).map(text=>`<span class="talent-state">${h(text)}</span>`).join('')}${f.statuses.map(x=>`<span title="${h(get('statuses',x.id).description)}">${h(get('statuses',x.id).name)} · ${x.duration}</span>`).join('')||'<span class="neutral">Sin estados</span>'}</div></div>`;}
function blocked(i,id){try{validateAction(game.players,game.combat,i,{abilityId:id,choices:selected===id?decisions:{}});return '';}catch(e){return e.message;}}
function combat(){
 const c=game.combat,i=index(),p=game.players[i];
 if(!session&&c.handoff)return waiting('Decide '+h(game.players[1].name),'La primera acción ya está oculta. Entrega el dispositivo.','<button class="primary" data-action="continue-combat">CONTINUAR →</button>');
 const committed=Boolean(c.pending[i]);const ids=availableAbilities(activeBuild(game.players,c,i));
 return shell(`<main class="combat"><div class="section-heading"><div><span class="eyebrow">ARENA · RONDA ${c.round}</span><h1>Dos voluntades.<br><em>Una decisión.</em></h1></div><span class="counter">${h(p.name)}</span></div><div class="arena"><div class="arena-sky"><span class="arena-moon"></span></div><div class="arena-fighters"><div class="combatant">${portrait(0)}<span>${h(game.players[0].name)}</span></div><div class="arena-center">✧<small>VS</small></div><div class="combatant">${portrait(1)}<span>${h(game.players[1].name)}</span></div></div><div class="arena-floor"></div></div><div class="fighter-grid">${fighter(0)}${fighter(1)}</div><div class="combat-bottom"><section class="action-panel"><span class="eyebrow">ACCIÓN OCULTA HASTA AMBAS CONFIRMACIONES</span><h2>${committed?'Esperando la acción rival':h(p.name)+', elige tu movimiento'}</h2>${committed?'<p>Tu acción está confirmada y permanece oculta al rival.</p>':`<div class="abilities">${ids.map(id=>{const a=get('abilities',id),why=blocked(i,id),profile=actionProfile(game.players,c,i,{abilityId:id,choices:selected===id?decisions:{}});return `<button class="ability ${selected===id?'chosen':''}" data-action="ability" data-id="${id}" ${why?'disabled':''} title="${h(why||a.description)}"><span><b>${h(a.name)}</b><em>${profile.cost} ✦${profile.healthCost?` · ${profile.healthCost} ♥`:""}</em></span><small>${h(a.description)}</small>${why?`<small class="blocked">${h(why)}</small>`:''}</button>`;}).join('')}</div>${combatDecisions(i)}<div class="action-footer"><span>Velocidad decide el orden. Empates alternan. Los estados cuentan la ronda en que se aplican.</span><button class="primary" data-action="action" ${!selected||blocked(i,selected)?'disabled':''}>CONFIRMAR ACCIÓN →</button></div>`}</section><aside class="battle-log"><span class="eyebrow">CRÓNICA</span><h3>Última ronda</h3><ol>${c.lastEvents.map(e=>`<li>${h(e)}</li>`).join('')||'<li>La arena espera.</li>'}</ol><details><summary>Build rival</summary>${inventory(game.players[1-i].build)}</details></aside></div></main>`,2);
}
function result(){const winner=game.players.find(p=>p.id===game.result.winnerId);return shell(`<main class="result"><span class="eyebrow">${game.result.rounds} RONDAS</span><div class="result-emblem">✧</div><h1>${winner?h(winner.name)+'<br><em>conquista la arena.</em>':'<em>Empate.</em>'}</h1><div class="result-fighters">${game.players.map((p,i)=>`<div class="result-fighter">${portrait(i)}<b>${h(p.name)}</b>${stats(p.build)}</div>`).join('')}</div><button class="primary" data-action="rematch">OTRA PARTIDA →</button><details class="chronicle"><summary>Crónica completa</summary>${game.combat.history.map(r=>`<div><h3>Ronda ${r.round}</h3>${r.events.map(e=>`<p>${h(e)}</p>`).join('')}</div>`).join('')}</details></main>`,3);}
let renderedPhaseKey=null;
function render(){const phaseKey=game?.phase==='preparation'?game.phase+':'+index()+':'+game.preparation.steps[index()]:game?.phase??'landing';const preserve=phaseKey===renderedPhaseKey;const pane=root.querySelector('.phase-catalog'),scrollTop=pane?.scrollTop??0,pageTop=window.scrollY;root.innerHTML=validateContent().length?shell('<main class="fatal">El catálogo contiene errores. Ejecuta npm run verify.</main>'):session&&!game?waiting('Conectando a la sala…','Recuperando tu partida.'):!game?landing():game.phase==='preparation'?preparation():game.phase==='combat'?combat():result();if(preserve){const nextPane=root.querySelector('.phase-catalog');if(nextPane)nextPane.scrollTop=scrollTop;window.scrollTo(0,pageTop);}renderedPhaseKey=phaseKey;root.setAttribute('aria-busy',String(busy));if(busy)root.querySelectorAll('button').forEach(b=>b.disabled=true);}
function persist(){if(!session&&game)try{saveGame(game);}catch{networkWarning='No se pudo guardar en este navegador.';}}
function setView(view){if(game?.combat?.round!==view.state.combat?.round){selected=null;decisions={};}game=view.state;joined=view.joined;lastRevision=game.revision;render();}
async function api(path,body){
 const response=await fetch(path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(session?{Authorization:'Bearer '+session.token}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
 let data;try{data=await response.json();}catch{throw Error('El servidor de salas no está activo. Ejecuta npm run dev para usar online.');}
 if(!response.ok){const e=Error(data.error??'No se pudo conectar.');e.code=data.code;throw e;}return data;
}
let lastPollAt=0,pollInFlight=false;
async function poll(){if(!session||busy||pollInFlight||document.hidden||game?.phase==='result')return;const delay=game?.phase==='preparation'&&joined?10000:2500;if(Date.now()-lastPollAt<delay)return;lastPollAt=Date.now();pollInFlight=true;try{const view=await api('/api/state?room='+session.code);if(view.state.revision!==lastRevision||!game){networkWarning='';setView(view);}else if(networkWarning){networkWarning='';render();}}catch(e){networkWarning=e.message;render();}finally{pollInFlight=false;}}
async function command(action,arg){
 if(session){
  const request={command:action,arg,revision:game.revision,round:game.combat?.round,requestId:globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`};
  try{setView(await api('/api/command?room='+session.code,request));}catch(e){if(e.code!=='STALE_STATE')throw e;const view=await api('/api/state?room='+session.code);setView(view);request.revision=game.revision;setView(await api('/api/command?room='+session.code,request));}
 }else{
  const i=index();
  if(action==='choose')game=choosePhase(game,i,arg);
  else if(action==='draw')game=drawPhase(game,i);
  else if(action==='advance')game=advancePhase(game,i);
  else if(action==='configure'){game=structuredClone(game);game.players[i].build=changeBuild(game.players[i].build,{type:'talent-config',...arg});game.revision++;}
  else if(action==='ready'){game.preparation.hasRolled[i]=true;game=confirmPlayer(game);}
  else if(action==='continue-prep')game=continuePreparation(game);
  else if(action==='continue-combat')game=continueCombat(game);
  else if(action==='action')game=submitAction(game,arg);
  else if(action==='rematch')game=initializePreparation(rematch(game));
  else if(action==='restart'){game=structuredClone(game);game.players[i].build=createBuild();game.preparation.steps[i]=0;game.preparation.offers[i]=null;game.preparation.selected[i]=false;game.preparation.completed[i]=[];game.revision++;}
  persist();render();
 }
}
async function perform(fn){if(busy)return;busy=true;error=null;render();try{await fn();}catch(e){error=e.message||'No se pudo completar la acción.';}finally{busy=false;render();}}
root.addEventListener('submit',event=>{
 event.preventDefault();const form=new FormData(event.target);
 if(event.target.id==='new-game')perform(async()=>{
  const mode=form.get('mode');
  if(event.submitter?.value==='online'){const data=await api('/api/create',{name:form.get('player1'),mode});session={code:data.code,token:data.token,index:data.index};sessionStorage.setItem('carnalia-room',JSON.stringify(session));setView(data.view);}
  else{game=initializePreparation(createGame([form.get('player1'),form.get('player2')],mode));persist();}
 });
 else if(event.target.id==='join-game')perform(async()=>{const data=await api('/api/join',{name:form.get('name'),code:form.get('code')});session={code:data.code,token:data.token,index:data.index};sessionStorage.setItem('carnalia-room',JSON.stringify(session));setView(data.view);});
});
root.addEventListener('click',event=>{
 const b=event.target.closest('[data-action]');if(!b||b.disabled||busy)return;
 const action=b.dataset.action;
 if(action==='ability'){selected=b.dataset.id;decisions={};render();return;}
 if(action==='leave'){if(!window.confirm('¿Salir de esta partida?'))return;session=null;sessionStorage.removeItem('carnalia-room');game=null;clearGame();error=null;networkWarning='';selected=null;render();return;}
 perform(async()=>{
  if(action==='draw'){networkWarning='La ruleta está girando…';render();await new Promise(resolve=>setTimeout(resolve,450));networkWarning='';}
  await command(action,action==='choose'?b.dataset.id:action==='action'?{abilityId:selected,choices:{...decisions}}:undefined);
  if(action==='action'){selected=null;decisions={};}
 });
});

function talentConfiguration(b){const config=b.talentConfig??{};const owns=k=>b.talentIds.some(id=>get('talents',id).mechanic===k);const sel=(key,label,entries,value)=>`<label>${label}<select data-config="${key}">${entries.map(e=>`<option value="${h(e.id)}" ${e.id===value?'selected':''}>${h(e.name)}</option>`).join('')}</select></label>`;return `<div class="talent-config">${owns('oath')?sel('oath','Acción a la que renuncias',COMMON_ACTIONS.map(id=>get('abilities',id)),config.oath??'evade'):''}${owns('arsenal')?sel('secondaryWeapon','Segunda arma de prueba',content.items.filter(e=>e.slot==='weapon'),config.secondaryWeapon??'azure_sword'):''}${owns('secondPhase')?sel('secondClass','Clase de la segunda fase',content.classes,config.secondClass??'arcanist'):''}</div>`;}
function combatDecisions(i){const c=game.combat,b=baseBuild(game.players,c,i),select=(key,label,entries)=>`<label>${label}<select data-decision="${key}"><option value="">Sin seleccionar</option>${entries.map(e=>`<option value="${h(e.id)}" ${decisions[key]===e.id?'selected':''}>${h(e.name)}</option>`).join('')}</select></label>`;let html='';if(selected&&get('abilities',selected)?.choice)html+=select('target','Objetivo de la técnica',choicesFor(game.players,c,i,selected));if(has(game.players,c,i,'oracle')||has(game.players,c,i,'pattern'))html+=select('prediction','Predicción secreta · acción rival',predictionOptions(game.players,c,i));if(has(game.players,c,i,'pattern'))html+=select('prediction2','Predicción secreta · siguiente ronda',predictionOptions(game.players,c,i));if(has(game.players,c,i,'mask')&&!c.fighters[i].uses.mask)html+=select('mask','Anuncio de Máscara para la siguiente ronda',COMMON_ACTIONS.map(id=>get('abilities',id)));if(has(game.players,c,i,'arsenal'))html+=select('weapon','Arma activa esta ronda',[...new Set([game.players[i].build.equipment.weapon,b.talentConfig?.secondaryWeapon??'azure_sword'])].map(id=>get('items',id)));return html?`<div class="combat-decisions">${html}</div>`:'';}
root.addEventListener('change',event=>{const el=event.target;if(el.id==='talent-tier'){talentTier=el.value;render();}else if(el.id==='talent-search'){talentSearch=el.value;render();}else if(el.dataset?.decision){if(el.value)decisions[el.dataset.decision]=el.value;else delete decisions[el.dataset.decision];render();}else if(el.dataset?.config)perform(()=>command('configure',{key:el.dataset.config,id:el.value}));});
root.addEventListener('keydown',event=>{if(event.target.id==='talent-search'&&event.key==='Enter'){event.preventDefault();talentSearch=event.target.value;render();}});

render();if(session)poll();setInterval(poll,2500);
