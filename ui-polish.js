const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const css=document.createElement('style');
css.id='ui-polish-styles';
css.textContent=`
:root{--spring:cubic-bezier(.2,.8,.2,1);--soft-spring:cubic-bezier(.22,1,.36,1)}
body{overflow-x:hidden}
.screen.active{animation:screenEnter .42s var(--soft-spring) both}
@keyframes screenEnter{from{opacity:0;transform:translateY(12px) scale(.994)}to{opacity:1;transform:none}}
#home.active .hero{animation:heroEnter .65s var(--soft-spring) both}
@keyframes heroEnter{from{opacity:.2;transform:translateY(-8px) scale(.985)}to{opacity:1;transform:none}}
#home.active .quote{animation:riseIn .48s .08s var(--soft-spring) both}
#home.active .tile{animation:tileEnter .48s var(--soft-spring) both}
#home.active .tile:nth-child(1){animation-delay:.04s}#home.active .tile:nth-child(2){animation-delay:.08s}#home.active .tile:nth-child(3){animation-delay:.12s}#home.active .tile:nth-child(4){animation-delay:.16s}#home.active .tile:nth-child(5){animation-delay:.20s}#home.active .tile:nth-child(6){animation-delay:.24s}#home.active .tile:nth-child(7){animation-delay:.28s}#home.active .tile:nth-child(8){animation-delay:.32s}#home.active .tile:nth-child(9){animation-delay:.36s}
@keyframes tileEnter{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
@keyframes riseIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.tile,.card,.design,.list-item,.feed-item,.moment,.surprise,.who-btn,.activity-signal{transition:transform .24s var(--spring),box-shadow .24s var(--spring),border-color .24s ease,background .24s ease}
.btn,.chip,.back,.icon-btn,.bottom button,.heart{transition:transform .18s var(--spring),background .2s ease,color .2s ease,box-shadow .2s ease,opacity .2s ease}
.btn:active,.chip:active,.back:active,.icon-btn:active,.bottom button:active,.heart:active{transform:scale(.94)}
@media(hover:hover){.tile:hover,.card:hover,.design:hover,.moment:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(35,30,25,.10)}.btn:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(23,25,29,.16)}.chip:hover{background:#f2ede7}.back:hover,.icon-btn:hover{transform:translateY(-1px)}}
.screen.active .card,.screen.active .gallery,.screen.active .list,.screen.active .feed,.screen.active .moment-grid,.screen.active .surprise{animation:riseIn .4s .04s var(--soft-spring) both}
.list-item,.feed-item,.moment{animation:itemIn .34s var(--soft-spring) both}
@keyframes itemIn{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
.result-box.show{animation:resultPop .35s var(--soft-spring) both}
@keyframes resultPop{0%{opacity:0;transform:translateY(8px) scale(.96)}65%{transform:translateY(-2px) scale(1.01)}100%{opacity:1;transform:none}}
.overlay.show{animation:overlayIn .22s ease both;backdrop-filter:blur(5px)}
.overlay.show .modal-card,.overlay.show .viewer-card{animation:modalIn .34s var(--soft-spring) both}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}@keyframes modalIn{from{opacity:0;transform:translateY(14px) scale(.94)}to{opacity:1;transform:none}}
.bottom{transition:transform .25s var(--spring),box-shadow .25s ease}.bottom button.active{animation:navPop .28s var(--soft-spring)}@keyframes navPop{50%{transform:scale(1.05)}100%{transform:none}}
.notify-badge.show{animation:badgePop .35s var(--soft-spring)}@keyframes badgePop{0%{transform:scale(.5)}70%{transform:scale(1.15)}100%{transform:scale(1)}}

/* Спасибо: сначала свежие сообщения, затем форма. */
#thanks .thanks-bank{position:relative;overflow:hidden;padding:17px 16px 15px;margin-bottom:12px;background:linear-gradient(145deg,#fff,#fff8f3);border:1px solid #f0e4dc;box-shadow:0 10px 30px rgba(90,60,45,.07)}
#thanks .thanks-bank .section-title{margin:0 0 3px;align-items:center}
#thanks .thanks-bank .section-title h2{font-size:18px}
#thanks .thanks-bank-note{font-size:10px;color:#9a8175;margin:0 0 11px;line-height:1.45}
#thanks .thanks-bank #thanksFeed{margin-top:0}
#thanks .thanks-bank.compact #thanksFeed .feed-item:nth-child(n+4){display:none}
#thanks .thanks-bank .feed-item{background:rgba(255,255,255,.92);padding:14px 14px 13px;border-color:#eee2dc}
#thanks .thanks-bank .feed-item.from-partner{border-color:#efc9ce;background:linear-gradient(135deg,#fff,#fff3f4);box-shadow:0 7px 20px rgba(191,88,103,.08)}
#thanks .thanks-bank .feed-item.from-partner b{color:#a54f5c}
#thanks .thanks-bank .feed-item.from-partner:after{content:'для тебя';position:absolute;right:10px;top:10px;font-size:9px;font-weight:800;color:#b65e6a;background:#f9e1e4;border-radius:999px;padding:5px 8px}
#thanksExpand{width:100%;border:0;background:#f4ece7;color:#6f5a50;border-radius:13px;padding:10px 12px;margin-top:9px;font-size:11px;font-weight:800;cursor:pointer;transition:transform .18s var(--spring),background .2s ease}
#thanksExpand:active{transform:scale(.98)}
#thanksExpand[hidden]{display:none}
#thanks .thanks-compose{position:relative;background:linear-gradient(135deg,#f4dfe1,#fff0e4);animation:thanksGlow 7s ease-in-out infinite alternate}
@keyframes thanksGlow{from{box-shadow:0 8px 24px rgba(176,83,96,.04)}to{box-shadow:0 13px 34px rgba(176,83,96,.13)}}
#thanks .thanks-compose .big{display:inline-block;animation:letterFloat 3.6s ease-in-out infinite}
@keyframes letterFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
#thanks #saveThanks{display:none!important}
#thanks #shareThanks{width:100%;padding:14px 18px;border-radius:16px;font-size:14px}
#thanks .thanks-preview{transition:transform .22s var(--spring),box-shadow .22s ease}
#thanks .thanks-preview.preview-pop{animation:previewPop .3s var(--soft-spring)}
@keyframes previewPop{50%{transform:scale(1.015);box-shadow:0 8px 20px rgba(181,82,96,.10)}100%{transform:none}}
#thanks .thanks-sent{animation:sentButton .55s var(--soft-spring)}
@keyframes sentButton{0%{transform:scale(1)}40%{transform:scale(.96)}72%{transform:scale(1.035)}100%{transform:scale(1)}}
.thanks-heart{position:fixed;z-index:120;pointer-events:none;font-size:18px;animation:heartFly .8s var(--soft-spring) forwards}
@keyframes heartFly{0%{opacity:0;transform:translate(-50%,0) scale(.4) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),var(--dy)) scale(1.15) rotate(var(--rot))}}

/* Мягкая реакция на обновление текста/результатов. */
.ui-pop{animation:resultPop .35s var(--soft-spring)!important}

@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}}
`;
document.head.appendChild(css);

