import { content, get, options } from '../content/registry.js';
import { validateContent } from '../engine/content-validation.js';
import { RULES } from '../engine/config.js';
import { availableAbilities } from '../engine/build.js';
import { calculateStats } from '../engine/stats.js';
import { createGame, updatePlayerBuild, rollPlayerBuild, confirmPlayer, continuePreparation, submitAction, continueCombat, rematch } from '../engine/game-state.js';
import { loadGame, saveGame, clearGame } from '../engine/storage.js';
import { composeSprite } from './sprite-composer.js';

const root = document.querySelector('#app');
const validationErrors = validateContent();
const loaded = loadGame();
let game = loaded.state;
let error = validationErrors.length ? 'El contenido del juego contiene errores. Revisa la consola de desarrollo.' : loaded.error;
let warning = '';
let tab = 'origin';
let selectedAbility = null;
let debugOpen = false;
if (validationErrors.length) console.error('Carnalia content validation:', validationErrors);

const h = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const label = { hp: 'Vida', damage: 'Daño', defense: 'Defensa', speed: 'Velocidad', energy: 'Energía', resistance: 'Resistencia' };
const slotName = { weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio', relic: 'Reliquia' };
const emoji = { hp: '♥', damage: '◆', defense: '▣', speed: '➤', energy: '✦', resistance: '◈' };

function statGrid(build) {
  const stats = calculateStats(build);
  return `<div class="stat-grid">${RULES.statKeys.map(key => `<div class="stat"><span>${emoji[key]} ${label[key]}</span><strong>${stats[key]}</strong></div>`).join('')}</div>`;
}
function avatar(index, className = '') {
  return `<div class="avatar-shell ${className}"><div class="avatar-halo"></div><canvas class="sprite" data-sprite-player="${index}" width="48" height="64" role="img" aria-label="Personaje de ${h(game.players[index].name)}"></canvas><div class="avatar-ground"></div></div>`;
}
function chosenName(kind, id) { return get(kind, id)?.name ?? 'Ninguno'; }
function buildInventory(build) {
  return `<div class="inventory-list">
    <span><b>Origen</b>${h(chosenName('races', build.raceId))}</span>
    <span><b>Clase</b>${h(chosenName('classes', build.classId))}</span>
    <span><b>Don</b>${h(chosenName('gifts', build.giftId))}</span>
    <span><b>Talentos</b>${build.talentIds.map(id => h(chosenName('talents', id))).join(' · ') || '—'}</span>
    ${RULES.slots.map(slot => `<span><b>${slotName[slot]}</b>${h(chosenName('items', build.equipment[slot]))}</span>`).join('')}
  </div>`;
}
function choice(kind, entries, selected, type, detail = '') {
  return `<div class="choices">${entries.map(entry => `<button type="button" class="choice ${selected(entry) ? 'chosen' : ''}" data-action="choice" data-type="${type}" data-id="${h(entry.id)}" ${detail ? `data-slot="${detail}"` : ''} aria-pressed="${selected(entry)}"><span class="choice-title">${h(entry.name)}</span><small>${h(entry.description)}</small><span class="choice-stats">${Object.entries(entry.stats ?? {}).map(([key, value]) => `${value > 0 ? '+' : ''}${value} ${label[key]}`).join(' · ') || (kind === 'talents' ? 'Efecto pasivo' : '')}</span></button>`).join('')}</div>`;
}
function equipmentPane(build) {
  return RULES.slots.map(slot => `<section class="equip-group"><h3>${slotName[slot]}</h3><div class="choices compact"><button type="button" class="choice ${build.equipment[slot] === null ? 'chosen' : ''}" data-action="choice" data-type="equip" data-slot="${slot}" data-id="" aria-pressed="${build.equipment[slot] === null}"><span class="choice-title">Sin equipar</span></button>${options('items', item => item.slot === slot).map(item => `<button type="button" class="choice ${build.equipment[slot] === item.id ? 'chosen' : ''}" data-action="choice" data-type="equip" data-slot="${slot}" data-id="${item.id}" aria-pressed="${build.equipment[slot] === item.id}"><span class="choice-title">${h(item.name)}</span><small>${h(item.description)}</small><span class="choice-stats">${Object.entries(item.stats).map(([key, value]) => `${value > 0 ? '+' : ''}${value} ${label[key]}`).join(' · ')}</span></button>`).join('')}</div></section>`).join('');
}
const lookOptions = {
  skin: [['warm', 'Cálida'], ['light', 'Clara'], ['deep', 'Oscura']],
  hair: [['dark', 'Oscuro'], ['silver', 'Plateado'], ['flame', 'Cobrizo']],
  style: [['short', 'Corto'], ['long', 'Largo']],
  cape: [['none', 'Sin capa'], ['red', 'Carmesí'], ['blue', 'Azul']]
};
function appearancePane(build) {
  return `<p class="panel-intro">Cada cambio se dibuja sobre el personaje al instante.</p>${Object.entries(lookOptions).map(([key, entries]) => `<section class="look-group"><h3>${{ skin: 'Piel', hair: 'Cabello', style: 'Peinado', cape: 'Capa' }[key]}</h3><div class="chips">${entries.map(([value, name]) => `<button type="button" class="chip ${build.appearance[key] === value ? 'chosen' : ''}" data-action="appearance" data-key="${key}" data-value="${value}" aria-pressed="${build.appearance[key] === value}">${name}</button>`).join('')}</div></section>`).join('')}`;
}
function selectionPane(build) {
  if (tab === 'origin') return `<p class="panel-intro">Elige tu linaje, oficio y don. Las cifras se recalculan al instante.</p><h3>Linaje</h3>${choice('races', content.races, e => e.id === build.raceId, 'race')}<h3>Oficio</h3>${choice('classes', content.classes, e => e.id === build.classId, 'class')}<h3>Don</h3>${choice('gifts', content.gifts, e => e.id === build.giftId, 'gift')}`;
  if (tab === 'talents') return `<p class="panel-intro">Elige hasta dos talentos. Pulsa uno otra vez para retirarlo.</p>${choice('talents', content.talents, e => build.talentIds.includes(e.id), 'talent')}`;
  if (tab === 'equipment') return `<p class="panel-intro">El equipo modifica las estadísticas y las capas del personaje.</p>${equipmentPane(build)}`;
  return appearancePane(build);
}

function shell(step, body) {
  return `<div class="app-shell"><header class="topbar"><div class="brand"><span class="brand-symbol">✧</span><span>CARNALIA</span><small>ARENA DE DUELOS</small></div><div class="top-right"><span class="edition">BASE · v0.1</span>${game ? `<button class="quiet-link" data-action="abandon">Abandonar partida</button>` : ''}</div></header>${step ? `<div class="phase-line"><span class="${step === 1 ? 'active' : ''}">01 / PREPARAR</span><span class="${step === 2 ? 'active' : ''}">02 / COMBATIR</span><span class="${step === 3 ? 'active' : ''}">03 / RESULTADO</span></div>` : ''}${error ? `<div class="alert" role="alert">${h(error)}</div>` : ''}${warning ? `<div class="notice" role="status">${h(warning)}</div>` : ''}${body}<footer class="footer">CARNALIA <span>◇</span> DOS VOLUNTADES · UNA ARENA <span>◇</span> DUELO LOCAL</footer></div>`;
}
function landing() {
  return shell(0, `<main class="landing"><div class="landing-copy"><span class="eyebrow">EL UMBRAL ESTÁ ABIERTO</span><h1>Forja tu<br><em>destino.</em></h1><p>Dos combatientes. Builds únicas. Decisiones ocultas. Entra en la arena y demuestra quién construyó la leyenda más fuerte.</p><div class="feature-line"><span>✦ PREPARA</span><span>◆ DECIDE</span><span>⚔ COMBATE</span></div></div><form id="new-game" class="start-card"><span class="card-kicker">NUEVO DUELO / 001</span><h2>Entra en Carnalia</h2><p>Comparte este dispositivo: cada jugador preparará su héroe y elegirá sus acciones por separado.</p><label>PRIMER COMBATIENTE<input name="player1" minlength="2" maxlength="18" placeholder="Nombre del jugador 1" required autocomplete="off"></label><label>SEGUNDO COMBATIENTE<input name="player2" minlength="2" maxlength="18" placeholder="Nombre del jugador 2" required autocomplete="off"></label><fieldset><legend>MODO DE PREPARACIÓN</legend><label class="mode-choice"><input type="radio" name="mode" value="selection" checked><span><b>Selección</b><small>Diseña cada detalle de tu build.</small></span></label><label class="mode-choice"><input type="radio" name="mode" value="chance"><span><b>Azar</b><small>Hasta tres tiradas para tentar tu destino.</small></span></label></fieldset><button type="submit" class="primary full">CREAR PARTIDA <span>↗</span></button><span class="helper">La partida se guarda en este navegador.</span></form></main>`);
}
function handoff(kind, name) {
  return shell(kind === 'prep' ? 1 : 2, `<main class="handoff"><div class="seal">✧</div><span class="eyebrow">TURNO RESERVADO</span><h1>Entrega la arena<br>a <em>${h(name)}</em></h1><p>Deja que el siguiente jugador tome el dispositivo antes de continuar.</p><button class="primary" data-action="continue-${kind}">SOY ${h(name).toUpperCase()} · CONTINUAR →</button></main>`);
}
function preparation() {
  const { preparation: prep, mode } = game;
  if (prep.handoff) return handoff('prep', game.players[1].name);
  const index = prep.index;
  const player = game.players[index];
  const build = player.build;
  const chance = mode === 'chance';
  const canConfirm = !chance || prep.hasRolled[index];
  const tabs = [['origin', 'Origen'], ['talents', 'Talentos'], ['equipment', 'Equipo'], ['appearance', 'Apariencia']];
  const editor = chance ? `<div class="editor-head"><span class="eyebrow">EL DESTINO DECIDE</span><h2>La tirada de ${h(player.name)}</h2><p>La raza, clase, talentos y equipo son aleatorios. Puedes cambiar la apariencia.</p></div><div class="roll-area"><button class="primary" data-action="roll" ${prep.rollsRemaining[index] === 0 ? 'disabled' : ''}>✦ ${prep.hasRolled[index] ? 'VOLVER A TIRAR' : 'TIRAR BUILD'} <span>(${prep.rollsRemaining[index]} restantes)</span></button><small>Confirmar conserva el resultado actual.</small></div>${prep.hasRolled[index] ? buildInventory(build) : '<div class="empty-roll">✧<br>Tu destino aún no ha sido revelado.</div>'}<div class="divider"></div><h3>PERSONALIZACIÓN</h3>${appearancePane(build)}` : `<div class="editor-head"><span class="eyebrow">CONSTRUYE TU LEYENDA</span><h2>Elige tu camino</h2><p>Cada elección transforma tus estadísticas y tu silueta.</p></div><div class="tabs" role="tablist" aria-label="Opciones de preparación">${tabs.map(([key, title]) => `<button type="button" role="tab" aria-selected="${tab === key}" class="${tab === key ? 'active' : ''}" data-action="tab" data-tab="${key}">${title}</button>`).join('')}</div><div class="tab-content" role="tabpanel">${selectionPane(build)}</div>`;
  return shell(1, `<main class="preparation"><div class="section-heading"><div><span class="eyebrow">PREPARACIÓN · ${chance ? 'AZAR' : 'SELECCIÓN'}</span><h1>${h(player.name)}, <em>forja tu héroe.</em></h1></div><span class="counter">JUGADOR ${index + 1} / 2</span></div><div class="prep-grid"><aside class="character-panel"><div class="visual-scene">${avatar(index)}<span class="scene-caption">VISTA DEL COMBATIENTE</span></div><div class="character-details"><span class="eyebrow">${h(chosenName('races', build.raceId))} / ${h(chosenName('classes', build.classId))}</span><h2>${h(player.name)}</h2>${statGrid(build)}<div class="selected-gear"><span>ARMA EQUIPADA</span><b>${h(chosenName('items', build.equipment.weapon))}</b></div></div></aside><section class="editor-panel">${editor}<div class="editor-footer"><span>${chance ? 'Lo que salga, se lleva a la arena.' : `${build.talentIds.length} / ${RULES.maxTalents} talentos elegidos`}</span><button class="primary" data-action="confirm-build" ${canConfirm ? '' : 'disabled'}>CONFIRMAR BUILD →</button></div></section></div></main>`);
}
function fighterCard(index) {
  const player = game.players[index];
  const fighter = game.combat.fighters[index];
  const max = calculateStats(player.build);
  const hpPercent = Math.max(0, fighter.hp / max.hp * 100);
  const enPercent = Math.max(0, fighter.energy / max.energy * 100);
  return `<div class="fighter-card"><div class="fighter-name"><span>JUGADOR ${index + 1}</span><strong>${h(player.name)}</strong></div><div class="meter-label"><span>VIDA</span><b>${fighter.hp} / ${max.hp}</b></div><div class="meter"><i style="width:${hpPercent}%"></i></div><div class="meter-label"><span>ENERGÍA</span><b>${fighter.energy} / ${max.energy}</b></div><div class="meter energy"><i style="width:${enPercent}%"></i></div><div class="status-list">${fighter.statuses.length ? fighter.statuses.map(s => `<span title="${h(get('statuses', s.id).description)}">${h(get('statuses', s.id).name)} · ${s.duration}</span>`).join('') : '<span class="neutral">Sin estados</span>'}</div></div>`;
}
function combatView() {
  const combat = game.combat;
  if (combat.handoff) return handoff('combat', game.players[1].name);
  const index = combat.selectionIndex;
  const player = game.players[index];
  const fighter = combat.fighters[index];
  const abilities = availableAbilities(player.build).map(id => get('abilities', id));
  const chosen = abilities.find(a => a.id === selectedAbility);
  return shell(2, `<main class="combat"><div class="section-heading"><div><span class="eyebrow">LA ARENA / RONDA ${String(combat.round).padStart(2, '0')}</span><h1>El duelo <em>comienza.</em></h1></div><span class="counter">DECIDE ${h(player.name).toUpperCase()}</span></div><div class="arena"><div class="arena-sky"><span class="arena-moon"></span><span class="tower tower-a"></span><span class="tower tower-b"></span><span class="tower tower-c"></span></div><div class="arena-fighters"><div class="combatant">${avatar(0, 'fighter-sprite')}<span>${h(game.players[0].name)}</span></div><div class="arena-center">✧<small>VS</small></div><div class="combatant">${avatar(1, 'fighter-sprite')}<span>${h(game.players[1].name)}</span></div></div><div class="arena-floor"></div></div><div class="fighter-grid">${fighterCard(0)}${fighterCard(1)}</div><div class="combat-bottom"><section class="action-panel"><span class="eyebrow">ACCIÓN EN SECRETO</span><h2>${h(player.name)}, elige tu movimiento</h2><div class="abilities">${abilities.map(a => `<button class="ability ${selectedAbility === a.id ? 'chosen' : ''}" data-action="ability" data-id="${a.id}" ${fighter.energy < a.cost ? 'disabled' : ''} aria-pressed="${selectedAbility === a.id}"><span><b>${h(a.name)}</b><em>${a.cost ? `${a.cost} ✦` : 'GRATIS'}</em></span><small>${h(a.description)}</small></button>`).join('')}</div><div class="action-footer"><span>${chosen ? h(chosen.description) : 'Tu elección se ocultará al rival hasta resolver la ronda.'}</span><button class="primary" data-action="confirm-action" ${chosen ? '' : 'disabled'}>CONFIRMAR ACCIÓN →</button></div></section><aside class="battle-log"><span class="eyebrow">CRÓNICA DE COMBATE</span><h3>Última ronda</h3>${combat.lastEvents.length ? `<ol>${combat.lastEvents.map(line => `<li>${h(line)}</li>`).join('')}</ol>` : '<p>La arena espera el primer movimiento.</p>'}</aside></div></main>`);
}
function resultView() {
  const winner = game.players.find(p => p.id === game.result.winnerId);
  return shell(3, `<main class="result"><span class="eyebrow">DUELO COMPLETADO · ${game.result.rounds} RONDAS</span><div class="result-emblem">✧</div><h1>${winner ? `<em>${h(winner.name)}</em><br>conquista la arena.` : 'La arena dicta<br><em>un empate.</em>'}</h1><p>Dos builds se enfrentaron. Una historia queda escrita.</p><div class="result-fighters">${game.players.map((player, index) => `<div class="result-fighter ${winner?.id === player.id ? 'victor' : ''}">${avatar(index)}<b>${h(player.name)}</b><span>${winner?.id === player.id ? 'VICTORIA' : (winner ? 'DERROTA' : 'EMPATE')}</span></div>`).join('')}</div><div class="result-actions"><button class="primary" data-action="rematch">JUGAR OTRA VEZ →</button><button class="secondary" data-action="new-game">NUEVOS JUGADORES</button></div><details class="chronicle"><summary>Ver crónica del duelo (${game.combat.history.length} rondas)</summary>${game.combat.history.map(round => `<div><b>RONDA ${round.round}</b><p>${round.events.map(h).join('<br>')}</p></div>`).join('')}</details></main>`);
}

function render() {
  if (validationErrors.length) root.innerHTML = shell(0, '<main class="fatal"><h1>No se pudo iniciar Carnalia.</h1><p>Corrige los errores de contenido antes de jugar.</p></main>');
  else root.innerHTML = !game ? landing() : game.phase === 'preparation' ? preparation() : game.phase === 'combat' ? combatView() : resultView();
  for (const canvas of root.querySelectorAll('[data-sprite-player]')) {
    const index = Number(canvas.dataset.spritePlayer);
    composeSprite(canvas, game.players[index].build, index ? 'left' : 'right');
  }
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    const debug = document.createElement('details');
    debug.className = 'debug-drawer'; debug.open = debugOpen;
    debug.innerHTML = `<summary>Estado de desarrollo</summary><pre>${h(JSON.stringify(game, null, 2))}</pre>`;
    debug.addEventListener('toggle', () => { debugOpen = debug.open; });
    root.querySelector('.app-shell')?.append(debug);
  }
}
function transition(fn) {
  try {
    const newGame = fn();
    if (newGame !== undefined) {
      game = newGame;
      try { saveGame(game); warning = ''; }
      catch (e) { console.warn('Carnalia save unavailable:', e); warning = 'El navegador no pudo guardar esta partida. Puedes seguir jugando, pero se perderá al recargar.'; }
    }
    error = null;
    render();
  } catch (e) {
    if (e.name === 'GameError') error = e.message;
    else { console.error(e); error = 'Algo salió mal. Vuelve a intentar la acción.'; }
    render();
  }
}

