import {test,expect} from './test-fixture.mjs';

const base='http://127.0.0.1:8000/';
const token='test-family-token-0000000000000000000000000001';
const tinyPng='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZpVUAAAAASUVORK5CYII=';

async function prepare(page,gameHandler){
  await page.addInitScript(({token})=>{
    localStorage.clear();
    localStorage.setItem('us_family_token',token);
    localStorage.setItem('us_profile',JSON.stringify({name:'Муж'}));
  },{token});
  await page.route('**/functions/v1/family-api',async route=>{
    const body=route.request().postDataJSON?.()||{};
    if(body.action==='whoami')return route.fulfill({json:{ok:true,author:'Муж',capabilities:{idempotent_create:true}}});
    if(body.action==='social_sync')return route.fulfill({json:{ok:true,author:'Муж',items:[],comments:[],reactions:[],activity:[]}});
    return route.fulfill({json:{ok:true,author:'Муж',items:[],unread:{}}});
  });
  await page.route('**/functions/v1/game-api',gameHandler);
  await page.goto(base);
  await page.waitForFunction(()=>Boolean(window.__familyGamesV1));
}

function state(active=null,extra={}){
  return {ok:true,author:'Муж',active,history:extra.history||[],latest_finished:extra.latest_finished||null};
}
function active(mode='words',step=0,current='Муж',extra={}){
  const prompts=mode==='words'?['Кто?','Где оказался?','Что делал?','Что сказал?','Что ответили?','Чем всё закончилось?']:['Голова','Плечи, туловище и руки','Таз и верх ног','Ноги и обувь'];
  const hints=mode==='words'?['Например: сосед в халате','','','','','']:['Нарисуй голову, лицо, волосы и шею.','Продолжи от видимого края.','Продолжи тело.','Заверши персонажа.'];
  return {id:'11111111-1111-4111-8111-111111111111',mode,status:'active',starter_author:'Муж',partner_author:'Жена',current_author:current,current_step:step,total_steps:mode==='words'?6:4,my_turn:current==='Муж',prompt:prompts[step]||'',hint:extra.hint??hints[step]??'',scenario_title:mode==='words'?(extra.scenario_title||'Классическая чепуха'):null,preview_data:extra.preview_data||null,created_at:'2026-09-17T10:00:00Z'};
}

test('раздел Игры один, переключает Слова и Рисунок и блокирует выбор во время партии',async({page})=>{
  let current=state();
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='start'){current=state(active(body.mode,0,'Муж'));return route.fulfill({json:current})}
    return route.fulfill({json:current});
  });
  await expect(page.locator('#home [data-open="games"]')).toHaveCount(1);
  await page.locator('#home [data-open="games"]').click();
  await expect(page.locator('#games')).toHaveClass(/active/);
  await expect(page.locator('[data-game-mode]')).toHaveCount(2);
  await page.locator('[data-game-mode="drawing"]').click();
  await expect(page.locator('#games')).toContainText('Рисованная чепуха');
  await page.locator('#gameStart').click();
  await expect(page.locator('#gameCanvas')).toBeVisible();
  await expect(page.locator('#games .game-mode')).toHaveCount(2);
  expect(await page.locator('#games .game-mode').evaluateAll(nodes=>nodes.every(node=>node.disabled))).toBe(true);
  await expect(page.locator('#gameStart')).toHaveCount(0);
});

test('словесный ответ после отправки скрывается и экран ждёт второго игрока',async({page})=>{
  let current=state();
  let submitted='';
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='start'){current=state(active('words',0,'Муж'));return route.fulfill({json:current})}
    if(body.action==='submit'){
      submitted=body.text;
      current=state(active('words',1,'Жена'));
      return route.fulfill({json:current});
    }
    return route.fulfill({json:current});
  });
  await page.locator('#home [data-open="games"]').click();
  await page.locator('#gameStart').click();
  await expect(page.locator('.game-prompt')).toHaveText('Кто?');
  await page.locator('#gameAnswer').fill('Розовый слон');
  await page.locator('#gameSubmitWord').click();
  expect(submitted).toBe('Розовый слон');
  await expect(page.locator('#games')).toContainText('Ход Жена');
  await expect(page.locator('#games')).not.toContainText('Розовый слон');
  await expect(page.locator('#gameAnswer')).toHaveCount(0);
});

