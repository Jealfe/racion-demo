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

test('главная повторяет согласованный компактный макет',async({page})=>{
  const menu=page.locator('#home .menu');
  await expect(menu).toHaveClass(/home-menu-redesign/);

  const designs=menu.locator('[data-open="designs"]');
  const moments=menu.locator('[data-open="moments"]');
  await expect(designs).toHaveClass(/home-feature/);
  await expect(moments).toHaveClass(/home-feature/);
  await expect(designs).toContainText('Идеи для будущего дома');
  await expect(moments).toContainText('Фото, даты и воспоминания');

  for(const id of ['movies','food','wishlist','ideas','likes','surprise']){
    await expect(menu.locator(`[data-open="${id}"]`)).toHaveClass(/home-mini/);
  }

  await expect(menu.locator('[data-open="thanks"]')).toBeHidden();
  await expect(page.locator('.bottom [data-nav="thanks"]')).toBeVisible();

  const featureBox=await designs.boundingBox();
  const miniBox=await menu.locator('[data-open="movies"]').boundingBox();
  expect(featureBox&&miniBox&&featureBox.width>miniBox.width*1.7).toBeTruthy();
  expect(featureBox&&featureBox.height<=110).toBeTruthy();
  expect(miniBox&&miniBox.height<=82).toBeTruthy();
});

test('шестерёнка белая и больше не emoji',async({page})=>{
  const gear=page.locator('#settingsGear');
  await expect(gear.locator('svg')).toHaveCount(1);
  const color=await gear.evaluate(el=>getComputedStyle(el).color);
  expect(color).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
  await gear.click();
  await expect(page.locator('#familySettings')).toHaveClass(/show/);
});
