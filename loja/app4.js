function urlB64ToUint8(b){const p='='.repeat((4-b.length%4)%4),s=(b+p).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(s);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}

async function enableNotifications(){
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
  if(isIOS&&!standalone)throw new Error('No iPhone, primeiro adicione o MDcortes Store à Tela de Início e abra pelo ícone.');
  if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))throw new Error('Este navegador não suporta notificações push');
  const perm=await Notification.requestPermission();
  if(perm!=='granted')throw new Error('Permissão de notificação não foi concedida');
  const reg=await navigator.serviceWorker.ready;
  let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlB64ToUint8(VAPID)});
  const j=sub.toJSON();
  await rest('md_store_push_subscriptions?on_conflict=endpoint',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:session.user.id,endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,user_agent:navigator.userAgent})});
  await reg.showNotification('MDcortes Store',{body:'Lembretes ativados neste celular.',icon:'icon-192.png',badge:'icon-192.png',tag:'md-store-test'});
  toast('Notificações ativadas');
}

function withinActive(){
  const s=db.settings;if(!s)return false;
  const now=new Date(),parts=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':').map(Number),n=parts[0]*60+parts[1];
  const cv=t=>{const [h,m]=String(t).split(':').map(Number);return h*60+m},a=cv(s.active_start),b=cv(s.active_end);
  return a<=b?n>=a&&n<b:n>=a||n<b;
}

async function reminderCheck(){
  const s=db.settings;
  if(!s?.reminders_enabled||!withinActive())return;
  if($('#modal-root')?.children.length)return;
  const ts=[s.last_sale_at,s.last_stock_update_at,s.last_reminder_at,s.updated_at].filter(Boolean).map(x=>new Date(x).getTime());
  const last=ts.length?Math.max(...ts):Date.now(),due=(s.reminder_interval_minutes||120)*60000;
  if(Date.now()-last<due||Date.now()-lastReminderUI<60000)return;
  lastReminderUI=Date.now();
  try{
    await rest(`md_store_settings?user_id=eq.${session.user.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({last_reminder_at:new Date().toISOString()})});
    db.settings.last_reminder_at=new Date().toISOString();
  }catch{}
  modal({title:'Hora de conferir a loja',body:`<div class="alert"><div class="ico">✓</div><div><b>${esc(s.reminder_message)}</b><p>Se vendeu, registre agora. Se recebeu ou contou peças, atualize o estoque.</p></div></div><div class="grid2" style="margin-top:12px"><button type="button" class="submit" data-action="remind-sale">Registrar venda</button><button type="button" class="submit" style="background:#6d6559" data-action="remind-stock">Atualizar estoque</button></div>`});
}

function startReminderWatcher(){
  clearInterval(reminderTimer);
  reminderTimer=setInterval(reminderCheck,60000);
  setTimeout(reminderCheck,1500);
}

function restoreSearchFocus(id,pos){
  requestAnimationFrame(()=>{
    const n=$(id);
    if(!n)return;
    try{n.focus({preventScroll:true})}catch{n.focus()}
    try{n.setSelectionRange(pos,pos)}catch{}
  });
}

function bindSearch(id){
  const el=$(id);
  if(!el)return;
  el.oninput=e=>{
    search=e.target.value;
    const pos=e.target.selectionStart??search.length;
    clearTimeout(window.__mdSearchTimer);
    window.__mdSearchTimer=setTimeout(()=>{render();restoreSearchFocus(id,pos)},70);
  };
}

function bind(){
  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;search='';closeModal();render()});
  document.querySelectorAll('[data-subpage]').forEach(b=>b.onclick=()=>{page=b.dataset.subpage;search='';closeModal();render()});
  const lf=$('#login-form');
  if(lf)lf.onsubmit=async e=>{
    e.preventDefault();
    if(lf.dataset.busy==='1')return;
    lf.dataset.busy='1';
    const btn=lf.querySelector('.submit'),old=btn?.textContent;
    if(btn){btn.disabled=true;btn.textContent='Entrando...'}
    $('#login-error').textContent='';
    try{await login($('#login-email').value.trim(),$('#login-pass').value)}catch(err){$('#login-error').textContent=err.message}finally{if(lf.isConnected){lf.dataset.busy='0';if(btn){btn.disabled=false;btn.textContent=old}}}
  };
  bindSearch('#search-stock');
  bindSearch('#search-sale');
}

async function handleAction(e){
  const b=e.currentTarget,a=b?.dataset?.action;
  if(!a)return;
  const networkActions=new Set(['cancel-sale','toggle-reminders','notification-enable','archive-product']);
  if(networkActions.has(a)&&b.dataset.busy==='1')return;
  if(networkActions.has(a)){b.dataset.busy='1';b.disabled=true}
  try{
    if(a==='close-modal')return closeModal();
    if(a==='new-product')return productModal();
    if(a==='edit-product')return productModal(b.dataset.id);
    if(a==='add-cart'){
      const k=b.dataset.vid+'|'+b.dataset.size,c=cart.find(x=>x.variant_id+'|'+x.size===k),stock=db.inventory.find(i=>i.variant_id===b.dataset.vid&&i.size===b.dataset.size)?.quantity||0;
      if(c){if(c.quantity<stock)c.quantity++;else toast('Sem mais unidades em estoque')}else cart.push({variant_id:b.dataset.vid,size:b.dataset.size,quantity:1});
      return render();
    }
    if(a==='cart-minus'||a==='cart-plus'){
      const [vid,size]=b.dataset.key.split('|'),c=cart.find(x=>x.variant_id===vid&&x.size===size);if(!c)return;
      if(a==='cart-minus'){c.quantity--;if(c.quantity<=0)cart=cart.filter(x=>x!==c)}else{const stock=db.inventory.find(i=>i.variant_id===vid&&i.size===size)?.quantity||0;if(c.quantity<stock)c.quantity++;else toast('Limite do estoque atingido')}
      return render();
    }
    if(a==='checkout')return checkoutModal();
    if(a==='sale-detail')return saleDetailModal(b.dataset.id);
    if(a==='cancel-sale'){
      if(!confirm('Cancelar esta venda? As peças voltarão para o estoque.'))return;
      await rest('rpc/md_store_cancel_sale',{method:'POST',body:JSON.stringify({p_sale_id:b.dataset.id})});
      await load();closeModal();toast('Venda cancelada e estoque devolvido');return render();
    }
    if(a==='new-expense')return expenseModal();
    if(a==='new-supplier')return supplierModal();
    if(a==='reminder-settings')return reminderModal();
    if(a==='toggle-reminders'){
      await rest(`md_store_settings?user_id=eq.${session.user.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({reminders_enabled:!db.settings.reminders_enabled})});
      await load();return render();
    }
    if(a==='notification-enable'){await enableNotifications();return}
    if(a==='export')return exportCSV();
    if(a==='logout'){closeModal();return logout()}
    if(a==='archive-product'){
      if(!confirm('Arquivar este produto? O histórico será mantido.'))return;
      await rest(`md_store_products?id=eq.${b.dataset.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({archived:true})});
      await load();closeModal();toast('Produto arquivado');return render();
    }
    if(a==='remind-sale'){closeModal();page='sale';search='';return render()}
    if(a==='remind-stock'){closeModal();page='stock';search='';return render()}
  }catch(err){toast(err.message||'Não foi possível concluir')}
  finally{if(networkActions.has(a)&&b.isConnected){b.dataset.busy='0';b.disabled=false}}
}

function modal(content){
  const root=$('#modal-root');
  root.innerHTML=`<div class="modal-wrap" role="presentation"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(content.title)}"><div class="modal-head"><h2>${content.title}</h2><button type="button" class="x" data-action="close-modal" aria-label="Fechar">×</button></div>${content.body}</div></div>`;
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>{const x=root.querySelector('.x');if(x){try{x.focus({preventScroll:true})}catch{x.focus()}}});
}

