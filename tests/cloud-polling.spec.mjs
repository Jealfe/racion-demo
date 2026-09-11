import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

function installCloudDevice(){
  localStorage.clear();
  localStorage.setItem('us_family_token','t'.repeat(64));
  localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
  Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{}});
}

const unread={thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0};

test('повторный одинаковый cloud sync не пересоздаёт карточку Спасибо',async({page})=>{
  await page.addInitScript(installCloudDevice);
  let syncCalls=0;
  const item={
    id:'22222222-2222-4222-8222-222222222222',kind:'thanks',text:'Спасибо тебе за кофе ❤️',emoji:null,data:{},author_name:'Жена',image_url:null,created_at:'2026-09-10T12:00:00.000Z',updated_at:'2026-09-10T12:00:00.000Z'
  };
  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync'){syncCalls++;data={ok:true,author:'Муж',items:[item],unread}}
    else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[item],comments:[],reactions:[],activity:[]};
    else if(body.action==='mark_read')data={ok:true,unread};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });

  await page.goto(base);
  await expect(page.locator('.local-pill')).toContainText('общая синхронизация');
  await page.getByRole('button',{name:/Спасибо/}).first().click();
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
  await page.evaluate(()=>{document.querySelector('#thanksFeed .feed-item').__cloudStableProbe='same-node'});

  await page.waitForTimeout(11000);
  expect(syncCalls).toBeGreaterThanOrEqual(2);
  const sameNode=await page.evaluate(()=>document.querySelector('#thanksFeed .feed-item')?.__cloudStableProbe==='same-node');
  expect(sameNode).toBeTruthy();
});

test('новый signed URL при каждом sync не пересоздаёт фото Дом и дизайны',async({page})=>{
  await page.addInitScript(installCloudDevice);
  let syncCalls=0;
  const baseItem={
    id:'33333333-3333-4333-8333-333333333333',kind:'designs',text:'Светлые рейки у кровати',emoji:null,
    data:{room:'bedroom1',source:''},author_name:'Жена',image_path:'designs/room.jpg',created_at:'2026-09-10T12:00:00.000Z',updated_at:'2026-09-10T12:00:00.000Z'
  };
  await page.route('https://example.com/signed-room.jpg**',async route=>{
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
    await route.fulfill({status:200,contentType:'image/png',body:png});
  });
  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync'){
      syncCalls++;
      data={ok:true,author:'Муж',items:[{...baseItem,image_url:`https://example.com/signed-room.jpg?token=${syncCalls}`}],unread};
    }else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[baseItem],comments:[],reactions:[],activity:[]};
    else if(body.action==='mark_read')data={ok:true,unread};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });

  await page.goto(base);
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  await expect(page.locator('#designBoard .idea-card')).toHaveCount(1);
  await expect(page.locator('#designBoard')).toContainText('Светлые рейки у кровати');
  const initialSrc=await page.locator('#designBoard .idea-card img').getAttribute('src');
  await page.evaluate(()=>{document.querySelector('#designBoard .idea-card').__designStableProbe='same-node'});

  await page.waitForTimeout(11000);
  expect(syncCalls).toBeGreaterThanOrEqual(3);
  const result=await page.evaluate(()=>({
    sameNode:document.querySelector('#designBoard .idea-card')?.__designStableProbe==='same-node',
    src:document.querySelector('#designBoard .idea-card img')?.getAttribute('src')||''
  }));
  expect(result.sameNode).toBeTruthy();
  expect(result.src).toBe(initialSrc);
});

test('новый signed URL при каждом sync не пересоздаёт карточку Наши моменты',async({page})=>{
  await page.addInitScript(installCloudDevice);
  let syncCalls=0;
  const baseItem={
    id:'44444444-4444-4444-8444-444444444444',kind:'moments',text:'Наш тестовый момент',emoji:null,
    data:{date:'2026-09-10'},author_name:'Жена',created_at:'2026-09-10T12:00:00.000Z',updated_at:'2026-09-10T12:00:00.000Z'
  };
  await page.route('https://example.com/signed-moment.jpg**',async route=>{
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
    await route.fulfill({status:200,contentType:'image/png',body:png});
  });
  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync'){
      syncCalls++;
      data={ok:true,author:'Муж',items:[{...baseItem,image_url:`https://example.com/signed-moment.jpg?token=${syncCalls}`}],unread};
    }else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[baseItem],comments:[],reactions:[],activity:[]};
    else if(body.action==='mark_read')data={ok:true,unread};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });

  await page.goto(base);
  await page.getByRole('button',{name:/Наши моменты/}).click();
  await expect(page.locator('#momentGrid .moment')).toHaveCount(1);
  await expect(page.locator('#momentGrid')).toContainText('Наш тестовый момент');
  const initialSrc=await page.locator('#momentGrid .moment img').getAttribute('src');
  await page.evaluate(()=>{document.querySelector('#momentGrid .moment').__momentStableProbe='same-node'});

  await page.waitForTimeout(11000);
  expect(syncCalls).toBeGreaterThanOrEqual(3);
  const result=await page.evaluate(()=>({
    sameNode:document.querySelector('#momentGrid .moment')?.__momentStableProbe==='same-node',
    src:document.querySelector('#momentGrid .moment img')?.getAttribute('src')||''
  }));
  expect(result.sameNode).toBeTruthy();
  expect(result.src).toBe(initialSrc);
});
