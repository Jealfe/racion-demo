if(typeof document!=='undefined'){
const $=s=>document.querySelector(s);
const css=document.createElement('style');css.id='home-layout-styles';css.textContent=`
/* Компактная главная */
#home .hero{min-height:0!important;padding:13px 16px 15px!important;border-radius:23px!important}
#home .hero-top{margin:0 0 8px!important;min-height:28px!important}
#home .hero h1{font-size:32px!important;line-height:1!important;letter-spacing:-.035em!important}
#home .hero>p{display:none!important}
#home .brand{font-size:10px!important;letter-spacing:.07em!important}
#home .today{font-size:10px!important;padding:6px 9px!important}
#home .quote{margin-top:10px!important;padding:11px 13px!important;font-size:11px!important;border-radius:15px!important}
#home .section-title{margin-top:18px!important}
@media(max-width:380px){#home .hero{padding:12px 14px 14px!important;border-radius:21px!important}#home .hero-top{margin-bottom:7px!important}#home .hero h1{font-size:29px!important}}

/* Профиль + статус + настройки */
.identity-bar{gap:7px!important}.identity-actions{display:flex;align-items:center;gap:6px;margin-left:auto;min-width:0}.identity-actions .local-pill{font-size:9px!important;padding:7px 9px!important;max-width:145px;overflow:hidden;text-overflow:ellipsis}.settings-gear{border:0;background:#fff;width:34px;height:34px;min-width:34px;border-radius:12px;display:grid;place-items:center;font-size:16px;cursor:pointer;box-shadow:0 5px 16px rgba(35,30,25,.05);transition:transform .18s ease,background .18s ease}.settings-gear:active{transform:scale(.92);background:#f1ece8}

/* Что нового: в начале, но не забирает экран */
#familyActivity{margin:10px 4px 0!important;padding:0!important;border-radius:17px!important;overflow:hidden!important;background:#fff!important}
#familyActivity .activity-head{margin:0!important;padding:11px 12px!important;cursor:pointer;user-select:none;align-items:center!important}
#familyActivity .activity-head h3{font-size:13px!important;display:flex;align-items:center;gap:7px}
#familyActivity .activity-head h3:before{content:'↻';display:grid;place-items:center;width:23px;height:23px;border-radius:8px;background:#f5efeb;color:#9a776a;font-size:11px}
#familyActivity .activity-head span{font-size:9px!important}
.activity-chevron{font-size:13px;color:#9c8d84;transition:transform .22s ease;margin-left:3px}
#familyActivity.activity-collapsed .activity-chevron{transform:rotate(-90deg)}
#familyActivity .activity-list{padding:0 8px 8px!important;gap:5px!important}
#familyActivity .activity-row{padding:7px 8px!important;border-radius:11px!important;grid-template-columns:26px 1fr auto!important;gap:7px!important;min-height:42px}
#familyActivity .activity-ico{width:26px!important;height:26px!important;border-radius:8px!important;font-size:13px!important}
#familyActivity .activity-copy b{font-size:9px!important}#familyActivity .activity-copy small{font-size:8px!important}
#familyActivity .activity-time{font-size:7px!important}
#familyActivity .activity-row:nth-child(n+4){display:none!important}
#familyActivity .activity-more{display:none!important}
#familyActivity.activity-collapsed .activity-list{display:none!important}

/* Служебные кнопки живут только в настройках */
#familyTools.settings-tools{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin:13px 0 0!important}
.settings-tools .family-tool{width:100%!important;text-align:left!important;border-radius:14px!important;padding:12px 13px!important;font-size:11px!important;box-shadow:none!important;background:#f7f3ef!important}
.settings-overlay{z-index:310!important}.settings-overlay .modal-card{max-width:340px;text-align:left;padding:19px;border-radius:24px}.settings-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.settings-head h3{margin:0;font-size:18px}.settings-head button{border:0;width:34px;height:34px;border-radius:50%;background:#f1ece8;font-size:18px;cursor:pointer}.settings-sub{margin:5px 0 0!important;font-size:10px!important;color:#958980!important}.settings-status{margin-top:13px;padding:10px 11px;border-radius:13px;background:#faf7f4;font-size:9px;color:#81756e;line-height:1.45}
`;
document.head.appendChild(css);

const thoughts=[
'Сегодня можно ничего грандиозного. Достаточно быть на одной стороне.',
'Самые хорошие вещи часто выглядят как обычный кофе, обычный ужин и обычное «я дома».',
'Иногда лучший план — сохранить то, что уже делает нас счастливыми.',
'Из маленьких привычек обычно и складывается то самое «нам хорошо».',
'Хороший день не обязан быть идеальным, чтобы его хотелось запомнить.',
'Иногда забота — это просто заметить, что другому сегодня тяжеловато.',
'Уют начинается не с вещей, а с ощущения, что тебя здесь ждут.',
'Ничего страшного, если сегодня план — просто спокойно провести вечер.',
'Смешная мелочь, которую понимаете только вы двое, тоже часть вашей истории.',
'Иногда лучший подарок — взять на себя то, что второй делать совсем не хочет.',
'Можно не соглашаться во всём и всё равно оставаться одной командой.',
'Хорошие воспоминания часто начинаются со слов «а давай».',
'Не обязательно ждать повода, чтобы сказать что-нибудь тёплое.',
'Совместные планы приятнее, когда в них остаётся место для спонтанности.',
'Обычный вечер тоже может однажды оказаться тем самым хорошим воспоминанием.',
'Иногда «я рядом» полезнее любого правильного совета.',
'Самые ценные традиции часто появляются случайно.',
'Можно иногда выбирать не лучший вариант, а тот, который радует вас обоих.',
'Маленькая благодарность сегодня может очень долго оставаться в памяти.',
'Дом становится своим постепенно — из ваших решений, вещей и привычек.',
'Иногда достаточно убрать телефоны и просто немного поговорить.',
'Хорошо, когда есть человек, которому можно отправить совершенно бессмысленную фотографию.',
'Не все планы обязаны быть полезными. Некоторые могут быть просто приятными.',
'День становится лучше, когда есть кому рассказать даже самую мелкую новость.',
'Забота редко выглядит эффектно. Чаще всего она очень бытовая.',
'Можно иногда ничего не решать сегодня. Завтра тоже существует.',
'Ваше «нормально» не обязано быть похоже на чужое.',
'Общие мечты начинаются с маленьких разговоров о том, как хотелось бы.',
'Если сегодня получилось посмеяться вместе — день уже был не зря.',
'Любимые места становятся любимыми чаще из-за человека рядом, а не из-за самого места.',
'Иногда хорошее настроение можно буквально заказать вместе с пиццей.',
'Быть командой — не значит всё делать поровну. Главное, чтобы обоим было не одиноко.',
'Самые тёплые слова обычно не требуют красивого повода.',
'Маленькие совместные решения тоже двигают большую жизнь вперёд.',
'Иногда лучший вечер — тот, который вообще не пришлось организовывать.',
'Есть вещи, которые становятся ценными просто потому, что они ваши общие.'
];
function refreshThought(){const q=$('#dailyQuote');if(!q)return;const d=new Date(),day=Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/86400000);q.innerHTML='<b>Мысль дня.</b> '+thoughts[Math.abs(day)%thoughts.length]}

