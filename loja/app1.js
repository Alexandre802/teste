const SUPABASE='https://qtxcqlzfqfckcjpeboeo.supabase.co';
const APIKEY='sb_publishable_TWIxTBn8_aWmtlX3xnvLNA_9ZthmAiz';
const VAPID='BN8_eQYU0tzWUfhxtq1dMVtn0YUu77QxtPbk5T3YyQvlbd9OPJYnC5kM5f-OprHcp6RfQE3FOqxtYHPSs0zZ4hc';
const BASE_PATH='/teste/loja/';
let session=JSON.parse(localStorage.getItem('md-store-session')||'null');
let db={products:[],variants:[],inventory:[],sales:[],items:[],expenses:[],suppliers:[],settings:null};
let page='home', cart=[], search='', filter='todos', reminderTimer=null, lastReminderUI=0;
const $=s=>document.querySelector(s), app=()=>$('#app');
const uuid=()=>crypto.randomUUID();
const money=c=>(Number(c||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const dateKey=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
const dateTime=d=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(d));
const todayKey=()=>dateKey(new Date());
const payName={pix:'Pix',dinheiro:'Dinheiro',debito:'Débito',credito:'Crédito'};
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2800)}
function h(auth=true,extra={}){const o={'apikey':APIKEY,'Content-Type':'application/json',...extra};if(auth&&session?.access_token)o.Authorization='Bearer '+session.access_token;return o}
async function refresh(){if(!session?.refresh_token)return false;const r=await fetch(`${SUPABASE}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:h(false),body:JSON.stringify({refresh_token:session.refresh_token})});if(!r.ok){logout(false);return false}session=await r.json();localStorage.setItem('md-store-session',JSON.stringify(session));return true}
async function req(url,opt={},retry=true){const r=await fetch(url,{...opt,headers:{...h(opt.auth!==false),...(opt.headers||{})}});if(r.status===401&&retry&&await refresh())return req(url,opt,false);if(!r.ok){let m='Erro ao comunicar com o servidor';try{const j=await r.json();m=j.message||j.error_description||j.error||m}catch{}throw new Error(m)}if(r.status===204)return null;const text=await r.text();return text?JSON.parse(text):null}
const rest=(path,opt={})=>req(`${SUPABASE}/rest/v1/${path}`,opt);
