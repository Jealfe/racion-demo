const FAMILY_API_HOST='jlejyppniaifdavllwid.supabase.co';
const FAMILY_PUBLISHABLE_KEY='sb_publishable_sMtJPBsGvDjvtB0e-1ea0w_Yuk9pzae';

if(typeof window!=='undefined'&&!window.__bootScreenV1){
  const style=document.createElement('style');
  style.id='boot-screen-styles';
  style.textContent=`
    #appBootScreen{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#f6f3ef;opacity:1;transition:opacity .24s ease;pointer-events:auto}
    #appBootScreen.boot-leave{opacity:0;pointer-events:none}
    #appBootScreen .boot-inner{display:grid;place-items:center;gap:11px;transform:translateY(-3vh);color:#7b5b68;text-align:center}
    #appBootScreen .boot-heart{width:58px;height:58px;border-radius:20px;display:grid;place-items:center;font-size:28px;background:linear-gradient(145deg,#fff,#f4e7e5);box-shadow:0 10px 30px rgba(94,67,76,.10);animation:bootPulse 1.25s ease-in-out infinite}
    #appBootScreen .boot-title{font-size:15px;font-weight:800;letter-spacing:-.02em;color:#5f5157}
    #appBootScreen .boot-sub{font-size:9px;color:#9f9297;letter-spacing:.03em}
    @keyframes bootPulse{0%,100%{transform:scale(.96);box-shadow:0 8px 24px rgba(94,67,76,.08)}50%{transform:scale(1.04);box-shadow:0 12px 34px rgba(94,67,76,.15)}}
    @media(prefers-reduced-motion:reduce){#appBootScreen .boot-heart{animation:none}#appBootScreen{transition:none}}
  `;
  document.head.appendChild(style);
  const boot=document.createElement('div');
  boot.id='appBootScreen';
  boot.setAttribute('role','status');
  boot.setAttribute('aria-live','polite');
  boot.innerHTML='<div class="boot-inner"><div class="boot-heart">❤️</div><div class="boot-title">Мы вдвоём</div><div class="boot-sub">обновляем данные…</div></div>';
  document.body.appendChild(boot);
  let finished=false;
  window.__finishBoot=()=>{
    if(finished)return;
    finished=true;
    boot.classList.add('boot-leave');
    setTimeout(()=>{boot.remove();style.remove()},280);
  };
  setTimeout(()=>window.__finishBoot?.(),8000);
  window.__bootScreenV1=true;
}

if(typeof window!=='undefined' && !window.__stableInnerHtmlPatched){
  const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(descriptor?.get&&descriptor?.set){
    Object.defineProperty(Element.prototype,'innerHTML',{
      configurable:descriptor.configurable,
      enumerable:descriptor.enumerable,
      get:descriptor.get,
      set(value){
        const next=String(value??'');
        if(descriptor.get.call(this)===next)return;
        descriptor.set.call(this,next);
      }
    });
  }
  window.__stableInnerHtmlPatched=true;
}

if(typeof window!=='undefined' && !window.__familyTokenGuardPatched){
  const nativeRemove=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key){
    if(this===window.localStorage && key==='us_family_token' && !window.__allowFamilyTokenRemoval){
      const token=this.getItem(key)||'';
      if(token && !sessionStorage.getItem('us_family_recovery_retry')){
        sessionStorage.setItem('us_family_recovery_retry','1');
        setTimeout(()=>{
          sessionStorage.removeItem('us_family_recovery_retry');
          window.dispatchEvent(new StorageEvent('storage',{key:'us_family_token',oldValue:token,newValue:token,storageArea:window.localStorage,url:location.href}));
        },5000);
      }
      return;
    }
    return nativeRemove.call(this,key);
  };
  window.__familyTokenGuardPatched=true;
}

if(typeof window!=='undefined' && !window.__familyAccessHashPatched){
  window.addEventListener('hashchange',()=>{
    if(!location.hash.startsWith('#access='))return;
    try{
      const nextToken=decodeURIComponent(location.hash.slice(8)).trim();
      if(nextToken.length<32)return;
      localStorage.setItem('us_family_token',nextToken);
      location.reload();
    }catch{}
  });
  window.__familyAccessHashPatched=true;
}

