if(typeof document!=='undefined'&&!window.__pushRecoveryV1){
  const API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/family-api';
  const VAPID_PUBLIC='BBk9t_Yy-qHd-2WRsNs7hk42mjD4q47n9jIEn6F-no9WWMtvTI_4OdJaRaQUYERzU5lQbFNtOpx9gGa0I-dbFeY';
  const token=()=>localStorage.getItem('us_family_token')||'';
  let repairing=false,lastRepair=0;

  function b64ToBytes(s){
    const pad='='.repeat((4-s.length%4)%4),base=(s+pad).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base),out=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
    return out;
  }
  function paintEnabled(){
    const b=document.getElementById('pushBtn');
    if(!b)return;
    b.textContent='🔔 Уведомления включены';
    b.classList.add('on');
  }
  async function apiSubscribe(subscription){
    const tk=token();if(!tk)return false;
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-family-token':tk},body:JSON.stringify({action:'push_subscribe',subscription:subscription.toJSON()})});
    return r.ok;
  }
  async function freshRegistration(){
    if(!('serviceWorker' in navigator))return null;
    let reg=null;
    try{reg=await navigator.serviceWorker.register('./sw.js?v=4',{scope:'./',updateViaCache:'none'})}catch{}
    if(!reg)reg=await navigator.serviceWorker.ready.catch(()=>null);
    if(reg){try{await reg.update()}catch{}}
    return reg;
  }
  async function repairPush(force=false){
    if(repairing||!token()||!('Notification' in window)||!('PushManager' in window)||!('serviceWorker' in navigator))return false;
    if(Notification.permission!=='granted')return false;
    const now=Date.now();if(!force&&now-lastRepair<5000)return false;
    lastRepair=now;repairing=true;
    try{
      const reg=await freshRegistration();if(!reg)return false;
      let sub=await reg.pushManager.getSubscription();
      if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(VAPID_PUBLIC)});
      const ok=await apiSubscribe(sub);
      if(ok)paintEnabled();
      return ok;
    }catch(e){console.warn('push recovery',e);return false}
    finally{repairing=false}
  }
  function scheduleRepair(){
    [120,900,2600,6500].forEach((ms,i)=>setTimeout(()=>repairPush(i===0),ms));
  }
  scheduleRepair();
  window.addEventListener('pageshow',()=>repairPush(true));
  window.addEventListener('focus',()=>repairPush());
  window.addEventListener('online',()=>repairPush(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)repairPush(true)});
  if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>setTimeout(()=>repairPush(true),120));
  window.__repairFamilyPush=repairPush;
  window.__pushRecoveryV1=true;
}