root.addEventListener('submit', event => {
  if (event.target.id !== 'new-game') return;
  event.preventDefault();
  const form = new FormData(event.target);
  transition(() => createGame([form.get('player1'), form.get('player2')], form.get('mode')));
});
root.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action } = button.dataset;
  if (action === 'abandon') {
    if (window.confirm('¿Abandonar esta partida y borrar su progreso?')) { clearGame(); game = null; selectedAbility = null; warning = ''; error = null; render(); }
    return;
  }
  if (action === 'new-game') { clearGame(); game = null; selectedAbility = null; error = null; render(); return; }
  if (action === 'tab') { tab = button.dataset.tab; render(); return; }
  if (action === 'ability') { selectedAbility = button.dataset.id; render(); return; }
  if (action === 'choice') {
    const { type, id, slot } = button.dataset;
    transition(() => updatePlayerBuild(game, type === 'equip' ? { type, slot, id: id || null } : { type, id }));
  } else if (action === 'appearance') transition(() => updatePlayerBuild(game, { type: 'appearance', key: button.dataset.key, value: button.dataset.value }));
  else if (action === 'roll') transition(() => rollPlayerBuild(game));
  else if (action === 'confirm-build') transition(() => { tab = 'origin'; return confirmPlayer(game); });
  else if (action === 'continue-prep') transition(() => continuePreparation(game));
  else if (action === 'continue-combat') transition(() => continueCombat(game));
  else if (action === 'confirm-action') transition(() => {
    const next = submitAction(game, selectedAbility);
    selectedAbility = null;
    return next;
  });
  else if (action === 'rematch') transition(() => rematch(game));
});

render();