function setup(){
  const home=$('#home'),identity=$('.identity-bar'),pill=$('.local-pill'),tools=$('#familyTools'),activity=$('#familyActivity');
  if(!home||!identity||!pill||!tools||!activity)return false;

  if(!$('#settingsGear')){
    const actions=document.createElement('div');actions.className='identity-actions';pill.parentNode.insertBefore(actions,pill);actions.appendChild(pill);
    const gear=document.createElement('button');gear.id='settingsGear';gear.className='settings-gear';gear.type='button';gear.title='Настройки';gear.setAttribute('aria-label','Настройки');gear.textContent='⚙️';actions.appendChild(gear);
    const overlay=document.createElement('div');overlay.id='familySettings';overlay.className='overlay settings-overlay';overlay.innerHTML='<div class="modal-card"><div class="settings-head"><h3>Настройки</h3><button type="button" id="settingsClose">×</button></div><p class="settings-sub">Приложение и уведомления</p><div id="settingsToolsSlot"></div><div class="settings-status">Персональная ссылка и общая синхронизация остаются без изменений.</div></div>';document.body.appendChild(overlay);
    tools.classList.add('settings-tools');$('#settingsToolsSlot').appendChild(tools);
    const close=()=>overlay.classList.remove('show');gear.onclick=()=>overlay.classList.add('show');$('#settingsClose').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  }

  if(!activity.dataset.compactReady){
    activity.dataset.compactReady='1';
    const head=activity.querySelector('.activity-head'),meta=head?.querySelector('span');
    if(meta){meta.textContent='последние 3';const ch=document.createElement('span');ch.className='activity-chevron';ch.textContent='⌄';meta.after(ch)}
    head?.setAttribute('role','button');head?.setAttribute('tabindex','0');
    const toggle=()=>activity.classList.toggle('activity-collapsed');
    head?.addEventListener('click',toggle);head?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
  }

  const title=home.querySelector('.hero h1');if(title)title.textContent='Мы вдвоём';
  refreshThought();
  return true;
}
let tries=0;const timer=setInterval(()=>{if(setup()||++tries>100)clearInterval(timer)},60);setup();
}
