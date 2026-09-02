const BASE = 'https://app.instadelivery.com.br/api/';
const SLUG = 'comidacaseiradamarciacosta';
const STORE_ID = 170308;
const UA = { accept: 'application/json,text/html,application/javascript,*/*', 'user-agent': 'Mozilla/5.0' };

async function probe(label, path) {
  try {
    const r = await fetch(BASE + path, { headers: UA });
    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : null);
    const sample = arr ? arr.slice(0,5).map(x => ({ id:x?.id, name:x?.name, menu_group_id:x?.menu_group_id, is_invisible:x?.is_invisible, deleted_at:x?.deleted_at, order:x?.order })) : null;
    console.log('[PROBE]' + JSON.stringify({ label, path, status:r.status, type:Array.isArray(data)?'array':typeof data, keys:data && !Array.isArray(data)?Object.keys(data).slice(0,40):[], count:arr?.length ?? null, sample, text: data ? undefined : text.slice(0,500) }));
    return data;
  } catch (e) {
    console.log('[PROBE_ERROR]' + JSON.stringify({ label, path, message:String(e) }));
  }
}

const store = await probe('bySlug', `stores/by-slug/${SLUG}`);
await probe('bySlugTable', `stores/by-slug/${SLUG}/table`);
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