test('последний словесный ход раскрывает всю историю только после завершения',async({page})=>{
  const sessionId='22222222-2222-4222-8222-222222222222';
  let current=state({...active('words',5,'Муж'),id:sessionId});
  const finished={id:sessionId,mode:'words',starter_author:'Муж',partner_author:'Жена',total_steps:6,created_at:'2026-09-17T10:00:00Z',finished_at:'2026-09-17T10:10:00Z'};
  const turns=['Кот','На Луне','Пёк блины','Где мой тапок?','В холодильнике','Все улетели домой'].map((text,step)=>({step,author_name:step%2?'Жена':'Муж',text,image_url:null,prompt:['Кто?','Где оказался?','Что делал?','Что сказал?','Что ответили?','Чем всё закончилось?'][step],created_at:'2026-09-17T10:00:00Z'}));
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='submit'){
      current=state(null,{history:[finished],latest_finished:finished});
      return route.fulfill({json:{...current,finished:true,result:{ok:true,session:{...finished,status:'finished',scenario_title:'Классическая чепуха'},scenario_title:'Классическая чепуха',story:'Кот оказался на Луне, пёк блины и спросил: «Где мой тапок?». Ему ответили: «В холодильнике». В итоге все улетели домой.',turns}}});
    }
    if(body.action==='result')return route.fulfill({json:{ok:true,session:{...finished,status:'finished',scenario_title:'Классическая чепуха'},scenario_title:'Классическая чепуха',story:'Кот оказался на Луне, пёк блины и спросил: «Где мой тапок?». Ему ответили: «В холодильнике». В итоге все улетели домой.',turns}});
    return route.fulfill({json:current});
  });
  await page.locator('#home [data-open="games"]').click();
  await expect(page.locator('.game-prompt')).toHaveText('Чем всё закончилось?');
  await page.locator('#gameAnswer').fill('Все улетели домой');
  await page.locator('#gameSubmitWord').click();
  await expect(page.locator('#games')).toContainText('Чепуха готова');
  await expect(page.locator('.game-story-line')).toHaveCount(1);
  await expect(page.locator('.game-story-line')).toContainText('Кот оказался на Луне');
  await expect(page.locator('.game-story-line')).toContainText('все улетели домой');
  await expect(page.locator('.game-story-row')).toHaveCount(0);
});

test('рисунок показывает границу полоски для партнёра и отправляет только этот край отдельно',async({page})=>{
  let current=state(active('drawing',0,'Муж'));
  let drawingPayload=null;
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='submit'){
      drawingPayload=body;
      current=state(active('drawing',1,'Жена'));
      return route.fulfill({json:current});
    }
    return route.fulfill({json:current});
  });
  await page.locator('#home [data-open="games"]').click();
  const canvas=page.locator('#gameCanvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('.game-draw-turn')).toBeVisible();
  await expect(page.locator('.game-draw-part')).toHaveText('Голова');
  await expect(page.locator('.game-draw-hint')).toContainText('голову');
  await expect(canvas).toHaveAttribute('width','720');
  await expect(canvas).toHaveAttribute('height','900');
  await expect(page.locator('.game-share-guide')).toContainText('ниже увидит партнёр');
  await expect(page.locator('.game-draw-turn')).toHaveCSS('position','relative');
  await expect(page.locator('.game-tools')).toHaveCSS('position','static');
  await expect(page.locator('#gameSubmitDrawing')).toHaveCSS('position','static');
  await expect.poll(async()=>canvas.evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(0);
  const box=await canvas.evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});
  expect(box.height).toBeGreaterThan(0);
  const guideBottom=await page.locator('.game-share-guide').evaluate(el=>parseFloat(getComputedStyle(el).bottom));
  expect(guideBottom).toBeGreaterThan(0);
  await page.mouse.move(box.x+40,box.y+40);await page.mouse.down();await page.mouse.move(box.x+180,box.y+100,{steps:4});await page.mouse.up();
  await expect(page.locator('#gameSubmitDrawing')).toBeEnabled();
  await page.locator('#gameSubmitDrawing').click();
  expect(drawingPayload.image_data.startsWith('data:image/png;base64,')).toBeTruthy();
  expect(drawingPayload.preview_data.startsWith('data:image/png;base64,')).toBeTruthy();
  expect(drawingPayload.preview_data.length).toBeLessThan(drawingPayload.image_data.length);
  await expect(page.locator('#games')).toContainText('Ход Жена');
  await expect(page.locator('#gameCanvas')).toHaveCount(0);
});

