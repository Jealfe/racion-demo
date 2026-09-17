import { createSupabaseContext } from 'npm:@supabase/server@1.5.3'
import webpush from 'npm:web-push@3.6.7'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,x-family-token,apikey',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
}
const enc = new TextEncoder()
const wordPrompts = ['Кто?','Где оказался?','Что делал?','Что сказал?','Что ответили?','Чем всё закончилось?']
const drawingPrompts = ['Нарисуй начало картинки','Продолжи рисунок','Продолжи ещё немного','Заверши рисунок']

function json(data: unknown, status=200){ return new Response(JSON.stringify(data), {status, headers:cors}) }
function snippet(v:string,n=90){ const s=String(v||'').trim().replace(/\s+/g,' '); return s.length>n?s.slice(0,n-1)+'…':s }
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
function dataUrlToBytes(value:string,maxBytes:number){
  const m=String(value||'').match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/)
  if(!m) throw new Error('INVALID_IMAGE')
  const bin=atob(m[2])
  if(bin.length>maxBytes) throw new Error('IMAGE_TOO_LARGE')
  const bytes=new Uint8Array(bin.length)
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i)
  return {mime:m[1],bytes}
}
async function ensureBucket(admin:any){
  const {data}=await admin.storage.getBucket('family-games')
  if(data)return
  const {error}=await admin.storage.createBucket('family-games',{public:false,fileSizeLimit:2*1024*1024,allowedMimeTypes:['image/png','image/jpeg','image/webp']})
  if(error&&!String(error.message||'').toLowerCase().includes('already'))throw error
}
async function pushConfig(admin:any){
  const {data}=await admin.from('push_config').select('public_key,private_key').eq('id',true).maybeSingle()
  return data||null
}
async function sendPushToAuthor(admin:any,authorName:string,payload:any){
  try{
    const cfg=await pushConfig(admin); if(!cfg)return
    webpush.setVapidDetails('https://jealfe.github.io',cfg.public_key,cfg.private_key)
    const {data:devices}=await admin.from('device_tokens').select('id').eq('author_name',authorName)
    const ids=(devices||[]).map((x:any)=>x.id)
    if(!ids.length)return
    const {data:subs}=await admin.from('push_subscriptions').select('id,endpoint,p256dh,auth').in('device_id',ids)
    for(const s of subs||[]){
      try{
        await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify(payload),{TTL:180,urgency:'normal'})
      }catch(e:any){
        const status=Number(e?.statusCode||e?.status||0)
        if(status===404||status===410)await admin.from('push_subscriptions').delete().eq('id',s.id)
        else console.error('game push failed',status,e?.message||e)
      }
    }
  }catch(e){console.error('game push error',e)}
}
function pushPayload(title:string,body:string,gameId:string){
  return {title,body,icon:'./app-icon.svg',badge:'./app-icon.svg',tag:`game-${gameId}`,url:'./#games',kind:'game',gameId}
}
function publicSession(row:any,deviceAuthor:string,previewData:string|null=null){
  if(!row)return null
  const prompts=row.mode==='words'?wordPrompts:drawingPrompts
  return {
    id:row.id,
    mode:row.mode,
    status:row.status,
    starter_author:row.starter_author,
    partner_author:row.partner_author,
    current_author:row.current_author,
    current_step:row.current_step,
    total_steps:row.total_steps,
    my_turn:row.status==='active'&&row.current_author===deviceAuthor,
    prompt:prompts[row.current_step]||'',
    preview_data:row.mode==='drawing'&&row.current_author===deviceAuthor?previewData:null,
    created_at:row.created_at,
  }
}
async function activeSession(admin:any,deviceAuthor:string){
  const {data,error}=await admin.from('game_sessions')
    .select('id,mode,status,starter_author,partner_author,current_author,current_step,total_steps,created_at,updated_at')
    .eq('status','active').maybeSingle()
  if(error)throw error
  if(!data)return null
  let preview:string|null=null
  if(data.mode==='drawing'&&data.current_author===deviceAuthor&&Number(data.current_step)>0){
    const {data:turn,error:turnError}=await admin.from('game_turns').select('preview_data').eq('game_id',data.id).eq('step',Number(data.current_step)-1).maybeSingle()
    if(turnError)throw turnError
    preview=turn?.preview_data||null
  }
  return publicSession(data,deviceAuthor,preview)
}
async function history(admin:any){
  const {data,error}=await admin.from('game_sessions')
    .select('id,mode,starter_author,partner_author,total_steps,created_at,finished_at')
    .eq('status','finished').order('finished_at',{ascending:false}).limit(12)
  if(error)throw error
  return data||[]
}
async function statePayload(admin:any,device:{author_name:string}){
  const [active,items]=await Promise.all([activeSession(admin,device.author_name),history(admin)])
  return {author:device.author_name,active,history:items,latest_finished:items[0]||null}
}
async function resultPayload(admin:any,sessionId:string,deviceAuthor:string){
  const {data:session,error:sErr}=await admin.from('game_sessions')
    .select('id,mode,status,starter_author,partner_author,total_steps,created_at,finished_at')
    .eq('id',sessionId).maybeSingle()
  if(sErr)throw sErr
  if(!session)return {error:'Игра не найдена',status:404}
  if(session.status!=='finished')return {error:'Игра ещё не закончена',status:409}
  if(![session.starter_author,session.partner_author].includes(deviceAuthor))return {error:'Нет доступа к этой игре',status:403}
  const {data:turns,error:tErr}=await admin.from('game_turns')
    .select('step,author_name,text,image_path,created_at').eq('game_id',sessionId).order('step',{ascending:true})
  if(tErr)throw tErr
  const rows=turns||[]
  if(session.mode==='drawing'){
    const paths=rows.map((x:any)=>x.image_path).filter(Boolean)
    if(paths.length){
      const {data:signed,error:signErr}=await admin.storage.from('family-games').createSignedUrls(paths,3600)
      if(signErr)throw signErr
      const urls=new Map((signed||[]).map((x:any)=>[x.path,x.signedUrl]))
      for(const row of rows)row.image_url=row.image_path?urls.get(row.image_path)||null:null
    }
  }
  const prompts=session.mode==='words'?wordPrompts:drawingPrompts
  return {ok:true,session,turns:rows.map((row:any)=>({step:row.step,author_name:row.author_name,text:row.text||'',image_url:row.image_url||null,prompt:prompts[row.step]||'',created_at:row.created_at}))}
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const {data:ctx,error:ctxError}=await createSupabaseContext(req,{auth:'publishable'})
    if(ctxError||!ctx)return json({error:'Client access denied'},ctxError?.status||401)
    const admin=ctx.supabaseAdmin
    const device=await deviceAuth(req,admin)
    if(!device)return json({error:'Доступ не разрешён'},401)
    const body=await req.json().catch(()=>({}))
    const action=String(body.action||'state')

    if(action==='state')return json({ok:true,...await statePayload(admin,device)})

    if(action==='start'){
      const mode=String(body.mode||'')
      if(!['words','drawing'].includes(mode))return json({error:'Неизвестный режим'},400)
      const {data:devices,error:dErr}=await admin.from('device_tokens').select('author_name,last_used_at').neq('author_name',device.author_name).order('last_used_at',{ascending:false,nullsFirst:false}).limit(20)
      if(dErr)throw dErr
      const partner=(devices||[]).map((x:any)=>String(x.author_name||'').trim()).find((name:string)=>name&&name!==device.author_name)
      if(!partner)return json({error:'Второй игрок пока не подключён'},409)
      const totalSteps=mode==='words'?6:4
      const {data,error}=await admin.from('game_sessions').insert({mode,status:'active',starter_author:device.author_name,partner_author:partner,current_author:device.author_name,current_step:0,total_steps:totalSteps}).select('id').single()
      if(error){
        if(error.code==='23505')return json({error:'Игра уже идёт'},409)
        throw error
      }
      await sendPushToAuthor(admin,partner,pushPayload(`${device.author_name} начал(а) Чепуху 🎲`,'Первый ход уже начался',data.id))
      return json({ok:true,...await statePayload(admin,device)})
    }

    if(action==='cancel'){
      const sessionId=String(body.session_id||'')
      if(!sessionId)return json({error:'Некорректная игра'},400)
      const {data:session,error:sErr}=await admin.from('game_sessions')
        .select('id,status,starter_author,partner_author').eq('id',sessionId).eq('status','active').maybeSingle()
      if(sErr)throw sErr
      if(!session)return json({error:'Активная игра уже завершена'},409)
      if(![session.starter_author,session.partner_author].includes(device.author_name))return json({error:'Нет доступа к этой игре'},403)
      const {data:turns,error:tErr}=await admin.from('game_turns').select('image_path').eq('game_id',sessionId)
      if(tErr)throw tErr
      const {error:deleteErr}=await admin.from('game_sessions').delete().eq('id',sessionId).eq('status','active')
      if(deleteErr)throw deleteErr
      const paths=(turns||[]).map((x:any)=>x.image_path).filter(Boolean)
      if(paths.length)await admin.storage.from('family-games').remove(paths).catch(()=>{})
      const partner=session.starter_author===device.author_name?session.partner_author:session.starter_author
      await sendPushToAuthor(admin,partner,pushPayload('Чепуха завершена',`${device.author_name} завершил(а) текущую игру`,sessionId))
      return json({ok:true,...await statePayload(admin,device)})
    }

    if(action==='submit'){
      const sessionId=String(body.session_id||'')
      const step=Number(body.step)
      if(!sessionId||!Number.isInteger(step)||step<0)return json({error:'Некорректный ход'},400)
      const {data:session,error:sErr}=await admin.from('game_sessions')
        .select('id,mode,status,starter_author,partner_author,current_author,current_step,total_steps')
        .eq('id',sessionId).eq('status','active').maybeSingle()
      if(sErr)throw sErr
      if(!session)return json({error:'Активная игра не найдена'},404)
      if(session.current_author!==device.author_name)return json({error:'Сейчас ход другого игрока'},409)
      if(Number(session.current_step)!==step)return json({error:'Этот ход уже отправлен'},409)

      let text:string|null=null,imagePath:string|null=null,previewData:string|null=null
      if(session.mode==='words'){
        text=String(body.text||'').trim().slice(0,800)
        if(!text)return json({error:'Напиши ответ'},400)
      }else{
        let image,preview
        try{image=dataUrlToBytes(String(body.image_data||''),2*1024*1024);preview=dataUrlToBytes(String(body.preview_data||''),180*1024)}
        catch(e:any){return json({error:e?.message==='IMAGE_TOO_LARGE'?'Рисунок слишком большой':'Не удалось прочитать рисунок'},400)}
        await ensureBucket(admin)
        const ext=image.mime==='image/jpeg'?'jpg':image.mime==='image/webp'?'webp':'png'
        imagePath=`${session.id}/${step}-${crypto.randomUUID()}.${ext}`
        const {error:upErr}=await admin.storage.from('family-games').upload(imagePath,image.bytes,{contentType:image.mime,upsert:false})
        if(upErr)throw upErr
        previewData=String(body.preview_data)
      }

      const {error:turnErr}=await admin.from('game_turns').insert({game_id:session.id,step,author_name:device.author_name,text,image_path:imagePath,preview_data:previewData})
      if(turnErr){
        if(imagePath)await admin.storage.from('family-games').remove([imagePath])
        if(turnErr.code==='23505')return json({error:'Этот ход уже отправлен'},409)
        throw turnErr
      }

      const isFinal=step+1>=Number(session.total_steps)
      const nextAuthor=session.current_author===session.starter_author?session.partner_author:session.starter_author
      const patch=isFinal
        ? {status:'finished',current_author:null,current_step:session.total_steps,finished_at:new Date().toISOString(),updated_at:new Date().toISOString()}
        : {current_author:nextAuthor,current_step:step+1,updated_at:new Date().toISOString()}
      const {data:advanced,error:advanceErr}=await admin.from('game_sessions').update(patch)
        .eq('id',session.id).eq('status','active').eq('current_step',step).eq('current_author',device.author_name).select('id').maybeSingle()
      if(advanceErr)throw advanceErr
      if(!advanced){
        try{await admin.from('game_turns').delete().eq('game_id',session.id).eq('step',step).eq('author_name',device.author_name)}catch{}
        if(imagePath){try{await admin.storage.from('family-games').remove([imagePath])}catch{}}
        return json({error:'Состояние игры изменилось. Обнови экран'},409)
      }

      if(isFinal){
        await sendPushToAuthor(admin,nextAuthor,pushPayload('Чепуха готова 🎉','Можно раскрывать результат',session.id))
        const result=await resultPayload(admin,session.id,device.author_name)
        return json({ok:true,finished:true,result,...await statePayload(admin,device)})
      }
      await sendPushToAuthor(admin,nextAuthor,pushPayload('Чепуха — твой ход 🎲',session.mode==='words'?'Ответь на следующий вопрос':'Продолжи рисунок',session.id))
      return json({ok:true,...await statePayload(admin,device)})
    }

    if(action==='result'){
      const result=await resultPayload(admin,String(body.session_id||''),device.author_name)
      if((result as any).error)return json({error:(result as any).error},(result as any).status||400)
      return json(result)
    }

    return json({error:'Unknown action'},400)
  }catch(e:any){
    console.error('game-api error',e)
    return json({error:'Временная ошибка игры'},500)
  }
})