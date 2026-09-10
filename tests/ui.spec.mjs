import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{}});
  });
  await page.goto(base);
});

test('главная и навигация открывают основные разделы',async({page})=>{
  await expect(page.getByRole('heading',{name:'Мы вдвоём',exact:true})).toBeVisible();
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  await expect(page.getByRole('heading',{name:'Дом и дизайны',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Главная'}).click();
  await page.getByRole('button',{name:/Спасибо/}).first().click();
  await expect(page.getByRole('heading',{name:'Спасибо',exact:true})).toBeVisible();
});

test('спасибо отправляется один раз и форма сбрасывается',async({page})=>{
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
  await send.click({force:true});
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
});

test('входящее спасибо с одним id не дублируется',async({page})=>{
  const payload=encodeURIComponent(JSON.stringify({id:'same_message',text:'Спасибо тебе за ужин ❤️',date:'2026-09-10T10:00:00.000Z'}));
  await page.goto(base+'#thanks='+payload);
  await expect(page.locator('#received')).toHaveClass(/show/);
  await page.locator('#closeReceived').click();
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
  await page.goto(base+'#thanks='+payload);
  await expect(page.locator('#received')).toHaveClass(/show/);
  await page.locator('#closeReceived').click();
  await expect(page.locator('#thanksFeed .feed-item')).toHaveCount(1);
});

test('дизайн открывается крупно и лайк переключается',async({page})=>{
  await page.getByRole('button',{name:/Дом и дизайны/}).click();
  const first=page.locator('.design').first();
  await first.click();
  await expect(page.locator('#designViewer')).toHaveClass(/show/);
  await page.locator('#closeViewer').click();
  const heart=first.locator('.heart');
  await heart.click();
  await expect(heart).toHaveText('♥');
  await heart.click();
  await expect(heart).toHaveText('♡');
});

test('фильмы выбираются, добавляются и удаляются',async({page})=>{
  await page.getByRole('button',{name:/Что посмотреть/}).click();
  await page.getByRole('button',{name:'Смешной'}).click();
  await page.locator('#pickMovie').click();
  await expect(page.locator('#movieResult')).toHaveClass(/show/);
  await page.locator('#movieInput').fill('Наш тестовый фильм');
  await page.locator('#addMovie').click();
  await expect(page.locator('#movieList')).toContainText('Наш тестовый фильм');
  await page.locator('.del-movie').click();
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

test('хотелка добавляется, отмечается и удаляется',async({page})=>{
  await page.getByRole('button',{name:/Хотелки/}).click();
  await page.locator('#wishText').fill('Кофемашина');
  await page.locator('#addWish').click();
  await expect(page.locator('#wishList')).toContainText('Кофемашина');
  await page.locator('.wish-done').click();
  await expect(page.locator('#wishList .list-item')).toHaveClass(/done/);
  await page.locator('.wish-del').click();
  await expect(page.locator('#wishList')).not.toContainText('Кофемашина');
});

test('идея добавляется, отмечается и удаляется',async({page})=>{
  await page.getByRole('button',{name:/Идеи/}).click();
  await page.getByRole('button',{name:'🍴 Попробовать'}).click();
  await page.locator('#ideaText').fill('Новый десерт');
  await page.locator('#addIdea').click();
  await expect(page.locator('#ideaList')).toContainText('Новый десерт');
  await page.locator('.idea-done').click();
  await expect(page.locator('#ideaList .list-item')).toHaveClass(/done/);
  await page.locator('.idea-del').click();
  await expect(page.locator('#ideaList')).not.toContainText('Новый десерт');
});

test('нам нравится добавляется и удаляется',async({page})=>{
  await page.getByRole('button',{name:/Нам нравится/}).click();
  await page.locator('#likeText').fill('Песня для нас');
  await page.locator('#addLike').click();
  await expect(page.locator('#likeList')).toContainText('Песня для нас');
  await page.locator('.like-del').click();
  await expect(page.locator('#likeList')).not.toContainText('Песня для нас');
});

test('момент с картинкой добавляется и удаляется',async({page})=>{
  await page.getByRole('button',{name:/Наши моменты/}).click();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
  await page.locator('#momentPhoto').setInputFiles({name:'tiny.png',mimeType:'image/png',buffer:png});
  await page.locator('#momentText').fill('Тестовый момент');
  await page.locator('#addMoment').click();
  await expect(page.locator('#momentGrid')).toContainText('Тестовый момент');
  await page.locator('.moment-del').click();
  await expect(page.locator('#momentGrid')).not.toContainText('Тестовый момент');
});
