import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

async function fixture(slug,items=[],{pushFailure=false}={}){
  const tables={shared_items:structuredClone(items),device_tokens:[{id:'device-a',author_name:'A',last_used_at:new Date().toISOString()}],device_reads:[],activity_events:[],push_config:[{id:true,public_key:'test',private_key:'test'}],push_subscriptions:[{id:'sub',device_id:'device-a',endpoint:'test',p256dh:'test',auth:'test'}]};
  let notifications=0;
  const admin={rpc:async()=>({data:{thanks:0}}),storage:{from:()=>({createSignedUrls:async paths=>({data:paths.map(path=>({path,signedUrl:'https://test/'+path}))}),remove:async()=>({})})},from(table){
    const filters=[];let mode='read',patch,single=false;
    const q={select(){return q},eq(k,v){if(k!=='token_hash')filters.push(r=>r[k]===v);return q},neq(k,v){filters.push(r=>r[k]!==v);return q},in(k,v){filters.push(r=>v.includes(r[k]));return q},filter(k,_op,v){filters.push(r=>JSON.stringify(r[k])===v);return q},order(){return q},limit(){return q},update(v){mode='update';patch=v;return q},delete(){mode='delete';return q},insert(v){mode='insert';patch=v;return q},maybeSingle(){single=true;return q},single(){single=true;return q},then(resolve,reject){
      try{
        const rows=tables[table]||=[];let matched=rows.filter(r=>filters.every(fn=>fn(r)));
        if(mode==='update')matched.forEach(r=>Object.assign(r,structuredClone(patch)));
        if(mode==='delete')tables[table]=rows.filter(r=>!matched.includes(r));
        if(mode==='insert'){
          if(patch.id&&rows.some(r=>r.id===patch.id))return Promise.resolve({error:{code:'23505'}}).then(resolve,reject);
          const row={id:crypto.randomUUID(),...patch};rows.push(row);matched=[row];
        }
        return Promise.resolve({data:structuredClone(single?matched[0]||null:matched),error:null}).then(resolve,reject);
      }catch(e){return Promise.reject(e).then(resolve,reject)}
    }};return q;
  }};
  const source=readFileSync(new URL('../supabase/functions/'+slug+'/index.ts',import.meta.url),'utf8').replace(/^import .*$/gm,'');
  const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None},reportDiagnostics:true});
  assert.deepEqual(result.diagnostics,[]);
  let handler;
  const Deno={env:{get:()=> 'test-cron'},serve:fn=>handler=fn};
  const webpush={setVapidDetails(){},async sendNotification(){notifications++;if(pushFailure)throw Error('push unavailable')}};
  new Function('Deno','createSupabaseContext','webpush',result.outputText)(Deno,async()=>({data:{supabaseAdmin:admin}}),webpush);
  const call=async body=>{const response=await handler(new Request('https://test',{method:'POST',headers:{'content-type':'application/json','x-family-token':'t'.repeat(64),'x-reminder-cron':'test-cron'},body:JSON.stringify(body)}));return {status:response.status,data:await response.json()}};
  return {call,tables,notifications:()=>notifications};
}
test('family API blocks content changes and deletion of another author, but allows shared completion',async()=>{
  const f=await fixture('family-api',[{id:'item',kind:'wishlist',author_name:'B',text:'original',data:{done:false,link:'https://test'}}]);
  assert.equal((await f.call({action:'update',id:'item',text:'overwrite'})).status,403);
  assert.equal((await f.call({action:'delete',id:'item'})).status,403);
  assert.equal((await f.call({action:'update',id:'item',data:{done:true}})).status,200);
  assert.equal(f.tables.shared_items[0].data.link,'https://test');
});
test('generic API cannot bypass reminder permissions',async()=>{
  const f=await fixture('family-api',[{id:'reminder',kind:'reminders',author_name:'A',text:'original',data:{}}]);
  for(const action of ['edit','update','delete'])assert.equal((await f.call({action,id:'reminder',text:'bypass'})).status,404);
  assert.equal(f.tables.shared_items.length,1);
});
test('same create request is stored once and repeated response returns original id',async()=>{
  const f=await fixture('family-api'),id=crypto.randomUUID();
  const request={action:'create',kind:'thanks',text:'once',request_id:id};
  assert.equal((await f.call(request)).data.id,id);assert.equal((await f.call(request)).data.id,id);
  assert.equal(f.tables.shared_items.length,1);assert.equal(f.tables.activity_events.length,1);
});
test('concurrent reminder dispatch claims only one copy',async()=>{
  const f=await fixture('reminder-api',[{id:'reminder',kind:'reminders',author_name:'A',text:'due',data:{scheduled_for:new Date(Date.now()-1000).toISOString(),target:'self',done:false,sent_at:null}}]);
  await Promise.all([f.call({action:'dispatch'}),f.call({action:'dispatch'})]);assert.equal(f.notifications(),1);
});
test('failed reminder delivery releases its claim for a later attempt',async()=>{
  const f=await fixture('reminder-api',[{id:'reminder',kind:'reminders',author_name:'A',text:'due',data:{scheduled_for:new Date(Date.now()-1000).toISOString(),target:'self',done:false,sent_at:null}}],{pushFailure:true});
  await f.call({action:'dispatch'});assert.equal(f.tables.shared_items[0].data.sent_at,null);
});
test('an expired reminder claim is retried after worker death',async()=>{
  const f=await fixture('reminder-api',[{id:'reminder',kind:'reminders',author_name:'A',text:'due',data:{scheduled_for:new Date(Date.now()-600000).toISOString(),claimed_at:new Date(Date.now()-360000).toISOString(),target:'self',done:false,sent_at:null}}]);
  await f.call({action:'dispatch'});assert.equal(f.notifications(),1);assert.ok(f.tables.shared_items[0].data.sent_at);assert.equal(f.tables.shared_items[0].data.claimed_at,null);
});
