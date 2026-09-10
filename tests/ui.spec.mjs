import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';
async function confirmDelete(page,trigger){
  await trigger.click();
  await expect(page.locator('#deleteConfirm')).toHaveClass(/show/);
  await page.locator('#deleteConfirm .confirm-delete').click();
  await expect(page.locator('#deleteConfirm')).not.toHaveClass(/show/);
}

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    if(!sessionStorage.getItem('test_no_profile')) localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
    Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{}});
  });
  await page.goto(base);
  await page.waitForFunction(()=>window.__appReady===true);
});

test('главная и навигация открывают основные разделы',async({page})=>{
  await expect(page.getByRole('heading',{name:'Мы вдвоём',exact:true})).toBeVisible();
  await expect(page.locator('#profileName')).toHaveText('Муж');
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  await expect(page.getByRole('heading',{name:'Дом и дизайны',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Главная'}).click();
  await page.getByRole('button',{name:/Спасибо/}).first().click();
  await expect(page.getByRole('heading',{name:'Спасибо',exact:true})).toBeVisible();
});

test('при первом входе можно выбрать автора устройства',async({page})=>{
  await page.evaluate(()=>{sessionStorage.setItem('test_no_profile','1');localStorage.removeItem('us_profile')});
  await page.reload();
  await expect(page.locator('#profileSetup')).toHaveClass(/show/);
  await page.getByRole('button',{name:'❤️ Жена'}).click();
  await expect(page.locator('#profileSetup')).not.toHaveClass(/show/);
  await expect(page.locator('#profileName')).toHaveText('Жена');
});

test('спасибо отправляется один раз, подписывается и форма сбрасывается',async({page})=>{
  await page.getByRole('button',{name:/Спасибо/}).first().click();
  const send=page.locator('#shareThanks');
  await expect(send).toBeDisabled();
  await page.getByRole('button',{name:'☕ За кофе'}).click();
  await expect(page.locator('#thanksPreview')).toContainText('Спасибо тебе за кофе');
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.locator('#thanksPreview')).toContainText('Выбери, за что хочешь сказать спасибо');
  await expect(send).toBeDisabled();
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
  await expect(page.locator('#thanksFeed')).toContainText('Муж');
  await send.click({force:true});
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
});

test('входящее спасибо сохраняет автора и не дублируется',async({page})=>{
  const payload=encodeURIComponent(JSON.stringify({id:'same_message',text:'Спасибо тебе за ужин ❤️',date:'2026-09-10T10:00:00.000Z',author:'Жена'}));
  await page.goto(base+'#thanks='+payload);
  await expect(page.locator('#received')).toHaveClass(/show/);
  await expect(page.locator('#received .modal-card h3')).toContainText('Жена');
  await page.locator('#closeReceived').click();
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
  await expect(page.locator('#thanksFeed')).toContainText('От Жена');
  await page.goto(base+'#thanks='+payload);
  await expect(page.locator('#received')).toHaveClass(/show/);
  await page.locator('#closeReceived').click();
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
});

test('новая запись другого автора включает лампочку и открытие гасит её',async({page})=>{
  await page.evaluate(()=>{
    const next=[{id:777,t:'Новая хотелка от жены',type:'🎁',done:false,author:'Жена',createdAt:new Date().toISOString()}];
    const raw=JSON.stringify(next);
    localStorage.setItem('us_wishes',raw);
    window.dispatchEvent(new StorageEvent('storage',{key:'us_wishes',oldValue:'[]',newValue:raw}));
  });
  await expect(page.locator('#activitySignal')).toHaveClass(/show/);
  await expect(page.locator('[data-open="wishlist"] .notify-badge')).toHaveClass(/show/);
  await expect(page.locator('#activityText')).toContainText('Хотелки: 1');
  await page.locator('[data-open="wishlist"]').click();
  await expect(page.locator('#wishList')).toContainText('Новая хотелка от жены');
  await expect(page.locator('#wishList')).toContainText('Жена');
  await expect(page.locator('[data-open="wishlist"] .notify-badge')).not.toHaveClass(/show/);
});

test('доска дизайнов позволяет добавить фото по комнате, открыть и удалить с подтверждением',async({page})=>{
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  await expect(page.getByText('Наша доска идей')).toBeVisible();
  await page.locator('#designRoom').selectOption('bedroom1');
  await page.locator('#designComment').fill('Подсветка за рейками у кровати');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
  await page.locator('#designPhoto').setInputFiles({name:'idea.png',mimeType:'image/png',buffer:png});
  await page.locator('#addDesignIdea').click();
  await expect(page.locator('#designBoard')).toContainText('Подсветка за рейками у кровати');
  await expect(page.locator('#designBoard')).toContainText('Спальня 1');
  await expect(page.locator('#designBoard')).toContainText('Муж');
  await page.locator('.idea-card .pic').first().click();
  await expect(page.locator('#designViewer')).toHaveClass(/show/);
  await page.locator('#closeViewer').click();
  await page.locator('.idea-card .idea-del').click();
  await expect(page.locator('#deleteConfirm')).toHaveClass(/show/);
  await page.locator('#deleteConfirm .cancel-delete').click();
  await expect(page.locator('#designBoard')).toContainText('Подсветка за рейками у кровати');
  await confirmDelete(page,page.locator('.idea-card .idea-del'));
  await expect(page.locator('#designBoard')).not.toContainText('Подсветка за рейками у кровати');
});

test('фильмы выбираются, добавляются с автором и удаляются после подтверждения',async({page})=>{
  await page.getByRole('button',{name:/Что посмотреть/}).click();
  await page.getByRole('button',{name:'Смешной'}).click();
  await page.locator('#pickMovie').click();
  await expect(page.locator('#movieResult')).toHaveClass(/show/);
  await page.locator('#movieInput').fill('Наш тестовый фильм');
  await page.locator('#addMovie').click();
  await expect(page.locator('#movieList')).toContainText('Наш тестовый фильм');
  await expect(page.locator('#movieList')).toContainText('Муж');
  await confirmDelete(page,page.locator('.del-movie'));
  await expect(page.locator('#movieList')).not.toContainText('Наш тестовый фильм');
});

test('еда и сюрприз выдают результат',async({page})=>{
  await page.getByRole('button',{name:/Что поесть/}).click();
  await page.getByRole('button',{name:'Быстро'}).click();
  await page.locator('#pickFood').click();
  await expect(page.locator('#foodResult')).toHaveClass(/show/);
  await page.getByRole('button',{name:'Сюрприз'}).last().click();
  await page.locator('#surpriseBtn').click();
  await expect(page.locator('#surpriseTitle')).not.toHaveText('Нажми и узнаешь');
});

test('хотелка остаётся после галочки, возвращается обратно и удаляется только после подтверждения',async({page})=>{
  await page.getByRole('button',{name:/Хотелки/}).click();
  await page.locator('#wishText').fill('Кофемашина');
  await page.locator('#addWish').click();
  await expect(page.locator('#wishList')).toContainText('Кофемашина');
  await expect(page.locator('#wishList')).toContainText('Муж');
  const toggle=page.locator('.wish-done');
  await toggle.click();
  await expect(page.locator('#wishList .list-item')).toHaveClass(/done/);
  await expect(page.locator('#wishList')).toContainText('исполнено');
  await expect(page.locator('#wishList')).toContainText('Кофемашина');
  await toggle.click();
  await expect(page.locator('#wishList .list-item')).not.toHaveClass(/done/);
  await expect(page.locator('#wishList')).toContainText('хочется');
  await confirmDelete(page,page.locator('.wish-del'));
  await expect(page.locator('#wishList')).not.toContainText('Кофемашина');
});

test('идея остаётся после галочки, возвращается обратно и кнопки не перекрываются',async({page})=>{
  await page.getByRole('button',{name:/Идеи/}).click();
  await page.getByRole('button',{name:'🍴 Попробовать'}).click();
  await page.locator('#ideaText').fill('Новый десерт');
  await page.locator('#addIdea').click();
  await expect(page.locator('#ideaList')).toContainText('Новый десерт');
  await expect(page.locator('#ideaList')).toContainText('Муж');
  const done=page.locator('#ideaList .idea-done'),del=page.locator('#ideaList .idea-del');
  const db=await done.boundingBox(),xb=await del.boundingBox();
  expect(db&&xb&&db.x+db.width<=xb.x).toBeTruthy();
  await done.click();
  await expect(page.locator('#ideaList .list-item')).toHaveClass(/done/);
  await expect(page.locator('#ideaList')).toContainText('готово');
  await expect(page.locator('#ideaList')).toContainText('Новый десерт');
  await done.click();
  await expect(page.locator('#ideaList .list-item')).not.toHaveClass(/done/);
  await expect(page.locator('#ideaList')).toContainText('в списке');
  await confirmDelete(page,del);
  await expect(page.locator('#ideaList')).not.toContainText('Новый десерт');
});

test('нам нравится добавляется с автором и удаляется после подтверждения',async({page})=>{
  await page.getByRole('button',{name:/Нам нравится/}).click();
  await page.locator('#likeText').fill('Песня для нас');
  await page.locator('#addLike').click();
  await expect(page.locator('#likeList')).toContainText('Песня для нас');
  await expect(page.locator('#likeList')).toContainText('Муж');
  await confirmDelete(page,page.locator('.like-del'));
  await expect(page.locator('#likeList')).not.toContainText('Песня для нас');
});

test('момент с картинкой добавляется с автором и удаляется после подтверждения',async({page})=>{
  await page.getByRole('button',{name:/Наши моменты/}).click();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
  await page.locator('#momentPhoto').setInputFiles({name:'tiny.png',mimeType:'image/png',buffer:png});
  await page.locator('#momentText').fill('Тестовый момент');
  await page.locator('#addMoment').click();
  await expect(page.locator('#momentGrid')).toContainText('Тестовый момент');
  await expect(page.locator('#momentGrid')).toContainText('Муж');
  await confirmDelete(page,page.locator('.moment-del'));
  await expect(page.locator('#momentGrid')).not.toContainText('Тестовый момент');
});

test('облачная запись получает ленту, реакции, комментарии и редактирование своей записи',async({page})=>{
  const id='11111111-1111-4111-8111-111111111111';
  let text='Кофемашина',comments=[],reactions=[];
  await page.route('**/functions/v1/family-api',async route=>{
    const req=route.request();let body={};try{body=req.postDataJSON()||{}}catch{}
    const item=()=>({id,kind:'wishlist',text,emoji:'🎁',data:{done:false},author_name:'Муж',created_at:'2026-09-10T12:00:00.000Z',updated_at:'2026-09-10T12:00:00.000Z'});
    let data={ok:true};
    if(body.action==='whoami')data={ok:true,author:'Муж'};
    else if(body.action==='sync')data={ok:true,author:'Муж',items:[item()],unread:{thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0}};
    else if(body.action==='social_sync')data={ok:true,author:'Муж',items:[item()],comments,reactions,activity:[{id:'a1',actor_name:'Жена',action:'comment',kind:'wishlist',item_id:id,text:'А эта модель тихая?',data:{},created_at:'2026-09-10T12:05:00.000Z'}]};
    else if(body.action==='mark_read')data={ok:true,unread:{thanks:0,wishlist:0,ideas:0,likes:0,moments:0,movies:0,designs:0}};
    else if(body.action==='reaction_toggle'){
      const at=reactions.findIndex(r=>r.item_id===id&&r.author_name==='Муж'&&r.emoji===body.emoji);
      if(at>=0){reactions.splice(at,1);data={ok:true,active:false}}else{reactions.push({item_id:id,author_name:'Муж',emoji:body.emoji,created_at:new Date().toISOString()});data={ok:true,active:true}}
    }else if(body.action==='comment_add'){comments.push({id:'c1',item_id:id,author_name:'Муж',text:body.text,created_at:new Date().toISOString()});data={ok:true,id:'c1'}}
    else if(body.action==='edit'){text=body.text;data={ok:true}};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  const key='mock_family_token_1234567890123456789012345678901234567890';
  await page.goto(base+'#access='+key);
  await expect(page.locator('.local-pill')).toContainText('общая синхронизация');
  await expect(page.locator('#activityList')).toContainText('Жена написал(а) комментарий');
  await page.locator('[data-open="wishlist"]').click();
  await expect(page.locator('#wishList')).toContainText('Кофемашина');
  await expect(page.locator('#wishList .social-tools')).toBeVisible();
  await page.locator('#wishList [data-react][data-emoji="❤️"]').click();
  await expect(page.locator('#wishList [data-react][data-emoji="❤️"]')).toHaveClass(/active/);
  await page.locator('#wishList [data-comments]').click();
  await expect(page.locator('#socialThread')).toHaveClass(/show/);
  await page.locator('#threadInput').fill('Да, посмотрим отзывы');
  await page.locator('#threadSend').click();
  await expect(page.locator('#threadList')).toContainText('Да, посмотрим отзывы');
  await page.locator('[data-social-close="socialThread"]').click();
  await page.locator('#wishList [data-edit]').click();
  await page.locator('#editInput').fill('Кофемашина с тихой кофемолкой');
  await page.locator('#editSave').click();
  await expect(page.locator('#wishList')).toContainText('Кофемашина с тихой кофемолкой');
});
