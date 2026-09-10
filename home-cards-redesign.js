if(typeof document!=='undefined'&&!window.__homeCardsRedesign){
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];

  const css=document.createElement('style');
  css.id='home-cards-redesign-styles';
  css.textContent=`
  /* Белая шестерёнка, как часть шапки */
  #settingsGear{color:#fff!important;background:rgba(255,255,255,.17)!important;border:1px solid rgba(255,255,255,.08)!important}
  #settingsGear svg{display:block;width:16px;height:16px;stroke:currentColor;stroke-width:2;fill:none}

  /* Блок «Наше»: компактный гибрид из макета */
  #home .section-title.home-menu-title{margin:22px 5px 11px!important;align-items:center!important}
  #home .section-title.home-menu-title h2{font-size:23px!important;letter-spacing:-.035em!important}
  #home .section-title.home-menu-title span{font-size:10px!important;color:#948b85!important}
  #home .menu.home-menu-redesign{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
  #home .menu.home-menu-redesign>.tile{margin:0!important;box-shadow:0 9px 24px rgba(58,43,35,.055)!important;border:1px solid rgba(232,224,216,.82)!important;background-color:rgba(255,255,255,.94)!important;transform:none;overflow:hidden!important}
  #home .menu.home-menu-redesign>.tile:before{display:none!important}
  #home .menu.home-menu-redesign>.tile:active{transform:scale(.985)!important}

  /* Две большие акцентные карточки */
  #home .menu.home-menu-redesign>.home-feature{grid-column:1/-1!important;min-height:104px!important;height:104px!important;border-radius:22px!important;padding:13px 54px 13px 14px!important;display:grid!important;grid-template-columns:66px minmax(0,1fr)!important;align-items:center!important;gap:13px!important;position:relative!important;background-size:46% 100%!important;background-repeat:no-repeat!important;background-position:right center!important}
  #home .menu.home-menu-redesign>.home-feature[data-open="designs"]{background-image:linear-gradient(90deg,#fff 0%,#fff 49%,rgba(255,255,255,.87) 61%,rgba(255,255,255,.22) 100%),url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=520&q=72')!important}
  #home .menu.home-menu-redesign>.home-feature[data-open="moments"]{background-image:linear-gradient(90deg,#fff 0%,#fff 49%,rgba(255,255,255,.88) 61%,rgba(255,255,255,.22) 100%),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=520&q=72')!important}
  #home .home-feature .tile-icon{width:64px!important;height:64px!important;display:grid!important;place-items:center!important;border-radius:20px!important;background:linear-gradient(145deg,#fff7f4,#f8e7e5)!important;font-size:31px!important;position:relative!important;z-index:2!important;box-shadow:inset 0 0 0 1px rgba(225,207,198,.45)!important}
  #home .home-feature>div:not(.tile-icon):not(.home-card-arrow):not(.home-feature-note){position:relative!important;z-index:2!important;min-width:0!important}
  #home .home-feature strong{font-size:16px!important;line-height:1.16!important;letter-spacing:-.02em!important;margin:0!important}
  #home .home-feature small{font-size:10px!important;line-height:1.3!important;margin-top:5px!important;color:#918984!important;max-width:180px!important}
  #home .home-feature-note{display:none;position:absolute;right:50px;top:18px;width:78px;text-align:center;font-family:cursive;font-size:13px;line-height:1.05;color:#b37375;transform:rotate(-4deg);z-index:2;pointer-events:none}
  #home .home-feature[data-open="moments"] .home-feature-note{top:20px;transform:rotate(-3deg)}

  /* Маленькие карточки */
  #home .menu.home-menu-redesign>.home-mini{min-height:76px!important;height:76px!important;border-radius:20px!important;padding:9px 30px 9px 10px!important;display:grid!important;grid-template-columns:46px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;position:relative!important}
  #home .home-mini .tile-icon{width:44px!important;height:44px!important;display:grid!important;place-items:center!important;border-radius:15px!important;background:#f8eeeb!important;font-size:23px!important;margin:0!important}
  #home .home-mini:nth-of-type(4n+1) .tile-icon{background:#f9eeee!important}
  #home .home-mini:nth-of-type(4n+2) .tile-icon{background:#fff3df!important}
  #home .home-mini:nth-of-type(4n+3) .tile-icon{background:#f5edf5!important}
  #home .home-mini:nth-of-type(4n+4) .tile-icon{background:#fff5dc!important}
  #home .home-mini>div:not(.tile-icon):not(.home-card-arrow){min-width:0!important}
  #home .home-mini strong{font-size:13px!important;line-height:1.12!important;letter-spacing:-.015em!important;margin:0!important;white-space:normal!important}
  #home .home-mini small{display:block!important;font-size:9px!important;line-height:1.18!important;color:#938b85!important;margin-top:4px!important;white-space:normal!important}
  #home .home-card-arrow{position:absolute!important;right:10px!important;top:50%!important;transform:translateY(-50%)!important;width:26px!important;height:26px!important;display:grid!important;place-items:center!important;border-radius:10px!important;background:rgba(255,255,255,.88)!important;color:#9b8f87!important;font-size:19px!important;font-weight:400!important;z-index:4!important;pointer-events:none!important}
  #home .home-feature .home-card-arrow{right:11px!important;width:31px!important;height:31px!important;border-radius:12px!important;color:#a06d68!important;box-shadow:0 4px 14px rgba(68,45,38,.05)!important}
  #home .menu.home-menu-redesign>.home-hidden{display:none!important}

  /* Счётчики нового должны оставаться видимыми на новом дизайне */
  #home .menu.home-menu-redesign .notify-badge{right:7px!important;top:6px!important;z-index:8!important;transform:scale(.82);transform-origin:top right}
  #home .home-feature .notify-badge{right:10px!important;top:7px!important}

  @media(min-width:400px){
    #home .home-feature-note{display:block}
    #home .home-feature strong{font-size:17px!important}
    #home .home-mini strong{font-size:13.5px!important}
  }
  @media(max-width:365px){
    #home .menu.home-menu-redesign{gap:7px!important}
    #home .menu.home-menu-redesign>.home-feature{height:96px!important;min-height:96px!important;grid-template-columns:58px minmax(0,1fr)!important;padding-left:11px!important;gap:10px!important}
    #home .home-feature .tile-icon{width:56px!important;height:56px!important;border-radius:18px!important;font-size:28px!important}
    #home .menu.home-menu-redesign>.home-mini{height:72px!important;min-height:72px!important;grid-template-columns:42px minmax(0,1fr)!important;padding-left:8px!important;gap:8px!important}
    #home .home-mini .tile-icon{width:40px!important;height:40px!important;font-size:21px!important}
    #home .home-mini strong{font-size:12px!important}
    #home .home-mini small{font-size:8.5px!important}
  }
  `;
  document.head.appendChild(css);

  function setCopy(tile,title,subtitle){
    if(!tile)return;
    tile.setAttribute('aria-label',title);
    const body=[...tile.children].find(x=>x.tagName==='DIV'&&!x.classList.contains('tile-icon')&&!x.classList.contains('tile-arrow')&&!x.classList.contains('home-card-arrow')&&!x.classList.contains('home-feature-note'));
    if(!body)return;
    const strong=body.querySelector('strong'),small=body.querySelector('small');
    if(strong)strong.textContent=title;
    if(small)small.textContent=subtitle;
  }
  function addArrow(tile){
    if(!tile||tile.querySelector('.home-card-arrow'))return;
    const arrow=document.createElement('div');arrow.className='home-card-arrow';arrow.textContent='›';tile.appendChild(arrow);
  }
  function feature(tile,note){
    if(!tile)return;
    tile.classList.remove('wide');tile.classList.add('home-feature');
    if(!tile.querySelector('.home-feature-note')){const n=document.createElement('div');n.className='home-feature-note';n.textContent=note;tile.appendChild(n)}
    addArrow(tile);
  }
  function mini(tile){if(!tile)return;tile.classList.remove('wide');tile.classList.add('home-mini');addArrow(tile)}

  function setup(){
    const menu=$('#home .menu');
    if(!menu)return false;
    menu.classList.add('home-menu-redesign');
    const title=menu.previousElementSibling;
    if(title?.classList.contains('section-title'))title.classList.add('home-menu-title');

    const designs=menu.querySelector('[data-open="designs"]');
    const moments=menu.querySelector('[data-open="moments"]');
    const movies=menu.querySelector('[data-open="movies"]');
    const food=menu.querySelector('[data-open="food"]');
    const wishlist=menu.querySelector('[data-open="wishlist"]');
    const ideas=menu.querySelector('[data-open="ideas"]');
    const likes=menu.querySelector('[data-open="likes"]');
    const surprise=menu.querySelector('[data-open="surprise"]');
    const thanks=menu.querySelector('[data-open="thanks"]');

    setCopy(designs,'Дом и дизайны','Идеи для будущего дома');
    setCopy(moments,'Наши моменты','Фото, даты и воспоминания');
    setCopy(movies,'Что посмотреть','Фильм на вечер');
    setCopy(food,'Что поесть','Быстрый выбор');
    setCopy(wishlist,'Хотелки','Всё, что хочется');
    setCopy(ideas,'Идеи','Чтобы не забыть');
    setCopy(likes,'Нам нравится','Всё любимое');
    setCopy(surprise,'Сюрприз','Случайная приятность');

    feature(designs,'Наш дом');
    feature(moments,'Маленькие счастья');
    [movies,food,wishlist,ideas,likes,surprise].forEach(mini);
    if(thanks)thanks.classList.add('home-hidden');

    [designs,moments,movies,food,wishlist,ideas,likes,surprise,thanks].forEach(x=>x&&menu.appendChild(x));

    const gear=$('#settingsGear');
    if(gear&&!gear.querySelector('svg')){
      gear.textContent='';
      gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20.3h-3v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.56-1.04H5.3v-3h.14A1.7 1.7 0 0 0 7 9.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.7 4.7v-.1h3v.1a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.14v3h-.14A1.7 1.7 0 0 0 19.4 15Z"></path></svg>';
    }
    return true;
  }

  let tries=0;const timer=setInterval(()=>{if(setup()||++tries>100)clearInterval(timer)},60);setup();
  window.__homeCardsRedesign=true;
}
