if(typeof document!=='undefined'&&!window.__homeCardsRedesign){
  const $=s=>document.querySelector(s);

  const css=document.createElement('style');
  css.id='home-cards-redesign-styles';
  css.textContent=`
  /* Кнопка настроек — лёгкие белые ползунки */
  #settingsGear{color:#fff!important;background:rgba(255,255,255,.13)!important;border:1px solid rgba(255,255,255,.18)!important;box-shadow:none!important}
  #settingsGear svg{display:block;width:16px;height:16px;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;fill:none}

  /* «Наше» — плотнее и ближе к согласованному макету */
  #home .section-title.home-menu-title{margin:18px 5px 8px!important;align-items:center!important}
  #home .section-title.home-menu-title h2{font-size:21px!important;letter-spacing:-.035em!important}
  #home .section-title.home-menu-title span{font-size:9px!important;color:#9a918b!important}
  #home .menu.home-menu-redesign{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
  #home .menu.home-menu-redesign>.tile{margin:0!important;border:1px solid rgba(231,224,217,.82)!important;background-color:rgba(255,255,255,.96)!important;box-shadow:0 6px 18px rgba(58,43,35,.045)!important;overflow:hidden!important;transform:none!important}
  #home .menu.home-menu-redesign>.tile:before{display:none!important}
  #home .menu.home-menu-redesign>.tile:active{transform:scale(.986)!important}

  /* Два акцента: Наши моменты и Хотелки */
  #home .menu.home-menu-redesign>.home-feature{grid-column:1/-1!important;height:80px!important;min-height:80px!important;border-radius:19px!important;padding:9px 43px 9px 10px!important;display:grid!important;grid-template-columns:48px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;position:relative!important;background-repeat:no-repeat!important;background-position:right center!important;background-size:42% 100%!important}
  #home .menu.home-menu-redesign>.home-feature[data-open="moments"]{background-image:linear-gradient(90deg,#fff 0%,#fff 55%,rgba(255,255,255,.88) 66%,rgba(255,255,255,.22) 100%),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=520&q=72')!important}
  #home .menu.home-menu-redesign>.home-feature[data-open="wishlist"]{background-image:linear-gradient(90deg,#fff 0%,#fff 55%,rgba(255,255,255,.9) 66%,rgba(255,255,255,.28) 100%),url('https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=520&q=72')!important}
  #home .home-feature .tile-icon{width:46px!important;height:46px!important;display:grid!important;place-items:center!important;border-radius:15px!important;background:linear-gradient(145deg,#fff8f5,#f8e9e7)!important;font-size:23px!important;margin:0!important;position:relative!important;z-index:2!important;box-shadow:inset 0 0 0 1px rgba(225,207,198,.4)!important}
  #home .home-feature>div:not(.tile-icon):not(.home-card-arrow):not(.home-feature-note){position:relative!important;z-index:2!important;min-width:0!important}
  #home .home-feature strong{font-size:14px!important;line-height:1.08!important;letter-spacing:-.02em!important;margin:0!important}
  #home .home-feature small{font-size:8.7px!important;line-height:1.18!important;margin-top:3px!important;color:#948c86!important;max-width:165px!important}
  #home .home-feature-note{display:none!important}

  /* Все остальные — маленькие спокойные карточки */
  #home .menu.home-menu-redesign>.home-mini{height:56px!important;min-height:56px!important;border-radius:17px!important;padding:6px 24px 6px 7px!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;align-items:center!important;gap:7px!important;position:relative!important;background-image:none!important}
  #home .home-mini .tile-icon{width:32px!important;height:32px!important;display:grid!important;place-items:center!important;border-radius:11px!important;background:#f8eeeb!important;font-size:17px!important;margin:0!important}
  #home .home-mini[data-open="designs"] .tile-icon{background:#f3ece7!important}
  #home .home-mini[data-open="movies"] .tile-icon{background:#f9eded!important}
  #home .home-mini[data-open="food"] .tile-icon{background:#fff2dc!important}
  #home .home-mini[data-open="ideas"] .tile-icon{background:#fff4d8!important}
  #home .home-mini[data-open="likes"] .tile-icon{background:#f4edf5!important}
  #home .home-mini[data-open="surprise"] .tile-icon{background:#f8ecef!important}
  #home .home-mini>div:not(.tile-icon):not(.home-card-arrow){min-width:0!important}
  #home .home-mini strong{font-size:11.3px!important;line-height:1.05!important;letter-spacing:-.012em!important;margin:0!important;white-space:normal!important}
  #home .home-mini small{display:block!important;font-size:7.7px!important;line-height:1.08!important;color:#9a928d!important;margin-top:2px!important;white-space:normal!important}

  #home .home-card-arrow{position:absolute!important;right:7px!important;top:50%!important;transform:translateY(-50%)!important;width:20px!important;height:20px!important;display:grid!important;place-items:center!important;border-radius:8px!important;background:rgba(255,255,255,.88)!important;color:#a19891!important;font-size:15px!important;font-weight:400!important;z-index:4!important;pointer-events:none!important}
  #home .home-feature .home-card-arrow{right:8px!important;width:24px!important;height:24px!important;border-radius:9px!important;color:#a06d68!important;background:rgba(255,255,255,.9)!important}
  #home .menu.home-menu-redesign>.home-hidden{display:none!important}
  #home .menu.home-menu-redesign .notify-badge{right:5px!important;top:4px!important;z-index:8!important;transform:scale(.72);transform-origin:top right}

  @media(max-width:365px){
    #home .menu.home-menu-redesign{gap:6px!important}
    #home .menu.home-menu-redesign>.home-feature{height:74px!important;min-height:74px!important;grid-template-columns:43px minmax(0,1fr)!important;padding:8px 39px 8px 8px!important;gap:8px!important}
    #home .home-feature .tile-icon{width:41px!important;height:41px!important;border-radius:14px!important;font-size:21px!important}
    #home .home-feature strong{font-size:13px!important}
    #home .menu.home-menu-redesign>.home-mini{height:52px!important;min-height:52px!important;grid-template-columns:31px minmax(0,1fr)!important;padding-left:6px!important;gap:6px!important}
    #home .home-mini .tile-icon{width:29px!important;height:29px!important;font-size:16px!important}
    #home .home-mini strong{font-size:10.5px!important}
    #home .home-mini small{font-size:7.2px!important}
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
  function clearNote(tile){tile?.querySelector('.home-feature-note')?.remove()}
  function feature(tile){
    if(!tile)return;
    tile.classList.remove('wide','home-mini');
    tile.classList.add('home-feature');
    clearNote(tile);addArrow(tile);
  }
  function mini(tile){
    if(!tile)return;
    tile.classList.remove('wide','home-feature');
    tile.classList.add('home-mini');
    clearNote(tile);addArrow(tile);
  }

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

    setCopy(moments,'Наши моменты','Фото, даты и воспоминания');
    setCopy(wishlist,'Хотелки','Всё, что хочется');
    setCopy(designs,'Дом и дизайны','Идеи для дома');
    setCopy(movies,'Что посмотреть','Фильм на вечер');
    setCopy(food,'Что поесть','Быстрый выбор');
    setCopy(ideas,'Идеи','Чтобы не забыть');
    setCopy(likes,'Нам нравится','Всё любимое');
    setCopy(surprise,'Сюрприз','Случайная приятность');

    feature(moments);
    feature(wishlist);
    [designs,movies,food,ideas,likes,surprise].forEach(mini);
    if(thanks)thanks.classList.add('home-hidden');

    [moments,wishlist,designs,movies,food,ideas,likes,surprise,thanks].forEach(x=>x&&menu.appendChild(x));

    const gear=$('#settingsGear');
    if(gear){
      gear.dataset.iconSliders='2';
      gear.textContent='';
      gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h4"></path><path d="M13 7h6"></path><circle cx="11" cy="7" r="2"></circle><path d="M5 12h8"></path><path d="M17 12h2"></path><circle cx="15" cy="12" r="2"></circle><path d="M5 17h2"></path><path d="M11 17h8"></path><circle cx="9" cy="17" r="2"></circle></svg>';
    }
    return true;
  }

  let tries=0;const timer=setInterval(()=>{if(setup()||++tries>100)clearInterval(timer)},60);setup();
  window.__homeCardsRedesign=true;
}
