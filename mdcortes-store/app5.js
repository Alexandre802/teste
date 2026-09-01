function moneyToCents(value){
  let s=String(value??'').trim().replace(/\s+/g,'').replace(/^R\$/i,'').replace(/[^0-9,.-]/g,'');
  if(!s)return 0;
  const comma=s.lastIndexOf(','),dot=s.lastIndexOf('.');
  if(comma>=0&&dot>=0){
    if(comma>dot)s=s.replace(/\./g,'').replace(',','.');
    else s=s.replace(/,/g,'');
  }else if(comma>=0){
    s=s.replace(/\./g,'').replace(',','.');
  }else if(dot>=0){
    const parts=s.split('.');
    if(parts.length>2||parts.at(-1).length>2)s=s.replace(/\./g,'');
  }
  const n=Number(s);
  return Math.max(0,Math.round((Number.isFinite(n)?n:0)*100));
}

function exportCSV(){
  const rows=[['TIPO','DATA','DESCRIÇÃO','VALOR','STATUS'],...db.sales.map(s=>['VENDA',s.sold_at,payName[s.payment_method]||s.payment_method,(s.total_cents/100).toFixed(2).replace('.',','),s.status]),...db.expenses.map(e=>['DESPESA',e.spent_on,e.description,(e.amount_cents/100).toFixed(2).replace('.',','),''])];
  const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
  const csv='\ufeff'+rows.map(r=>r.map(quote).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');
  a.href=url;a.download=`md-store-backup-${todayKey()}.csv`;a.style.display='none';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  toast('Backup CSV preparado');
}

function updateNetworkBadge(){
  const el=$('.sync');if(!el)return;
  const online=navigator.onLine!==false;
  el.innerHTML=`<i style="background:${online?'var(--green)':'var(--red)'}"></i> ${online?'Online':'Offline'}`;
}

window.addEventListener('online',updateNetworkBadge);
window.addEventListener('offline',updateNetworkBadge);
const mdOriginalRender=render;
render=function(){const out=mdOriginalRender();updateNetworkBadge();return out};
setTimeout(updateNetworkBadge,0);
