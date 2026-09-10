const FAMILY_API_HOST='jlejyppniaifdavllwid.supabase.co';
const FAMILY_PUBLISHABLE_KEY='sb_publishable_sMtJPBsGvDjvtB0e-1ea0w_Yuk9pzae';

if(typeof window!=='undefined' && !window.__familyTokenGuardPatched){
  const nativeRemove=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key){
    if(this===window.localStorage && key==='us_family_token' && !window.__allowFamilyTokenRemoval){
      if(!sessionStorage.getItem('us_family_recovery_reload')){
        sessionStorage.setItem('us_family_recovery_reload','1');
        setTimeout(()=>location.reload(),3500);
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
  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:(input&&typeof input.url==='string'?input.url:String(input));
    if(!url.includes(FAMILY_API_HOST+'/functions/v1/family-api')) return nativeFetch(input,init);
    const sourceHeaders=(input&&typeof input==='object'&&input.headers)?input.headers:undefined;
    const headers=new Headers(init.headers||sourceHeaders||{});
    if(!headers.has('apikey')) headers.set('apikey',FAMILY_PUBLISHABLE_KEY);
    const nextInit={...init,headers};
    let lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const response=await nativeFetch(input,nextInit);
        if(response.status<500 && response.status!==429){
          if(response.ok){
            sessionStorage.removeItem('us_family_recovery_reload');
            sessionStorage.removeItem('us_family_status_reload');
          }
          return response;
        }
        if(attempt===2) return response;
      }catch(error){
        lastError=error;
        if(attempt===2) throw error;
      }
      await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
    }
    if(lastError) throw lastError;
    return nativeFetch(input,nextInit);
  };
  window.__familyApiFetchPatched=true;
}

if(typeof window!=='undefined'){
  const watchCloudStatus=()=>{
    const token=(localStorage.getItem('us_family_token')||'').trim();
    const pill=document.querySelector('.local-pill');
    if(!token||!pill)return;
    if(pill.textContent.includes('общая синхронизация')){
      sessionStorage.removeItem('us_family_status_reload');
      return;
    }
    if(pill.textContent.includes('только это устройство')&&!sessionStorage.getItem('us_family_status_reload')){
      sessionStorage.setItem('us_family_status_reload','1');
      setTimeout(()=>location.reload(),2500);
    }
  };
  window.addEventListener('load',()=>setTimeout(watchCloudStatus,1200),{once:true});
  setInterval(watchCloudStatus,5000);

  await import('./ui-fixes.js');
  await import('./ui-polish.js');
  await import('./design-board.js');
  await import('./social-upgrades.js');
  await import('./home-layout.js');
  await import('./home-cards-redesign.js?v=4');
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
