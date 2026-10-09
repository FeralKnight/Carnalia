import { PersistentRooms } from '../src/server/persistent-rooms.js';
import { createSupabaseStore, StorageConflict } from '../src/server/supabase-store.js';
const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
export async function handle(request,storeFactory=createSupabaseStore){
 try{
  const url=new URL(request.url);
  const operation=url.searchParams.get('operation')??url.pathname.split('/').pop();
  if(!['create','join','state','command'].includes(operation))return reply(404,{error:'Ruta desconocida.'});
  if(request.method!==(operation==='state'?'GET':'POST'))return reply(405,{error:'Método no permitido.'});
  const origin=request.headers.get('origin');
  if(origin&&new URL(origin).origin!==url.origin)return reply(403,{error:'Origen no permitido.'});
  let body;
  if(operation!=='state'){
   const text=await request.text();
   if(new TextEncoder().encode(text).length>8192)return reply(413,{error:'Solicitud demasiado grande.'});
   try{body=JSON.parse(text);}catch{return reply(400,{error:'Solicitud inválida.'});}
   if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,{error:'Solicitud inválida.'});
  }
  const rooms=new PersistentRooms(storeFactory());
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'');
  return reply(200,await rooms.execute(operation,url.searchParams.get('room'),token,body));
 }catch(error){
  if(error instanceof StorageConflict)return reply(409,{error:error.message,code:'STALE_STATE'});
  if(error.name==='GameError')return reply(error.code==='STALE_STATE'?409:400,{error:error.message,code:error.code});
  console.error('Carnalia rooms:',error.name);
  return reply(503,{error:'El servicio de salas no está disponible. Inténtalo de nuevo.',code:'SERVICE_UNAVAILABLE'});
 }
}
export const GET=request=>handle(request);
export const POST=request=>handle(request);
