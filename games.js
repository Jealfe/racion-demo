if(typeof document!=='undefined'&&!window.__familyGamesV1){
  const API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/game-api';
  const API_KEY='sb_publishable_sMtJPBsGvDjvtB0e-1ea0w_Yuk9pzae';
  const token=()=>localStorage.getItem('us_family_token')||'';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let selectedMode='words',state={author:'',active:null,history:[],latest_finished:null},lastResult=null,dismissedResultId='',busy=false,pollTimer=0,canvasState=null;

  async function api(action,payload={}){
    const tk=token();if(!tk)throw Object.assign(new Error('NO_TOKEN'),{status:401});
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-family-token':tk,'apikey':API_KEY},body:JSON.stringify({action,...payload})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw Object.assign(new Error(data.error||'Ошибка игры'),{status:r.status});
    return data;
  }
  function showToast(message){
    const t=$('#toast');if(!t)return;
    t.textContent=message;t.classList.add('show');clearTimeout(window.__gamesToast);window.__gamesToast=setTimeout(()=>t.classList.remove('show'),2200);
  }
  function setBusy(value){busy=Boolean(value);document.querySelectorAll('#games button,#games textarea').forEach(el=>{if(el.dataset.keepEnabled!=='1')el.disabled=busy})}
  function modeTitle(mode){return mode==='drawing'?'Рисунок':'Слова'}
  function modeIcon(mode){return mode==='drawing'?'🎨':'📝'}
  function prettyDate(v){const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleDateString('ru-RU',{day:'numeric',month:'long'}):''}
  function partnerLabel(active){return active?.current_author||'партнёра'}

  const style=document.createElement('style');
  style.id='games-v1-styles';
  style.textContent=`
  #home .home-mini[data-open="games"] .tile-icon{background:#eee9ff!important}
  #home .home-mini[data-open="games"]{overflow:visible!important}
  .game-home-badge{position:absolute;right:5px;top:-5px;z-index:12;display:none;align-items:center;gap:4px;background:#d85f70;color:#fff;border-radius:999px;padding:4px 7px;font-size:7px;font-weight:900;box-shadow:0 5px 14px rgba(188,68,87,.25);white-space:nowrap}
  .game-home-badge.show{display:flex}.game-home-badge.ready{background:#7b5b9a}
  #games{padding-bottom:16px}.game-shell{display:grid;gap:12px}.game-hero{padding:18px;border-radius:24px;background:linear-gradient(145deg,#fff,#f3efff);border:1px solid #ece5f5;box-shadow:0 8px 25px rgba(63,45,74,.05)}
  .game-hero-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.game-kicker{font-size:10px;font-weight:900;color:#8c7893;text-transform:uppercase;letter-spacing:.08em}.game-hero h3{font-size:23px;line-height:1.05;margin:4px 0 5px;letter-spacing:-.03em}.game-hero p{font-size:11px;color:#877c84;margin:0;line-height:1.45}.game-dice{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;background:#fff;font-size:25px;box-shadow:0 7px 22px rgba(77,57,88,.08)}
  .game-segment{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;background:#eee9e5;border-radius:17px}.game-mode{border:0;border-radius:13px;padding:11px 10px;background:transparent;color:#766d68;font:inherit;font-size:12px;font-weight:850;cursor:pointer}.game-mode.active{background:#fff;color:#2d2927;box-shadow:0 4px 12px rgba(55,42,35,.07)}.game-mode:disabled{opacity:.58}
  .game-card{background:#fff;border:1px solid #eee7e1;border-radius:22px;padding:17px;box-shadow:0 7px 24px rgba(44,35,29,.045)}.game-card h3{margin:0 0 5px;font-size:17px}.game-card p{margin:0;color:#8c837d;font-size:11px;line-height:1.5}.game-card .game-big{font-size:42px;margin-bottom:8px}.game-card.center{text-align:center;padding:27px 19px}
  .game-progress{display:flex;gap:6px;justify-content:center;margin:14px 0 1px}.game-progress i{display:block;width:8px;height:8px;border-radius:50%;background:#e6dfda}.game-progress i.done{background:#94739b}.game-progress i.current{background:#d76773;box-shadow:0 0 0 4px #fae9ec}
  .game-prompt{font-size:22px!important;color:#2b2928!important;font-weight:900!important;letter-spacing:-.025em;line-height:1.15!important;margin:8px 0 13px!important}.game-step-label{font-size:9px;color:#9b908a;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
  .game-answer{width:100%;min-height:108px;border:1px solid #e8dfda;background:#fbf9f7;border-radius:16px;padding:13px;font:inherit;font-size:15px;resize:vertical;outline:none}.game-answer:focus{border-color:#bda7c3;box-shadow:0 0 0 3px rgba(164,129,174,.1)}
  .game-primary{width:100%;border:0;border-radius:15px;padding:14px 16px;background:#29272a;color:#fff;font:inherit;font-size:13px;font-weight:900;cursor:pointer;margin-top:11px}.game-primary:disabled{opacity:.45}.game-soft{border:0;border-radius:13px;padding:10px 12px;background:#f3efeb;color:#5f5752;font:inherit;font-size:11px;font-weight:800;cursor:pointer}.game-dangerless{background:#f8edf0;color:#9a5964}.game-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.game-actions .game-soft{flex:1}
  .game-wait-orbit{width:66px;height:66px;border-radius:50%;margin:0 auto 13px;display:grid;place-items:center;background:#f6f0fa;font-size:28px;animation:gameFloat 2.1s ease-in-out infinite}@keyframes gameFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .game-edge-wrap{margin:10px 0 0;border:1px dashed #cfc3d3;border-bottom:0;border-radius:14px 14px 0 0;overflow:hidden;background:#fff}.game-edge-label{font-size:8px;text-transform:uppercase;letter-spacing:.07em;color:#9c899f;padding:6px 9px;background:#f8f4fa}.game-edge-preview{display:block;width:100%;height:30px;object-fit:fill;background:#fff}
  .game-canvas-wrap{border:1px solid #ded5df;border-radius:16px;overflow:hidden;background:#fff;touch-action:none}.game-edge-wrap+.game-canvas-wrap{border-radius:0 0 16px 16px}.game-canvas{display:block;width:100%;height:auto;aspect-ratio:5/2;background:#fff;touch-action:none}.game-tools{display:flex;align-items:center;gap:7px;margin-top:9px;flex-wrap:wrap}.game-color{width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #d9d0cb;cursor:pointer;padding:0}.game-color.active{box-shadow:0 0 0 2px #7d6a83}.game-size{border:0;background:#f2eeea;border-radius:11px;padding:8px 10px;font-size:10px;font-weight:800;cursor:pointer}.game-size.active{background:#29272a;color:#fff}.game-tool-spacer{flex:1}
  .game-history{display:grid;gap:7px;margin-top:9px}.game-history-item{width:100%;border:1px solid #eee6e0;background:#fff;border-radius:15px;padding:11px 12px;display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;text-align:left;cursor:pointer}.game-history-item span:first-child{font-size:20px}.game-history-item b{display:block;font-size:11px}.game-history-item small{font-size:8px;color:#9a918c}.game-history-item em{font-style:normal;color:#aaa;font-size:16px}
  .game-story{display:grid;gap:8px;margin-top:13px}.game-story-row{border-radius:15px;background:#faf7f4;padding:12px;text-align:left}.game-story-row small{display:block;font-size:8px;color:#a09690;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}.game-story-row b{font-size:13px;line-height:1.4}.game-story-row .game-author{display:block;font-size:8px;color:#9a7d91;margin-top:5px}
  .game-drawing-result{margin-top:14px;border-radius:18px;overflow:hidden;border:1px solid #e7dfda;background:#fff}.game-drawing-result img{display:block;width:100%;height:auto;margin:0;padding:0;border:0}.game-result-title{font-size:24px!important;margin-bottom:4px!important}.game-sync-note{margin-top:9px!important;font-size:9px!important}.game-inline-error{padding:11px;border-radius:13px;background:#fff3f1;color:#9a5c55;font-size:10px;margin-top:9px}
  @media(prefers-reduced-motion:reduce){.game-wait-orbit{animation:none}}
  `;
  document.head.appendChild(style);

  function ensureTile(){
    const menu=$('#home .menu');if(!menu)return null;
    let tile=menu.querySelector('[data-open="games"]');
    if(!tile){
      tile=document.createElement('button');tile.type='button';tile.className='tile home-mini';tile.dataset.open='games';tile.setAttribute('aria-label','Игры');
      tile.innerHTML='<div class="mini-main"><div class="tile-icon">🎲</div><div class="mini-copy"><strong>Игры</strong><small>Чепуха вдвоём</small></div></div><div class="home-card-arrow">›</div><span class="game-home-badge" id="gameHomeBadge">твой ход</span>';
      const before=menu.querySelector('[data-open="reminders"]')||menu.querySelector('[data-open="surprise"]')||menu.querySelector('[data-open="thanks"]');
      before?menu.insertBefore(tile,before):menu.appendChild(tile);
      tile.addEventListener('click',openGames);
    }
    return tile;
  }
  function ensureScreen(){
    let screen=$('#games');if(screen)return screen;
    screen=document.createElement('section');screen.id='games';screen.className='screen';
    screen.innerHTML='<div class="screen-head"><button class="back" id="gamesBack" type="button">←</button><div><h2>Игры</h2><p>Чепуха на двух телефонах</p></div></div><div class="game-shell" id="gameShell"></div>';
    const app=$('.app');app?.appendChild(screen);
    $('#gamesBack')?.addEventListener('click',openHome);
    return screen;
  }
  function openGames(){
    ensureScreen();document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='games'));document.querySelectorAll('.bottom button').forEach(x=>x.classList.remove('active'));window.scrollTo({top:0,behavior:'smooth'});refresh(true);
  }
  function openHome(){
    document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='home'));document.querySelectorAll('.bottom button').forEach(x=>x.classList.toggle('active',x.dataset.nav==='home'));window.scrollTo({top:0,behavior:'smooth'});
  }
  function progressHTML(active){
    const n=Number(active?.total_steps)||0,cur=Number(active?.current_step)||0;
    return `<div class="game-progress">${Array.from({length:n},(_,i)=>`<i class="${i<cur?'done':i===cur?'current':''}"></i>`).join('')}</div>`;
  }
  function setupHTML(){
    const history=state.history||[];
    return `<div class="game-hero"><div class="game-hero-top"><div><div class="game-kicker">Чепуха вдвоём</div><h3>Выберите игру</h3><p>Каждый делает ход на своём телефоне. Предыдущие ответы скрыты до финала.</p></div><div class="game-dice">🎲</div></div></div>
      <div class="game-segment" id="gameModeSwitch"><button class="game-mode ${selectedMode==='words'?'active':''}" data-game-mode="words">📝 Слова</button><button class="game-mode ${selectedMode==='drawing'?'active':''}" data-game-mode="drawing">🎨 Рисунок</button></div>
      <div class="game-card"><h3>${selectedMode==='words'?'Словесная чепуха':'Рисованная чепуха'}</h3><p>${selectedMode==='words'?'6 вопросов по очереди. Чужие ответы раскроются только в конце.':'4 части рисунка. Следующий видит только узкую полоску края предыдущего фрагмента.'}</p><button class="game-primary" id="gameStart">Начать игру</button><p class="game-sync-note">Одновременно может идти только одна общая партия.</p></div>
      ${historyHTML(history)}`;
  }
  function historyHTML(items){
    if(!items?.length)return '<div class="game-card"><h3>Наши прошлые игры</h3><p>Здесь появятся законченные Чепухи.</p></div>';
    return `<div class="game-card"><h3>Наши прошлые игры</h3><div class="game-history">${items.map(x=>`<button class="game-history-item" data-game-result="${esc(x.id)}"><span>${modeIcon(x.mode)}</span><span><b>${modeTitle(x.mode)}</b><small>${esc(prettyDate(x.finished_at||x.created_at))}</small></span><em>›</em></button>`).join('')}</div></div>`;
  }
  function myTurnHTML(active){
    if(active.mode==='words')return `<div class="game-card"><div class="game-step-label">Твой ход · ${Number(active.current_step)+1} из ${active.total_steps}</div>${progressHTML(active)}<p class="game-prompt">${esc(active.prompt)}</p><textarea class="game-answer" id="gameAnswer" maxlength="800" placeholder="Напиши что-нибудь неожиданное…"></textarea><button class="game-primary" id="gameSubmitWord">Отправить ответ</button><p class="game-sync-note">После отправки ответ спрячется до конца партии.</p></div>`;
    return `<div class="game-card"><div class="game-step-label">Твой ход · ${Number(active.current_step)+1} из ${active.total_steps}</div>${progressHTML(active)}<p class="game-prompt">${esc(active.prompt)}</p>${active.preview_data?`<div class="game-edge-wrap"><div class="game-edge-label">виден только край предыдущего рисунка</div><img class="game-edge-preview" src="${esc(active.preview_data)}" alt="Край предыдущего рисунка"></div>`:''}<div class="game-canvas-wrap"><canvas class="game-canvas" id="gameCanvas" width="900" height="360"></canvas></div><div class="game-tools"><button class="game-color active" data-game-color="#252329" style="background:#252329" aria-label="Чёрный"></button><button class="game-color" data-game-color="#d76773" style="background:#d76773" aria-label="Красный"></button><button class="game-color" data-game-color="#5678aa" style="background:#5678aa" aria-label="Синий"></button><button class="game-color" data-game-color="#65916a" style="background:#65916a" aria-label="Зелёный"></button><span class="game-tool-spacer"></span><button class="game-size active" data-game-size="7">тонко</button><button class="game-size" data-game-size="14">толще</button></div><div class="game-actions"><button class="game-soft" id="gameUndo">↶ Отменить</button><button class="game-soft game-dangerless" id="gameClear">Очистить</button></div><button class="game-primary" id="gameSubmitDrawing" disabled>Отправить рисунок</button><p class="game-sync-note">Следующий игрок увидит только нижнюю полоску этого фрагмента.</p></div>`;
  }
  function waitingHTML(active){
    return `<div class="game-card center"><div class="game-wait-orbit">⏳</div><div class="game-step-label">Ход ${esc(partnerLabel(active))}</div><h3>Ждём следующий ход</h3><p>${active.mode==='words'?'Ответы остаются скрытыми. Когда партнёр отправит свой, твой следующий ход появится здесь.':'Рисунок скрыт. Когда партнёр закончит свой фрагмент, ты увидишь только край для продолжения.'}</p>${progressHTML(active)}</div>`;
  }
  function resultHTML(result){
    const s=result.session||{},turns=result.turns||[];
    const body=s.mode==='drawing'?`<div class="game-drawing-result">${turns.map(t=>t.image_url?`<img src="${esc(t.image_url)}" alt="Фрагмент ${Number(t.step)+1}">`:'').join('')}</div>`:`<div class="game-story">${turns.map(t=>`<div class="game-story-row"><small>${esc(t.prompt)}</small><b>${esc(t.text)}</b><span class="game-author">${esc(t.author_name)}</span></div>`).join('')}</div>`;
    return `<div class="game-card center"><div class="game-big">🎉</div><h3 class="game-result-title">Чепуха готова</h3><p>${s.mode==='drawing'?'Вот ваш общий рисунок целиком.':'Теперь можно прочитать всю историю целиком.'}</p>${body}<div class="game-actions"><button class="game-soft" id="gameDismissResult">Новая игра</button></div></div>${historyHTML(state.history||[])}`;
  }
  function noTokenHTML(){return '<div class="game-card center"><div class="game-big">☁️</div><h3>Нужна общая синхронизация</h3><p>Игра идёт между двумя телефонами, поэтому открой приложение по вашей персональной ссылке на этом устройстве.</p></div>'}

  function bindRendered(){
    document.querySelectorAll('[data-game-mode]').forEach(b=>b.addEventListener('click',()=>{if(state.active||busy)return;selectedMode=b.dataset.gameMode||'words';render()}));
    $('#gameStart')?.addEventListener('click',startGame);
    $('#gameSubmitWord')?.addEventListener('click',submitWord);
    document.querySelectorAll('[data-game-result]').forEach(b=>b.addEventListener('click',()=>loadResult(b.dataset.gameResult)));
    $('#gameDismissResult')?.addEventListener('click',()=>{dismissedResultId=lastResult?.session?.id||state.latest_finished?.id||'';lastResult=null;render()});
    if($('#gameCanvas'))setupCanvas();
  }
  function render(){
    const shell=$('#gameShell');if(!shell)return;
    if(!token()){shell.innerHTML=noTokenHTML();updateTile();return}
    if(lastResult){shell.innerHTML=resultHTML(lastResult);bindRendered();updateTile();return}
    if(state.active){
      selectedMode=state.active.mode;
      shell.innerHTML=`<div class="game-segment"><button class="game-mode ${selectedMode==='words'?'active':''}" disabled>📝 Слова</button><button class="game-mode ${selectedMode==='drawing'?'active':''}" disabled>🎨 Рисунок</button></div>${state.active.my_turn?myTurnHTML(state.active):waitingHTML(state.active)}`;
      bindRendered();updateTile();return;
    }
    shell.innerHTML=setupHTML();bindRendered();updateTile();
  }
  function updateTile(){
    const tile=ensureTile();if(!tile)return;
    const sub=tile.querySelector('.mini-copy small'),badge=tile.querySelector('.game-home-badge');
    badge?.classList.remove('show','ready');
    if(!token()){if(sub)sub.textContent='Нужна синхронизация';return}
    if(state.active?.my_turn){if(sub)sub.textContent='Твой ход';if(badge){badge.textContent='твой ход';badge.classList.add('show')}return}
    if(state.active){if(sub)sub.textContent=`Ход ${partnerLabel(state.active)}`;return}
    if(state.latest_finished&&state.latest_finished.id!==dismissedResultId){if(sub)sub.textContent='Готово — посмотреть';if(badge){badge.textContent='готово';badge.classList.add('show','ready')}return}
    if(sub)sub.textContent='Чепуха вдвоём';
  }
  async function maybeLoadLatest(){
    const latest=state.latest_finished;
    if(!state.active&&latest?.id&&latest.id!==dismissedResultId&&lastResult?.session?.id!==latest.id){
      try{const d=await api('result',{session_id:latest.id});lastResult=d}catch{}
    }
  }
  async function refresh(forceRender=false){
    if(!token()){state={author:'',active:null,history:[],latest_finished:null};lastResult=null;if(forceRender)render();updateTile();return}
    try{
      const d=await api('state');
      const before=JSON.stringify({a:state.active,h:state.latest_finished?.id});
      state={author:d.author||'',active:d.active||null,history:Array.isArray(d.history)?d.history:[],latest_finished:d.latest_finished||null};
      if(state.active)lastResult=null;
      await maybeLoadLatest();
      const after=JSON.stringify({a:state.active,h:state.latest_finished?.id,r:lastResult?.session?.id});
      if(forceRender||before!==after||$('#games')?.classList.contains('active'))render();else updateTile();
    }catch(e){if(forceRender&&$('#games')?.classList.contains('active')){const shell=$('#gameShell');if(shell)shell.innerHTML=`<div class="game-inline-error">${esc(e.message||'Не удалось обновить игру')}</div>`}}
  }
  async function startGame(){
    if(busy||state.active)return;setBusy(true);
    try{const d=await api('start',{mode:selectedMode});state={author:d.author||state.author,active:d.active||null,history:d.history||state.history,latest_finished:d.latest_finished||state.latest_finished};lastResult=null;render()}
    catch(e){showToast(e.message||'Не удалось начать игру')}
    finally{setBusy(false)}
  }
  async function submitWord(){
    if(busy||!state.active?.my_turn)return;const input=$('#gameAnswer'),text=String(input?.value||'').trim();if(!text){showToast('Напиши ответ');input?.focus();return}
    setBusy(true);
    try{const d=await api('submit',{session_id:state.active.id,step:state.active.current_step,text});state={author:d.author||state.author,active:d.active||null,history:d.history||state.history,latest_finished:d.latest_finished||state.latest_finished};lastResult=d.result||null;if(!lastResult)await maybeLoadLatest();render()}
    catch(e){showToast(e.message||'Не удалось отправить ход')}
    finally{setBusy(false)}
  }
  async function submitDrawing(){
    if(busy||!state.active?.my_turn||!canvasState?.hasInk)return;
    const imageData=canvasState.canvas.toDataURL('image/png');
    const strip=document.createElement('canvas');strip.width=canvasState.canvas.width;strip.height=32;
    strip.getContext('2d').drawImage(canvasState.canvas,0,canvasState.canvas.height-32,canvasState.canvas.width,32,0,0,strip.width,strip.height);
    const previewData=strip.toDataURL('image/png');
    setBusy(true);
    try{const d=await api('submit',{session_id:state.active.id,step:state.active.current_step,image_data:imageData,preview_data:previewData});state={author:d.author||state.author,active:d.active||null,history:d.history||state.history,latest_finished:d.latest_finished||state.latest_finished};lastResult=d.result||null;if(!lastResult)await maybeLoadLatest();render()}
    catch(e){showToast(e.message||'Не удалось отправить рисунок')}
    finally{setBusy(false)}
  }
  async function loadResult(id){
    if(!id||busy)return;setBusy(true);
    try{lastResult=await api('result',{session_id:id});dismissedResultId='';render()}
    catch(e){showToast(e.message||'Не удалось открыть игру')}
    finally{setBusy(false)}
  }
  function setupCanvas(){
    const canvas=$('#gameCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';
    canvasState={canvas,ctx,color:'#252329',size:7,drawing:false,hasInk:false,undo:[]};
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
    const snapshot=()=>{if(canvasState.undo.length>=12)canvasState.undo.shift();canvasState.undo.push(canvas.toDataURL('image/png'))};
    const begin=e=>{snapshot();canvasState.drawing=true;canvas.setPointerCapture?.(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.strokeStyle=canvasState.color;ctx.lineWidth=canvasState.size;ctx.stroke();canvasState.hasInk=true;const submit=$('#gameSubmitDrawing');if(submit)submit.disabled=false;e.preventDefault()};
    const move=e=>{if(!canvasState.drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle=canvasState.color;ctx.lineWidth=canvasState.size;ctx.stroke();e.preventDefault()};
    const end=e=>{canvasState.drawing=false;try{canvas.releasePointerCapture?.(e.pointerId)}catch{}};
    canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('pointerleave',e=>{if(e.buttons===0)end(e)});
    document.querySelectorAll('[data-game-color]').forEach(b=>b.addEventListener('click',()=>{canvasState.color=b.dataset.gameColor||'#252329';document.querySelectorAll('[data-game-color]').forEach(x=>x.classList.toggle('active',x===b))}));
    document.querySelectorAll('[data-game-size]').forEach(b=>b.addEventListener('click',()=>{canvasState.size=Number(b.dataset.gameSize)||7;document.querySelectorAll('[data-game-size]').forEach(x=>x.classList.toggle('active',x===b))}));
    $('#gameClear')?.addEventListener('click',()=>{snapshot();ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);canvasState.hasInk=false;const submit=$('#gameSubmitDrawing');if(submit)submit.disabled=true});
    $('#gameUndo')?.addEventListener('click',()=>{const src=canvasState.undo.pop();if(!src)return;const img=new Image();img.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);canvasState.hasInk=canvasState.undo.length>0;const submit=$('#gameSubmitDrawing');if(submit)submit.disabled=!canvasState.hasInk};img.src=src});
    $('#gameSubmitDrawing')?.addEventListener('click',submitDrawing);
  }

  ensureTile();ensureScreen();
  const menu=$('#home .menu');if(menu){
    const observer=new MutationObserver(()=>{const tile=ensureTile();const before=menu.querySelector('[data-open="reminders"]')||menu.querySelector('[data-open="surprise"]')||menu.querySelector('[data-open="thanks"]');if(tile&&before&&tile.nextElementSibling!==before)menu.insertBefore(tile,before)});
    observer.observe(menu,{childList:true});
  }
  window.addEventListener('hashchange',()=>{if(location.hash==='#games'){openGames();history.replaceState(null,'',location.pathname+location.search)}});
  if(location.hash==='#games'){setTimeout(()=>{openGames();history.replaceState(null,'',location.pathname+location.search)},0)}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});window.addEventListener('focus',()=>refresh(false));
  refresh(false);pollTimer=setInterval(()=>{if(!document.hidden)refresh(false)},6000);
  window.__familyGamesV1={refresh,open:openGames,destroy(){clearInterval(pollTimer)}};
}
