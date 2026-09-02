const BASE='https://app.instadelivery.com.br/api/';
const SLUG='comidacaseiradamarciacosta';
const UA={accept:'application/json','user-agent':'Mozilla/5.0'};
const r=await fetch(BASE+`stores/by-slug/${SLUG}?filterAll=true`,{headers:UA});
const store=await r.json();
console.log('[STORE]'+JSON.stringify({id:store.id,name:store.name,address:store.address,city:store.city,state:store.state,phone:store.phone,whatsapp:store.whatsapp,minimum_order:store.minimum_order,take_out:store.take_out,wait_time:store.wait_time,payment_methods:store.payment_methods,times:store.times,fee_count:(store.fees||[]).length}));
for(const g of (store.groups||[])){
  console.log('[GROUP]'+JSON.stringify({id:g.id,name:g.name,order:g.order,image:g.image,count:(g.itens||[]).length}));
  for(const i of (g.itens||[])){
    console.log('[ITEM]'+JSON.stringify({id:i.id,group_id:g.id,group:g.name,name:i.name,description:i.description,price1:i.price1,from_price:i.from_price,price2:i.price2,strike_price:i.strike_price,image:i.image,order:i.order,is_invisible:i.is_invisible,start_time:i.start_time,end_time:i.end_time,days:{sun:i.sun,mon:i.mon,tue:i.tue,wed:i.wed,thu:i.thu,fri:i.fri,sat:i.sat}}));
    for(const c of (i.complementos||[])){
      console.log('[OPTION]'+JSON.stringify({item_id:i.id,id:c.id,name:c.name,description:c.description,min:c.min,max:c.max,only_one:c.only_one,order:c.order,choices:(c.complements||[]).map(x=>({id:x.id,name:x.name,description:x.description,price:x.price,order:x.order,active:x.active,image:x.image}))}));
    }
  }
}
for(const f of (store.fees||[])) console.log('[FEE]'+JSON.stringify({id:f.id,name:f.name,price:f.price,free_delivery:f.free_delivery,deleted_at:f.deleted_at,estimate:f.estimate}));
