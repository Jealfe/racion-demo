const APP_SCOPE=self.registration?.scope||new URL('./',self.location.href).href;
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()||''}}
  const title=data.title||'Мы вдвоём ❤️';
  const body=data.body||'Есть новое в вашем общем месте.';
  const isLove=data.kind==='love'||(data.kind==='home'&&/❤️/.test(title)&&/люблю тебя/i.test(body));
  const options={
    body,
    icon:new URL('app-icon.svg',APP_SCOPE).href,
    badge:new URL('app-icon.svg',APP_SCOPE).href,
    tag:data.tag||'family-update',
    renotify:true,
    data:{url:new URL(data.url||'./',APP_SCOPE).href,kind:isLove?'love':(data.kind||''),itemId:data.itemId||null,sender:title,message:body}
  };
  event.waitUntil((async()=>{
    if(isLove){
      const list=await clients.matchAll({type:'window',includeUncontrolled:true});
      for(const client of list){
        client.postMessage({type:'love_ping',sender:title,message:body});
      }
    }
    await self.registration.showNotification(title,options);
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const d=event.notification.data||{};
  let url=d.url||APP_SCOPE;
  if(d.kind==='love'){
    const payload=encodeURIComponent(JSON.stringify({sender:d.sender||'',message:d.message||'Я люблю тебя! ❤️'}));
    url=new URL('./#love='+payload,APP_SCOPE).href;
  }
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      if(new URL(client.url).origin===new URL(url).origin){
        await client.focus();
        if('navigate' in client) await client.navigate(url);
        return;
      }
    }
    if(clients.openWindow) await clients.openWindow(url);
  })());
});
