import {test,expect} from './test-fixture.mjs';

const base='http://127.0.0.1:8000/';

function json(route,body,status=200){
  return route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
}

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    localStorage.setItem('us_profile',JSON.stringify({name:'Жена'}));
    localStorage.setItem('us_family_token','x'.repeat(64));
  });
});

test('напоминание сохраняется без визуального зависания при медленном повторном списке',async({page})=>{
  let listCalls=0;
  await page.route('**/functions/v1/reminder-api',async route=>{
    const data=JSON.parse(route.request().postData()||'{}');
    if(data.action==='list'){
      listCalls++;
      if(listCalls>1)await new Promise(r=>setTimeout(r,2500));
      return json(route,{ok:true,author:'Жена',people:['Муж','Жена'],items:[]});
    }
    if(data.action==='create')return json(route,{ok:true,id:'rem-1'});
    return json(route,{ok:true});
  });
  await page.goto(base);
  await page.waitForFunction(()=>document.querySelector('[data-open="reminders"]'));
  await page.locator('[data-open="reminders"]').click();
  await page.locator('#remText').fill('Забрать документы');
  await page.locator('#remDate').fill('2030-01-01');
  await page.locator('#remTime').fill('10:00');
  const save=page.locator('#remSave');
  await save.click();
  await expect(page.locator('#toast')).toContainText('Напоминание добавлено');
  await expect(save).toBeEnabled({timeout:1000});
  await expect(save).toHaveText('Добавить напоминание');
});

test('ошибка загрузки списка не блокирует форму напоминания',async({page})=>{
  await page.route('**/functions/v1/reminder-api',async route=>{
    const data=JSON.parse(route.request().postData()||'{}');
    if(data.action==='list')return json(route,{error:'temporary'},503);
    return json(route,{ok:true});
  });
  await page.goto(base);
  await page.waitForFunction(()=>document.querySelector('[data-open="reminders"]'));
  await page.locator('[data-open="reminders"]').click();
  await expect(page.locator('#remOffline')).toBeVisible();
  await expect(page.locator('#remText')).toBeVisible();
  await expect(page.locator('#remSave')).toBeEnabled();
});
