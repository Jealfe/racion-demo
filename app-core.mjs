const FAMILY_API_HOST='jlejyppniaifdavllwid.supabase.co';
const FAMILY_PUBLISHABLE_KEY='sb_publishable_sMtJPBsGvDjvtB0e-1ea0w_Yuk9pzae';

if(typeof window!=='undefined' && typeof window.fetch==='function' && !window.__familyApiFetchPatched){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const url=typeof input==='string'?input:(input&&typeof input.url==='string'?input.url:String(input));
    if(url.includes(FAMILY_API_HOST+'/functions/v1/family-api')){
      const sourceHeaders=(input&&typeof input==='object'&&input.headers)?input.headers:undefined;
      const headers=new Headers(init.headers||sourceHeaders||{});
      if(!headers.has('apikey')) headers.set('apikey',FAMILY_PUBLISHABLE_KEY);
      init={...init,headers};
    }
    return nativeFetch(input,init);
  };
  window.__familyApiFetchPatched=true;
}

if(typeof window!=='undefined'){
  await import('./ui-polish.js');
  await import('./design-board.js');
  await import('./ui-fixes.js');
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
