if(typeof document!=='undefined'&&!window.__familyRemindersV1){
  const API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/reminder-api';
  const PUBLISHABLE_KEY='sb_publishable_sMtJPBsGvDjvtB0e-1ea0w_Yuk9pzae';
  const token=()=>localStorage.getItem('us_family_token')||'';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const state={me:'',people:[],items:[],sig:'',target:'self',editId:'',busy:false,refreshing:false,refreshQueued:false};

  async function api(action,payload={}){
    const tk=token();
    if(!tk)throw new Error('NO_TOKEN');
    const controller=new AbortController();
    const timeoutMs=action==='list'?8000:20000;
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','apikey':PUBLISHABLE_KEY,'x-family-token':tk},body:JSON.stringify({action,...payload}),signal:controller.signal});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||'REMINDER_ERROR');
      return data;
    }catch(e){
      if(e?.name==='AbortError')throw new Error('TIMEOUT');
      throw e;
    }finally{clearTimeout(timer)}
  }
  function toast(msg){
    const t=$('#toast');
    if(!t)return;
    t.textContent=msg;t.classList.add('show');clearTimeout(window.__reminderToast);
    window.__reminderToast=setTimeout(()=>t.classList.remove('show'),2100);
  }
  function friendlyError(e,fallback='Не получилось'){
    if(e?.message==='NO_TOKEN')return 'Нужна общая синхронизация';
    if(e?.message==='TIMEOUT')return 'Сервер отвечает дольше обычного. Попробуй ещё раз.';
    return e?.message||fallback;
  }
  function localParts(date){
    const d=new Date(date),pad=n=>String(n).padStart(2,'0');
    return {date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,time:`${pad(d.getHours())}:${pad(d.getMinutes())}`};
  }
  function defaultWhen(){
    const d=new Date(Date.now()+60*60*1000);
    d.setSeconds(0,0);
    d.setMinutes(Math.ceil(d.getMinutes()/5)*5);
    return localParts(d);
  }
  function partnerName(){return state.people.find(x=>x&&x!==state.me)||'другому';}
  function targetText(item){
    if(item.target==='both')return 'Нам обоим';
    if(item.target==='self')return item.author===state.me?'Себе':`Себе (${item.author})`;
    return item.author===state.me?`Для ${partnerName()}`:`Для ${state.me||'тебя'}`;
  }
  function formatWhen(value){
    const d=new Date(value);
    if(!Number.isFinite(d.getTime()))return 'Дата не указана';
    return d.toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).replace(',',' ·');
  }
  function signature(items){
    return JSON.stringify((items||[]).map(x=>[x.id,x.text,x.author,x.scheduled_for,x.target,Boolean(x.done),x.sent_at||'']));
  }

  function addStyles(){
    if($('#family-reminder-styles'))return;
    const style=document.createElement('style');style.id='family-reminder-styles';style.textContent=`
      #home .home-mini[data-open="reminders"] .tile-icon{background:#edf3ff!important}
      .rem-card{background:#fff;border-radius:24px;padding:17px;margin-bottom:11px;box-shadow:0 8px 26px rgba(35,30,25,.055)}
      .rem-card h3{margin:0 0 4px;font-size:15px}.rem-card>p{margin:0;color:#8e8782;font-size:10px;line-height:1.45}
      .rem-field{margin-top:11px}.rem-field label{display:block;margin:0 0 5px 3px;font-size:9px;color:#938b86;font-weight:750}
      .rem-field input{width:100%;border:1px solid #ece6e1;background:#fbfaf8;border-radius:14px;padding:12px;font:inherit;font-size:13px;outline:none;color:#282427}
      .rem-field input:focus{border-color:#cfa8ae;box-shadow:0 0 0 3px rgba(207,168,174,.12)}
      .rem-datetime{display:grid;grid-template-columns:1.15fr .85fr;gap:8px}
      .rem-targets{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:7px}
      .rem-target{border:1px solid #ece5df;background:#faf8f6;color:#665f5c;border-radius:13px;padding:9px 5px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}
      .rem-target.active{background:#262329;color:#fff;border-color:#262329}
      .rem-save{width:100%;margin-top:12px;border:0;background:#242127;color:#fff;border-radius:14px;padding:12px 14px;font:inherit;font-size:11px;font-weight:850;cursor:pointer}
      .rem-save:disabled{opacity:.45}.rem-cancel{display:none;width:100%;margin-top:6px;border:0;background:transparent;color:#968d88;padding:7px;font:inherit;font-size:9px;cursor:pointer}.rem-cancel.show{display:block}
      .rem-push-note{display:none;margin-top:9px;padding:9px 11px;border-radius:13px;background:#fff7e8;color:#806641;font-size:9px;line-height:1.4}.rem-push-note.show{display:block}
      .rem-section-title{display:flex;align-items:center;justify-content:space-between;margin:16px 4px 8px}.rem-section-title b{font-size:13px}.rem-section-title span{font-size:9px;color:#aaa}
      .rem-list{display:grid;gap:7px}.rem-item{border:1px solid #ece6e1;background:#fff;border-radius:18px;padding:11px;display:grid;grid-template-columns:34px minmax(0,1fr);gap:9px;align-items:start}
      .rem-item.done{opacity:.58}.rem-item.done .rem-text{text-decoration:line-through}.rem-clock{width:34px;height:34px;border-radius:12px;background:#f2f5fb;display:grid;place-items:center;font-size:16px}.rem-main{min-width:0}.rem-text{font-size:11.5px;font-weight:800;line-height:1.25;color:#353033;overflow-wrap:anywhere}.rem-meta{font-size:8.7px;color:#958d89;margin-top:4px;line-height:1.35}.rem-status{display:inline-block;margin-top:5px;padding:4px 7px;border-radius:999px;background:#f3efe9;color:#796f69;font-size:7.8px;font-weight:800}.rem-status.sent{background:#ebf5ed;color:#52725a}.rem-actions{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}.rem-action{border:0;background:#f3efeb;color:#5e5754;border-radius:9px;min-height:28px;padding:0 9px;font:inherit;font-size:8px;font-weight:800;cursor:pointer}.rem-action.primary{background:#edf4ee;color:#45664c}.rem-action.danger{background:#fbefef;color:#9a5a60}.rem-empty{text-align:center;color:#aaa;font-size:10px;padding:22px 8px;border:1px dashed #e6dfd9;border-radius:18px;background:rgba(255,255,255,.55)}
      .rem-offline{padding:18px;border-radius:20px;background:#fff7e8;color:#735e3f;font-size:11px;line-height:1.5}
      .rem-home-badge{position:absolute;right:4px;top:3px;z-index:8;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#df5363;color:#fff;display:none;align-items:center;justify-content:center;font-size:8px;font-weight:900;transform:scale(.75);transform-origin:top right}.rem-home-badge.show{display:flex}
      @media(max-width:360px){.rem-card{padding:14px}.rem-target{font-size:8.4px}.rem-datetime{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(style);
  }

  function ensureTile(){
    const menu=$('#home .menu.home-menu-redesign')||$('#home .menu');
    if(!menu||menu.querySelector('[data-open="reminders"]'))return Boolean(menu);
    const tile=document.createElement('button');
    tile.type='button';tile.className='tile home-mini';tile.dataset.open='reminders';tile.setAttribute('aria-label','Напоминания');
    tile.innerHTML='<div class="mini-main"><div class="tile-icon">⏰</div><div class="mini-copy"><strong>Напоминания</strong><small>Себе или друг другу</small></div></div><div class="home-card-arrow">›</div><span class="rem-home-badge"></span>';
    const surprise=menu.querySelector('[data-open="surprise"]');
    if(surprise)surprise.before(tile);else menu.appendChild(tile);
    tile.addEventListener('click',openScreen);
    updateBadge();
    return true;
  }

  function ensureScreen(){
    if($('#reminders'))return;
    const app=$('.app');if(!app)return;
    const section=document.createElement('section');section.id='reminders';section.className='screen';
    section.innerHTML=`
      <div class="screen-head"><button class="back" id="remBack" type="button">←</button><div><h2>Напоминания</h2><p>Себе, друг другу или вам обоим</p></div></div>
      <div id="remOffline" class="rem-offline" style="display:none">Чтобы напоминания приходили при закрытом приложении, открой сайт по своей персональной ссылке и включи уведомления в настройках.</div>
      <div id="remBody">
        <div class="rem-card">
          <h3 id="remFormTitle">Новое напоминание</h3><p>Уведомление придёт примерно в указанную минуту.</p>
          <div class="rem-field"><label for="remText">Что напомнить</label><input id="remText" maxlength="500" autocomplete="off" placeholder="Например: забрать заказ"></div>
          <div class="rem-field"><label>Кому</label><div class="rem-targets"><button type="button" class="rem-target active" data-rem-target="self">Себе</button><button type="button" class="rem-target" data-rem-target="partner">Другому</button><button type="button" class="rem-target" data-rem-target="both">Нам обоим</button></div></div>
          <div class="rem-datetime"><div class="rem-field"><label for="remDate">Дата</label><input id="remDate" type="date"></div><div class="rem-field"><label for="remTime">Время</label><input id="remTime" type="time" step="60"></div></div>
          <button class="rem-save" id="remSave" type="button">Добавить напоминание</button><button class="rem-cancel" id="remCancel" type="button">Отменить редактирование</button>
          <div class="rem-push-note" id="remPushNote">🔔 Напоминание сохранится, но уведомления на этом устройстве сейчас не разрешены. Их можно включить через настройки приложения.</div>
        </div>
        <div class="rem-section-title"><b>Предстоящие</b><span id="remCount"></span></div><div class="rem-list" id="remUpcoming"></div>
        <div class="rem-section-title"><b>Выполненные</b><span>последние</span></div><div class="rem-list" id="remDone"></div>
      </div>`;
    app.appendChild(section);
    $('#remBack').addEventListener('click',openHome);
    $('#remSave').addEventListener('click',saveReminder);
    $('#remCancel').addEventListener('click',resetForm);
    section.addEventListener('click',e=>{
      const target=e.target.closest?.('[data-rem-target]');
      if(target){setTarget(target.dataset.remTarget);return}
      const action=e.target.closest?.('[data-rem-action]');
      if(action)handleAction(action.dataset.remAction,action.dataset.id);
    });
    resetForm();updatePushNote();
  }

  function setTarget(value){
    state.target=['self','partner','both'].includes(value)?value:'self';
    document.querySelectorAll('[data-rem-target]').forEach(b=>b.classList.toggle('active',b.dataset.remTarget===state.target));
    const partnerBtn=$('[data-rem-target="partner"]');if(partnerBtn)partnerBtn.textContent=partnerName()==='другому'?'Другому':partnerName();
  }
  function updatePushNote(){
    const note=$('#remPushNote');if(!note)return;
    const show=typeof Notification!=='undefined'&&Notification.permission!=='granted';
    note.classList.toggle('show',show);
  }
  function resetForm(){
    state.editId='';state.target='self';
    if(!$('#remText'))return;
    $('#remText').value='';
    const w=defaultWhen();$('#remDate').value=w.date;$('#remTime').value=w.time;
    $('#remFormTitle').textContent='Новое напоминание';$('#remSave').textContent='Добавить напоминание';$('#remCancel').classList.remove('show');
    setTarget('self');
  }
  function editReminder(item){
    state.editId=item.id;$('#remText').value=item.text;
    const w=localParts(item.scheduled_for);$('#remDate').value=w.date;$('#remTime').value=w.time;
    $('#remFormTitle').textContent='Изменить напоминание';$('#remSave').textContent='Сохранить изменения';$('#remCancel').classList.add('show');
    setTarget(item.target);$('#remText').focus();scrollTo({top:0,behavior:'smooth'});
  }
  async function saveReminder(){
    if(state.busy)return;
    const text=$('#remText').value.trim(),date=$('#remDate').value,time=$('#remTime').value;
    if(!text)return toast('Напиши, что напомнить');
    if(!date||!time)return toast('Выбери дату и время');
    const when=new Date(`${date}T${time}:00`);
    if(!Number.isFinite(when.getTime()))return toast('Не получилось прочитать дату');
    if(when.getTime()<Date.now()-60000)return toast('Это время уже прошло');
    const wasEditing=Boolean(state.editId),saveButton=$('#remSave');
    state.busy=true;saveButton.disabled=true;saveButton.textContent='Сохраняю…';
    try{
      if(state.editId)await api('update',{id:state.editId,text,target:state.target,scheduled_for:when.toISOString()});
      else await api('create',{text,target:state.target,scheduled_for:when.toISOString()});
      toast(wasEditing?'Напоминание обновлено':'Напоминание добавлено ⏰');resetForm();
      refresh(true);
    }catch(e){toast(friendlyError(e,'Не удалось сохранить'));refresh(true)}
    finally{
      state.busy=false;saveButton.disabled=false;
      saveButton.textContent=state.editId?'Сохранить изменения':'Добавить напоминание';
    }
  }
  async function handleAction(action,id){
    const item=state.items.find(x=>String(x.id)===String(id));if(!item)return;
    try{
      if(action==='done'){await api('update',{id:item.id,done:!item.done});refresh(true);return}
      if(action==='edit'){editReminder(item);return}
      if(action==='delete'){
        if(!confirm('Удалить это напоминание?'))return;
        await api('delete',{id:item.id});toast('Напоминание удалено');if(state.editId===item.id)resetForm();refresh(true);
      }
    }catch(e){toast(friendlyError(e));refresh(true)}
  }

  function itemHtml(item){
    const mine=item.author===state.me;
    const when=new Date(item.scheduled_for),past=Number.isFinite(when.getTime())&&when.getTime()<Date.now();
    const status=item.done?'Выполнено':item.sent_at?'Уведомление отправлено':past?'Ожидает отправки':'Запланировано';
    const sentClass=item.sent_at?' sent':'';
    return `<div class="rem-item${item.done?' done':''}" data-rem-id="${esc(item.id)}"><div class="rem-clock">${item.done?'✓':'⏰'}</div><div class="rem-main"><div class="rem-text">${esc(item.text)}</div><div class="rem-meta">${esc(formatWhen(item.scheduled_for))} · ${esc(targetText(item))}<br>Создал(а): ${esc(item.author||'—')}</div><span class="rem-status${sentClass}">${esc(status)}</span><div class="rem-actions"><button class="rem-action primary" type="button" data-rem-action="done" data-id="${esc(item.id)}">${item.done?'↩ Вернуть':'✓ Готово'}</button>${mine&&!item.done?`<button class="rem-action" type="button" data-rem-action="edit" data-id="${esc(item.id)}">Изменить</button>`:''}${mine?`<button class="rem-action danger" type="button" data-rem-action="delete" data-id="${esc(item.id)}">Удалить</button>`:''}</div></div></div>`;
  }
  function render(){
    if(!$('#remUpcoming'))return;
    const upcoming=state.items.filter(x=>!x.done).sort((a,b)=>new Date(a.scheduled_for)-new Date(b.scheduled_for));
    const done=state.items.filter(x=>x.done).sort((a,b)=>new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at)).slice(0,20);
    $('#remUpcoming').innerHTML=upcoming.length?upcoming.map(itemHtml).join(''):'<div class="rem-empty">Пока ничего не запланировано</div>';
    $('#remDone').innerHTML=done.length?done.map(itemHtml).join(''):'<div class="rem-empty">Выполненных напоминаний пока нет</div>';
    $('#remCount').textContent=upcoming.length?String(upcoming.length):'';
    setTarget(state.target);updateBadge();
  }
  function updateBadge(){
    const badge=$('[data-open="reminders"] .rem-home-badge');if(!badge)return;
    const count=state.items.filter(x=>!x.done&&new Date(x.scheduled_for).getTime()>=Date.now()-24*60*60*1000).length;
    badge.textContent=count>9?'9+':String(count);badge.classList.toggle('show',count>0);
  }
  async function refresh(force=false){
    if(!token()){
      if($('#remOffline'))$('#remOffline').style.display='block';if($('#remBody'))$('#remBody').style.display='none';state.items=[];state.sig='';updateBadge();return;
    }
    if(state.refreshing){if(force)state.refreshQueued=true;return}
    state.refreshing=true;
    try{
      const d=await api('list');state.me=String(d.author||'');state.people=Array.isArray(d.people)?d.people:[];
      if($('#remOffline'))$('#remOffline').style.display='none';if($('#remBody'))$('#remBody').style.display='block';
      const items=Array.isArray(d.items)?d.items:[],sig=signature(items);
      if(force||sig!==state.sig){state.items=items;state.sig=sig;render()}else{setTarget(state.target);updateBadge()}
      updatePushNote();
    }catch(e){
      if($('#remOffline')){$('#remOffline').style.display='block';$('#remOffline').textContent=e?.message==='TIMEOUT'?'Сервер отвечает дольше обычного. Список обновится автоматически.':'Не удалось загрузить напоминания. Проверь подключение — список обновится автоматически.'}
    }finally{
      state.refreshing=false;
      if(state.refreshQueued){state.refreshQueued=false;setTimeout(()=>refresh(true),0)}
    }
  }

  function openScreen(){
    ensureScreen();
    document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='reminders'));
    document.querySelectorAll('.bottom button').forEach(x=>x.classList.remove('active'));
    scrollTo({top:0,behavior:'smooth'});refresh(true);
  }
  function openHome(){
    const screen=$('#reminders');if(screen)screen.classList.remove('active');
    const home=$('#home');if(home)home.classList.add('active');
    document.querySelectorAll('.bottom button').forEach(x=>x.classList.toggle('active',x.dataset.nav==='home'));
    if(location.hash==='#reminders')history.replaceState(null,'',location.pathname+location.search);
    scrollTo({top:0,behavior:'smooth'});
  }
  function hashOpen(){if(location.hash==='#reminders')setTimeout(openScreen,80)}
  function init(){
    addStyles();ensureScreen();
    let tries=0;const timer=setInterval(()=>{if(ensureTile()||++tries>100)clearInterval(timer)},80);ensureTile();
    refresh(false);setInterval(()=>{if(!document.hidden)refresh(false)},60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});
    window.addEventListener('hashchange',hashOpen);hashOpen();
  }
  init();window.__familyRemindersV1=true;
}
