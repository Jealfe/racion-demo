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
  expect(featureBox&&featureBox.height<=82).toBeTruthy();
  expect(miniBox&&miniBox.height<=58).toBeTruthy();
});

test('кнопка настроек показывает белые ползунки',async({page})=>{
  const gear=page.locator('#settingsGear');
  await expect(gear.locator('svg circle')).toHaveCount(3);
  const color=await gear.evaluate(el=>getComputedStyle(el).color);
  expect(color).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
  await gear.click();
  await expect(page.locator('#familySettings')).toHaveClass(/show/);
});