if(typeof window!=='undefined' && typeof window.fetch==='function' && !window.__familyApiFetchPatched){
  const nativeFetch=window.fetch.bind(window);
  const readCache=new Map();
  const cacheableActions=new Set(['sync','social_sync']);
  const readTtlMs=3000;
  const actionFrom=(input,init)=>{
    let body=init?.body;
    if(body==null&&input&&typeof input==='object'&&'body' in input)body=input.body;
    if(typeof body!=='string')return '';
    try{return String(JSON.parse(body)?.action||'')}catch{return ''}
  };
  const invalidateReads=()=>readCache.clear();
  const doFetch=async(input,nextInit)=>{
    let lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const response=await nativeFetch(input,nextInit);
        if(response.status<500 && response.status!==429)return response;
        if(attempt===2)return response;
      }catch(error){
        lastError=error;
        if(attempt===2)throw error;
      }
      await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
    }
    if(lastError)throw lastError;
    return nativeFetch(input,nextInit);
  };
  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:(input&&typeof input.url==='string'?input.url:String(input));
    if(!url.includes(FAMILY_API_HOST+'/functions/v1/family-api'))return nativeFetch(input,init);
    const sourceHeaders=(input&&typeof input==='object'&&input.headers)?input.headers:undefined;
    const headers=new Headers(init.headers||sourceHeaders||{});
    if(!headers.has('apikey'))headers.set('apikey',FAMILY_PUBLISHABLE_KEY);
    const nextInit={...init,headers};
    const action=actionFrom(input,init);
    const cacheable=cacheableActions.has(action);
    const cacheKey=cacheable?`${action}:${headers.get('x-family-token')||''}`:'';
    const now=Date.now();
    if(cacheable){
      const cached=readCache.get(cacheKey);
      if(cached&&now-cached.at<readTtlMs){
        try{return (await cached.promise).clone()}catch{readCache.delete(cacheKey)}
      }
    }else if(action){
      invalidateReads();
    }
    const promise=doFetch(input,nextInit).then(response=>{
      if(response.ok){
        sessionStorage.removeItem('us_family_recovery_retry');
        if(!cacheable)invalidateReads();
      }
      return response;
    });
    if(cacheable)readCache.set(cacheKey,{at:now,promise});
    const response=await promise;
    return cacheable?response.clone():response;
  };
  window.__familyApiFetchPatched=true;
}

if(typeof window!=='undefined'){
  const ensureActivityPlaceholder=()=>{
    const anchor=document.querySelector('#dailyQuote');
    if(!anchor||document.querySelector('#familyTools'))return;
    const tools=document.createElement('div');
    tools.id='familyTools';
    tools.className='family-tools';
    tools.innerHTML='<button class="family-tool" id="installApp">📲 На экран телефона</button><button class="family-tool" id="pushBtn">🔔 Уведомления</button>';
    const activity=document.createElement('section');
    activity.id='familyActivity';
    activity.className='activity-card';
    activity.innerHTML='<div class="activity-head"><h3>Что нового</h3><span>у нас двоих</span></div><div class="activity-list" id="activityList"><div class="activity-empty">⏳ Обновляем последние записи…</div></div><button class="activity-more" id="activityMore" hidden></button>';
    anchor.after(tools);
    tools.after(activity);
  };
  ensureActivityPlaceholder();

  await import('./ui-fixes.js');
  await import('./ui-polish.js');
  await import('./design-board.js');
  await import('./design-paste-images.js?v=1');
  await import('./social-upgrades.js?v=2');
  await import('./settings-gear-final.js?v=3');
  await import('./push-recovery.js?v=1');
  await import('./home-layout.js');
  await import('./home-cards-redesign.js?v=8');
  await import('./wishlist-artwork-v2.js?v=1');
  await import('./food-options-expanded.js?v=1');
  await import('./interaction-fixes.js?v=2');
  await import('./couple-upgrades-v2.js?v=2');
  await import('./moment-stability-v2.js?v=1');
  await import('./love-popup.js?v=4');

  const finishWhenReady=async()=>{
    const hasToken=Boolean((localStorage.getItem('us_family_token')||'').trim());
    if(hasToken){
      const started=Date.now();
      while(Date.now()-started<2600){
        const activity=document.querySelector('#activityList');
        if(activity&&activity.childElementCount>0&&!activity.textContent.includes('Обновляем последние записи'))break;
        await new Promise(resolve=>setTimeout(resolve,50));
      }
    }
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.__finishBoot?.()));
  };
  finishWhenReady();
}

export const DEFAULT_THANKS_HINT='Выбери, за что хочешь сказать спасибо ❤️';
export function makeThanksText(reason='',custom=''){const c=String(custom||'').trim();if(c)return `Спасибо тебе ${c}${c.includes('❤️')?'':' ❤️'}`;const r=String(reason||'').trim();return r?`Спасибо тебе за ${r} ❤️`:''}
export function makeMessageId(now=Date.now()){return `m_${Number(now).toString(36)}_${Math.random().toString(36).slice(2,8)}`}
export function normalizeAuthor(value=''){return String(value||'').trim().replace(/\s+/g,' ').slice(0,32)}
export function encodeThanksPayload(data){return encodeURIComponent(JSON.stringify(data))}
export function decodeThanksPayload(value){const d=JSON.parse(decodeURIComponent(value));if(!d||typeof d.text!=='string'||!d.text.trim())throw new Error('Invalid thanks payload');return{id:String(d.id||''),text:d.text.trim(),date:String(d.date||''),author:normalizeAuthor(d.author||'')}}
export function addUniqueThanks(items,item){const list=Array.isArray(items)?items.slice():[];if(item.refId&&list.some(x=>x.refId===item.refId))return list;const duplicate=list.some(x=>x.text===item.text&&x.received===item.received&&(x.author||'')===(item.author||'')&&Math.abs(new Date(x.date).getTime()-new Date(item.date).getTime())<3000);if(duplicate)return list;list.unshift(item);return list.slice(0,100)}
export function pickByTag(items,tag='all',random=Math.random){const arr=tag==='all'?items:items.filter(x=>x.tag===tag);if(!arr.length)return null;const n=Math.min(arr.length-1,Math.max(0,Math.floor(random()*arr.length)));return arr[n]}
export function localDateValue(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
export function unreadTotal(value={}){if(!value||typeof value!=='object')return 0;return Object.values(value).reduce((sum,n)=>sum+(Number.isFinite(Number(n))?Math.max(0,Number(n)):0),0)}