if(typeof document!=='undefined'&&!window.__lovePopupV2){
  const API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/family-api';
  const token=()=>localStorage.getItem('us_family_token')||'';
  async function api(action,payload={}){
    const tk=token();if(!tk)throw new Error('NO_TOKEN');
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-family-token':tk},body:JSON.stringify({action,...payload})});
    if(!r.ok)throw new Error('CLOUD_ERROR');
    return r.json().catch(()=>({}));
  }
  const style=document.createElement('style');
  style.id='love-popup-styles';
  style.textContent=`
    .love-pop{position:fixed;left:50%;bottom:calc(78px + env(safe-area-inset-bottom));z-index:10020;width:min(355px,calc(100vw - 28px));transform:translate(-50%,18px) scale(.98);opacity:0;pointer-events:none;transition:opacity .22s ease,transform .28s cubic-bezier(.22,1,.36,1)}
    .love-pop.show{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
    .love-pop-card{position:relative;display:grid;grid-template-columns:44px 1fr;gap:11px;align-items:center;background:rgba(255,255,255,.96);border:1px solid #f0dfe2;border-radius:21px;padding:12px 42px 12px 12px;box-shadow:0 16px 42px rgba(75,42,52,.16);backdrop-filter:blur(14px)}
    .love-pop-heart{width:44px;height:44px;border-radius:15px;display:grid;place-items:center;background:#fff0f2;font-size:22px;animation:lovePopPulse 1.35s ease-in-out infinite}
    .love-pop-copy b{display:block;font-size:11px;color:#8e6670;margin-bottom:3px}.love-pop-copy strong{display:block;font-size:14px;color:#403638;line-height:1.25}.love-pop-actions{grid-column:1/-1;display:flex;gap:7px;margin-top:1px}.love-pop-reply{flex:1;border:0;background:#d96777;color:#fff;border-radius:12px;padding:9px 11px;font:inherit;font-size:10px;font-weight:850;cursor:pointer}.love-pop-close{position:absolute;right:10px;top:10px;width:27px;height:27px;border:0;border-radius:50%;background:#f5efef;color:#8c7e80;font-size:16px;cursor:pointer}.love-pop-reply:active,.love-pop-close:active{transform:scale(.95)}
    @keyframes lovePopPulse{0%,100%{transform:scale(.96)}50%{transform:scale(1.06)}}
    @media(prefers-reduced-motion:reduce){.love-pop,.love-pop-heart{transition:none;animation:none}}
  `;
  document.head.appendChild(style);
  const root=document.createElement('div');
  root.id='lovePopup';root.className='love-pop';root.setAttribute('role','dialog');root.setAttribute('aria-live','polite');
  root.innerHTML='<div class="love-pop-card"><div class="love-pop-heart">❤️</div><div class="love-pop-copy"><b id="lovePopupSender">Тебе отправили ❤️</b><strong id="lovePopupText">Я люблю тебя! ❤️</strong></div><div class="love-pop-actions"><button class="love-pop-reply" id="lovePopupReply">❤️ И я тебя</button></div><button class="love-pop-close" id="lovePopupClose" aria-label="Закрыть">×</button></div>';
  document.body.appendChild(root);

  let hideTimer=0,currentLoveId='';
  async function serviceWorkerTarget(forceUpdate=false){
    if(!('serviceWorker' in navigator))return null;
    const reg=await navigator.serviceWorker.ready.catch(()=>null);
    if(!reg)return navigator.serviceWorker.controller||null;
    if(forceUpdate){try{await reg.update()}catch{}}
    return reg.active||navigator.serviceWorker.controller||reg.waiting||reg.installing||null;
  }
  async function postToServiceWorker(data,forceUpdate=false){
    const target=await serviceWorkerTarget(forceUpdate);
    target?.postMessage(data);
  }
  function requestPendingLove(forceUpdate=false){postToServiceWorker({type:'love_pending_request'},forceUpdate).catch(()=>{})}
  function acknowledgeLove(id){if(id)postToServiceWorker({type:'love_seen',id}).catch(()=>{})}

  function showLove(sender='',message='Я люблю тебя! ❤️',id=''){
    const s=String(sender||'').replace(/\s*❤️\s*$/,'').trim();
    currentLoveId=String(id||currentLoveId||'');
    document.getElementById('lovePopupSender').textContent=s?`${s} отправил(а) тебе ❤️`:'Тебе отправили ❤️';
    document.getElementById('lovePopupText').textContent=String(message||'Я люблю тебя! ❤️');
    root.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>root.classList.remove('show'),12000);
  }
  function readHash(){
    if(!location.hash.startsWith('#love='))return;
    try{const d=JSON.parse(decodeURIComponent(location.hash.slice(6)));showLove(d.sender||'',d.message||'Я люблю тебя! ❤️',d.id||'')}catch{showLove()}
    history.replaceState(null,'',location.pathname+location.search);
  }
  function closeAndAcknowledge(){
    const id=currentLoveId;currentLoveId='';
    clearTimeout(hideTimer);root.classList.remove('show');
    acknowledgeLove(id);
  }
  document.getElementById('lovePopupClose').onclick=closeAndAcknowledge;
  document.getElementById('lovePopupReply').onclick=async()=>{
    const b=document.getElementById('lovePopupReply');b.disabled=true;
    try{
      await api('love_ping',{message:'И я тебя люблю! ❤️'});
      const id=currentLoveId;currentLoveId='';
      b.textContent='Отправлено ❤️';
      setTimeout(()=>{root.classList.remove('show');acknowledgeLove(id)},850);
    }catch{
      b.textContent='Не получилось';setTimeout(()=>{b.textContent='❤️ И я тебя';b.disabled=false},1200);return;
    }
    setTimeout(()=>{b.textContent='❤️ И я тебя';b.disabled=false},1300);
  };

  if('serviceWorker' in navigator){
    navigator.serviceWorker.addEventListener('message',e=>{
      const d=e.data||{};
      if(d.type==='love_ping'||d.type==='love_pending')showLove(d.sender||'',d.message||'Я люблю тебя! ❤️',d.id||'');
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>setTimeout(()=>requestPendingLove(),80));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestPendingLove()});
    window.addEventListener('pageshow',()=>requestPendingLove());
    setTimeout(()=>requestPendingLove(true),120);
  }
  window.addEventListener('hashchange',readHash);
  readHash();
  window.__showLovePopup=showLove;
  window.__lovePopupV1=true;
  window.__lovePopupV2=true;
  import('./v2-social-bridge.js?v=1').catch(()=>{});
}
