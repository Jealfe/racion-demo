import { createSupabaseContext } from 'npm:@supabase/server@1.5.3'
import webpush from 'npm:web-push@3.6.7'

const CRON_SECRET=Deno.env.get('REMINDER_CRON_SECRET')||''
const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'content-type,x-family-token,x-reminder-cron,apikey',
  'Access-Control-Allow-Methods':'POST,OPTIONS',
  'Content-Type':'application/json; charset=utf-8',
}
const enc=new TextEncoder()
const targets=new Set(['self','partner','both'])

function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:cors})}
function cleanText(v:unknown,n=500){return String(v??'').trim().replace(/\s+/g,' ').slice(0,n)}
async function sha256(value:string){
  const hash=await crypto.subtle.digest('SHA-256',enc.encode(value))
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')
}
async function deviceAuth(req:Request,admin:any){
  const token=(req.headers.get('x-family-token')||'').trim()
  if(token.length<32)return null
  const tokenHash=await sha256(token)
  const {data,error}=await admin.from('device_tokens').select('id,author_name').eq('token_hash',tokenHash).maybeSingle()
  if(error||!data)return null
  await admin.from('device_tokens').update({last_used_at:new Date().toISOString()}).eq('id',data.id)
  return data as {id:string,author_name:string}
}
function rowOut(row:any){
  const d=row?.data&&typeof row.data==='object'?row.data:{}
  return {
    id:String(row.id),
    text:String(row.text||''),
    author:String(row.author_name||''),
    scheduled_for:String(d.scheduled_for||''),
    target:targets.has(String(d.target||''))?String(d.target):'self',
    done:Boolean(d.done),
    sent_at:d.sent_at?String(d.sent_at):null,
    created_at:String(row.created_at||''),
    updated_at:String(row.updated_at||''),
  }
}
async function listReminders(admin:any){
  const {data,error}=await admin.from('shared_items')
    .select('id,text,data,author_name,created_at,updated_at')
    .eq('kind','reminders')
    .order('created_at',{ascending:false})
    .limit(500)
  if(error)throw error
  return (data||[]).map(rowOut)
}
async function people(admin:any){
  const {data}=await admin.from('device_tokens').select('author_name')
  return [...new Set((data||[]).map((x:any)=>String(x.author_name||'')).filter(Boolean))]
}
function parseSchedule(value:unknown){
  const d=new Date(String(value||''))
  if(!Number.isFinite(d.getTime()))return null
  return d
}
function targetLabel(target:string){return target==='partner'?'для тебя':target==='both'?'для нас обоих':'для себя'}
async function pushConfig(admin:any){
  const {data}=await admin.from('push_config').select('public_key,private_key').eq('id',true).maybeSingle()
  return data||null
}
async function sendReminderPush(admin:any,row:any){
  const d=row?.data&&typeof row.data==='object'?row.data:{}
  const target=targets.has(String(d.target||''))?String(d.target):'self'
  const creator=String(row.author_name||'')
  const {data:devices,error:dErr}=await admin.from('device_tokens').select('id,author_name')
  if(dErr)throw dErr
  const deviceIds=(devices||[]).filter((x:any)=>{
    if(target==='both')return true
    if(target==='partner')return String(x.author_name||'')!==creator
    return String(x.author_name||'')===creator
  }).map((x:any)=>String(x.id))
  if(!deviceIds.length)return {success:0,attempted:0}
  const {data:subs,error:sErr}=await admin.from('push_subscriptions').select('id,device_id,endpoint,p256dh,auth').in('device_id',deviceIds)
  if(sErr)throw sErr
  if(!(subs||[]).length)return {success:0,attempted:0}
  const cfg=await pushConfig(admin)
  if(!cfg)return {success:0,attempted:0}
  webpush.setVapidDetails('https://jealfe.github.io',cfg.public_key,cfg.private_key)
  const title=target==='partner'?`⏰ Напоминание от ${creator}`:target==='both'?'⏰ Наше напоминание':'⏰ Напоминание'
  const payload=JSON.stringify({
    title,
    body:cleanText(row.text,500),
    icon:'./app-icon.svg',
    badge:'./app-icon.svg',
    tag:`reminder-${row.id}`,
    url:'./#reminders',
    kind:'reminders',
    itemId:String(row.id),
  })
  let success=0,attempted=0
  for(const s of subs||[]){
    attempted++
    try{
      await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},payload,{TTL:3600,urgency:'normal'})
      success++
    }catch(e:any){
      const status=Number(e?.statusCode||e?.status||0)
      if(status===404||status===410)await admin.from('push_subscriptions').delete().eq('id',s.id)
      else console.error('reminder push failed',status,e?.message||e)
    }
  }
  return {success,attempted}
}
async function dispatch(admin:any){
  const now=Date.now(),maxAge=24*60*60*1000
  const {data,error}=await admin.from('shared_items')
    .select('id,text,data,author_name,created_at,updated_at')
    .eq('kind','reminders')
    .order('created_at',{ascending:true})
    .limit(500)
  if(error)throw error
  let due=0,sent=0,noSubscription=0,expired=0
  for(const row of data||[]){
    const d=row?.data&&typeof row.data==='object'?row.data:{}
    if(Boolean(d.done)||d.sent_at)continue
    if(d.claimed_at&&now-new Date(d.claimed_at).getTime()<300000)continue
    const scheduled=parseSchedule(d.scheduled_for)
    if(!scheduled)continue
    const ts=scheduled.getTime()
    if(ts>now)continue
    if(now-ts>maxAge){expired++;continue}
    due++
    const claimedAt=new Date().toISOString()
    const nextData={...d,claimed_at:claimedAt}
    const {data:claimed,error:uErr}=await admin.from('shared_items').update({data:nextData,updated_at:claimedAt}).eq('id',row.id).eq('kind','reminders').filter('data','eq',JSON.stringify(d)).select('id').maybeSingle()
    if(uErr){console.error('claim reminder failed',row.id,uErr);continue}
    if(!claimed)continue
    let result={success:0,attempted:0}
    try{result=await sendReminderPush(admin,{...row,data:nextData})}catch(error){console.error('reminder delivery failed',error)}
    if(result.success>0){
      const {error:finishError}=await admin.from('shared_items').update({data:{...nextData,claimed_at:null,sent_at:new Date().toISOString()},updated_at:new Date().toISOString()}).eq('id',row.id).filter('data','eq',JSON.stringify(nextData))
      if(finishError)console.error('finalize reminder failed',row.id,finishError);else sent++
    }
    else{
      noSubscription++
      const retryData={...nextData,claimed_at:null,sent_at:null}
      await admin.from('shared_items').update({data:retryData,updated_at:new Date().toISOString()}).eq('id',row.id).filter('data','eq',JSON.stringify(nextData))
    }
  }
  return {due,sent,no_subscription:noSubscription,expired}
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const body=await req.json().catch(()=>({}))
    const action=String(body.action||'list')
    const {data:ctx,error:ctxError}=await createSupabaseContext(req,{auth:'publishable'})
    if(ctxError||!ctx)return json({error:'Client access denied'},ctxError?.status||401)
    const admin=ctx.supabaseAdmin

    if(action==='dispatch'){
      const secret=req.headers.get('x-reminder-cron')||''
      if(!CRON_SECRET||secret!==CRON_SECRET)return json({error:'Forbidden'},403)
      return json({ok:true,...await dispatch(admin)})
    }

    const device=await deviceAuth(req,admin)
    if(!device)return json({error:'Доступ не разрешён'},401)

    if(action==='list'){
      return json({ok:true,author:device.author_name,people:await people(admin),items:await listReminders(admin)})
    }

    if(action==='create'){
      const text=cleanText(body.text,500)
      const target=String(body.target||'self')
      const scheduled=parseSchedule(body.scheduled_for)
      if(!text)return json({error:'Напиши текст напоминания'},400)
      if(!targets.has(target))return json({error:'Некорректный получатель'},400)
      if(!scheduled)return json({error:'Некорректные дата и время'},400)
      if(scheduled.getTime()<Date.now()-60_000)return json({error:'Время напоминания уже прошло'},400)
      const data={reminder:true,target,scheduled_for:scheduled.toISOString(),done:false,sent_at:null}
      const {data:created,error}=await admin.from('shared_items').insert({kind:'reminders',text,data,author_name:device.author_name}).select('id').single()
      if(error)throw error
      return json({ok:true,id:created.id})
    }

    if(action==='update'){
      const id=String(body.id||'')
      const {data:item,error:getErr}=await admin.from('shared_items').select('id,kind,text,data,author_name').eq('id',id).eq('kind','reminders').maybeSingle()
      if(getErr||!item)return json({error:'Напоминание не найдено'},404)
      const current=item.data&&typeof item.data==='object'?item.data:{}
      const isCreator=String(item.author_name||'')===device.author_name
      const wantsEdit=body.text!==undefined||body.target!==undefined||body.scheduled_for!==undefined
      if(wantsEdit&&!isCreator)return json({error:'Изменить может только автор'},403)
      const patch:any={updated_at:new Date().toISOString()}
      let nextData={...current}
      if(body.text!==undefined){
        const text=cleanText(body.text,500)
        if(!text)return json({error:'Напиши текст напоминания'},400)
        patch.text=text
      }
      if(body.target!==undefined){
        const target=String(body.target||'')
        if(!targets.has(target))return json({error:'Некорректный получатель'},400)
        nextData.target=target
        nextData.sent_at=null
      }
      if(body.scheduled_for!==undefined){
        const scheduled=parseSchedule(body.scheduled_for)
        if(!scheduled)return json({error:'Некорректные дата и время'},400)
        if(scheduled.getTime()<Date.now()-60_000)return json({error:'Время напоминания уже прошло'},400)
        nextData.scheduled_for=scheduled.toISOString()
        nextData.sent_at=null
      }
      if(body.done!==undefined){
        nextData.done=Boolean(body.done)
        if(!nextData.done){
          const scheduled=parseSchedule(nextData.scheduled_for)
          if(scheduled&&scheduled.getTime()>Date.now())nextData.sent_at=null
        }
      }
      patch.data=nextData
      const {error}=await admin.from('shared_items').update(patch).eq('id',id)
      if(error)throw error
      return json({ok:true})
    }

    if(action==='delete'){
      const id=String(body.id||'')
      const {data:item}=await admin.from('shared_items').select('id,author_name').eq('id',id).eq('kind','reminders').maybeSingle()
      if(!item)return json({error:'Напоминание не найдено'},404)
      if(String(item.author_name||'')!==device.author_name)return json({error:'Удалить может только автор'},403)
      const {error}=await admin.from('shared_items').delete().eq('id',id)
      if(error)throw error
      return json({ok:true})
    }

    return json({error:'Unknown action'},400)
  }catch(e){
    console.error(e)
    return json({error:'Server error'},500)
  }
})
