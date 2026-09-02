const URL = 'https://app.instadelivery.com.br/api/stores/by-slug/comidacaseiradamarciacosta';
const response = await fetch(URL, { headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' } });
if (!response.ok) throw new Error(`InstaDelivery ${response.status}`);
const store = await response.json();
const groups = Array.isArray(store.groups) ? store.groups : [];
const items = groups.flatMap((g) => (Array.isArray(g.itens) ? g.itens.map((item) => ({ ...item, __group: { id: g.id, name: g.name, order: g.order } })) : []));
const complementGroups = items.flatMap((i) => Array.isArray(i.complementos) ? i.complementos : []);
console.log('[CARDAPIO_META]' + JSON.stringify({
  id: store.id, name: store.name, url: store.url, address: store.address, reference: store.reference,
  city: store.city, state: store.state, phone: store.phone, whatsapp: store.whatsapp,
  public_message: store.public_message, top_message: store.top_message, minimum_order: store.minimum_order,
  fee_type: store.fee_type, free_delivery: store.free_delivery, take_out: store.take_out,
  wait_time: store.wait_time, wait_time_takeaway: store.wait_time_takeaway,
  payment_methods: store.payment_methods, times: store.times,
  groupCount: groups.length, itemCount: items.length, complementGroupCount: complementGroups.length,
  itemKeys: items[0] ? Object.keys(items[0]) : [], complementGroupKeys: complementGroups[0] ? Object.keys(complementGroups[0]) : [],
}));
for (const g of groups) {
  console.log('[CARDAPIO_GRUPO]' + JSON.stringify({ id:g.id, name:g.name, description:g.description, order:g.order, start_time:g.start_time, end_time:g.end_time, image:g.image, itemCount:Array.isArray(g.itens)?g.itens.length:0 }));
}
for (const i of items) {
  const complementos = (Array.isArray(i.complementos) ? i.complementos : []).map((grupo) => ({
    id: grupo.id,
    name: grupo.name,
    description: grupo.description,
    min: grupo.min,
    max: grupo.max,
    only_one: grupo.only_one,
    order: grupo.order,
    complements: (Array.isArray(grupo.complements) ? grupo.complements : []).map((c) => ({ id:c.id, name:c.name, description:c.description, price:c.price, order:c.order, active:c.active, image:c.image })),
  }));
  console.log('[CARDAPIO_ITEM]' + JSON.stringify({
    group:i.__group,
    id:i.id,
    name:i.name,
    description:i.description,
    price1:i.price1,
    from_price:i.from_price,
    price2:i.price2,
    strike_price:i.strike_price,
    internal_id:i.internal_id,
    image:i.image,
    image_2:i.image_2,
    image_3:i.image_3,
    image_4:i.image_4,
    image_5:i.image_5,
    custom_tag:i.custom_tag,
    obs_placeholder:i.obs_placeholder,
    variations:i.variations,
    has_promotion:i.has_promotion,
    is_best_seller:i.is_best_seller,
    is_invisible:i.is_invisible,
    is_newest:i.is_newest,
    is_highlight:i.is_highlight,
    requires_schedule:i.requires_schedule,
    start_time:i.start_time,
    end_time:i.end_time,
    available:i.available,
    active:i.active,
    sunday:i.sunday,
    monday:i.monday,
    tuesday:i.tuesday,
    wednesday:i.wednesday,
    thursday:i.thursday,
    friday:i.friday,
    saturday:i.saturday,
    complementos,
  }));
}
