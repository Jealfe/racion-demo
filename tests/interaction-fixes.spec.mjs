import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
    localStorage.setItem('us_wishes',JSON.stringify([
      {id:123,t:'Измельчитель пищевых продуктов для кухонной раковины',type:'🎁',done:false,author:'Жена',createdAt:'2026-09-10T12:00:00.000Z'}
    ]));
  });
  await page.goto(base);
  await page.waitForFunction(()=>window.__interactionFixes===true&&window.__appReady===true);
});

test('социальная строка не сдвигает текст хотелки вправо',async({page})=>{
  await page.locator('#home [data-open="wishlist"]').click();
  const row=page.locator('#wishList .list-item').first();
  await expect(row).toBeVisible();

  await row.evaluate(el=>{
    const foot=document.createElement('div');
    foot.className='social-tools';
    foot.innerHTML='<button>❤️</button><button>👍</button><button>😂</button><button>✨</button><button>💬</button>';
    el.appendChild(foot);
  });

  const copy=row.locator(':scope > div:not(.ico):not(.row):not(.social-tools)').first();
  const foot=row.locator(':scope > .social-tools');
  const rowBox=await row.boundingBox();
  const copyBox=await copy.boundingBox();
  const footBox=await foot.boundingBox();
  const textAlign=await copy.evaluate(el=>getComputedStyle(el).textAlign);

  expect(textAlign).toBe('left');
  expect(rowBox&&copyBox&&copyBox.x<rowBox.x+rowBox.width*0.28).toBeTruthy();
  expect(rowBox&&copyBox&&copyBox.width>rowBox.width*0.35).toBeTruthy();
  expect(rowBox&&footBox&&footBox.width>rowBox.width*0.9).toBeTruthy();
  expect(copyBox&&footBox&&footBox.y>copyBox.y).toBeTruthy();
});

test('pull-to-refresh сохраняет открытый экран Хотелки',async({page})=>{
  await page.locator('#home [data-open="wishlist"]').click();
  await expect(page.locator('#wishlist')).toHaveClass(/active/);
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('us_active_screen_session'))).toBe('wishlist');

  await page.reload();
  await page.waitForFunction(()=>window.__interactionFixes===true&&window.__appReady===true);
  await expect(page.locator('#wishlist')).toHaveClass(/active/);
  await expect(page.locator('#home')).not.toHaveClass(/active/);
});
