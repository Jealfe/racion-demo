if(typeof document!=='undefined'){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const names={thanks:'Спасибо',wishlist:'Хотелки',ideas:'Идеи',likes:'Нам нравится',moments:'Моменты',movies:'Фильмы',designs:'Дом и дизайны'};
const css=document.createElement('style');css.textContent=`
.list-item>.row{flex-wrap:nowrap!important;gap:6px!important;justify-content:flex-end}.list-item>.row .icon-btn{position:relative!important;flex:0 0 36px!important;width:36px!important;min-width:36px!important;transform:none}.list-item>.row .icon-btn:active{transform:scale(.94)!important}
.notify-badge{display:none!important}.notify-badge.show{display:inline-flex!important;align-items:center!important;justify-content:center!important;vertical-align:middle!important;line-height:1!important;text-indent:0!important;padding-top:1px!important}
`;document.head.appendChild(css);
function unread(){try{const u=JSON.parse(localStorage.getItem('us_unread')||'{}');return u&&typeof u==='object'?u:{}}catch{return {}}}
function refreshActivity(){const sig=$('#activitySignal'),txt=$('#activityText');if(!sig||!txt)return;const u=unread(),parts=Object.entries(names).filter(([k])=>(Number(u[k])||0)>0).map(([k,n])=>`${n}: ${u[k]}`),first=Object.keys(names).find(k=>(Number(u[k])||0)>0)||'';sig.classList.toggle('show',parts.length>0);txt.textContent=parts.join(' · ');sig.dataset.section=first;$$('.notify-badge').forEach(b=>{if((b.textContent||'').trim()==='0')b.classList.remove('show')})}
window.addEventListener('storage',()=>setTimeout(refreshActivity,0));
setInterval(refreshActivity,1200);
document.addEventListener('click',e=>{const s=e.target.closest?.('#activitySignal');if(!s||s.dataset.section!=='designs')return;e.preventDefault();e.stopImmediatePropagation();$('[data-open="designs"]')?.click()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshActivity,{once:true});else refreshActivity();
}
