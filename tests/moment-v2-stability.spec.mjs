import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';
const unread={thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0};

test('v2 Наши моменты не пересоздаёт карточку при новом signed URL',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    localStorage.setItem('us_family_token','t'.repeat(64));
    localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
  });

  let syncCalls=0;
  const baseItem={
    id:'55555555-5555-4555-8555-555555555555',kind:'moments',text:'Наш стабильный момент',emoji:null,
    data:{date:'2026-09-11'},author_name:'Жена',created_at:'2026-09-11T12:00:00.000Z',updated_at:'2026-09-11T12:00:00.000Z'
  };

  await page.route('https://example.com/v2-moment.jpg**',async route=>{
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
    await route.fulfill({status:200,contentType:'image/png',body:png});
  });

  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync'){
      syncCalls++;
      data={ok:true,author:'Муж',items:[{...baseItem,image_url:`https://example.com/v2-moment.jpg?token=${syncCalls}`}],unread};
    }else if(body.action==='social_sync'){
      data={ok:true,author:'Муж',items:[baseItem],comments:[],reactions:[],activity:[]};
    }else if(body.action==='mark_read')data={ok:true,unread};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });

  await page.goto(base);
  await page.waitForFunction(()=>window.__appReady===true);
  await page.getByRole('button',{name:/Наши моменты/}).click();
  await expect(page.locator('#cu2MomentCards .cu2-moment')).toHaveCount(1);
  await expect(page.locator('#cu2MomentCards')).toContainText('Наш стабильный момент');
  await page.waitForFunction(()=>window.__momentStabilityV2===true&&document.querySelector('#cu2MomentCards')?.__momentStableGuard===true);

  const initialSrc=await page.locator('#cu2MomentCards .cu2-moment img').getAttribute('src');
  await page.evaluate(()=>{document.querySelector('#cu2MomentCards .cu2-moment').__v2StableProbe='same-node'});

  await page.waitForTimeout(11000);
  expect(syncCalls).toBeGreaterThanOrEqual(2);
  const result=await page.evaluate(()=>({
    sameNode:document.querySelector('#cu2MomentCards .cu2-moment')?.__v2StableProbe==='same-node',
    src:document.querySelector('#cu2MomentCards .cu2-moment img')?.getAttribute('src')||''
  }));
  expect(result.sameNode).toBeTruthy();
  expect(result.src).toBe(initialSrc);
});
