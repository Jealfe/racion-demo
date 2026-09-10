if(typeof document!=='undefined'&&!window.__interactionFixes){
  const SCREEN_KEY='us_active_screen_session';
  const validScreens=new Set(['home','designs','movies','food','moments','thanks','wishlist','ideas','likes','surprise']);

  const style=document.createElement('style');
  style.id='interaction-fixes-styles';
  style.textContent=`
  /* Социальные реакции в списках должны быть отдельной строкой, а не ломать grid основной записи. */
  #wishList .list-item,#ideaList .list-item,#likeList .list-item{grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important}
  #wishList .list-item>.ico,#ideaList .list-item>.ico,#likeList .list-item>.ico{grid-column:1!important;grid-row:1!important}
  #wishList .list-item>div:not(.ico):not(.row):not(.social-tools),
  #ideaList .list-item>div:not(.ico):not(.row):not(.social-tools),
  #likeList .list-item>div:not(.ico):not(.row):not(.social-tools){grid-column:2!important;grid-row:1!important;min-width:0!important;justify-self:stretch!important;text-align:left!important}
  #wishList .list-item>.row,#ideaList .list-item>.row{grid-column:3!important;grid-row:1!important;margin-left:0!important}
  #wishList .list-item>.like-del,#ideaList .list-item>.idea-del,#likeList .list-item>.like-del{grid-column:3!important;grid-row:1!important}
  #wishList .list-item>.social-tools,#ideaList .list-item>.social-tools,#likeList .list-item>.social-tools{grid-column:1/-1!important;grid-row:2!important;width:100%!important;min-width:0!important;margin:8px 0 0!important;padding-top:8px!important;box-sizing:border-box!important;justify-self:stretch!important}
  #wishList .list-item b{display:block!important;text-align:left!important;overflow-wrap:anywhere!important}
  #wishList .list-item span{display:block!important;text-align:left!important}
  `;
  document.head.appendChild(style);

  function screenFromTrigger(trigger){
    if(!trigger)return '';
    if(trigger.matches('[data-home]'))return 'home';
    return trigger.dataset.open||trigger.dataset.nav||'';
  }

  document.addEventListener('click',event=>{
    const activity=event.target.closest?.('#activitySignal');
    if(activity&&validScreens.has(activity.dataset.section||'')){
      sessionStorage.setItem(SCREEN_KEY,activity.dataset.section);
      return;
    }
    const trigger=event.target.closest?.('[data-open],[data-home],[data-nav]');
    const screen=screenFromTrigger(trigger);
    if(validScreens.has(screen))sessionStorage.setItem(SCREEN_KEY,screen);
  },true);

  function specialHash(){return location.hash.startsWith('#thanks=')||location.hash.startsWith('#access=')}

  function restoreStoredScreen(){
    if(specialHash())return;
    const target=sessionStorage.getItem(SCREEN_KEY)||'home';
    if(!validScreens.has(target)||target==='home')return;
    let tries=0;
    const timer=setInterval(()=>{
      if(++tries>120){clearInterval(timer);return}
      if(!window.__appReady)return;
      const trigger=document.querySelector(`#home [data-open="${target}"]`)||document.querySelector(`.bottom [data-nav="${target}"]`);
      if(!trigger)return;
      clearInterval(timer);
      trigger.click();
    },50);
  }

  if(!sessionStorage.getItem(SCREEN_KEY)&&!specialHash())sessionStorage.setItem(SCREEN_KEY,'home');
  restoreStoredScreen();
  window.__interactionFixes=true;
}
