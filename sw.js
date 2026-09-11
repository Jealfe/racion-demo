const APP_SCOPE=self.registration?.scope||new URL('./',self.location.href).href;
const LOVE_PENDING_CACHE='love-pending-v2';
const LOVE_QUEUE_URL=new URL('__love_pending__',APP_SCOPE).href;
let loveQueueOp=Promise.resolve();

function serializeLoveQueue(work){
  const run=loveQueueOp.then(work,work);
  loveQueueOp=run.catch(()=>{});
  return run;
}
async function readLoveQueue(){
  const cache=await caches.open(LOVE_PENDING_CACHE),response=await cache.match(LOVE_QUEUE_URL);
  if(!response)return [];
  try{const value=await response.json();return Array.isArray(value)?value:[]}catch{return []}
}
async function writeLoveQueue(queue){
  const cache=await caches.open(LOVE_PENDING_CACHE);
  if(!queue.length){await cache.delete(LOVE_QUEUE_URL);return}
  await cache.put(LOVE_QUEUE_URL,new Response(JSON.stringify(queue),{headers:{'content-type':'application/json'}}));
}
function makeLoveId(data={}){return String(data.loveId||data.eventId||data.itemId||`${Date.now()}-${Math.random().toString(36).slice(2,9)}`)}
async function rememberLove(item){
  return serializeLoveQueue(async()=>{
    let queue=await readLoveQueue();
    if(!queue.some(x=>String(x.id)===String(item.id))){queue.push(item);queue=queue.slice(-20);await writeLoveQueue(queue)}
    return item;
  });
}
async function acknowledgeLove(id){
  if(!id)return;
  await serializeLoveQueue(async()=>{
    const queue=await readLoveQueue(),next=queue.filter(x=>String(x.id)!==String(id));
    if(next.length!==queue.length)await writeLoveQueue(next);
  });
}
async function sendPendingLove(client){
  if(!client?.postMessage)return false;
  const queue=await readLoveQueue(),item=queue[0];
  if(!item)return false;
  client.postMessage({type:'love_ping',pending:true,...item});
  return true;
}
function loveUrl(item){
  const payload=encodeURIComponent(JSON.stringify({id:item?.id||'',sender:item?.sender||'',message:item?.message||'Я люблю тебя! ❤️'}));
  return new URL('./#love='+payload,APP_SCOPE).href;
}
function isLovePush(data,title,body){
  const text=`${title||''} ${body||''}`;
  return data.kind==='love'||data.action==='love_ping'||(/❤️/.test(text)&&/(?:люблю\s+тебя|тебя\s+люблю)/i.test(text));
}

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()||''}}
  const title=data.title||'Мы вдвоём ❤️';
  const body=data.body||'Есть новое в вашем общем месте.';
  const isLove=isLovePush(data,title,body);
  const loveItem=isLove?{id:makeLoveId(data),sender:title,message:body,receivedAt:Date.now()}:null;
  const options={
    body,
    icon:new URL('app-icon.svg',APP_SCOPE).href,
    badge:new URL('app-icon.svg',APP_SCOPE).href,
    tag:data.tag||'family-update',
    renotify:true,
    data:{url:new URL(data.url||'./',APP_SCOPE).href,kind:isLove?'love':(data.kind||''),itemId:data.itemId||null,loveId:loveItem?.id||null,sender:title,message:body}
  };
  event.waitUntil((async()=>{
    if(loveItem){
      await rememberLove(loveItem);
      const list=await clients.matchAll({type:'window',includeUncontrolled:true});
      for(const client of list)await sendPendingLove(client);
    }
    await self.registration.showNotification(title,options);
  })());
});

self.addEventListener('message',event=>{
  const data=event.data||{};
  if(data.type==='love_pending_request'){
    event.waitUntil((async()=>{if(event.source)await sendPendingLove(event.source)})());
    return;
  }
  if(data.type==='love_seen'){
    event.waitUntil((async()=>{
      await acknowledgeLove(data.id);
      if(event.source)await sendPendingLove(event.source);
    })());
  }
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const d=event.notification.data||{};
  event.waitUntil((async()=>{
    let url=d.url||APP_SCOPE;
    if(d.kind==='love'){
      const item={id:d.loveId||makeLoveId(d),sender:d.sender||'',message:d.message||'Я люблю тебя! ❤️',receivedAt:Date.now()};
      await rememberLove(item);
      url=loveUrl(item);
    }else{
      const pending=(await readLoveQueue())[0];
      if(pending)url=loveUrl(pending);
    }
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      if(new URL(client.url).origin===new URL(url).origin){
        await client.focus();
        if('navigate' in client)await client.navigate(url);
        return;
      }
    }
    if(clients.openWindow)await clients.openWindow(url);
  })());
});
