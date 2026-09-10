if(typeof document!=='undefined'){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const css=document.createElement('style');
css.id='ui-polish-styles';
css.textContent=`
:root{--spring:cubic-bezier(.2,.8,.2,1);--soft-spring:cubic-bezier(.22,1,.36,1)}
body{overflow-x:hidden}
#home .hero{min-height:250px;justify-content:flex-start;padding:86px 22px 22px}
#home .hero h1{margin-top:0}#home .hero p{margin-top:10px}
@media(max-width:360px){#home .hero{min-height:235px;padding:78px 18px 18px}}
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

/* Спасибо: одно последнее сообщение -> форма -> история. */
#thanksLatest{display:none;margin-bottom:10px;padding:13px 14px;border-radius:20px;background:linear-gradient(135deg,#fff,#fff4f5);border:1px solid #efd6d9;box-shadow:0 8px 24px rgba(181,82,96,.07)}
#thanksLatest.show{display:block;animation:riseIn .35s var(--soft-spring) both}
#thanksLatest .latest-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:10px;font-weight:900;color:#a65762;text-transform:uppercase;letter-spacing:.04em}
#thanksLatest .feed-item{margin:0;border:0;background:transparent;padding:2px 0;box-shadow:none}
#thanksLatest .feed-item:after{display:none!important}
#thanks .thanks-compose{position:relative;background:linear-gradient(135deg,#f4dfe1,#fff0e4);animation:thanksGlow 7s ease-in-out infinite alternate;margin-bottom:12px}
@keyframes thanksGlow{from{box-shadow:0 8px 24px rgba(176,83,96,.04)}to{box-shadow:0 13px 34px rgba(176,83,96,.13)}}
#thanks .thanks-compose .big{display:inline-block;animation:letterFloat 3.6s ease-in-out infinite}
@keyframes letterFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
#thanks #saveThanks{display:none!important}
#thanks #shareThanks{width:100%;padding:14px 18px;border-radius:16px;font-size:14px}
#thanks .thanks-compose .mini-note{display:none!important}
#thanks .thanks-preview{transition:transform .22s var(--spring),box-shadow .22s ease}
#thanks .thanks-preview.preview-pop{animation:previewPop .3s var(--soft-spring)}
@keyframes previewPop{50%{transform:scale(1.015);box-shadow:0 8px 20px rgba(181,82,96,.10)}100%{transform:none}}
#thanks .thanks-bank{position:relative;overflow:hidden;padding:17px 16px 15px;margin:0 0 12px;background:linear-gradient(145deg,#fff,#fff8f3);border:1px solid #f0e4dc;box-shadow:0 10px 30px rgba(90,60,45,.07)}
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
#thanksExpand:active{transform:scale(.98)}#thanksExpand[hidden]{display:none}
#thanks .thanks-sent{animation:sentButton .55s var(--soft-spring)}
@keyframes sentButton{0%{transform:scale(1)}40%{transform:scale(.96)}72%{transform:scale(1.035)}100%{transform:scale(1)}}
.thanks-heart{position:fixed;z-index:120;pointer-events:none;font-size:18px;animation:heartFly .8s var(--soft-spring) forwards}
@keyframes heartFly{0%{opacity:0;transform:translate(-50%,0) scale(.4) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),var(--dy)) scale(1.15) rotate(var(--rot))}}

/* Дизайны: картинка всегда занимает карточку, есть локальный визуальный fallback. */
#designs .design{background:#ded8d1}
#designs .design img{opacity:1;transition:opacity .25s ease,transform .35s var(--soft-spring)}
#designs .design.image-loading img{opacity:.12}
#designs .design.image-fallback img{opacity:1;object-fit:cover}
@media(hover:hover){#designs .design:hover img{transform:scale(1.025)}}
.ui-pop{animation:resultPop .35s var(--soft-spring)!important}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}}
`;
document.head.appendChild(css);

let bankExpanded=false;
function pop(el){if(!el)return;el.classList.remove('ui-pop');void el.offsetWidth;el.classList.add('ui-pop');setTimeout(()=>el.classList.remove('ui-pop'),450)}
function animateThanksSend(btn){
  btn.classList.remove('thanks-sent');void btn.offsetWidth;btn.classList.add('thanks-sent');
  const r=btn.getBoundingClientRect(),hearts=['❤️','💗','✨','💌','💕'];
  for(let i=0;i<7;i++){const h=document.createElement('span');h.className='thanks-heart';h.textContent=hearts[i%hearts.length];h.style.left=(r.left+r.width/2)+'px';h.style.top=(r.top+r.height/2)+'px';h.style.setProperty('--dx',`${-78+Math.random()*156}px`);h.style.setProperty('--dy',`${-55-Math.random()*85}px`);h.style.setProperty('--rot',`${-30+Math.random()*60}deg`);h.style.animationDelay=`${i*25}ms`;document.body.appendChild(h);setTimeout(()=>h.remove(),1000)}
}

function isPartnerCard(x){
  const me=($('#profileName')?.textContent||'').trim();
  const head=(x.querySelector('b')?.textContent||'').trim();
  return head.startsWith('💌 От ')||(me&&!head.includes(me)&&head.startsWith('💌'));
}
function refreshThanksBank(){
  const bank=$('#thanksBank'),feed=$('#thanksFeed'),expand=$('#thanksExpand'),latest=$('#thanksLatest');if(!bank||!feed||!expand||!latest)return;
  const items=$$('#thanksFeed .feed-item');
  items.forEach(x=>x.classList.toggle('from-partner',isPartnerCard(x)));
  bank.classList.toggle('compact',!bankExpanded);expand.hidden=items.length<=3;expand.textContent=bankExpanded?'Свернуть историю':'Показать всю историю · '+items.length;
  const first=items[0];
  if(first){const clone=first.cloneNode(true);clone.classList.remove('from-partner');latest.querySelector('.latest-body').replaceChildren(clone);latest.querySelector('.latest-label span').textContent=isPartnerCard(first)?'Новое для тебя':'Последнее сообщение';latest.classList.add('show')}
  else{latest.classList.remove('show');latest.querySelector('.latest-body').replaceChildren()}
}
function setupThanks(){
  const thanks=$('#thanks'),hero=thanks?.querySelector('.thanks-hero'),feed=$('#thanksFeed');if(!thanks||!hero||!feed||$('#thanksBank'))return;
  hero.classList.add('thanks-compose');
  const mini=hero.querySelector('.mini-note');if(mini)mini.remove();
  const latest=document.createElement('div');latest.id='thanksLatest';latest.innerHTML='<div class="latest-label"><span>Последнее сообщение</span><b>💌</b></div><div class="latest-body"></div>';hero.before(latest);
  const title=[...thanks.querySelectorAll('.section-title')].find(x=>x.querySelector('#thanksCount'));
  const bank=document.createElement('div');bank.id='thanksBank';bank.className='thanks-bank card compact';
  if(title){title.querySelector('h2').textContent='История «спасибо»';bank.appendChild(title)}
  const note=document.createElement('div');note.className='thanks-bank-note';note.textContent='Все ваши благодарности в одном месте.';bank.appendChild(note);bank.appendChild(feed);
  const expand=document.createElement('button');expand.id='thanksExpand';expand.type='button';expand.textContent='Показать всю историю';bank.appendChild(expand);hero.after(bank);
  expand.addEventListener('click',()=>{bankExpanded=!bankExpanded;refreshThanksBank();pop(bank)});
  const save=$('#saveThanks');if(save){save.tabIndex=-1;save.setAttribute('aria-hidden','true')}
  new MutationObserver(refreshThanksBank).observe(feed,{childList:true,subtree:true,characterData:true});refreshThanksBank();
}

function fallbackSvg(title,emoji){
  const safe=String(title||'Интерьер').replace(/[&<>]/g,'');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1050"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9ddd1"/><stop offset="1" stop-color="#c9b8aa"/></linearGradient></defs><rect width="900" height="1050" fill="url(#g)"/><rect x="90" y="160" width="720" height="530" rx="28" fill="#f7f2ec" opacity=".9"/><rect x="150" y="520" width="600" height="170" rx="28" fill="#b59b88" opacity=".65"/><circle cx="450" cy="360" r="110" fill="#fff" opacity=".75"/><text x="450" y="395" text-anchor="middle" font-size="120">${emoji}</text><text x="450" y="820" text-anchor="middle" font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="#4a4038">${safe}</text><text x="450" y="875" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" fill="#75685e">идея интерьера</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function setupDesignImages(){
  const sources={
    bedroom:'https://images.pexels.com/photos/8089163/pexels-photo-8089163.jpeg?auto=compress&cs=tinysrgb&w=900',
    living:'https://images.pexels.com/photos/5353892/pexels-photo-5353892.jpeg?auto=compress&cs=tinysrgb&w=900',
    kitchen:'https://images.pexels.com/photos/4030908/pexels-photo-4030908.jpeg?auto=compress&cs=tinysrgb&w=900',
    bath:'https://images.pexels.com/photos/7031565/pexels-photo-7031565.jpeg?auto=compress&cs=tinysrgb&w=900',
    hall:'https://images.pexels.com/photos/7614605/pexels-photo-7614605.jpeg?auto=compress&cs=tinysrgb&w=900',
    detail:'https://images.pexels.com/photos/7587311/pexels-photo-7587311.jpeg?auto=compress&cs=tinysrgb&w=900'
  };
  const icons={bedroom:'🛏️',living:'🛋️',kitchen:'🍽️',bath:'🛁',hall:'🚪',detail:'✨'};
  $$('#designs .design').forEach(card=>{
    const img=card.querySelector('img'),id=card.dataset.id,title=card.querySelector('.design-info b')?.textContent||'Интерьер';if(!img)return;
    card.classList.add('image-loading');img.referrerPolicy='no-referrer';img.decoding='async';
    const fail=()=>{img.onerror=null;img.src=fallbackSvg(title,icons[id]||'🏠');card.classList.remove('image-loading');card.classList.add('image-fallback')};
    img.onload=()=>{card.classList.remove('image-loading');card.classList.remove('image-fallback')};img.onerror=fail;
    if(sources[id])img.src=sources[id];
    if(img.complete){if(img.naturalWidth>0)card.classList.remove('image-loading');else fail()}
  });
}

function setupCopy(){
  const husband=$('[data-profile="Алекс"]');if(husband){husband.dataset.profile='Муж';husband.textContent='💙 Муж'}
  const moments=$('#moments');if(moments){const sub=moments.querySelector('.screen-head p');if(sub)sub.textContent='Ваши общие фото и воспоминания';const note=moments.querySelector('.mini-note');if(note)note.textContent='Фото сжимается перед загрузкой и в общем режиме сохраняется в приватном хранилище.'}
}
function setupResultAnimations(){['#movieResult','#foodResult','#thanksPreview','#surpriseTitle','#surpriseText'].forEach(sel=>{const el=$(sel);if(!el)return;new MutationObserver(()=>{if(sel==='#thanksPreview'){el.classList.remove('preview-pop');void el.offsetWidth;el.classList.add('preview-pop')}else pop(el)}).observe(el,{childList:true,subtree:true,characterData:true})})}

document.addEventListener('click',e=>{
  const send=e.target?.closest?.('#shareThanks');if(!send)return;if(send.disabled)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const save=$('#saveThanks');if(save&&!save.disabled){animateThanksSend(send);save.click();setTimeout(refreshThanksBank,0)}
},true);

function init(){setupCopy();setupDesignImages();setupThanks();setupResultAnimations()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}
