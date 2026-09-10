if(typeof document!=='undefined'&&!window.__stableSyncDomPatched){
  const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  const getter=desc?.get,setter=desc?.set;
  const stableIds=new Set(['thanksFeed','wishList','ideaList','likeList','momentGrid','movieList','activityList','threadList']);
  function clean(node){
    const clone=node.cloneNode(true);
    clone.querySelectorAll('.social-tools').forEach(x=>x.remove());
    clone.querySelectorAll('[data-state]').forEach(x=>x.removeAttribute('data-state'));
    clone.querySelectorAll('[title]').forEach(x=>x.removeAttribute('title'));
    clone.querySelectorAll('[aria-label]').forEach(x=>x.removeAttribute('aria-label'));
    return clone.innerHTML;
  }
  function normalizeHtml(html){
    const box=document.createElement('div');
    setter.call(box,String(html??''));
    box.querySelectorAll('.social-tools').forEach(x=>x.remove());
    box.querySelectorAll('[data-state]').forEach(x=>x.removeAttribute('data-state'));
    box.querySelectorAll('[title]').forEach(x=>x.removeAttribute('title'));
    box.querySelectorAll('[aria-label]').forEach(x=>x.removeAttribute('aria-label'));
    return getter.call(box);
  }
  if(getter&&setter){
    Object.defineProperty(Element.prototype,'innerHTML',{
      configurable:desc.configurable,
      enumerable:desc.enumerable,
      get(){return getter.call(this)},
      set(value){
        if(this?.id&&stableIds.has(this.id)){
          try{
            const current=clean(this),next=normalizeHtml(value);
            if(current===next)return;
          }catch{}
        }
        return setter.call(this,value);
      }
    });
  }
  window.__stableSyncDomPatched=true;
}
