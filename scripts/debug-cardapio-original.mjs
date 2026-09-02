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
    console.log('[PROBE]' + JSON.stringify({ label, path, method, status:r.status, message:data?.message }));
    return data;
  } catch (e) {
    console.log('[PROBE_ERROR]' + JSON.stringify({ label, path, method, message:String(e) }));
  }
}

function dumpStore(tag, store) {
  if (!store?.groups) return;
  const groups = store.groups.map(g => ({
    id:g.id, name:g.name, description:g.description, order:g.order, image:g.image,
    is_invisible:g.is_invisible, always_display:g.always_display, start_time:g.start_time, end_time:g.end_time,
    itens:(g.itens||[]).map(i=>({
      id:i.id, name:i.name, description:i.description, price1:i.price1, from_price:i.from_price, price2:i.price2,
      strike_price:i.strike_price, image:i.image, image_2:i.image_2, image_3:i.image_3, image_4:i.image_4, image_5:i.image_5,
      order:i.order, is_invisible:i.is_invisible, available:i.available, active:i.active, start_time:i.start_time, end_time:i.end_time,
      sun:i.sun,mon:i.mon,tue:i.tue,wed:i.wed,thu:i.thu,fri:i.fri,sat:i.sat,
      complementos:(i.complementos||[]).map(c=>({id:c.id,name:c.name,description:c.description,min:c.min,max:c.max,only_one:c.only_one,order:c.order,complements:(c.complements||[]).map(x=>({id:x.id,name:x.name,description:x.description,price:x.price,order:x.order,active:x.active,image:x.image}))}))
    }))
  }));
  console.log('['+tag+']'+JSON.stringify({
    store:{id:store.id,name:store.name,address:store.address,reference:store.reference,city:store.city,state:store.state,zipcode:store.zipcode,phone:store.phone,whatsapp:store.whatsapp,minimum_order:store.minimum_order,take_out:store.take_out,wait_time:store.wait_time,payment_methods:store.payment_methods,times:store.times,fees:store.fees},
    groupCount:groups.length,itemCount:groups.reduce((n,g)=>n+g.itens.length,0),groups
  }));
}

const store = await probe('bySlug', `stores/by-slug/${SLUG}`);
dumpStore('FULL_CURRENT_MENU', store);
const all = await probe('filterAll', `stores/by-slug/${SLUG}?filterAll=true`);
dumpStore('FULL_FILTER_ALL', all);
await probe('excludedTrue', `stores/excluded/${STORE_ID}`, 'POST', {filterAll:true});