test('на следующем рисовальном ходе видна только полоска предыдущего фрагмента',async({page})=>{
  const current=state(active('drawing',1,'Муж',{preview_data:tinyPng}));
  await prepare(page,async route=>route.fulfill({json:current}));
  await page.locator('#home [data-open="games"]').click();
  await expect(page.locator('.game-edge-preview')).toHaveAttribute('src',tinyPng);
  await expect(page.locator('.game-edge-label')).toContainText('только край');
  await expect(page.locator('.game-drawing-result')).toHaveCount(0);
  await expect(page.locator('#gameCanvas')).toBeVisible();
});

test('набраный словесный ответ не сбрасывается во время фонового polling',async({page})=>{
  const current=state(active('words',0,'Муж'));
  let stateCalls=0;
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='state')stateCalls++;
    return route.fulfill({json:current});
  });
  await page.locator('#home [data-open="games"]').click();
  const answer=page.locator('#gameAnswer');
  await answer.fill('Длинный ответ, который я ещё не закончил');
  await page.waitForTimeout(6500);
  await expect(answer).toHaveValue('Длинный ответ, который я ещё не закончил');
  expect(stateCalls).toBeGreaterThanOrEqual(2);
});

test('черновик ответа сохраняется при уходе на главную и возврате в ту же игру',async({page})=>{
  const current=state(active('words',0,'Муж'));
  await prepare(page,async route=>route.fulfill({json:current}));
  await page.locator('#home [data-open="games"]').click();
  const answer=page.locator('#gameAnswer');
  await answer.fill('Я ещё не закончил этот ответ');
  await page.locator('#gamesBack').click();
  await expect(page.locator('#home')).toHaveClass(/active/);
  await page.locator('#home [data-open="games"]').click();
  await expect(page.locator('#gameAnswer')).toHaveValue('Я ещё не закончил этот ответ');
});

test('активную игру можно завершить с любого состояния и сразу начать новую',async({page})=>{
  let current=state(active('words',1,'Жена'));
  let cancelled='';
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='cancel'){
      cancelled=body.session_id;
      current=state();
      return route.fulfill({json:current});
    }
    return route.fulfill({json:current});
  });
  await page.locator('#home [data-open="games"]').click();
  await expect(page.locator('#games')).toContainText('Ждём следующий ход');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#gameStop').click();
  expect(cancelled).toBe('11111111-1111-4111-8111-111111111111');
  await expect(page.locator('#gameStart')).toBeVisible();
  await expect(page.locator('#games')).toContainText('Выберите игру');
});

test('после отмены текущей партии старая завершённая игра не всплывает как новая',async({page})=>{
  const oldFinished={id:'33333333-3333-4333-8333-333333333333',mode:'words',starter_author:'Муж',partner_author:'Жена',total_steps:6,created_at:'2026-09-16T10:00:00Z',finished_at:'2026-09-16T10:10:00Z'};
  let current=state(active('words',1,'Жена'),{history:[oldFinished],latest_finished:oldFinished});
  await prepare(page,async route=>{
    const body=route.request().postDataJSON();
    if(body.action==='cancel'){
      current=state(null,{history:[oldFinished],latest_finished:oldFinished});
      return route.fulfill({json:current});
    }
    if(body.action==='result')return route.fulfill({json:{ok:true,session:{...oldFinished,status:'finished'},turns:[]}});
    return route.fulfill({json:current});
  });
  await page.locator('#home [data-open="games"]').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#gameStop').click();
  await expect(page.locator('#gameStart')).toBeVisible();
  await expect(page.locator('#gameHomeBadge')).not.toHaveClass(/show/);
  await expect(page.locator('#home [data-open="games"] .mini-copy small')).toHaveText('Чепуха вдвоём');
});