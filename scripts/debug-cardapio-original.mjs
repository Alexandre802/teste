const BASE = 'https://app.instadelivery.com.br/api/';
const SLUG = 'comidacaseiradamarciacosta';
const UA = { accept: 'application/json', 'user-agent': 'Mozilla/5.0' };

async function get(path) {
  const r = await fetch(BASE + path, { headers: UA });
  const text = await r.text();
  let data=null; try { data=JSON.parse(text); } catch {}
  console.log('[HTTP]'+JSON.stringify({path,status:r.status}));
  return data;
}

function compact(store) {
  return {
    store:{id:store?.id,name:store?.name,address:store?.address,city:store?.city,state:store?.state,phone:store?.phone,whatsapp:store?.whatsapp,minimum_order:store?.minimum_order,take_out:store?.take_out,wait_time:store?.wait_time,payment_methods:store?.payment_methods,times:store?.times},
    groups:(store?.groups||[]).map(g=>({
      id:g.id,name:g.name,order:g.order,image:g.image,
      items:(g.itens||[]).map(i=>({id:i.id,name:i.name,description:i.description,price1:i.price1,from_price:i.from_price,price2:i.price2,image:i.image,order:i.order,is_invisible:i.is_invisible,start_time:i.start_time,end_time:i.end_time,complementos:(i.complementos||[]).map(c=>({id:c.id,name:c.name,min:c.min,max:c.max,choices:(c.complements||[]).map(x=>({id:x.id,name:x.name,price:x.price,active:x.active}))}))}))
    }))
  };
}

const normal=await get(`stores/by-slug/${SLUG}`);
const all=await get(`stores/by-slug/${SLUG}?filterAll=true`);
console.log('[NORMAL_COMPACT]'+JSON.stringify(compact(normal)));
console.log('[FILTER_ALL_COMPACT]'+JSON.stringify(compact(all)));
