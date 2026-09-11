if(typeof document!=='undefined'&&!window.__v2SocialBridge){
  const API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/family-api';
  const token=()=>localStorage.getItem('us_family_token')||'';
  async function socialSync(){
    const tk=token();if(!tk)return null;
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-family-token':tk},body:JSON.stringify({action:'social_sync'})});
    if(!r.ok)return null;
    return r.json().catch(()=>null);
  }
  function paint(data){
    if(!data)return;
    const me=String(data.author||'');
    const reactions=Array.isArray(data.reactions)?data.reactions:[];
    const comments=Array.isArray(data.comments)?data.comments:[];
    document.querySelectorAll('.cu2-card [data-react],.cu2-mbody [data-react]').forEach(btn=>{
      const id=String(btn.dataset.react||''),emoji=String(btn.dataset.emoji||'');
      const rows=reactions.filter(r=>String(r.item_id)===id&&r.emoji===emoji);
      btn.classList.toggle('active',rows.some(r=>r.author_name===me));
      btn.textContent=emoji+(rows.length?' '+rows.length:'');
    });
    document.querySelectorAll('.cu2-card [data-comments],.cu2-mbody [data-comments]').forEach(btn=>{
      const id=String(btn.dataset.comments||'');
      const count=comments.filter(c=>String(c.item_id)===id).length;
      btn.textContent='💬'+(count?' '+count:'');
    });
  }
  async function refreshSoon(){
    for(const delay of [180,500,1000]){
      await new Promise(r=>setTimeout(r,delay));
      const data=await socialSync().catch(()=>null);
      if(data)paint(data);
    }
  }
  document.addEventListener('click',e=>{
    const t=e.target.closest?.('.cu2-card [data-react],.cu2-mbody [data-react],.cu2-card [data-comments],.cu2-mbody [data-comments]');
    if(!t)return;
    if(t.matches('[data-react]')) t.classList.toggle('active');
    refreshSoon();
  });
  window.__v2SocialBridge=true;
}
