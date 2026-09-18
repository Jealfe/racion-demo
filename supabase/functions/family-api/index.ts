import { createSupabaseContext } from 'npm:@supabase/server@1.5.3'
import webpush from 'npm:web-push@3.6.7'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,x-family-token,apikey',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
}
const kinds = new Set(['thanks','wishlist','ideas','likes','moments','movies','designs'])
const reactions = new Set(['❤️','👍','😂','🔥','✨'])
const enc = new TextEncoder()

function json(data: unknown, status=200){ return new Response(JSON.stringify(data), {status, headers:cors}) }
function snippet(v:string,n=72){ const s=String(v||'').trim().replace(/\s+/g,' '); return s.length>n?s.slice(0,n-1)+'…':s }
function kindName(kind:string){ return ({thanks:'спасибо',wishlist:'хотелку',ideas:'идею',likes:'запись',moments:'момент',movies:'фильм',designs:'идею для дома'} as Record<string,string>)[kind]||'запись' }
async function sha256(value:string){
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(value))
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')
}

async function deviceAuth(req:Request, admin:any){
  const token=(req.headers.get('x-family-token')||'').trim()
  if(token.length<32) return null
  const tokenHash=await sha256(token)
  const {data,error}=await admin.from('device_tokens').select('id,author_name,last_used_at').eq('token_hash',tokenHash).maybeSingle()
  if(error||!data) return null
  if(!data.last_used_at||Date.now()-new Date(data.last_used_at).getTime()>300000)
    await admin.from('device_tokens').update({last_used_at:new Date().toISOString()}).eq('id',data.id)
  return data as {id:string,author_name:string}
}
async function unread(admin:any, device:{id:string,author_name:string}){
  const {data,error}=await admin.rpc('family_unread_counts',{p_device_id:device.id,p_author:device.author_name})
  if(error)throw error
  return data
}
async function signedItems(admin:any){
  const {data,error}=await admin.from('shared_items').select('id,kind,text,emoji,image_path,data,author_name,created_at,updated_at').order('created_at',{ascending:false}).limit(500)
  if(error) throw error
  const rows=data||[]
  const paths=[...new Set(rows.map((row:any)=>row.image_path).filter(Boolean))]
  if(paths.length){
    const {data:signed,error:signError}=await admin.storage.from('family-moments').createSignedUrls(paths,3600)
    if(signError)throw signError
    const urls=new Map((signed||[]).map((x:any)=>[x.path,x.signedUrl]))
    for(const row of rows)if(row.image_path)row.image_url=urls.get(row.image_path)||null
  }
  return rows
}
async function socialBundle(admin:any){
  const [{data:items,error:iErr},{data:comments,error:cErr},{data:reacts,error:rErr},{data:activity,error:aErr}] = await Promise.all([
    admin.from('shared_items').select('id,kind,text,emoji,data,author_name,created_at,updated_at').order('created_at',{ascending:false}).limit(500),
    admin.from('item_comments').select('id,item_id,author_name,text,created_at').order('created_at',{ascending:true}).limit(1000),
    admin.from('item_reactions').select('item_id,author_name,emoji,created_at').limit(1500),
    admin.from('activity_events').select('id,actor_name,action,kind,item_id,text,data,created_at').order('created_at',{ascending:false}).limit(60),
  ])
  if(iErr||cErr||rErr||aErr) throw iErr||cErr||rErr||aErr
  return {items:items||[],comments:comments||[],reactions:reacts||[],activity:activity||[]}
}
async function ensureBucket(admin:any){
  const {data}=await admin.storage.getBucket('family-moments')
  if(!data){
    const {error}=await admin.storage.createBucket('family-moments',{public:false,fileSizeLimit:5*1024*1024,allowedMimeTypes:['image/jpeg','image/png','image/webp']})
    if(error && !String(error.message).toLowerCase().includes('already')) throw error
  }
}
function dataUrlToBytes(dataUrl:string){
  const m=dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
  if(!m) throw new Error('Invalid image')
  const bin=atob(m[2]); const bytes=new Uint8Array(bin.length)
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i)
  return {mime:m[1],bytes}
}
async function addActivity(admin:any, device:{author_name:string}, action:string, kind:string, itemId:string|null, text='', data:any={}){
  await admin.from('activity_events').insert({actor_name:device.author_name,action,kind,item_id:itemId,text:snippet(text,160),data:data&&typeof data==='object'?data:{}})
}
async function pushConfig(admin:any){
  const {data}=await admin.from('push_config').select('public_key,private_key').eq('id',true).maybeSingle()
  return data||null
}
async function sendPush(admin:any, senderName:string|null, payload:any, deviceOnly:string|null=null){
  try{
    const cfg=await pushConfig(admin); if(!cfg) return
    webpush.setVapidDetails('https://jealfe.github.io',cfg.public_key,cfg.private_key)
    let deviceIds:string[]=[]
    if(deviceOnly){ deviceIds=[deviceOnly] }
    else{
      const {data:devices}=await admin.from('device_tokens').select('id,author_name')
      deviceIds=(devices||[]).filter((d:any)=>!senderName||d.author_name!==senderName).map((d:any)=>d.id)
    }
    if(!deviceIds.length) return
    const {data:subs}=await admin.from('push_subscriptions').select('id,device_id,endpoint,p256dh,auth').in('device_id',deviceIds)
    for(const s of subs||[]){
      try{
        await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify(payload),{TTL:120,urgency:'normal'})
      }catch(e:any){
        const status=Number(e?.statusCode||e?.status||0)
        if(status===404||status===410) await admin.from('push_subscriptions').delete().eq('id',s.id)
        else console.error('push failed',status,e?.message||e)
      }
    }
  }catch(e){ console.error('push error',e) }
}
function pushPayload(title:string,body:string,kind='home',itemId:string|null=null){
  return {title,body,icon:'./app-icon.svg',badge:'./app-icon.svg',tag:itemId?`item-${itemId}`:`family-${Date.now()}`,url:'./',kind,itemId}
}
function movieMatchesFilter(genres:string[],filter:string){
  const set=new Set((genres||[]).map(x=>String(x).toLowerCase()))
  if(filter==='fun')return set.has('comedy')||set.has('animation')
  if(filter==='romance')return set.has('romance')
  if(filter==='warm')return set.has('family')||set.has('animation')||set.has('comedy')||set.has('romance')
  return true
}
function randomItem<T>(items:T[]){
  if(!items.length)return null
  const n=crypto.getRandomValues(new Uint32Array(1))[0]%items.length
  return items[n]
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS') return new Response('',{headers:cors})
  if(req.method!=='POST') return json({error:'Method not allowed'},405)
  try{
    const {data:ctx,error:ctxError}=await createSupabaseContext(req,{auth:'publishable'})
    if(ctxError||!ctx) return json({error:'Client access denied'},ctxError?.status||401)
    const admin=ctx.supabaseAdmin
    const device=await deviceAuth(req,admin)
    if(!device) return json({error:'Доступ не разрешён'},401)
    const body=await req.json().catch(()=>({}))
    const action=String(body.action||'sync')

    if(action==='whoami') return json({ok:true,author:device.author_name,capabilities:{idempotent_create:true}})
    if(action==='movie_pick'){
      const filter=['all','warm','fun','romance'].includes(String(body.filter||''))?String(body.filter):'all'
      const [{data:catalog,error:catalogErr},{data:statuses,error:statusErr}]=await Promise.all([
        admin.from('movie_catalog').select('id,title,year,genres,imdb_rating,description,poster_url,votes').order('imdb_rating',{ascending:false}).order('votes',{ascending:false}).limit(500),
        admin.from('movie_family_status').select('movie_id,status')
      ])
      if(catalogErr||statusErr)throw catalogErr||statusErr
      const blocked=new Set((statuses||[]).map((x:any)=>String(x.movie_id)))
      const eligible=(catalog||[]).filter((x:any)=>!blocked.has(String(x.id))&&movieMatchesFilter(x.genres||[],filter))
      const movie=randomItem(eligible)
      if(!movie)return json({ok:true,movie:null,remaining:0,total:(catalog||[]).length})
      return json({ok:true,movie,remaining:eligible.length,total:(catalog||[]).length})
    }
    if(action==='movie_status'){
      const movieId=Number(body.movie_id)
      const status=String(body.status||'')
      if(!Number.isInteger(movieId)||movieId<=0||!['watched','hidden'].includes(status))return json({error:'Некорректный статус фильма'},400)
      const {data:movie,error:movieErr}=await admin.from('movie_catalog').select('id,title').eq('id',movieId).maybeSingle()
      if(movieErr||!movie)return json({error:'Фильм не найден'},404)
      const {error}=await admin.from('movie_family_status').upsert({movie_id:movieId,status,marked_by:device.author_name,updated_at:new Date().toISOString()},{onConflict:'movie_id'})
      if(error)throw error
      await addActivity(admin,device,status==='watched'?'movie_watched':'movie_hidden','movies',null,movie.title,{movie_id:movieId})
      return json({ok:true,status})
    }
    if(action==='sync'){const [items,counts]=await Promise.all([signedItems(admin),unread(admin,device)]);return json({ok:true,author:device.author_name,items,unread:counts})}
    if(action==='social_sync') return json({ok:true,author:device.author_name,...await socialBundle(admin)})
    if(action==='mark_read'){
      const section=String(body.section||'')
      if(!kinds.has(section)) return json({error:'Unknown section'},400)
      await admin.from('device_reads').upsert({device_id:device.id,section,last_seen_at:new Date().toISOString()},{onConflict:'device_id,section'})
      return json({ok:true,unread:await unread(admin,device)})
    }
    if(action==='create'){
      const requestId=String(body.request_id||'')
      if(requestId&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return json({error:'Invalid request id'},400)
      if(requestId){
        const {data:existing}=await admin.from('shared_items').select('id,author_name').eq('id',requestId).maybeSingle()
        if(existing)return existing.author_name===device.author_name?json({ok:true,id:existing.id}):json({error:'Request id conflict'},409)
      }
      const kind=String(body.kind||'')
      if(!kinds.has(kind)) return json({error:'Unknown kind'},400)
      let imagePath:string|null=null
      if(body.imageData){
        await ensureBucket(admin)
        const {mime,bytes}=dataUrlToBytes(String(body.imageData))
        if(bytes.byteLength>5*1024*1024) return json({error:'Фото слишком большое'},413)
        const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg'
        imagePath=`${Date.now()}-${crypto.randomUUID()}.${ext}`
        const {error}=await admin.storage.from('family-moments').upload(imagePath,bytes,{contentType:mime,upsert:false})
        if(error) throw error
      }
      const text=String(body.text||'').slice(0,4000)
      const emoji=body.emoji==null?null:String(body.emoji).slice(0,24)
      const safeData={...((body.data&&typeof body.data==='object'&&!Array.isArray(body.data))?body.data:{}),...(requestId?{client_request_id:requestId}:{})}
      const {data,error}=await admin.from('shared_items').insert({...(requestId?{id:requestId}:{}),kind,text,emoji,image_path:imagePath,data:safeData,author_name:device.author_name}).select('id').single()
      if(error){
        if(imagePath)await admin.storage.from('family-moments').remove([imagePath])
        if(error.code==='23505'&&requestId){
          const {data:existing}=await admin.from('shared_items').select('id,author_name').eq('id',requestId).maybeSingle()
          if(existing?.author_name===device.author_name)return json({ok:true,id:existing.id})
        }
        throw error
      }
      await addActivity(admin,device,'create',kind,data.id,text,{emoji})
      await sendPush(admin,device.author_name,pushPayload(`${device.author_name} добавил(а) ${kindName(kind)}`,snippet(text)||'Новая запись',kind,data.id))
      return json({ok:true,id:data.id})
    }
    if(action==='edit'){
      const id=String(body.id||'')
      const {data:item,error:getErr}=await admin.from('shared_items').select('id,kind,author_name,text,data').eq('id',id).maybeSingle()
      if(getErr||!item||!kinds.has(item.kind)) return json({error:'Запись не найдена'},404)
      if(item.author_name!==device.author_name) return json({error:'Можно редактировать только свои записи'},403)
      const patch:any={updated_at:new Date().toISOString()}
      if(body.text!==undefined) patch.text=String(body.text).slice(0,4000)
      if(body.emoji!==undefined) patch.emoji=body.emoji==null?null:String(body.emoji).slice(0,24)
      if(body.data!==undefined && body.data&&typeof body.data==='object'&&!Array.isArray(body.data)) patch.data={...(item.data||{}),...body.data}
      const {error}=await admin.from('shared_items').update(patch).eq('id',id)
      if(error) throw error
      const newText=patch.text??item.text
      await addActivity(admin,device,'edit',item.kind,id,newText)
      await sendPush(admin,device.author_name,pushPayload(`${device.author_name} изменил(а) ${kindName(item.kind)}`,snippet(newText)||'Запись обновлена',item.kind,id))
      return json({ok:true})
    }
    if(action==='update'){
      const id=String(body.id||'')
      const {data:before}=await admin.from('shared_items').select('id,kind,text,data,author_name').eq('id',id).maybeSingle()
      if(!before||!kinds.has(before.kind))return json({error:'Запись не найдена'},404)
      const isAuthor=before.author_name===device.author_name
      const inputData=body.data&&typeof body.data==='object'&&!Array.isArray(body.data)?body.data:{}
      if(!isAuthor){
        const sharedStatus=['wishlist','ideas'].includes(before.kind)
        const contentChanged=body.text!==undefined||body.emoji!==undefined||Object.entries(inputData).some(([key,value])=>!['done','status'].includes(key)&&JSON.stringify(value)!==JSON.stringify(before.data?.[key]))
        if(!sharedStatus||contentChanged)return json({error:'Можно редактировать только свои записи'},403)
      }
      const patch:any={updated_at:new Date().toISOString()}
      if(body.text!==undefined)patch.text=String(body.text).slice(0,4000)
      if(body.emoji!==undefined)patch.emoji=body.emoji==null?null:String(body.emoji).slice(0,24)
      if(body.data!==undefined)patch.data={...(before.data||{}),...inputData}
      const {error}=await admin.from('shared_items').update(patch).eq('id',id)
      if(error) throw error
      if(before && body.data && typeof body.data.done==='boolean' && Boolean(before.data?.done)!==Boolean(body.data.done)){
        const act=body.data.done?'done':'reopen'
        await addActivity(admin,device,act,before.kind,id,before.text)
        await sendPush(admin,device.author_name,pushPayload(`${device.author_name} ${body.data.done?'отметил(а) выполненным':'вернул(а) в список'}`,snippet(before.text),before.kind,id))
      }
      return json({ok:true})
    }
    if(action==='comment_add'){
      const itemId=String(body.item_id||''); const text=String(body.text||'').trim().slice(0,1000)
      if(!text) return json({error:'Пустой комментарий'},400)
      const {data:item}=await admin.from('shared_items').select('id,kind,text').eq('id',itemId).maybeSingle()
      if(!item) return json({error:'Запись не найдена'},404)
      const {data,error}=await admin.from('item_comments').insert({item_id:itemId,author_name:device.author_name,text}).select('id').single()
      if(error) throw error
      await addActivity(admin,device,'comment',item.kind,itemId,text)
      await sendPush(admin,device.author_name,pushPayload(`${device.author_name} написал(а) комментарий`,snippet(text),item.kind,itemId))
      return json({ok:true,id:data.id})
    }
    if(action==='comment_delete'){
      const id=String(body.id||'')
      const {data:c}=await admin.from('item_comments').select('id,author_name').eq('id',id).maybeSingle()
      if(!c) return json({error:'Комментарий не найден'},404)
      if(c.author_name!==device.author_name) return json({error:'Можно удалить только свой комментарий'},403)
      const {error}=await admin.from('item_comments').delete().eq('id',id); if(error) throw error
      return json({ok:true})
    }
    if(action==='reaction_toggle'){
      const itemId=String(body.item_id||''); const emoji=String(body.emoji||'❤️')
      if(!reactions.has(emoji)) return json({error:'Unknown reaction'},400)
      const {data:item}=await admin.from('shared_items').select('id,kind,text').eq('id',itemId).maybeSingle()
      if(!item) return json({error:'Запись не найдена'},404)
      const {data:existing}=await admin.from('item_reactions').select('item_id').eq('item_id',itemId).eq('author_name',device.author_name).eq('emoji',emoji).maybeSingle()
      if(existing){
        await admin.from('item_reactions').delete().eq('item_id',itemId).eq('author_name',device.author_name).eq('emoji',emoji)
        return json({ok:true,active:false})
      }
      const {error}=await admin.from('item_reactions').insert({item_id:itemId,author_name:device.author_name,emoji}); if(error) throw error
      await addActivity(admin,device,'reaction',item.kind,itemId,item.text,{emoji})
      await sendPush(admin,device.author_name,pushPayload(`${device.author_name} поставил(а) ${emoji}`,snippet(item.text)||kindName(item.kind),item.kind,itemId))
      return json({ok:true,active:true})
    }
    if(action==='push_subscribe'){
      const s=body.subscription||{}; const endpoint=String(s.endpoint||''); const p256dh=String(s.keys?.p256dh||''); const auth=String(s.keys?.auth||'')
      if(!endpoint.startsWith('https://')||!p256dh||!auth) return json({error:'Некорректная push-подписка'},400)
      await admin.from('push_subscriptions').delete().eq('device_id',device.id).neq('endpoint',endpoint)
      const {error}=await admin.from('push_subscriptions').upsert({device_id:device.id,endpoint,p256dh,auth,user_agent:String(req.headers.get('user-agent')||'').slice(0,500),updated_at:new Date().toISOString()},{onConflict:'endpoint'})
      if(error) throw error
      return json({ok:true})
    }
    if(action==='push_unsubscribe'){
      const endpoint=String(body.endpoint||''); if(endpoint) await admin.from('push_subscriptions').delete().eq('device_id',device.id).eq('endpoint',endpoint)
      return json({ok:true})
    }
    if(action==='push_test'){
      await sendPush(admin,null,pushPayload('Мы вдвоём ❤️','Уведомления работают. Теперь важные обновления могут приходить даже при закрытом сайте.'),device.id)
      return json({ok:true})
    }
    if(action==='love_ping'){
      const message=String(body.message||'Я люблю тебя! ❤️').trim().slice(0,120)||'Я люблю тебя! ❤️'
      const eventId=crypto.randomUUID()
      await addActivity(admin,device,'love','thanks',null,message,{love:true,eventId})
      await sendPush(admin,device.author_name,{...pushPayload(`${device.author_name} ❤️`,message,'love',null),eventId,action:'love_ping'})
      return json({ok:true,eventId})
    }
    if(action==='delete'){
      const id=String(body.id||'')
      const {data:item}=await admin.from('shared_items').select('image_path,kind,text,author_name').eq('id',id).maybeSingle()
      if(!item||!kinds.has(item.kind))return json({error:'Запись не найдена'},404)
      if(item.author_name!==device.author_name)return json({error:'Можно удалить только свои записи'},403)
      const {error}=await admin.from('shared_items').delete().eq('id',id)
      if(error) throw error
      if(item.image_path)await admin.storage.from('family-moments').remove([item.image_path])
      await addActivity(admin,device,'delete',item.kind,id,item.text)
      return json({ok:true})
    }
    return json({error:'Unknown action'},400)
  }catch(e){
    console.error(e)
    return json({error:'Server error'},500)
  }
})
