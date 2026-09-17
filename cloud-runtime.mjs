export const FAMILY_API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/family-api';
export const PUBLISHABLE_KEY='sb_publishable_sMtJPBsGvDjvtB0e-1ea0w_Yuk9pzae';
const reads=new Set(['sync','social_sync','whoami']);

// One scheduler and one in-flight read per action/device. Writes are never retried.
export function createCloudRuntime({fetch:transport,getToken,storage,interval=10000,timeout=12000,onError=()=>{}}){
  const cache=new Map(),listeners=new Map();
  let revision=0,timer=null,refreshTimer=null,activeToken=getToken();
  function reset(){revision++;cache.clear();activeToken=getToken()}
  function tokenChanged(){if(activeToken!==getToken())reset()}
  async function request(action,payload={},options={}){
    tokenChanged();
    const token=options.token??getToken();
    if(!token)throw new Error('NO_TOKEN');
    const isRead=reads.has(action),key=action+':'+token;
    const cached=cache.get(key);
    if(isRead&&cached&&cached.revision===revision&&(cached.pending||(!options.force&&Date.now()-cached.at<3000)))return cached.promise;
    if(!isRead){revision++;cache.clear()}
    const startedRevision=revision;
    const entry={revision,at:Date.now(),pending:true,promise:null};
    entry.promise=(async()=>{
      const controller=new AbortController();
      const abort=()=>controller.abort();
      options.signal?.addEventListener('abort',abort,{once:true});
      if(options.signal?.aborted)abort();
      const deadline=setTimeout(abort,isRead?timeout:20000);
      try{
        let response;
        for(let attempt=0;attempt<(isRead?2:1);attempt++){
          try{
            response=await transport(FAMILY_API,{method:'POST',headers:{'content-type':'application/json',apikey:PUBLISHABLE_KEY,'x-family-token':token},body:JSON.stringify({action,...payload}),signal:controller.signal});
            if(!isRead||response.status<500&&response.status!==429||attempt===1)break;
          }catch(error){if(!isRead||attempt===1||controller.signal.aborted)throw error}
          await new Promise(resolve=>setTimeout(resolve,350));
        }
        const data=await response.json();
        if(!response.ok){const error=new Error(data.error||'CLOUD_ERROR');error.status=response.status;throw error}
        if(!isRead){revision++;cache.clear();scheduleRefresh()}
        else if(startedRevision===revision&&token===getToken()){
          if(action==='social_sync')try{storage?.setItem('us_activity_cache_v2',JSON.stringify({token,activity:(data.activity||[]).slice(0,18)}))}catch{}
          for(const fn of listeners.get(action)||[])try{fn(data)}catch(error){onError(error)}
        }
        return data;
      }finally{clearTimeout(deadline);options.signal?.removeEventListener('abort',abort);entry.pending=false;entry.at=Date.now()}
    })();
    if(isRead){cache.set(key,entry);entry.promise.catch(()=>{if(cache.get(key)===entry)cache.delete(key)})}
    return entry.promise;
  }
  function refresh(){tokenChanged();if(!getToken())return Promise.resolve([]);return Promise.allSettled([...listeners.keys()].map(action=>request(action,{}, {force:true}).catch(error=>{onError(error);throw error}))) }
  function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,120)}
  function subscribe(action,fn){
    if(!listeners.has(action))listeners.set(action,new Set());
    let last;const listener=data=>{if(data!==last){last=data;fn(data)}};
    listeners.get(action).add(listener);
    if(!timer)timer=setInterval(refresh,interval);
    const token=getToken(),epoch=revision;
    if(token)request(action).then(data=>{if(token===getToken()&&epoch===revision&&listeners.get(action)?.has(listener))listener(data)}).catch(onError);
    return ()=>{listeners.get(action)?.delete(listener);if(!listeners.get(action)?.size)listeners.delete(action);if(!listeners.size){clearInterval(timer);timer=null}};
  }
  return {request,subscribe,refresh,reset,dispose(){clearInterval(timer);clearTimeout(refreshTimer);listeners.clear();cache.clear()}};
}

export function installCloudRuntime(){
  if(window.familyCloud)return window.familyCloud;
  const nativeFetch=window.fetch.bind(window);
  const runtime=createCloudRuntime({fetch:nativeFetch,getToken:()=>localStorage.getItem('us_family_token')||'',storage:localStorage,onError:error=>window.dispatchEvent(new CustomEvent('family-cloud-error',{detail:error}))});
  window.familyCloud=runtime;
  // Compatibility for modules that still use fetch; all family reads share the runtime.
  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:input?.url;
    if(url!==FAMILY_API||typeof init.body!=='string')return nativeFetch(input,init);
    const body=JSON.parse(init.body),headers=new Headers(init.headers||input?.headers);
    const {action,...payload}=body;
    try{return new Response(JSON.stringify(await runtime.request(action,payload,{token:headers.get('x-family-token')||undefined,signal:init.signal})),{status:200,headers:{'content-type':'application/json'}})}
    catch(error){if(!error.status)throw error;return new Response(JSON.stringify({error:error.message}),{status:error.status,headers:{'content-type':'application/json'}})}
  };
  window.addEventListener('online',()=>runtime.refresh());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)runtime.refresh()});
  window.addEventListener('storage',event=>{if(event.key==='us_family_token'){runtime.reset();runtime.refresh()}});
  return runtime;
}

let registrationPromise;
export function registerServiceWorker(){
  if(!('serviceWorker' in navigator))return Promise.resolve(null);
  if(!registrationPromise)registrationPromise=navigator.serviceWorker.register('./sw.js?v=5',{scope:'./',updateViaCache:'none'}).catch(error=>{registrationPromise=null;throw error});
  return registrationPromise;
}