let bankExpanded=false;

function pop(el){
  if(!el)return;
  el.classList.remove('ui-pop');
  void el.offsetWidth;
  el.classList.add('ui-pop');
  setTimeout(()=>el.classList.remove('ui-pop'),450);
}

function animateThanksSend(btn){
  btn.classList.remove('thanks-sent');void btn.offsetWidth;btn.classList.add('thanks-sent');
  const r=btn.getBoundingClientRect();
  const hearts=['❤️','💗','✨','💌','💕'];
  for(let i=0;i<7;i++){
    const h=document.createElement('span');h.className='thanks-heart';h.textContent=hearts[i%hearts.length];
    h.style.left=(r.left+r.width/2)+'px';h.style.top=(r.top+r.height/2)+'px';
    h.style.setProperty('--dx',`${-78+Math.random()*156}px`);
    h.style.setProperty('--dy',`${-55-Math.random()*85}px`);
    h.style.setProperty('--rot',`${-30+Math.random()*60}deg`);
    h.style.animationDelay=`${i*25}ms`;document.body.appendChild(h);setTimeout(()=>h.remove(),1000);
  }
}

function refreshThanksBank(){
  const bank=$('#thanksBank');const feed=$('#thanksFeed');const expand=$('#thanksExpand');if(!bank||!feed||!expand)return;
  const items=$$('#thanksFeed .feed-item');
  items.forEach(x=>x.classList.remove('from-partner'));
  const me=($('#profileName')?.textContent||'').trim();
  items.forEach(x=>{
    const head=(x.querySelector('b')?.textContent||'').trim();
    if(head.startsWith('💌 От ') || (me && !head.includes(me) && head.startsWith('💌')))x.classList.add('from-partner');
  });
  bank.classList.toggle('compact',!bankExpanded);
  expand.hidden=items.length<=3;
  expand.textContent=bankExpanded?'Свернуть историю':'Показать всю банку · '+items.length;
}

