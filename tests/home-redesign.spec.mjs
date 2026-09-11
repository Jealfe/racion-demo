import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
  });
  await page.goto(base);
  await page.waitForFunction(()=>window.__homeCardsRedesign===true);
});

test('главная использует новый компактный порядок',async({page})=>{
  const menu=page.locator('#home .menu');
  const moments=menu.locator('[data-open="moments"]');
  const wishlist=menu.locator('[data-open="wishlist"]');
  await expect(moments).toHaveClass(/home-feature/);
  await expect(wishlist).toHaveClass(/home-feature/);
  for(const id of ['designs','movies','food','ideas','likes','surprise']) await expect(menu.locator(`[data-open="${id}"]`)).toHaveClass(/home-mini/);
  const order=await menu.locator(':scope > [data-open]').evaluateAll(nodes=>nodes.map(n=>n.dataset.open));
  expect(order.slice(0,4)).toEqual(['moments','wishlist','designs','movies']);
  await expect(menu.locator('[data-open="thanks"]')).toBeHidden();
  const featureBox=await moments.boundingBox();
  const miniBox=await menu.locator('[data-open="movies"]').boundingBox();
  expect(featureBox&&featureBox.height<=74).toBeTruthy();
  expect(miniBox&&miniBox.height<=52).toBeTruthy();
});

test('фото занимает почти половину большой карточки, а текст Хотелок остаётся слева',async({page})=>{
  const wishlist=page.locator('#home .menu [data-open="wishlist"]');
  const photoEl=wishlist.locator('.feature-photo');
  const copyEl=wishlist.locator('.feature-copy');
  await expect(wishlist).toBeVisible();
  await expect(photoEl).toBeVisible();
  await expect(copyEl).toBeVisible();
  await page.waitForFunction(()=>{
    const card=document.querySelector('#home .menu [data-open="wishlist"]');
    const photo=card?.querySelector('.feature-photo');
    return Boolean(card&&photo&&card.getBoundingClientRect().width>0&&photo.getBoundingClientRect().width>0);
  });
  const card=await wishlist.boundingBox();
  const photo=await photoEl.boundingBox();
  const copy=await copyEl.boundingBox();
  expect(card&&photo&&photo.width/card.width>=0.43).toBeTruthy();
  expect(card&&photo&&photo.width/card.width<=0.49).toBeTruthy();
  expect(card&&copy&&copy.x+copy.width<card.x+card.width*0.72).toBeTruthy();
  await expect(copyEl.locator('strong')).toHaveText('Хотелки');
  await expect(copyEl.locator('small')).toHaveText('Всё, что хочется');
});

test('кнопка настроек показывает белые ползунки',async({page})=>{
  const gear=page.locator('#settingsGear');
  await expect(gear.locator('svg circle')).toHaveCount(3);
  const color=await gear.evaluate(el=>getComputedStyle(el).color);
  expect(color).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
  await gear.click();
  await expect(page.locator('#familySettings')).toHaveClass(/show/);
});
