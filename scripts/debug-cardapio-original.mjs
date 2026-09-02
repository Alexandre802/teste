const BASE = 'https://app.instadelivery.com.br/api/';
const SLUG = 'comidacaseiradamarciacosta';
const STORE_ID = 170308;
const UA = { accept: 'application/json,text/html,application/javascript,*/*', 'content-type':'application/json', 'user-agent': 'Mozilla/5.0' };

async function probe(label, path, method='GET', body) {
  try {
    const r = await fetch(BASE + path, { headers: UA, method, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : null);
    const sample = arr ? arr.slice(0,10).map(x => ({ id:x?.id, name:x?.name, menu_group_id:x?.menu_group_id, is_invisible:x?.is_invisible, deleted_at:x?.deleted_at, order:x?.order })) : null;
    console.log('[PROBE]' + JSON.stringify({ label, path, method, body, status:r.status, type:Array.isArray(data)?'array':typeof data, keys:data && !Array.isArray(data)?Object.keys(data).slice(0,80):[], count:arr?.length ?? null, sample, data: data && JSON.stringify(data).length < 12000 ? data : undefined, text: data ? undefined : text.slice(0,1000) }));
    return data;
  } catch (e) {
    console.log('[PROBE_ERROR]' + JSON.stringify({ label, path, method, message:String(e) }));
  }
}

const store = await probe('bySlug', `stores/by-slug/${SLUG}`);
await probe('bySlugTable', `stores/by-slug/${SLUG}/table`);
for (const q of ['filterAll=true','filterAll=1','all=true','include_invisible=true','includeInvisible=true','show_all=true']) {
  const x = await probe('bySlugQuery:'+q, `stores/by-slug/${SLUG}?${q}`);
  if (x?.groups) console.log('[QUERY_GROUPS]'+JSON.stringify({q,count:x.groups.length,items:x.groups.reduce((n,g)=>n+(g.itens?.length||0),0),groups:x.groups.map(g=>({id:g.id,name:g.name,invisible:g.is_invisible,deleted:g.deleted_at,items:g.itens?.length||0}))}));
}
await probe('excludedTrue', `stores/excluded/${STORE_ID}`, 'POST', {filterAll:true});
await probe('excludedFalse', `stores/excluded/${STORE_ID}`, 'POST', {filterAll:false});
await probe('excludedEmpty', `stores/excluded/${STORE_ID}`, 'POST', {});
await probe('groupPath', `stores/group/${STORE_ID}`);
await probe('groupQuery', `stores/group?store_id=${STORE_ID}`);
await probe('itemPath', `stores/item/${STORE_ID}`);
await probe('itemQuery', `stores/item?store_id=${STORE_ID}`);
await probe('complementsPath', `stores/group-complements/${STORE_ID}`);
await probe('complementsQuery', `stores/group-complements?store_id=${STORE_ID}`);
await probe('cashierStore', `cashier/store/${STORE_ID}`);
await probe('internalStore', `stores/internal/${STORE_ID}`);

if (store?.groups) {
  console.log('[CURRENT_GROUPS]' + JSON.stringify(store.groups.map(g => ({id:g.id,name:g.name,is_invisible:g.is_invisible,always_display:g.always_display,start_time:g.start_time,end_time:g.end_time,itemCount:g.itens?.length||0}))));
}
