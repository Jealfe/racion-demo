if(typeof document!=='undefined'&&!window.__homeCardsRedesign){
  const $=s=>document.querySelector(s);

  const css=document.createElement('style');
  css.id='home-cards-redesign-styles';
  css.textContent=`
  /* Настройки: лёгкие белые ползунки */
  #settingsGear{color:#fff!important;background:rgba(255,255,255,.13)!important;border:1px solid rgba(255,255,255,.18)!important;box-shadow:none!important}
  #settingsGear svg{display:block;width:16px;height:16px;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;fill:none}

  /* «Наше» */
  #home .section-title.home-menu-title{margin:17px 5px 7px!important;align-items:center!important}
  #home .section-title.home-menu-title h2{font-size:21px!important;letter-spacing:-.035em!important}
  #home .section-title.home-menu-title span{font-size:9px!important;color:#9a918b!important}
  #home .menu.home-menu-redesign{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
  #home .menu.home-menu-redesign>.tile{margin:0!important;border:1px solid rgba(231,224,217,.78)!important;background:#fff!important;box-shadow:0 5px 16px rgba(58,43,35,.04)!important;overflow:hidden!important;transform:none!important;position:relative!important}
  #home .menu.home-menu-redesign>.tile:before{display:none!important}
  #home .menu.home-menu-redesign>.tile:active{transform:scale(.987)!important}
  #home .menu.home-menu-redesign>.home-hidden{display:none!important}

  /* Две большие карточки: фото реально занимает почти половину */
  #home .menu.home-menu-redesign>.home-feature{grid-column:1/-1!important;height:72px!important;min-height:72px!important;border-radius:18px!important;padding:0!important;display:block!important}
  #home .home-feature .feature-photo{position:absolute!important;right:0!important;top:0!important;bottom:0!important;width:46%!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;z-index:0!important}
  #home .home-feature .feature-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.74) 17%,rgba(255,255,255,.24) 42%,rgba(255,255,255,0) 66%)}
  #home .home-feature .feature-main{position:relative!important;z-index:2!important;width:68%!important;height:100%!important;padding:8px 0 8px 10px!important;display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;gap:9px!important;align-items:center!important}
  #home .home-feature .tile-icon{width:40px!important;height:40px!important;border-radius:13px!important;display:grid!important;place-items:center!important;background:linear-gradient(145deg,#fff8f5,#f7e8e6)!important;box-shadow:inset 0 0 0 1px rgba(225,207,198,.38)!important;font-size:21px!important;margin:0!important}
  #home .home-feature .feature-copy{min-width:0!important;text-align:left!important}
  #home .home-feature strong{display:block!important;font-size:13.5px!important;line-height:1.08!important;letter-spacing:-.018em!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #home .home-feature small{display:block!important;font-size:8.5px!important;line-height:1.1!important;margin-top:3px!important;color:#948c86!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #home .home-feature .home-card-arrow{position:absolute!important;right:8px!important;top:50%!important;transform:translateY(-50%)!important;width:23px!important;height:23px!important;border-radius:9px!important;background:rgba(255,255,255,.9)!important;display:grid!important;place-items:center!important;color:#a06d68!important;font-size:15px!important;z-index:4!important;pointer-events:none!important;box-shadow:0 3px 10px rgba(70,48,41,.04)!important}

  /* Маленькие карточки — одна строка заголовка + одна короткая подпись */
  #home .menu.home-menu-redesign>.home-mini{height:50px!important;min-height:50px!important;border-radius:16px!important;padding:0!important;display:block!important;background:#fff!important}
  #home .home-mini .mini-main{height:100%!important;padding:6px 22px 6px 7px!important;display:grid!important;grid-template-columns:31px minmax(0,1fr)!important;align-items:center!important;gap:7px!important}
  #home .home-mini .tile-icon{width:29px!important;height:29px!important;border-radius:10px!important;display:grid!important;place-items:center!important;font-size:15px!important;margin:0!important;background:#f8eeeb!important}
  #home .home-mini[data-open="designs"] .tile-icon{background:#f3ece7!important}
  #home .home-mini[data-open="movies"] .tile-icon{background:#f9eded!important}
  #home .home-mini[data-open="food"] .tile-icon{background:#fff2dc!important}
  #home .home-mini[data-open="ideas"] .tile-icon{background:#fff4d8!important}
  #home .home-mini[data-open="likes"] .tile-icon{background:#f4edf5!important}
  #home .home-mini[data-open="surprise"] .tile-icon{background:#f8ecef!important}
  #home .home-mini .mini-copy{min-width:0!important;text-align:left!important}
  #home .home-mini strong{display:block!important;font-size:10.7px!important;line-height:1!important;letter-spacing:-.01em!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #home .home-mini small{display:block!important;font-size:7.1px!important;line-height:1!important;color:#9a928d!important;margin-top:3px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #home .home-mini .home-card-arrow{position:absolute!important;right:5px!important;top:50%!important;transform:translateY(-50%)!important;width:18px!important;height:18px!important;border-radius:7px!important;background:#faf7f5!important;display:grid!important;place-items:center!important;color:#a19891!important;font-size:13px!important;z-index:3!important;pointer-events:none!important}

  #home .menu.home-menu-redesign .notify-badge{right:4px!important;top:3px!important;z-index:8!important;transform:scale(.68);transform-origin:top right}

  @media(max-width:365px){
    #home .menu.home-menu-redesign{gap:5px!important}
    #home .menu.home-menu-redesign>.home-feature{height:68px!important;min-height:68px!important}
    #home .home-feature .feature-main{width:70%!important;grid-template-columns:39px minmax(0,1fr)!important;padding-left:8px!important;gap:7px!important}
    #home .home-feature .tile-icon{width:37px!important;height:37px!important;font-size:19px!important}
    #home .home-feature strong{font-size:12.5px!important}
    #home .home-feature small{font-size:8px!important}
    #home .menu.home-menu-redesign>.home-mini{height:48px!important;min-height:48px!important}
    #home .home-mini .mini-main{grid-template-columns:28px minmax(0,1fr)!important;padding-left:6px!important;gap:6px!important}
    #home .home-mini .tile-icon{width:27px!important;height:27px!important;font-size:14px!important}
    #home .home-mini strong{font-size:10px!important}
    #home .home-mini small{font-size:6.8px!important}
  }
  `;
  document.head.appendChild(css);

  const cards={
    moments:{title:'Наши моменты',subtitle:'Фото, даты и воспоминания',icon:'❤️',photo:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=700&q=78'},
    wishlist:{title:'Хотелки',subtitle:'Всё, что хочется',icon:'🛍️',photo:'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=700&q=78'},
    designs:{title:'Дом и дизайны',subtitle:'Идеи для дома',icon:'🏠'},
    movies:{title:'Что посмотреть',subtitle:'Фильм на вечер',icon:'🎬'},
    food:{title:'Что поесть',subtitle:'Быстрый выбор',icon:'🍕'},
    ideas:{title:'Идеи',subtitle:'Чтобы не забыть',icon:'💡'},
    likes:{title:'Нам нравится',subtitle:'Всё любимое',icon:'✨'},
    surprise:{title:'Сюрприз',subtitle:'Случайная приятность',icon:'🎁'}
  };

  function feature(tile,key){
    if(!tile)return;
    const c=cards[key];
    tile.classList.remove('wide','home-mini');
    tile.classList.add('home-feature');
    tile.setAttribute('aria-label',c.title);
    tile.innerHTML=`<div class="feature-photo" style="background-image:url('${c.photo}')"></div><div class="feature-main"><div class="tile-icon">${c.icon}</div><div class="feature-copy"><strong>${c.title}</strong><small>${c.subtitle}</small></div></div><div class="home-card-arrow">›</div>`;
  }

  function mini(tile,key){
    if(!tile)return;
    const c=cards[key];
    tile.classList.remove('wide','home-feature');
    tile.classList.add('home-mini');
    tile.setAttribute('aria-label',c.title);
    tile.innerHTML=`<div class="mini-main"><div class="tile-icon">${c.icon}</div><div class="mini-copy"><strong>${c.title}</strong><small>${c.subtitle}</small></div></div><div class="home-card-arrow">›</div>`;
  }

  function setup(){
    const menu=$('#home .menu');
    if(!menu)return false;
    menu.classList.add('home-menu-redesign');
    const title=menu.previousElementSibling;
    if(title?.classList.contains('section-title'))title.classList.add('home-menu-title');

    const moments=menu.querySelector('[data-open="moments"]');
    const wishlist=menu.querySelector('[data-open="wishlist"]');
    const designs=menu.querySelector('[data-open="designs"]');
    const movies=menu.querySelector('[data-open="movies"]');
    const food=menu.querySelector('[data-open="food"]');
    const ideas=menu.querySelector('[data-open="ideas"]');
    const likes=menu.querySelector('[data-open="likes"]');
    const surprise=menu.querySelector('[data-open="surprise"]');
    const thanks=menu.querySelector('[data-open="thanks"]');

    feature(moments,'moments');
    feature(wishlist,'wishlist');
    mini(designs,'designs');
    mini(movies,'movies');
    mini(food,'food');
    mini(ideas,'ideas');
    mini(likes,'likes');
    mini(surprise,'surprise');
    if(thanks)thanks.classList.add('home-hidden');

    [moments,wishlist,designs,movies,food,ideas,likes,surprise,thanks].forEach(x=>x&&menu.appendChild(x));

    const gear=$('#settingsGear');
    if(gear){
      gear.dataset.iconSliders='3';
      gear.textContent='';
      gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h4"></path><path d="M13 7h6"></path><circle cx="11" cy="7" r="2"></circle><path d="M5 12h8"></path><path d="M17 12h2"></path><circle cx="15" cy="12" r="2"></circle><path d="M5 17h2"></path><path d="M11 17h8"></path><circle cx="9" cy="17" r="2"></circle></svg>';
    }
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{if(setup()||++tries>100)clearInterval(timer)},60);
  setup();
  window.__homeCardsRedesign=true;
}