function setupThanks(){
  const thanks=$('#thanks'), hero=thanks?.querySelector('.thanks-hero'), feed=$('#thanksFeed');
  if(!thanks||!hero||!feed||$('#thanksBank'))return;
  hero.classList.add('thanks-compose');
  const title=[...thanks.querySelectorAll('.section-title')].find(x=>x.querySelector('#thanksCount'));
  const bank=document.createElement('div');bank.id='thanksBank';bank.className='thanks-bank card compact';
  if(title){title.querySelector('h2').textContent='Последние «спасибо»';bank.appendChild(title)}
  const note=document.createElement('div');note.className='thanks-bank-note';note.textContent='Свежие сообщения всегда сверху — их видно сразу при входе.';bank.appendChild(note);bank.appendChild(feed);
  const expand=document.createElement('button');expand.id='thanksExpand';expand.type='button';expand.textContent='Показать всю банку';bank.appendChild(expand);
  hero.before(bank);
  expand.addEventListener('click',()=>{bankExpanded=!bankExpanded;refreshThanksBank();pop(bank)});
  const mini=hero.querySelector('.mini-note');if(mini)mini.textContent='Нажми «Отправить» — благодарность сразу появится в вашей общей банке. Никакие мессенджеры не открываются.';
  const save=$('#saveThanks');if(save){save.tabIndex=-1;save.setAttribute('aria-hidden','true')}
  const observer=new MutationObserver(()=>refreshThanksBank());observer.observe(feed,{childList:true,subtree:true,characterData:true});
  refreshThanksBank();
}

function setupCopy(){
  const husband=$('[data-profile="Алекс"]');if(husband){husband.dataset.profile='Муж';husband.textContent='💙 Муж'}
  const moments=$('#moments');if(moments){
    const sub=moments.querySelector('.screen-head p');if(sub)sub.textContent='Ваши общие фото и воспоминания';
    const note=moments.querySelector('.mini-note');if(note)note.textContent='Фото сжимается перед загрузкой и в общем режиме сохраняется в приватном хранилище.';
  }
}

function setupResultAnimations(){
  ['#movieResult','#foodResult','#thanksPreview','#surpriseTitle','#surpriseText'].forEach(sel=>{
    const el=$(sel);if(!el)return;new MutationObserver(()=>{if(sel==='#thanksPreview'){el.classList.remove('preview-pop');void el.offsetWidth;el.classList.add('preview-pop')}else pop(el)}).observe(el,{childList:true,subtree:true,characterData:true});
  });
}

// Перехватываем старую кнопку отправки ДО её обработчика из app.js.
// Вместо Web Share вызываем внутреннее сохранение, которое уже умеет синхронизироваться с Supabase.
document.addEventListener('click',e=>{
  const send=e.target?.closest?.('#shareThanks');
  if(send){
    if(send.disabled)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    const save=$('#saveThanks');
    if(save&&!save.disabled){animateThanksSend(send);save.click();setTimeout(refreshThanksBank,0)}
    return;
  }
},true);

function init(){setupCopy();setupThanks();setupResultAnimations();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
