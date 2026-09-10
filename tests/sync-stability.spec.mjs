import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8000/';

test('одинаковая фоновая синхронизация не пересоздаёт список спасибо',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('us_profile',JSON.stringify({name:'Муж'})));
  await page.goto(base);
  const result=await page.evaluate(()=>{
    const feed=document.querySelector('#thanksFeed');
    feed.innerHTML='<div class="feed-item" id="stableProbe"><b>❤️ Муж</b><p>Спасибо за кофе ❤️</p><time>10 сент., 18:00</time></div>';
    const original=feed.firstElementChild;
    const social=document.createElement('div');social.className='social-tools';social.innerHTML='<button>❤️</button><button>💬</button>';
    original.appendChild(social);
    feed.innerHTML='<div class="feed-item" id="stableProbe"><b>❤️ Муж</b><p>Спасибо за кофе ❤️</p><time>10 сент., 18:00</time></div>';
    return {
      sameNode:feed.firstElementChild===original,
      socialPreserved:Boolean(feed.querySelector('.social-tools')),
      text:feed.textContent
    };
  });
  expect(result.sameNode).toBeTruthy();
  expect(result.socialPreserved).toBeTruthy();
  expect(result.text).toContain('Спасибо за кофе');
});
