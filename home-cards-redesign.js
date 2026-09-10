if(typeof document!=='undefined'&&!window.__homeCardsRedesign){
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];

  const css=document.createElement('style');
  css.id='home-cards-redesign-styles';
  css.textContent=`
  /* Белая минималистичная иконка настроек */
  #settingsGear{color:#fff!important;background:rgba(255,255,255,.17)!important;border:1px solid rgba(255,255,255,.08)!important}
  #settingsGear svg{display:block;width:17px;height:17px;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;fill:none}

  /* Блок «Наше»: компактный гибрид из макета */
  #home .section-title.home-menu-title{margin:20px 5px 9px!important;align-items:center!important}
  #home .section-title.home-menu-title h2{font-size:23px!important;letter-spacing:-.035em!important}
  #home .section-title.home-menu-title span{font-size:10px!important;color:#948b85!important}
  #home .menu.home-menu-redesign{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
  #home .menu.home-menu-redesign>.tile{margin:0!important;box-shadow:0 8px 22px rgba(58,43,35,.052)!important;border:1px solid rgba(232,224,216,.82)!important;background-color:rgba(255,255,255,.94)!important;transform:none;overflow:hidden!important}
  #home .menu.home-menu-redesign>.tile:before{display:none!important}
  #home .menu.home-menu-redesign>.tile:active{transform:scale(.985)!important}

  /* Две широкие карточки — чуть ниже */
  #home .menu.home-menu-redesign>.home-feature{grid-column:1/-1!important;min-height:92px!important;height:92px!important;border-radius:21px!important;padding:11px 50px 11px 12px!important;display:grid!important;grid-template-columns:58px minmax(0,1fr)!important;align-items:center!important;gap:11px!important;position:relative!important;background-size:46% 100%!important;background-repeat:no-repeat!important;background-position:right center!important}
  #home .menu.home-menu-redesign>.home-feature[data-open="designs"]{background-image:linear-gradient(90deg,#fff 0%,#fff 49%,rgba(255,255,255,.87) 61%,rgba(255,255,255,.22) 100%),url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=520&q=72')!important}
  #home .menu.home-menu-redesign>.home-feature[data-open="moments"]{background-image:linear-gradient(90deg,#fff 0%,#fff 49%,rgba(255,255,255,.88) 61%,rgba(255,255,255,.22) 100%),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=520&q=72')!important}
  #home .home-feature .tile-icon{width:56px!important;height:56px!important;display:grid!important;place-items:center!important;border-radius:18px!important;background:linear-gradient(145deg,#fff7f4,#f8e7e5)!important;font-size:28px!important;position:relative!important;z-index:2!important;box-shadow:inset 0 0 0 1px rgba(225,207,198,.45)!important}
  #home .home-feature>div:not(.tile-icon):not(.home-card-arrow):not(.home-feature-note){position:relative!important;z-index:2!important;min-width:0!important}
  #home .home-feature strong{font-size:15px!important;line-height:1.14!important;letter-spacing:-.02em!important;margin:0!important}
  #home .home-feature small{font-size:9.5px!important;line-height:1.25!important;margin-top:4px!important;color:#918984!important;max-width:175px!important}
  #home .home-feature-note{display:none;position:absolute;right:47px;top:14px;width:74px;text-align:center;font-family:cursive;font-size:12px;line-height:1.02;color:#b37375;transform:rotate(-4deg);z-index:2;pointer-events:none}
  #home .home-feature[data-open="moments"] .home-feature-note{top:16px;transform:rotate(-3deg)}

  /* Маленькие карточки — заметно компактнее */
  #home .menu.home-menu-redesign>.home-mini{min-height:64px!important;height:64px!important;border-radius:18px!important;padding:7px 27px 7px 8px!important;display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;position:relative!important}
  #home .home-mini .tile-icon{width:38px!important;height:38px!important;display:grid!important;place-items:center!important;border-radius:13px!important;background:#f8eeeb!important;font-size:20px!important;margin:0!important}
  #home .home-mini:nth-of-type(4n+1) .tile-icon{background:#f9eeee!important}
  #home .home-mini:nth-of-type(4n+2) .tile-icon{background:#fff3df!important}
  #home .home-mini:nth-of-type(4n+3) .tile-icon{background:#f5edf5!important}
  #home .home-mini:nth-of-type(4n+4) .tile-icon{background:#fff5dc!important}
  #home .home-mini>div:not(.tile-icon):not(.home-card-arrow){min-width:0!important}
  #home .home-mini strong{font-size:12.2px!important;line-height:1.08!important;letter-spacing:-.015em!important;margin:0!important;white-space:normal!important}
  #home .home-mini small{display:block!important;font-size:8.5px!important;line-height:1.12!important;color:#938b85!important;margin-top:3px!important;white-space:normal!important}
  #home .home-card-arrow{position:absolute!important;right:8px!important;top:50%!important;transform:translateY(-50%)!important;width:23px!important;height:23px!important;display:grid!important;place-items:center!important;border-radius:9px!important;background:rgba(255,255,255,.88)!important;color:#9b8f87!important;font-size:17px!important;font-weight:400!important;z-index:4!important;pointer-events:none!important}
  #home .home-feature .home-card-arrow{right:10px!important;width:28px!important;height:28px!important;border-radius:11px!important;color:#a06d68!important;box-shadow:0 4px 14px rgba(68,45,38,.05)!important}
  #home .menu.home-menu-redesign>.home-hidden{display:none!important}

  /* Счётчики нового должны оставаться видимыми на новом дизайне */
  #home .menu.home-menu-redesign .notify-badge{right:6px!important;top:5px!important;z-index:8!important;transform:scale(.78);transform-origin:top right}
  #home .home-feature .notify-badge{right:9px!important;top:6px!important}

  @media(min-width:400px){
    #home .home-feature-note{display:block}
    #home .home-feature strong{font-size:16px!important}
    #home .home-mini strong{font-size:12.6px!important}
  }
  @media(max-width:365px){
    #home .menu.home-menu-redesign{gap:7px!important}
    #home .menu.home-menu-redesign>.home-feature{height:86px!important;min-height:86px!important;grid-template-columns:52px minmax(0,1fr)!important;padding:10px 45px 10px 10px!important;gap:9px!important}
    #home .home-feature .tile-icon{width:50px!important;height:50px!important;border-radius:16px!important;font-size:25px!important}
    #home .menu.home-menu-redesign>.home-mini{height:60px!important;min-height:60px!important;grid-template-columns:36px minmax(0,1fr)!important;padding-left:7px!important;gap:7px!important}
    #home .home-mini .tile-icon{width:34px!important;height:34px!important;font-size:18px!important}
    #home .home-mini strong{font-size:11.4px!important}
    #home .home-mini small{font-size:8px!important}
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
    if(gear&&!gear.dataset.iconSliders){
      gear.dataset.iconSliders='1';
      gear.textContent='';
      gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h7"></path><path d="M15 7h5"></path><circle cx="13" cy="7" r="2"></circle><path d="M4 12h3"></path><path d="M11 12h9"></path><circle cx="9" cy="12" r="2"></circle><path d="M4 17h9"></path><path d="M17 17h3"></path><circle cx="15" cy="17" r="2"></circle></svg>';
    }
    return true;
  }

  let tries=0;const timer=setInterval(()=>{if(setup()||++tries>100)clearInterval(timer)},60);setup();
  window.__homeCardsRedesign=true;
}
