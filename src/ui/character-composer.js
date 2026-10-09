import { get } from '../content/registry.js';
import { raceLooks, classLooks, weaponLooks, armorLooks } from '../assets/appearance.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=(d,fill,stroke='none',width=2)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const circle=(x,y,r,fill,stroke='none',w=2)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
function emblem(symbol,x,y,c){
 const shapes={shield:'M-11-12H11V2Q8 12 0 16Q-8 12-11 2Z',star:'M0-15L4-4L15 0L4 4L0 15L-4 4L-15 0L-4-4Z',sun:'M0-17V-13M0 13V17M-17 0H-13M13 0H17M-12-12L-9-9M9 9L12 12M12-12L9-9M-9 9L-12 12',leaf:'M-12 12Q-15-12 12-14Q16 8-12 12ZM-10 10L8-9',cross:'M-4-15H4V-4H14V4H4V15H-4V4H-14V-4H-4Z',eye:'M-16 0Q0-15 16 0Q0 15-16 0ZM0-5V5',crescent:'M7-15A16 16 0 1 0 7 15A13 13 0 0 1 7-15Z',diamond:'M0-16L12 0L0 16L-12 0Z',crown:'M-15-10L-8 0L0-14L8 0L15-10L11 12H-11Z',arrow:'M0 16V-16M-8-8L0-16L8-8',tower:'M-12 14V-14H-6V-8H0V-14H6V-8H12V14ZM-4 14V4H4V14',hourglass:'M-11-15H11L7-8L-7 8L-11 15H11L7 8L-7-8Z',music:'M-3 8V-13L12-16V4M-3-7L12-10',flask:'M-5-15H5V-4L13 10Q14 15 8 15H-8Q-14 15-13 10L-5-4ZM-8 5H8',blades:'M-12-15L12 13M12-15L-12 13M-14 8L-7 15M7 15L14 8',spear:'M0 16V-7M0-17L6-7L0-3L-6-7Z',mirror:'M-9-13Q0-20 9-13V9Q0 16-9 9ZM0 13V19',anchor:'M0-13V13M-14 3Q-14 17 0 17Q14 17 14 3M-8-7H8',fang:'M-10-13L-6 14L0 6L6 14L10-13',fist:'M-12 12V-4L-7-9L-3-5V-15H2V-5L6-12L10-10V4L3 14Z',scythe:'M-7 17V-17Q14-18 15 0Q8-10-7-10',flame:'M0-17Q-1-7 8-3Q17 6 7 14Q-7 22-12 9Q-17 1-4-8Q-7 4 0 5Q5 0 0-17Z',skull:'M-12 2V-5Q0-21 12-5V2L6 6V13H-6V6ZM-6-3H-3M3-3H6',rapier:'M-9 17L9-17M-12 6L1 13',spiral:'M12 0Q12-15-3-12Q-18-8-12 7Q-3 19 9 9Q18-3 4-5Q-7-8-5 4Q0 11 5 3',gear:'M-5-15H5L7-8L14-6V5L8 8L5 15H-5L-7 8L-14 5V-6L-8-8Z'};
 return `<g transform="translate(${x} ${y})" opacity=".95">${path(shapes[symbol]??'M0-13V13M-13 0H13','none',c,2.4)}${['sun','circle','gear'].includes(symbol)?circle(0,0,7,'none',c):''}</g>`;
}
function ears(r){
 if(['sunelf','moonelf','drow','fae','goblin'].includes(r.shape))return path('M141 129L100 102L132 157Z M219 129L260 102L228 157Z',r.skin,'#252639',2);
 if(['siren','reptile'].includes(r.shape))return path('M137 123L112 111L124 143L136 161Z M223 123L248 111L236 143L224 161Z',r.skin,r.accent,2);
 return path('M140 128Q125 113 129 143Q132 158 142 150M220 128Q235 113 231 143Q228 158 218 150',r.skin,'#252639',2);
}
function raceBack(r){let s='';
 if(['angel','fae','dragon'].includes(r.shape)){
 const fill=r.shape==='angel'?'#e9e2d4':r.shape==='fae'?'#ada7d955':r.skin;
 s+=path('M147 236Q89 106 47 117Q40 180 101 247L54 217L88 292L141 309Z M213 236Q271 106 313 117Q320 180 259 247L306 217L272 292L219 309Z',fill,r.accent,2);
 s+=path('M59 140L125 253M53 163L115 264M68 198L109 277M301 140L235 253M307 163L245 264M292 198L251 277','none',r.accent,1.4);
 }
 if(['tiefling','dragon','reptile','chimera'].includes(r.shape))s+=path('M214 351Q314 368 280 293Q318 340 285 374Q256 394 207 373Z',r.skin,r.accent,2);
 return s;
}
function hair(r){
 if(r.shape==='machine')return path('M138 117V95L160 75H200L222 95V117L209 98H151Z','#3c4f65',r.accent,2);
 if(r.shape==='reptile'||r.shape==='dragon')return path('M146 100L153 76L165 96L180 61L195 96L207 76L214 100Z',r.hair,r.accent,2);
 return path('M136 137Q118 96 148 77Q180 49 213 78Q239 92 222 138L206 105L192 118L179 98L159 117L150 108Z',r.hair,'#222638',2)+path('M148 87Q167 72 189 79','none',r.accent,2);
}
function raceFace(r){let s='';const t=r.shape;
 if(['tiefling','chimera','dragon'].includes(t))s+=path('M146 95Q118 82 129 47Q136 69 156 78Z M214 95Q242 82 231 47Q224 69 204 78Z',t==='dragon'?r.accent:'#554156',r.accent,2);
 if(t==='wolf')s+=path('M145 94L139 51L163 80Z M215 94L221 51L197 80Z',r.hair,r.accent,2);
 if(t==='angel')s+=`<ellipse cx="180" cy="55" rx="36" ry="10" fill="none" stroke="${r.accent}" stroke-width="4"/>`;
 if(t==='sunelf')s+=circle(180,99,6,r.accent)+path('M174 104L180 113L186 104','none',r.accent);
 if(t==='moonelf')s+=path('M183 93A9 9 0 1 0 183 109A7 7 0 0 1 183 93Z',r.accent);
 if(t==='ember')s+=path('M145 149L154 139L151 126M205 127L211 143L219 152M175 160L180 148L187 154','none',r.accent,2.4);
 if(t==='machine')s+=path('M147 108L158 117V160L147 166M213 108L202 117V160L213 166M171 102H189V108H171Z','none',r.accent,2)+circle(180,141,4,r.accent);
 if(t==='orc')s+=path('M165 165L164 146L175 167M195 165L196 146L185 167','#f1ddbb');
 if(t==='vampire')s+=path('M170 161L172 171L176 162M184 162L188 171L190 161','#f3e6df');
 if(t==='dwarf')s+=path('M144 144Q150 169 180 166Q210 169 216 144L211 183L193 198L180 203L167 198L149 183Z',r.hair,'#222638',2)+path('M165 174L168 195M195 174L192 195','none',r.accent,2);
 if(t==='giant')s+=path('M150 113L169 119M191 119L210 113M149 158L155 165M206 158L201 165','none','#596070',5);
 if(t==='wolf')s+=path('M144 143L158 151L164 144M216 143L202 151L196 144','none',r.hair,3);
 if(['dragon','reptile','chimera'].includes(t))s+=path('M146 113L151 118L156 113M204 113L209 118L214 113M176 101L180 107L184 101M173 173L180 179L187 173','none',r.accent,2);
 if(t==='siren')s+=path('M149 150L163 148M197 148L211 150','none',r.accent,2)+circle(180,100,5,r.accent);
 if(t==='fae')s+=circle(180,99,4,r.accent)+circle(153,143,2,r.accent)+circle(207,143,2,r.accent);
 if(t==='drow')s+=path('M171 95L180 105L189 95M150 141L158 147M210 141L202 147','none',r.accent,2);
 if(t==='ghost')s+=path('M143 161Q151 190 163 178Q180 202 196 178Q208 189 217 161','none',r.accent,3);
 if(t==='goblin')s+=path('M171 129L176 149L188 146','none','#4f7857',4);
 return s;
}
function costume(c){let s=path('M137 205Q180 191 223 205L247 379Q180 404 113 379Z',c.main,'#202337',3);
 const cut=c.cut;
 if(cut==='robe')s+=path('M136 211L147 372L117 415H243L213 372L224 211L203 247L180 269L157 247Z',c.main,c.trim,2)+path('M158 248L180 373L202 248M180 273V401','none',c.trim,3);
 if(cut==='coat')s+=path('M138 208L111 245L120 405L160 385L175 258L148 229Z M222 208L249 245L240 405L200 385L185 258L212 229Z',c.main,c.trim,2)+path('M140 209L164 222L156 263L141 248M220 209L196 222L204 263L219 248',c.trim);
 if(cut==='hood')s+=path('M140 210L117 245L117 393L164 413L179 264L196 413L243 393L243 245L220 210L196 237L180 247L164 237Z',c.main,c.trim,2)+path('M131 114Q119 174 140 212L158 224Q140 185 149 159M229 114Q241 174 220 212L202 224Q220 185 211 159',c.main,c.trim,2);
 if(cut==='fur')s+=path('M143 209L121 198L116 211L98 220L116 230L112 246L131 242L135 259L155 240L180 250L205 240L225 259L229 242L248 246L244 230L262 220L244 211L239 198L217 209Z',c.trim,'#34313c',2)+path('M158 254L180 272L202 254','none',c.trim,5);
 if(cut==='wrap')s+=path('M138 211L209 277L216 311L143 238Z',c.trim,'#282939',2)+path('M218 207L142 281L145 309L220 238Z',c.main,c.trim,2)+path('M128 316L232 307L234 328L126 334Z',c.trim);
 if(cut==='plate')s+=path('M126 215L105 210L87 230L105 259L136 253Z M234 215L255 210L273 230L255 259L224 253Z',c.main,c.trim,3)+path('M155 212L180 232L205 212L224 240L208 302L180 325L152 302L136 240Z',c.main,c.trim,2)+path('M180 232V315M143 247L177 261M217 247L183 261','none',c.trim,2);
 s+=path('M130 334Q180 344 230 334L230 351Q180 361 130 351Z','#332b3c',c.trim,1)+emblem(c.symbol,180,345,c.trim);
 return s;
}
function armor(a){if(!a)return '';let s='';
 if(a.cut==='mantle'||a.cut==='silk')s=path('M132 243L151 236L167 302L145 332L127 315Z M228 243L209 236L193 302L215 332L233 315Z',a.main,a.trim,2)+path('M144 262L158 301M216 262L202 301','none',a.trim,2);
 else s=path('M147 245L180 260L213 245L222 287L202 323H158L138 287Z',a.main,a.trim,2)+path('M180 266V315M146 279L180 287L214 279','none',a.trim,2);
 if(a.cut==='heavy')s+=path('M109 235L124 259L100 278L80 250Z M251 235L236 259L260 278L280 250Z',a.main,a.trim,3);
 if(a.cut==='leather')s+=path('M149 250L211 318M211 250L149 318','none',a.trim,4);
 return s;
}
function weapon(w){if(!w)return '';let s='';const col=w.metal,shade=w.shade,a=w.accent;
 // The grip is always at (294, 302), so every weapon attaches to the same hand.
 if(w.shape==='staff'||w.shape==='crystal'){
 s+=path('M-4-184H4V82H-4Z',col,shade,2)+path('M-7-53H7M-7-43H7M-7-33H7','none',a,3);
 if(w.shape==='staff')s+=path('M0-184Q-29-200-15-229Q-20-209-2-214Q14-235 3-248Q37-222 16-195Z',a,shade,2)+circle(0,-216,8,'#fff3cf');
 else s+=path('M0-253L21-222L0-187L-21-222Z',a,shade,2)+path('M0-253V-187M-21-222H21','none','#eaffff',2)+path('M-17-188Q0-170 17-188','none',a,4);
 }else if(w.shape==='axe')s+=path('M-5-144H5V65H-5Z','#79523f',shade,2)+path('M-5-151Q-34-172-46-145L-43-95Q-26-113-5-111Z M5-151Q34-172 46-145L43-95Q26-113 5-111Z',col,shade,3)+path('M-35-143L-33-119M35-143L33-119','none','#e4edf0',3);
 else{
 const tip=w.shape==='dagger'?-89:w.shape==='rapier'?-195:-174;
 if(w.shape==='serrated')s+=path('M0-189L13-161L4-155L15-145L5-136L15-124L5-114L15-102L5-91L13-75L7-17H-7L-10-163Z',col,shade,2);
 else if(w.shape==='flaming')s+=path('M0-190L14-156L9-131L18-106L9-86L13-62L7-17H-7L-13-62L-9-86L-18-106L-9-131L-14-156Z',col,shade,2)+path('M-15-55Q-33-94-16-130Q-25-92-8-106M14-83Q34-125 17-163Q24-127 7-138','none',a,5);
 else s+=path(`M0 ${tip}L${w.shape==='rapier'?4:13} ${tip+31}L7-17H-7L-${w.shape==='rapier'?4:13} ${tip+31}Z`,col,shade,2)+path(`M0 ${tip+9}V-27`,'none',a,2);
 s+=path('M-22-17Q0-27 22-17L18-9H-18Z',a,shade,2)+path('M-6-7H6V33H-6Z','#433044',shade,2)+circle(0,37,8,a,shade);
 if(w.shape==='rapier')s+=`<ellipse cx="4" cy="0" rx="21" ry="26" fill="none" stroke="${a}" stroke-width="3"/>`;
 if(w.shape==='dagger')s+=path('M11-77Q23-54 15-43Q10-34 4-43Q0-51 11-77Z',a)+circle(19,-24,3,a);
 }
 return `<g transform="translate(294 302) rotate(12)">${s}</g>`;
}
export function composeCharacter(build,{id='hero',name='Combatiente'}={}){
 const r=raceLooks[build.raceId]??raceLooks.human,c=classLooks[build.classId]??classLooks.vanguard;
 const w=weaponLooks[build.equipment.weapon],a=armorLooks[build.equipment.armor];
 const prefix='char-'+id.replace(/[^a-zA-Z0-9_-]/g,'');
 const race=get('races',build.raceId)?.name??'',cls=get('classes',build.classId)?.name??'',item=get('items',build.equipment.weapon)?.name??'Sin arma';
 const scale=r.shape==='giant'?1.06:r.shape==='dwarf'?.91:r.shape==='goblin'?.92:1;
 return `<svg class="character-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440" role="img" aria-labelledby="${prefix}-title"><title id="${prefix}-title">${esc(name)}: ${esc(race)}, ${esc(cls)}, ${esc(item)}</title><defs><radialGradient id="${prefix}-aura"><stop stop-color="${c.trim}" stop-opacity=".25"/><stop offset="1" stop-color="${c.trim}" stop-opacity="0"/></radialGradient><linearGradient id="${prefix}-skin" x2="1" y2="1"><stop stop-color="${r.skin}"/><stop offset="1" stop-color="${r.hair}"/></linearGradient></defs><ellipse cx="180" cy="228" rx="170" ry="195" fill="url(#${prefix}-aura)"/><g opacity=".35" stroke="${c.trim}" fill="none"><circle cx="180" cy="210" r="132"/><circle cx="180" cy="210" r="141" stroke-dasharray="2 12"/>${path('M180 62L188 75L180 88L172 75Z','none',c.trim)}</g><ellipse cx="180" cy="422" rx="99" ry="11" fill="#10121c" opacity=".6"/><g transform="translate(180 422) scale(${scale}) translate(-180 -422)" stroke-linecap="round"><g data-layer="race-back" data-visual="${esc(build.raceId)}">${raceBack(r)}</g><g data-layer="class" data-visual="${esc(build.classId)}">${path('M139 205L97 260L92 377L126 384L147 258M221 205L263 260L282 319L311 305L249 245',c.main,'#232537',3)}${costume(c)}</g><g data-layer="armor" data-visual="${esc(build.equipment.armor??'none')}">${armor(a)}</g><g data-layer="race" data-visual="${esc(build.raceId)}">${ears(r)}${path('M164 169V205L180 220L196 205V169Z',r.skin,'#222638',2)}${path('M140 111Q142 76 180 76Q218 76 220 111L215 155Q207 175 180 184Q153 175 145 155Z',`url(#${prefix}-skin)`,'#222638',2)}${hair(r)}${path('M153 130L169 131M191 131L207 130','none','#252538',4)}${circle(161,132,2.8,r.accent)}${circle(199,132,2.8,r.accent)}${path('M179 136L176 149L184 150M168 162Q180 167 192 162','none','#423645',2)}${raceFace(r)}</g><g data-layer="class-emblem">${emblem(c.symbol,180,233,c.trim)}</g><g data-layer="weapon" data-visual="${esc(build.equipment.weapon??'none')}">${weapon(w)}</g><g data-layer="hands">${path('M277 292Q291 281 303 294L304 309Q290 324 278 310Z',r.skin,'#222638',2)}${path('M92 370L117 370L116 390Q102 399 91 385Z',r.skin,'#222638',2)}${path('M285 296L300 299M284 302L300 305','none',r.hair,1.5)}</g></g></svg>`;
}
