const URL = 'https://app.instadelivery.com.br/api/stores/by-slug/comidacaseiradamarciacosta';
const response = await fetch(URL, { headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' } });
if (!response.ok) throw new Error(`InstaDelivery ${response.status}`);
const store = await response.json();
const groups = Array.isArray(store.groups) ? store.groups : [];
const items = groups.flatMap((g) => Array.isArray(g.itens) ? g.itens : []);
const complementGroups = items.flatMap((i) => Array.isArray(i.complementos) ? i.complementos : []);
console.log('[CARDAPIO_META]' + JSON.stringify({
  id: store.id, name: store.name, url: store.url, address: store.address, reference: store.reference,
  city: store.city, state: store.state, phone: store.phone, whatsapp: store.whatsapp,
  public_message: store.public_message, top_message: store.top_message, minimum_order: store.minimum_order,
  fee_type: store.fee_type, free_delivery: store.free_delivery, take_out: store.take_out,
  wait_time: store.wait_time, wait_time_takeaway: store.wait_time_takeaway,
  payment_methods: store.payment_methods, times: store.times,
  groupCount: groups.length, itemCount: items.length, complementGroupCount: complementGroups.length,
}));
for (const g of groups) {
  console.log('[CARDAPIO_GRUPO]' + JSON.stringify({ id:g.id, name:g.name, description:g.description, order:g.order, start_time:g.start_time, end_time:g.end_time, image:g.image, itemCount:Array.isArray(g.itens)?g.itens.length:0 }));
}
