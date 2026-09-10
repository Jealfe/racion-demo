if(typeof document!=='undefined'){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const names={thanks:'Спасибо',wishlist:'Хотелки',ideas:'Идеи',likes:'Нам нравится',moments:'Моменты',movies:'Фильмы',designs:'Дом и дизайны'};
const FAMILY_API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/family-api';
const css=document.createElement('style');css.textContent=`
.list-item>.row{flex-wrap:nowrap!important;gap:6px!important;justify-content:flex-end}.list-item>.row .icon-btn{position:relative!important;flex:0 0 36px!important;width:36px!important;min-width:36px!important;transform:none}.list-item>.row .icon-btn:active{transform:scale(.94)!important}
.notify-badge{display:none!important}.notify-badge.show{display:inline-flex!important;align-items:center!important;justify-content:center!important;vertical-align:middle!important;line-height:1!important;text-indent:0!important;padding-top:1px!important}
#wishList .list-item.done{display:grid!important;opacity:.72;background:#f7f4f0;border-color:#e8dfd7}#wishList .list-item.done b{text-decoration:line-through;color:#8e8781}#wishList .wish-done[data-state="done"]{background:#dfeee2;color:#39724a;font-weight:900}#wishList .wish-done[data-state="open"]{background:#f3efeb;color:#444}
`;document.head.appendChild(css);
function unread(){try{const u=JSON.parse(localStorage.getItem('us_unread')||'{}');return u&&typeof u==='object'?u:{}}catch{return {}}}
function refreshActivity(){const sig=$('#activitySignal'),txt=$('#activityText');if(!sig||!txt)return;const u=unread(),parts=Object.entries(names).filter(([k])=>(Number(u[k])||0)>0).map(([k,n])=>`${n}: ${u[k]}`),first=Object.keys(names).find(k=>(Number(u[k])||0)>0)||'';sig.classList.toggle('show',parts.length>0);txt.textContent=parts.join(' · ');sig.dataset.section=first;$$('.notify-badge').forEach(b=>{if((b.textContent||'').trim()==='0')b.classList.remove('show')})}
function wishes(){try{const a=JSON.parse(localStorage.getItem('us_wishes')||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function saveWishes(a){localStorage.setItem('us_wishes',JSON.stringify(a))}
function isCloudId(id){return typeof id==='string'&&/^[0-9a-f-]{30,}$/i.test(id)}
function wishStatusText(x){const author=String(x.author||'').trim();return `${author?author+' · ':''}${x.done?'исполнено':'хочется'}`}
function paintWishRow(btn,x){const row=btn.closest('.list-item');if(!row)return;row.classList.toggle('done',Boolean(x.done));btn.textContent=x.done?'↩':'✓';btn.dataset.state=x.done?'done':'open';btn.title=x.done?'Вернуть в хотелки':'Отметить выполненной';btn.setAttribute('aria-label',btn.title);const status=row.querySelector('span');if(status)status.textContent=wishStatusText(x)}
async function syncWishState(x){const token=(localStorage.getItem('us_family_token')||'').trim();if(!token||!isCloudId(String(x.id)))return;const r=await fetch(FAMILY_API,{method:'POST',headers:{'content-type':'application/json','x-family-token':token},body:JSON.stringify({action:'update',id:x.id,data:{done:Boolean(x.done)}})});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.error||'Не удалось синхронизировать')}}
async function toggleWish(btn){const id=String(btn.dataset.id||''),a=wishes(),x=a.find(i=>String(i.id)===id);if(!x)return;const previous=Boolean(x.done),next=!previous;x.done=next;saveWishes(a);paintWishRow(btn,x);try{await syncWishState(x);const fresh=wishes(),same=fresh.find(i=>String(i.id)===id);if(same){same.done=next;saveWishes(fresh);paintWishRow(btn,same)}}catch(err){const fresh=wishes(),same=fresh.find(i=>String(i.id)===id);if(same){same.done=previous;saveWishes(fresh);paintWishRow(btn,same)}const t=$('#toast');if(t){t.textContent='Не удалось изменить хотелку';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}console.error(err)}}
window.addEventListener('storage',()=>setTimeout(refreshActivity,0));
setInterval(refreshActivity,1200);
document.addEventListener('click',e=>{const wish=e.target.closest?.('.wish-done');if(wish){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();toggleWish(wish);return}const s=e.target.closest?.('#activitySignal');if(!s||s.dataset.section!=='designs')return;e.preventDefault();e.stopImmediatePropagation();$('[data-open="designs"]')?.click()},true);
function refreshWishButtons(){$$('.wish-done').forEach(btn=>{const x=wishes().find(i=>String(i.id)===String(btn.dataset.id));if(x)paintWishRow(btn,x)})}
const observer=new MutationObserver(()=>refreshWishButtons());
function init(){refreshActivity();refreshWishButtons();const list=$('#wishList');if(list)observer.observe(list,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}
