import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
  });
  await page.goto(base);
  await page.waitForFunction(()=>window.__appReady===true);
});

test('v2 хотелки: добавление, архив Исполнилось и возврат',async({page})=>{
  await page.getByRole('button',{name:/Хотелки/}).click();
  await page.locator('#cu2WishText').fill('Кофемашина');
  await page.locator('#cu2WishFor').selectOption('us');
  await page.locator('#cu2WishPriority').selectOption('hot');
  await page.locator('#cu2WishLink').fill('https://example.com/coffee');
  await page.locator('#cu2WishAdd').click();
  await expect(page.locator('#cu2WishActive')).toContainText('Кофемашина');
  await expect(page.locator('#cu2WishActive')).toContainText('Нам');
  await expect(page.locator('#cu2WishActive')).toContainText('Очень хочется');
  await page.locator('[data-cu2-wish-toggle]').click();
  await expect(page.locator('#cu2WishDone')).toContainText('Кофемашина');
  await expect(page.locator('#cu2WishActive')).not.toContainText('Кофемашина');
  await page.locator('#cu2WishDone [data-cu2-wish-toggle]').click();
  await expect(page.locator('#cu2WishActive')).toContainText('Кофемашина');
  await page.locator('[data-cu2-wish-del]').click();
  await expect(page.locator('#cu2WishActive')).not.toContainText('Кофемашина');
});

test('v2 идеи: идея проходит стадии до Сделали',async({page})=>{
  await page.getByRole('button',{name:/Идеи/}).click();
  await page.locator('#cu2IdeaText').fill('Сходить на завтрак');
  await page.locator('#cu2IdeaCat').selectOption('go');
  await page.locator('#cu2IdeaAdd').click();
  await expect(page.locator('#cu2IdeasActive')).toContainText('Сходить на завтрак');
  await expect(page.locator('#cu2IdeasActive')).toContainText('Идея');
  await page.locator('[data-cu2-idea-next]').click();
  await expect(page.locator('#cu2IdeasActive')).toContainText('Запланировано');
  await page.locator('[data-cu2-idea-next]').click();
  await expect(page.locator('#cu2IdeasDone')).toContainText('Сходить на завтрак');
  await page.locator('#cu2IdeasDone [data-cu2-idea-next]').click();
  await expect(page.locator('#cu2IdeasActive')).toContainText('Сходить на завтрак');
});

test('v2 Нам нравится: категория, ссылка и поиск',async({page})=>{
  await page.getByRole('button',{name:/Нам нравится/}).click();
  await page.locator('#cu2LikeText').fill('Наша песня');
  await page.locator('#cu2LikeCat').selectOption('music');
  await page.locator('#cu2LikeLink').fill('https://example.com/song');
  await page.locator('#cu2LikeAdd').click();
  await expect(page.locator('#cu2LikeCards')).toContainText('Наша песня');
  await expect(page.locator('#cu2LikeCards')).toContainText('Музыка');
  await page.locator('#cu2LikeSearch').fill('песня');
  await expect(page.locator('#cu2LikeCards')).toContainText('Наша песня');
  await page.locator('#cu2LikeSearch').fill('несуществующее');
  await expect(page.locator('#cu2LikeCards')).not.toContainText('Наша песня');
});

test('v2 моменты: фото добавляется и попадает в галерею',async({page})=>{
  await page.getByRole('button',{name:/Наши моменты/}).click();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
  await page.locator('#cu2MomentPhoto').setInputFiles({name:'tiny.png',mimeType:'image/png',buffer:png});
  await page.locator('#cu2MomentText').fill('Тестовый момент');
  await page.locator('#cu2MomentAdd').click();
  await expect(page.locator('#cu2MomentCards')).toContainText('Тестовый момент');
  await expect(page.locator('#cu2MomentCards img')).toHaveCount(1);
});

test('v2 облачная хотелка показывает реакции и комментарии',async({page})=>{
  const id='11111111-1111-4111-8111-111111111111';
  const item={id,kind:'wishlist',text:'Кофемашина',emoji:'🎁',image_path:null,image_url:null,data:{done:false,forWhom:'us',priority:'want'},author_name:'Муж',created_at:'2026-09-10T12:00:00.000Z',updated_at:'2026-09-10T12:00:00.000Z'};
  let reactions=[];
  await page.route('**/functions/v1/family-api',async route=>{
    let body={};try{body=route.request().postDataJSON()||{}}catch{}
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync')data={ok:true,author:'Муж',items:[item],unread:{thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0}};
    else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[item],comments:[],reactions,activity:[]};
    else if(body.action==='mark_read')data={ok:true,unread:{thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0}};
    else if(body.action==='reaction_toggle'){
      reactions=[{item_id:id,author_name:'Муж',emoji:body.emoji,created_at:new Date().toISOString()}];
      data={ok:true,active:true};
    }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  const key='mock_family_token_1234567890123456789012345678901234567890';
  await page.goto(base+'#access='+key);
  await expect(page.locator('.local-pill')).toContainText('общая синхронизация');
  await page.locator('[data-open="wishlist"]').click();
  await expect(page.locator('#cu2WishActive')).toContainText('Кофемашина');
  await expect(page.locator('#cu2WishActive .social-tools')).toBeVisible();
  await page.locator('#cu2WishActive [data-react][data-emoji="❤️"]').click();
  await expect(page.locator('#cu2WishActive [data-react][data-emoji="❤️"]')).toHaveClass(/active/);
});