function closeModal(){
  const root=$('#modal-root');
  if(root)root.innerHTML='';
  document.body.style.overflow='';
}

function setFormBusy(form,busy,label='Salvando...'){
  form.dataset.busy=busy?'1':'0';
  const btn=form.querySelector('button.submit,button.goldbtn,button[type="submit"]');
  if(!btn)return;
  if(busy){btn.dataset.oldText=btn.textContent;btn.disabled=true;btn.textContent=label}
  else{btn.disabled=false;if(btn.dataset.oldText){btn.textContent=btn.dataset.oldText;delete btn.dataset.oldText}}
}

async function runForm(form,label,task){
  if(form.dataset.busy==='1')return;
  setFormBusy(form,true,label);
  try{await task()}catch(err){toast(err.message||'Erro ao salvar')}finally{if(form.isConnected)setFormBusy(form,false)}
}

document.addEventListener('click',e=>{
  const action=e.target.closest?.('[data-action]');
  if(action){e.preventDefault();handleAction({currentTarget:action,target:e.target});return}
  if(e.target.classList?.contains('modal-wrap'))closeModal();
});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modal-root')?.children.length)closeModal()});

document.addEventListener('submit',e=>{
  const form=e.target,id=form.id;
  if(!['product-form','checkout-form','expense-form','supplier-form','reminder-form'].includes(id))return;
  e.preventDefault();
  if(id==='product-form')return runForm(form,'Salvando produto...',()=>saveProduct(form));
  if(id==='checkout-form')return runForm(form,'Finalizando...',()=>completeSale());
  if(id==='expense-form')return runForm(form,'Salvando...',async()=>{await rest('md_store_expenses',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:session.user.id,description:$('#e-desc').value.trim(),amount_cents:moneyToCents($('#e-amount').value),category:$('#e-cat').value,spent_on:$('#e-date').value})});await load();closeModal();toast('Despesa registrada');render()});
  if(id==='supplier-form')return runForm(form,'Salvando...',async()=>{await rest('md_store_suppliers',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:session.user.id,name:$('#s-name').value.trim(),phone:$('#s-phone').value.trim(),notes:$('#s-notes').value.trim()})});await load();closeModal();toast('Fornecedor salvo');render()});
  if(id==='reminder-form')return runForm(form,'Salvando...',async()=>{const start=$('#r-start').value,end=$('#r-end').value,msg=$('#r-msg').value.trim();if(!start||!end)throw new Error('Escolha o horário de início e fim');if(!msg)throw new Error('Digite a mensagem do lembrete');await rest(`md_store_settings?user_id=eq.${session.user.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({reminder_interval_minutes:Number($('#r-int').value),active_start:start,active_end:end,reminder_message:msg})});await load();closeModal();toast('Lembretes atualizados');render()});
});

document.addEventListener('change',e=>{
  if(e.target.id==='p-photo'&&e.target.files[0]){
    const u=URL.createObjectURL(e.target.files[0]),preview=$('#photo-preview');
    if(preview){preview.innerHTML=`<img src="${u}" alt="Prévia">`;preview.querySelector('img').onload=()=>URL.revokeObjectURL(u)}
  }
});

document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)reminderCheck()});
window.addEventListener('focus',()=>{if(session)reminderCheck()});

async function init(){
  if('serviceWorker'in navigator){try{const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});reg.update().catch(()=>{})}catch{}}
  if(session){
    try{await load();startReminderWatcher()}
    catch{if(!await refresh())session=null;else{try{await load();startReminderWatcher()}catch{session=null}}}
  }
  render();
}

init();
