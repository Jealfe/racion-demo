if(typeof document!=='undefined'&&!window.__wishlistArtworkV2){
  const apply=()=>{
    const photo=document.querySelector('#home .menu [data-open="wishlist"] .feature-photo');
    if(!photo)return false;
    photo.style.backgroundImage="url('./assets/wishlist-loveis-v2.webp')";
    photo.style.backgroundPosition='center';
    photo.dataset.artwork='wishlist-loveis-v2';
    return true;
  };
  let tries=0;
  const timer=setInterval(()=>{if(apply()||++tries>80)clearInterval(timer)},50);
  apply();
  window.__wishlistArtworkV2=true;
}
