import {test,expect} from './test-fixture.mjs';
const base='http://127.0.0.1:8000/';
const token='t'.repeat(64),unread={};
async function setup(page,handler){
  await page.addInitScript(t=>{localStorage.setItem('us_family_token',t);localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}))},token);
  await page.route('**/functions/v1/reminder-api',r=>r.fulfill({json:{ok:true,items:[]}}));
  await page.route('**/functions/v1/family-api',async r=>{
    const body=r.request().postDataJSON();if(await handler?.(r,body))return;
    await r.fulfill({json:body.action==='sync'?{ok:true,author:'Муж',items:[],unread}:body.action==='social_sync'?{ok:true,author:'Муж',items:[],comments:[],reactions:[],activity:[]}:{ok:true,author:'Муж',unread}});
  });
}
test('screens are built before slow cloud data and native innerHTML remains intact',async({page})=>{
  await page.addInitScript(()=>window.originalInnerHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML').set);
  await setup(page,async(r,b)=>{if(b.action==='sync'||b.action==='social_sync'){await new Promise(resolve=>setTimeout(resolve,4000));await r.fulfill({json:{ok:true,items:[],activity:[]}});return true}});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#cu2WishText')).toBeAttached({timeout:2000});
  expect(await page.evaluate(()=>Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML').set===window.originalInnerHTML)).toBe(true);
});
test('a failed sync recovers on reconnect without reload or losing token',async({page})=>{
  let failed=true,calls=0;
  await setup(page,async(r,b)=>{if(b.action==='sync'){calls++;await r.fulfill({status:failed?503:200,json:failed?{error:'offline'}:{ok:true,author:'Муж',items:[],unread}});return true}});
  await page.goto(base);await expect.poll(()=>calls).toBeGreaterThanOrEqual(2);
  failed=false;await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await expect(page.locator('.local-pill')).toContainText('общая синхронизация');
  expect(await page.evaluate(()=>localStorage.getItem('us_family_token'))).toBe(token);
});
test('a movie saved during a slow sync survives the old server response',async({page})=>{
  let slow=false,created=false,createCalls=0;const id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  await setup(page,async(r,b)=>{
    if(b.action==='sync'){const items=created?[{id,kind:'movies',text:'Сохранить во время sync',data:{},author_name:'Муж',created_at:new Date().toISOString()}]:[];if(slow)await new Promise(resolve=>setTimeout(resolve,900));await r.fulfill({json:{ok:true,author:'Муж',items,unread}});return true}
    if(b.action==='create'){createCalls++;created=true;await r.fulfill({json:{ok:true,id}});return true}
  });
  await page.goto(base);await expect(page.locator('.local-pill')).toContainText('общая синхронизация');
  await page.locator('[data-open="movies"]').click();slow=true;
  await page.evaluate(()=>{void window.familyCloud.refresh()});
  await page.locator('#movieInput').fill('Сохранить во время sync');await page.locator('#addMovie').click();
  await expect(page.locator('#movieList')).toContainText('Сохранить во время sync');await page.waitForTimeout(1500);
  await expect(page.locator('#movieList')).toContainText('Сохранить во время sync');expect(createCalls).toBe(1);
});
test('one activity block and bounded network polling over 30 seconds',async({page})=>{
  test.setTimeout(40000);
  let sync=0,social=0;await setup(page,async(_r,b)=>{if(b.action==='sync')sync++;if(b.action==='social_sync')social++;return false});
  await page.goto(base);await expect(page.locator('#familyActivity')).toHaveCount(1);await expect(page.locator('#familyTools')).toHaveCount(1);
  await page.waitForTimeout(30500);expect(sync).toBeLessThanOrEqual(5);expect(social).toBeLessThanOrEqual(5);
  await expect(page.locator('#home #pushBtn')).not.toBeVisible();
});
