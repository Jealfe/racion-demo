if(typeof document!=='undefined'&&!window.__designPasteImagesV1){
  const API='https://jlejyppniaifdavllwid.supabase.co/functions/v1/family-api';
  const STORAGE_KEY='us_design_board';
  const externalImages=new Map();
  let syncing=false;

  const $=s=>document.querySelector(s);
  const token=()=>localStorage.getItem('us_family_token')||'';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(text){const t=$('#toast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(window.__designPasteToast);window.__designPasteToast=setTimeout(()=>t.classList.remove('show'),2200)}
  function validUrl(value){try{const u=new URL(String(value||'').trim());return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
  function designsVisible(){const s=$('#designs');return Boolean(s&&getComputedStyle(s).display!=='none'&&s.getClientRects().length)}
  async function api(action,payload={}){const tk=token();if(!tk)throw new Error('NO_TOKEN');const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-family-token':tk},body:JSON.stringify({action,...payload})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'CLOUD_ERROR');return d}

  function installStyles(){if($('#design-paste-image-styles'))return;const s=document.createElement('style');s.id='design-paste-image-styles';s.textContent=`
    .design-image-extra{margin-top:9px;padding:11px;border:1px solid #eadfd7;background:#fff;border-radius:16px}.design-image-extra .extra-title{font-size:10px;font-weight:850;color:#63554d;margin-bottom:7px}.design-image-extra .extra-row{display:grid;grid-template-columns:1fr auto;gap:7px}.design-image-extra input{width:100%;min-width:0;border:1px solid #e6ddd6;background:#fcfaf8;border-radius:12px;padding:10px 11px;font:inherit;font-size:11px;color:#3f3834}.design-image-extra button{border:0;border-radius:12px;background:#f0e7e1;color:#65554b;padding:9px 11px;font:inherit;font-size:10px;font-weight:850;white-space:nowrap;cursor:pointer}.design-image-extra .extra-hint{font-size:9px;line-height:1.4;color:#9a8b82;margin-top:7px}.design-image-extra.ready{border-color:#d8c0af;background:#fffaf6}.design-image-extra.ready .extra-title{color:#755541}@media(max-width:390px){.design-image-extra .extra-row{grid-template-columns:1fr}.design-image-extra button{width:100%}}
  `;document.head.appendChild(s)}

  function ensureUI(){
    installStyles();
    const pick=$('#designPhotoPick'),card=$('#designAddCard');if(!pick||!card)return false;
    if(!$('#designImageExtra')){
      const box=document.createElement('div');box.id='designImageExtra';box.className='design-image-extra';box.innerHTML=`<div class="extra-title">Или вставить фото без сохранения</div><div class="extra-row"><input id="designImageUrl" type="url" inputmode="url" autocomplete="off" placeholder="Ссылка на картинку https://..."><button id="designPasteImage" type="button">📋 Вставить из буфера</button></div><div class="extra-hint">Можно вставить прямую ссылку на фото или скопировать само изображение и нажать сюда. На компьютере также работает Ctrl+V прямо на этом экране.</div>`;
      pick.after(box);
      const input=$('#designImageUrl'),paste=$('#designPasteImage'),file=$('#designPhoto');
      input?.addEventListener('input',()=>previewUrl(input.value));
      input?.addEventListener('paste',()=>setTimeout(()=>previewUrl(input.value),0));
      paste?.addEventListener('click',readClipboard);
      file?.addEventListener('change',()=>{if(file.files?.[0]&&input){input.value='';$('#designImageExtra')?.classList.remove('ready')}});
    }
    return true;
  }

  function previewUrl(value){
    const url=validUrl(value),input=$('#designPhoto'),preview=$('#designPreview'),pick=$('#designPhotoPick'),box=$('#designImageExtra');
    if(!url){box?.classList.remove('ready');return}
    if(input)input.value='';
    if(preview){preview.src=url;preview.onerror=()=>{if(preview.src===url)toast('Картинка по этой ссылке не открылась')};preview.onload=()=>box?.classList.add('ready')}
    pick?.classList.add('has-photo');
  }

  function setClipboardImage(blob,name='clipboard-image.png'){
    if(!blob||!String(blob.type||'').startsWith('image/'))return false;
    const file=blob instanceof File?blob:new File([blob],name,{type:blob.type||'image/png',lastModified:Date.now()});
    const input=$('#designPhoto');if(!input)return false;
    try{const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));$('#designImageUrl')&&( $('#designImageUrl').value='' );$('#designImageExtra')?.classList.add('ready');toast('Фото вставлено из буфера 📷');return true}catch(e){console.warn('clipboard image',e);return false}
  }

  async function readClipboard(){
    if(!navigator.clipboard)return toast('Здесь вставь изображение долгим нажатием или Ctrl+V');
    try{
      if(navigator.clipboard.read){
        const items=await navigator.clipboard.read();
        for(const item of items){const type=item.types.find(t=>t.startsWith('image/'));if(type){const blob=await item.getType(type);if(setClipboardImage(blob,`clipboard.${type.split('/')[1]||'png'}`))return}}
      }
      const text=(await navigator.clipboard.readText?.())||'';const url=validUrl(text);
      if(url){const input=$('#designImageUrl');if(input){input.value=url;previewUrl(url);toast('Ссылка на фото вставлена 🔗');return}}
      toast('В буфере не нашёл изображение или ссылку');
    }catch(e){console.warn('clipboard read',e);toast('Браузер не дал прочитать буфер — вставь долгим нажатием или Ctrl+V')}
  }

  document.addEventListener('paste',e=>{
    if(!designsVisible())return;
    const items=[...(e.clipboardData?.items||[])];
    const image=items.find(x=>String(x.type||'').startsWith('image/'));
    if(image){const file=image.getAsFile();if(file&&setClipboardImage(file,file.name||'clipboard-image.png')){e.preventDefault();return}}
    const text=e.clipboardData?.getData('text/plain')||'';const url=validUrl(text);
    if(url&&(!e.target?.matches?.('#designSource'))){const input=$('#designImageUrl');if(input){input.value=url;previewUrl(url);if(e.target?.id!=='designImageUrl')e.preventDefault()}}
  },true);

  function localSaveExternal({room,source,comment,imageUrl}){
    let rows=[];try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(Array.isArray(x))rows=x}catch{}
    let author='Вы';try{author=JSON.parse(localStorage.getItem('us_profile')||'{}').name||author}catch{}
    rows.unshift({id:Date.now(),room,source,comment,img:imageUrl,author,createdAt:new Date().toISOString()});
    localStorage.setItem(STORAGE_KEY,JSON.stringify(rows.slice(0,100)));
    const active=$('.room-tab.active');if(active)active.click();
  }

  async function addExternalIdea(){
    const imageUrl=validUrl($('#designImageUrl')?.value),room=$('#designRoom')?.value||'general',source=validUrl($('#designSource')?.value),comment=String($('#designComment')?.value||'').trim();
    if(!imageUrl)return false;
    const card=$('#designAddCard');card?.classList.add('design-uploading');
    try{
      if(token()){
        await api('create',{kind:'designs',text:comment,data:{room,source,externalImageUrl:imageUrl}});
        await syncExternal(true);
        document.dispatchEvent(new Event('visibilitychange'));
      }else localSaveExternal({room,source,comment,imageUrl});
      if($('#designImageUrl'))$('#designImageUrl').value='';if($('#designSource'))$('#designSource').value='';if($('#designComment'))$('#designComment').value='';
      const preview=$('#designPreview');if(preview)preview.src='';$('#designPhotoPick')?.classList.remove('has-photo');$('#designImageExtra')?.classList.remove('ready');
      toast('Идея добавлена 🏠');
      setTimeout(()=>{document.dispatchEvent(new Event('visibilitychange'));patchCards()},250);
      return true;
    }catch(e){console.error(e);toast('Не получилось сохранить идею');return true}
    finally{card?.classList.remove('design-uploading')}
  }

  document.addEventListener('click',e=>{
    const add=e.target?.closest?.('#addDesignIdea');
    if(add&&!$('#designPhoto')?.files?.[0]&&validUrl($('#designImageUrl')?.value)){
      e.preventDefault();e.stopImmediatePropagation();addExternalIdea();return;
    }
    const pic=e.target?.closest?.('[data-view]');if(!pic||e.target?.closest?.('[data-del]'))return;
    const url=externalImages.get(String(pic.dataset.view));if(!url)return;
    e.preventDefault();e.stopImmediatePropagation();const viewer=$('#designViewer');if(!viewer)return;$('#viewerImg').src=url;$('#viewerImg').alt='Идея интерьера';$('#viewerTitle').textContent=pic.closest('.idea-card')?.querySelector('.comment')?.textContent||'Идея интерьера';viewer.classList.add('show');
  },true);

  function patchCards(){
    for(const [id,url] of externalImages){
      const pic=document.querySelector(`[data-view="${CSS.escape(id)}"]`);if(!pic)continue;
      let img=pic.querySelector(':scope > img');
      if(!img){img=document.createElement('img');img.alt='Идея интерьера';img.loading='lazy';pic.prepend(img);pic.querySelector(':scope > .design-empty')?.remove()}
      if(img.src!==url)img.src=url;
    }
  }

  async function syncExternal(force=false){
    if(syncing||!token())return;syncing=true;
    try{const d=await api('sync');externalImages.clear();for(const x of d.items||[]){if(x.kind!=='designs')continue;const u=validUrl(x.data?.externalImageUrl||'');if(u)externalImages.set(String(x.id),u)}patchCards()}
    catch(e){if(force)console.warn('external design image sync',e)}finally{syncing=false}
  }

  const observer=new MutationObserver(()=>{ensureUI();patchCards()});observer.observe(document.body,{childList:true,subtree:true});
  let tries=0;const boot=setInterval(()=>{if(ensureUI()||++tries>120){clearInterval(boot);syncExternal()}},100);
  setInterval(syncExternal,10000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncExternal()});
  window.addEventListener('pageshow',syncExternal);
  window.__designPasteImagesV1=true;
}
