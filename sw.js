const APP_SCOPE=self.registration?.scope||new URL('./',self.location.href).href;
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()||''}}
  const title=data.title||'Мы вдвоём ❤️';
  const options={
    body:data.body||'Есть новое в вашем общем месте.',
    icon:new URL('app-icon.svg',APP_SCOPE).href,
    badge:new URL('app-icon.svg',APP_SCOPE).href,
    tag:data.tag||'family-update',
    renotify:true,
    data:{url:new URL(data.url||'./',APP_SCOPE).href,kind:data.kind||'',itemId:data.itemId||null}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||APP_SCOPE;
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
