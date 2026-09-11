import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';
const unread={thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0};

function installCloudDevice(){
  localStorage.clear();
  localStorage.setItem('us_family_token','t'.repeat(64));
  localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
}

async function setupApi(page){
  let items=[];
  let created=null;
  await page.route('https://example.com/design-photo.jpg',async route=>{
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
    await route.fulfill({status:200,contentType:'image/png',body:png});
  });
  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync')data={ok:true,author:'Муж',items,unread};
    else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[],comments:[],reactions:[],activity:[]};
    else if(body.action==='mark_read')data={ok:true,unread};
    else if(body.action==='create'&&body.kind==='designs'){
      created=body;
      items=[{id:'55555555-5555-4555-8555-555555555555',kind:'designs',text:body.text||'',emoji:null,image_path:null,data:body.data||{},author_name:'Муж',created_at:'2026-09-11T14:30:00.000Z',updated_at:'2026-09-11T14:30:00.000Z'}];
      data={ok:true,id:items[0].id};
    }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  return {created:()=>created};
}

test('Дом и дизайны принимает прямую ссылку на фото',async({page})=>{
  await page.addInitScript(installCloudDevice);
  const api=await setupApi(page);
  await page.goto(base);
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  await expect(page.locator('#designImageUrl')).toBeVisible();
  await page.locator('#designImageUrl').fill('https://example.com/design-photo.jpg');
  await page.locator('#designComment').fill('Фото добавлено по ссылке');
  await page.locator('#addDesignIdea').click();
  await expect.poll(()=>api.created()?.data?.externalImageUrl).toBe('https://example.com/design-photo.jpg');
  await expect(page.locator('#designBoard [data-view="55555555-5555-4555-8555-555555555555"] img')).toHaveAttribute('src','https://example.com/design-photo.jpg');
});

test('Дом и дизайны принимает скопированное изображение через paste',async({page})=>{
  await page.addInitScript(installCloudDevice);
  await setupApi(page);
  await page.goto(base);
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  await expect(page.locator('#designImageUrl')).toBeVisible();
  await page.evaluate(()=>{
    const bytes=Uint8Array.from([137,80,78,71,13,10,26,10]);
    const file=new File([bytes], 'clipboard.png', {type:'image/png'});
    const dt=new DataTransfer();dt.items.add(file);
    document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
  });
  await expect.poll(()=>page.locator('#designPhoto').evaluate(el=>el.files?.length||0)).toBe(1);
  await expect(page.locator('#designPhotoPick')).toHaveClass(/has-photo/);
});
