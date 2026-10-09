// Server only: this key must never be copied into dist or browser code.
export class StorageConflict extends Error {
  constructor() { super('La partida cambió. Actualiza y vuelve a intentarlo.'); this.name='StorageConflict'; }
}
export function createSupabaseStore({url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY,fetcher=fetch}={}) {
  if(!url || !key) throw new Error('Supabase not configured');
  const endpoint=new URL('/rest/v1/carnalia_rooms',url);
  const headers={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};
  if(!key.startsWith('sb_secret_')) headers.Authorization=`Bearer ${key}`;
  async function request(method,params,body){
    const target=new URL(endpoint); for(const [k,v] of Object.entries(params))target.searchParams.set(k,v);
    const response=await fetcher(target,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
    if(response.status===409)throw new StorageConflict();
    if(!response.ok)throw new Error(`Supabase storage HTTP ${response.status}`);
    return response.status===204?[]:await response.json();
  }
  return {
    async read(code){
      const rows=await request('GET',{code:`eq.${code}`,select:'payload,version',expires_at:`gt.${new Date().toISOString()}`});
      return rows[0]?{text:JSON.stringify(rows[0].payload),etag:rows[0].version}:null;
    },
    async write(code,text,etag){
      const payload=JSON.parse(text);
      const data={payload,version:etag===null?1:Number(etag)+1,expires_at:new Date(payload.touched+6*3600*1000).toISOString()};
      if(etag===null){
        await request('DELETE',{expires_at:`lte.${new Date().toISOString()}`});
        await request('POST',{}, {code,...data});
      }else{
        const updated=await request('PATCH',{code:`eq.${code}`,version:`eq.${etag}`},data);
        if(!updated.length)throw new StorageConflict();
      }
    }
  };
}
