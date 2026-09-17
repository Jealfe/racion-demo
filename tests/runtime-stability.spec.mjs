import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

function installDevice(){
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('us_family_token','t'.repeat(64));
  localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
  Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{}});
  sessionStorage.setItem('runtime_loads',String((Number(sessionStorage.getItem('runtime_loads'))||0)+1));
}

const unread={thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0};

function routeCloud(page,{failWhoami=false,activity=[]}={}){
  return page.route('**/functions/v1/family-api',async route=>{
    let body={};
    try{body=route.request().postDataJSON()||{}}catch{}
    if(body.action==='whoami'&&failWhoami){
      await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'TEMPORARY'})});
      return;
    }
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync')data={ok:true,author:'Муж',items:[],unread};
    else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[],comments:[],reactions:[],activity};
    else if(body.action==='mark_read')data={ok:true,unread};
    else if(body.action==='push_status')data={ok:true,enabled:false};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
}

test('временная ошибка облака не перезагружает приложение сама',async({page})=>{
  await page.addInitScript(installDevice);
  await routeCloud(page,{failWhoami:true});
  await page.goto(base);
  await page.waitForTimeout(6500);
  expect(await page.evaluate(()=>sessionStorage.getItem('runtime_loads'))).toBe('1');
  expect(await page.evaluate(()=>localStorage.getItem('us_family_token'))).toBe('t'.repeat(64));
});

test('одинаковая лента Что нового не пересоздаётся на очередном polling',async({page})=>{
  await page.addInitScript(installDevice);
  const activity=[{
    id:'activity-1',kind:'ideas',action:'create',actor_name:'Жена',text:'Купить красивую лампу',created_at:'2026-09-17T08:00:00.000Z',data:{}
  }];
  await routeCloud(page,{activity});
  await page.goto(base);
  await expect(page.locator('#activityList .activity-row')).toHaveCount(1);
  await page.evaluate(()=>{document.querySelector('#activityList .activity-row').__stableProbe='same-node'});
  await page.waitForTimeout(11000);
  expect(await page.evaluate(()=>document.querySelector('#activityList .activity-row')?.__stableProbe==='same-node')).toBeTruthy();
});

test('главная резервирует место под последние записи во время первой синхронизации',async({page})=>{
  await page.addInitScript(installDevice);
  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    if(body.action==='social_sync'){
      await new Promise(resolve=>setTimeout(resolve,700));
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,author:'Муж',items:[],comments:[],reactions:[],activity:[]})});
      return;
    }
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync')data={ok:true,author:'Муж',items:[],unread};
    else if(body.action==='mark_read')data={ok:true,unread};
    else if(body.action==='push_status')data={ok:true,enabled:false};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.goto(base);
  await expect(page.locator('#familyActivity')).toBeVisible();
  await expect(page.locator('#activityList')).toBeVisible();
  await expect(page.locator('#activityList')).not.toContainText('Обновляем последние записи',{timeout:3000});
});
