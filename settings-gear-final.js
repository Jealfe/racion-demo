if(typeof document!=='undefined'&&!window.__settingsGearFinal){
  const svg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h4"></path><path d="M13 7h6"></path><circle cx="11" cy="7" r="2"></circle><path d="M5 12h8"></path><path d="M17 12h2"></path><circle cx="15" cy="12" r="2"></circle><path d="M5 17h2"></path><path d="M11 17h8"></path><circle cx="9" cy="17" r="2"></circle></svg>';
  const apply=()=>{
    const gear=document.getElementById('settingsGear');
    if(!gear)return false;
    if(gear.dataset.iconSliders!=='final'||!gear.querySelector('svg')){
      gear.dataset.iconSliders='final';
      gear.textContent='';
      gear.innerHTML=svg;
    }
    return true;
  };
  apply();
  const observer=new MutationObserver(()=>apply());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>{apply();observer.disconnect()},8000);
  window.__settingsGearFinal=true;
}
