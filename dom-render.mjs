// Keep stable nodes explicitly, without changing the browser's innerHTML setter.
const signatures=new WeakMap();
function normalize(template){
  template.content.querySelectorAll('img[src]').forEach(img=>{
    try{const url=new URL(img.getAttribute('src'),location.href);if(url.protocol==='https:'||url.protocol==='http:')img.setAttribute('src',url.origin+url.pathname)}catch{}
  });
  return template.innerHTML;
}
export function setHTML(el,html){
  if(!el)return;
  const value=String(html??'');
  const template=document.createElement('template');template.innerHTML=value;
  const media=el.id==='cu2MomentCards'||el.id==='cu2WishActive'||el.id==='cu2WishDone';
  const urls=media?[...template.content.querySelectorAll('img')].map(img=>img.getAttribute('src')):[];
  const signature=media?normalize(template):template.innerHTML;
  if(signatures.get(el)===signature){
    if(media)el.querySelectorAll('img').forEach((img,i)=>{img.onerror=()=>{if(urls[i]&&img.getAttribute('src')!==urls[i])img.src=urls[i]}});
    return;
  }
  signatures.set(el,signature);el.innerHTML=value;
  document.dispatchEvent(new CustomEvent('family-dom-rendered',{detail:el}));
}
