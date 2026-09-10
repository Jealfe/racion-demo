if(typeof document!=='undefined'){
const $=s=>document.querySelector(s);
const css=document.createElement('style');css.id='home-layout-styles';css.textContent=`
/* Компактная главная */
#home .hero{min-height:0!important;padding:12px 15px 14px!important;border-radius:22px!important}
#home .hero-top{margin:0 0 7px!important;min-height:30px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important}
#home .hero h1{font-size:31px!important;line-height:1!important;letter-spacing:-.035em!important}
#home .hero>p{display:none!important}
#home .brand{font-size:10px!important;letter-spacing:.07em!important}
#home .today{font-size:10px!important;padding:6px 9px!important;white-space:nowrap!important}
#home .quote{margin-top:9px!important;padding:11px 13px!important;font-size:11px!important;border-radius:15px!important}
#home .section-title{margin-top:18px!important}
.hero-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-left:auto}
.settings-gear{border:0;background:rgba(255,255,255,.16);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);width:30px;height:30px;min-width:30px;border-radius:10px;display:grid;place-items:center;font-size:14px;cursor:pointer;color:#fff;transition:transform .18s ease,background .18s ease;padding:0}.settings-gear:active{transform:scale(.91);background:rgba(255,255,255,.26)}
@media(max-width:380px){#home .hero{padding:11px 13px 13px!important;border-radius:20px!important}#home .hero-top{margin-bottom:6px!important}#home .hero h1{font-size:28px!important}.hero-actions{gap:4px}.settings-gear{width:29px;height:29px;min-width:29px}}

/* Профиль и статус больше не занимают место на главной */
.identity-bar{display:none!important}
.settings-account{display:grid;gap:7px;margin:13px 0 2px;padding:11px;background:#faf7f4;border-radius:15px;border:1px solid #eee6df}
.settings-account .who-btn{width:100%!important;justify-content:flex-start!important;box-shadow:none!important;background:#fff!important;border:1px solid #eee6df!important}
.settings-account .local-pill{display:block!important;width:100%!important;text-align:center!important;font-size:9px!important;padding:8px 10px!important;max-width:none!important;overflow:visible!important;background:#ebe6df;border-radius:999px;color:#777}

/* Что нового: в начале, максимум 3 события */
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

/* Служебные кнопки только в настройках */
#familyTools.settings-tools{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin:11px 0 0!important}
.settings-tools .family-tool{width:100%!important;text-align:left!important;border-radius:14px!important;padding:12px 13px!important;font-size:11px!important;box-shadow:none!important;background:#f7f3ef!important}
.settings-overlay{z-index:310!important}.settings-overlay .modal-card{max-width:340px;text-align:left;padding:19px;border-radius:24px}.settings-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.settings-head h3{margin:0;font-size:18px}.settings-head button{border:0;width:34px;height:34px;border-radius:50%;background:#f1ece8;font-size:18px;cursor:pointer}.settings-sub{margin:5px 0 0!important;font-size:10px!important;color:#958980!important}
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
'Есть вещи, которые становятся ценными просто потому, что они ваши общие.',
'Планы можно менять. Главное — не терять ощущение, ради чего вы их строили.',
'Иногда пять минут внимания важнее часа рядом с телефоном в руках.',
'Хорошо иметь свои маленькие слова, шутки и привычки, понятные только вам.',
'Даже очень обычный день может быть хорошим, если вечером хочется возвращаться домой.',
'Не обязательно всё успевать. Можно иногда просто быть вместе.',
'Пусть сегодня найдётся хотя бы одна мелочь, за которую хочется сказать спасибо.',
'Совместное решение становится легче, когда каждый чувствует, что его услышали.',
'Некоторые лучшие моменты невозможно запланировать заранее.',
'Иногда поддержка — это не совет, а чай и тишина рядом.',
'Хорошая привычка — чаще замечать то, что обычно принимается как само собой разумеющееся.',
'Можно быть уставшими и всё равно быть хорошей командой.',
'Если планы сорвались, это ещё не значит, что вечер испорчен.',
'Домашние шутки — вполне серьёзная семейная ценность.',
'Иногда один добрый вопрос меняет настроение целого вечера.',
'Приятно знать, что есть человек, с которым можно ничего не изображать.',
'Не обязательно искать особенный день для маленького сюрприза.',
'Хорошие отношения состоят не только из событий, но и из обычных вторников.',
'Иногда лучший компромисс — придумать третий вариант, который нравится обоим.',
'Можно не решать проблему сразу, если сначала нужно просто побыть рядом.',
'Совместное «помнишь?» со временем становится отдельным видом счастья.',
'Хорошо, когда можно вместе смеяться даже над неудачным планом.',
'Маленькие знаки внимания работают лучше, когда они неожиданные.',
'Иногда стоит выбрать то, что хочется, а не то, что выглядит правильнее.',
'Самые домашние моменты редко попадают на фотографии, но именно они запоминаются.',
'Сегодня можно сделать друг для друга что-то совсем простое.',
'Бывает полезно спросить: «Тебе сейчас помощь нужна или просто послушать?»',
'Ничего страшного, если ваши планы понятны только вам двоим.',
'Хорошая совместная жизнь складывается из множества маленьких договорённостей.',
'Иногда настроение спасает одна смешная фраза в нужный момент.',
'Можно быть разными и всё равно хотеть двигаться в одну сторону.',
'Хорошо иногда вспоминать, сколько всего вы уже прошли вместе.',
'Совместные мечты становятся реальнее, когда их иногда проговаривают вслух.',
'Не обязательно делать праздник большим, чтобы он был настоящим.',
'Иногда приятнее всего услышать простое «я подумал о тебе».',
'Уют — это когда не нужно объяснять, почему сегодня хочется тишины.',
'Хороший вечер может состоять из еды, дивана и одного нормального фильма.',
'Можно иногда отложить дела ради разговора, который давно откладывали.',
'Самое ценное в общих планах — ощущение, что вы строите их вместе.',
'Если второй сегодня устал, иногда достаточно просто немного облегчить ему день.',
'Не все счастливые моменты выглядят красиво со стороны.',
'Иногда стоит сохранить фотографию не потому, что она идеальная, а потому, что она ваша.',
'Хорошо иметь место, куда можно складывать общие идеи и потом случайно их находить.',
'Забота — это помнить мелочи, которые важны другому.',
'Можно иногда просто сказать: «Спасибо, что ты есть».',
'У каждого дня есть шанс стать хорошим хотя бы в одной маленькой детали.',
'Если сегодня не получилось всё, пусть получится хотя бы быть добрее друг к другу.',
'Иногда самое приятное — вместе предвкушать что-то, что ещё только будет.',
'Дом — это место, где ваши странные привычки становятся нормальными.',
'Можно иногда пересмотреть старые фотографии и удивиться, сколько уже произошло.',
'Хорошо, когда есть кому написать первым даже совершенно неважную мысль.',
'Не обязательно всегда быть в одинаковом настроении, чтобы понимать друг друга.',
'Иногда лучший способ поддержать — сделать обычный день чуть легче.',
'Общие покупки забываются, а смешные истории вокруг них остаются.',
'Можно иногда специально ничего не планировать и посмотреть, что получится.',
'Хорошие слова не портятся от частого использования.',
'Иногда маленькая уступка сегодня сохраняет хорошее настроение обоим.',
'Ваши совместные привычки — это тоже история, даже если они кажутся обычными.',
'Хорошо, когда рядом есть человек, перед которым не страшно выглядеть смешно.',
'Иногда один вечер без спешки полезнее целых выходных с планами.',
'Можно чаще отмечать не только большие достижения, но и маленькие победы.',
'Самые хорошие планы обычно начинаются с простого разговора.',
'Пусть сегодня будет хотя бы один момент, который хочется повторить.',
'Иногда достаточно одного объятия, чтобы ничего больше не объяснять.',
'Хорошо знать, что завтра снова будет с кем обсудить сегодняшний день.'
];
function refreshThought(){const q=$('#dailyQuote');if(!q)return;const d=new Date(),day=Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/86400000);q.innerHTML='<b>Мысль дня.</b> '+thoughts[Math.abs(day)%thoughts.length]}

function setup(){
  const home=$('#home'),identity=$('.identity-bar'),profile=$('#profileButton'),pill=$('.local-pill'),tools=$('#familyTools'),activity=$('#familyActivity'),heroTop=home?.querySelector('.hero-top'),today=$('#today');
  if(!home||!identity||!profile||!pill||!tools||!activity||!heroTop||!today)return false;

  let gear=$('#settingsGear');
  if(!gear){
    let heroActions=home.querySelector('.hero-actions');
    if(!heroActions){heroActions=document.createElement('div');heroActions.className='hero-actions';heroTop.appendChild(heroActions)}
    heroActions.appendChild(today);
    gear=document.createElement('button');gear.id='settingsGear';gear.className='settings-gear';gear.type='button';gear.title='Настройки';gear.setAttribute('aria-label','Настройки');gear.textContent='⚙️';heroActions.appendChild(gear);

    const overlay=document.createElement('div');overlay.id='familySettings';overlay.className='overlay settings-overlay';overlay.innerHTML='<div class="modal-card"><div class="settings-head"><h3>Настройки</h3><button type="button" id="settingsClose">×</button></div><p class="settings-sub">Профиль, синхронизация и приложение</p><div class="settings-account" id="settingsAccount"></div><div id="settingsToolsSlot"></div></div>';document.body.appendChild(overlay);
    $('#settingsAccount').appendChild(profile);$('#settingsAccount').appendChild(pill);
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

  refreshThought();
  return true;
}
let tries=0;const timer=setInterval(()=>{if(setup()||++tries>100)clearInterval(timer)},60);setup();
}
