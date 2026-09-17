// Persist before sending. Ambiguous failures stay visible and are not blindly replayed.
export function createOutbox({storage,getToken,send,onChange=()=>{},onError=()=>{}}){
  const key='us_cloud_outbox_v1';
  let running=false;
  const read=()=>{try{const rows=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}};
  const save=rows=>storage.setItem(key,JSON.stringify(rows));
  function enqueue(operations){
    const rows=read();
    for(const op of operations)rows.push({...op,requestId:crypto.randomUUID(),token:getToken(),state:'queued'});
    save(rows);onChange();void flush();
  }
  async function flush(){
    if(running)return;
    running=true;
    try{
      while(true){
        const token=getToken(),rows=read(),op=rows.find(x=>x.token===token&&x.state==='queued');
        if(!op)break;
        const parent=op.action!=='create'&&rows.find(x=>x.token===token&&x.action==='create'&&String(x.localId)===String(op.payload.id));
        if(parent&&!parent.serverId)break;
        if(parent)op.payload.id=parent.serverId;
        op.state='sending';save(rows);
        try{
          const result=await send(op.action,{...op.payload,request_id:op.requestId});
          const current=read(),found=current.find(x=>x.requestId===op.requestId);
          if(found){found.state='confirmed';found.serverId=result.id||op.payload.id;save(current)}
        }catch(error){
          const current=read(),found=current.find(x=>x.requestId===op.requestId);
          if(found){found.state=error.status>=400&&error.status<500&&error.status!==429?'rejected':'uncertain';save(current)}
          onError(error);break;
        }
        onChange();
      }
    }finally{running=false}
  }
  function retryCreates(){
    const rows=read();
    for(const op of rows)if(op.token===getToken()&&op.action==='create'&&op.state==='uncertain')op.state='queued';
    save(rows);void flush();
  }
  function merge(section,remote){
    const all=read(),token=getToken();let changed=false,result=remote.slice();
    for(const op of all.filter(x=>x.token===token&&x.key===section)){
      const parent=op.action!=='create'&&all.find(x=>x.token===token&&x.action==='create'&&String(x.localId)===String(op.payload.id));
      const id=String(op.serverId||parent?.serverId||op.payload.id||op.localId);
      const found=result.find(x=>String(x.id)===id||x.requestId===op.requestId);
      const settled=op.action==='create'?Boolean(found):op.state==='confirmed'&&(op.action==='delete'?!found:found&&Object.entries(op.local||{}).every(([k,v])=>JSON.stringify(found[k])===JSON.stringify(v)));
      if(settled){
        if(op.action==='create'&&all.some(child=>child!==op&&child.token===token&&String(child.payload.id)===String(op.localId))){op.serverId=found.id;op.state='confirmed'}
        else op.remove=true;
        changed=true;continue
      }
      if(op.action==='delete')result=result.filter(x=>String(x.id)!==id);
      else if(op.action==='create'){if(!result.some(x=>String(x.id)===String(op.localId)))result.unshift({...op.local,id:op.serverId||op.localId})}
      else result=result.map(x=>String(x.id)===id?{...x,...op.local}:x);
    }
    if(changed)save(all.filter(x=>!x.remove));
    return result;
  }
  // A process may have stopped after the server accepted a write. Do not replay it.
  const recovered=read();for(const op of recovered)if(op.state==='sending')op.state='uncertain';save(recovered);
  return {enqueue,flush,merge,retryCreates,pending:()=>read().filter(x=>x.token===getToken())};
}
