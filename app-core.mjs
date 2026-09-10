export const DEFAULT_THANKS_HINT='Выбери, за что хочешь сказать спасибо ❤️';

export function makeThanksText(reason='',custom=''){
  const c=String(custom||'').trim();
  if(c) return `Спасибо тебе ${c}${c.includes('❤️')?'':' ❤️'}`;
  const r=String(reason||'').trim();
  return r?`Спасибо тебе за ${r} ❤️`:'';
}

export function makeMessageId(now=Date.now()){
  return `m_${Number(now).toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

export function encodeThanksPayload(data){
  return encodeURIComponent(JSON.stringify(data));
}

export function decodeThanksPayload(value){
  const d=JSON.parse(decodeURIComponent(value));
  if(!d || typeof d.text!=='string' || !d.text.trim()) throw new Error('Invalid thanks payload');
  return {id:String(d.id||''),text:d.text.trim(),date:String(d.date||'')};
}

export function addUniqueThanks(items,item){
  const list=Array.isArray(items)?items.slice():[];
  if(item.refId && list.some(x=>x.refId===item.refId)) return list;
  const duplicate=list.some(x=>x.text===item.text && x.received===item.received && Math.abs(new Date(x.date).getTime()-new Date(item.date).getTime())<3000);
  if(duplicate) return list;
  list.unshift(item);
  return list.slice(0,100);
}

export function pickByTag(items,tag='all',random=Math.random){
  const arr=tag==='all'?items:items.filter(x=>x.tag===tag);
  if(!arr.length) return null;
  const n=Math.min(arr.length-1,Math.max(0,Math.floor(random()*arr.length)));
  return arr[n];
}

export function localDateValue(date=new Date()){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
