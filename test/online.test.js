import test from 'node:test';
import assert from 'node:assert/strict';
import { PersistentRooms } from '../src/server/persistent-rooms.js';
import { phaseOptions } from '../src/engine/preparation.js';
import { createSupabaseStore, StorageConflict } from '../src/server/supabase-store.js';
import { handle } from '../api/rooms.js';
function memory(){
 const data=new Map();return {data,async read(code){return data.get(code);},async write(code,text,etag){const old=data.get(code);if((old?.etag??null)!==etag)throw new StorageConflict();data.set(code,{text,etag:(etag??0)+1});}};
}
test('two independent clients prepare and resolve a round; duplicate and stale commands are safe',async()=>{
 const store=memory(), rooms=()=>new PersistentRooms(store);
 const a=await rooms().execute('create',null,null,{name:'Ale',mode:'selection'});
 const b=await rooms().execute('join',a.code,null,{name:'Juan'});
 await assert.rejects(rooms().execute('join',a.code,null,{name:'Otro'}),/dos jugadores/);
 await assert.rejects(rooms().execute('state',a.code,'bad'),/acceso/);
 let n=0;
 async function send(player,command,arg){
  const v=await rooms().execute('state',a.code,player.token);
  return rooms().execute('command',a.code,player.token,{requestId:String(++n),revision:v.state.revision,round:v.state.combat?.round,command,arg});
 }
 for(const p of [a,b]){
  for(let i=0;i<8;i++){
   const v=await rooms().execute('state',a.code,p.token);
   await send(p,'choose',phaseOptions(v.state,p.index)[0].id);await send(p,'advance');
  }
  await send(p,'ready');
 }
 let view=await send(a,'action',{abilityId:'strike',choices:{}});
 assert.equal(view.state.phase,'combat');
 const rival=await rooms().execute('state',a.code,b.token);
 assert.deepEqual(rival.state.combat.pending[0],{confirmed:true});
 const request={requestId:'second-action',revision:rival.state.revision,round:rival.state.combat.round,command:'action',arg:{abilityId:'strike',choices:{}}};
 view=await rooms().execute('command',a.code,b.token,request);
 assert.equal(view.state.combat.round,2);
 const duplicate=await rooms().execute('command',a.code,b.token,request);
 assert.equal(duplicate.state.revision,view.state.revision);
 await assert.rejects(rooms().execute('command',a.code,b.token,{...request,requestId:'stale'}),e=>e.code==='STALE_STATE');
});
test('Supabase compare-and-swap rejects updates that matched no row',async()=>{
 let observed;
 const store=createSupabaseStore({url:'https://example.supabase.co',key:'sb_secret_test',fetcher:async(u,o)=>{observed={url:u,options:o};return new Response('[]');}});
 await assert.rejects(store.write('ABCDEF',JSON.stringify({touched:Date.now()}),4),StorageConflict);
 assert.equal(observed.url.searchParams.get('version'),'eq.4');
 assert.equal(JSON.parse(observed.options.body).version,5);
 assert.equal(observed.options.headers.Authorization,undefined);
});
test('HTTP validates origins, methods, JSON, size, and room authentication',async()=>{
 const store=memory();
 const call=(operation,method='POST',body='{}',headers={})=>handle(new Request('https://game.test/api/rooms?operation='+operation,{method,body:method==='GET'?undefined:body,headers}),()=>store);
 assert.equal((await call('create','GET')).status,405);
 assert.equal((await call('create','POST','{}',{origin:'https://evil.test'})).status,403);
 assert.equal((await call('create','POST','{')).status,400);
 assert.equal((await call('create','POST',' '.repeat(9000))).status,413);
 const created=await call('create','POST',JSON.stringify({name:'Ale',mode:'selection'}));
 assert.equal(created.status,200);
 assert.equal((await call('unknown')).status,404);
});
