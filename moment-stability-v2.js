if(typeof document!=='undefined'&&!window.__momentStabilityV2){
  const innerHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML')||Object.getOwnPropertyDescriptor(HTMLElement.prototype,'innerHTML');
  if(innerHTML?.get&&innerHTML?.set){
    const stableMarkup=value=>{
      const template=document.createElement('template');
      innerHTML.set.call(template,String(value??''));
      template.content.querySelectorAll('img[src]').forEach(img=>{
        const src=img.getAttribute('src')||'';
        if(!src||src.startsWith('data:')||src.startsWith('blob:'))return;
        try{
          const url=new URL(src,location.href);
          img.setAttribute('src',url.origin+url.pathname);
        }catch{
          img.setAttribute('src',src.split('?')[0]);
        }
      });
      return innerHTML.get.call(template);
    };

    const install=el=>{
      if(!el||el.__momentStableGuard)return;
      Object.defineProperty(el,'innerHTML',{
        configurable:true,
        get(){return innerHTML.get.call(el)},
        set(next){
          const current=innerHTML.get.call(el);
          if(stableMarkup(current)===stableMarkup(next))return;
          innerHTML.set.call(el,next);
        }
      });
      el.__momentStableGuard=true;
    };

    const scan=()=>install(document.querySelector('#cu2MomentCards'));
    scan();
    const observer=new MutationObserver(scan);
    observer.observe(document.body,{childList:true,subtree:true});
  }
  window.__momentStabilityV2=true;
}
