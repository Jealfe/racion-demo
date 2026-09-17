import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCloudRuntime} from '../cloud-runtime.mjs';
import {createOutbox} from '../cloud-outbox.mjs';
const response=(data={},status=200)=>new Response(JSON.stringify(data),{status});
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)}};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};

test('slow reads are shared beyond the former 3 second cache TTL',async()=>{
  let calls=0;const gate=deferred();
  const r=createCloudRuntime({fetch:async()=>{calls++;await gate.promise;return response({items:[]})},getToken:()=> 'device'});
  const a=r.request('sync');await new Promise(r=>setTimeout(r,3100));const b=r.request('sync');gate.resolve();
  await Promise.all([a,b]);assert.equal(calls,1);r.dispose();
});
test('writes are never replayed after 503 or a lost response',async()=>{
  for(const fail of [()=>response({},503),()=>{throw Error('connection lost')}]){
    let calls=0;const r=createCloudRuntime({fetch:async()=>{calls++;return fail()},getToken:()=> 'device'});
    await assert.rejects(r.request('create',{text:'once'}));assert.equal(calls,1);r.dispose();
  }
});
test('failed read recovers and an old read cannot publish after a mutation',async()=>{
  let fail=true,calls=0;const gate=deferred(),published=[];
  const r=createCloudRuntime({fetch:async(_url,init)=>{const action=JSON.parse(init.body).action;if(action==='create')return response({id:'created'});calls++;if(fail)return response({},503);await gate.promise;return response({items:['fresh']})},getToken:()=> 'device'});
  await assert.rejects(r.request('sync'));fail=false;
  const stop=r.subscribe('sync',d=>published.push(d));await r.request('create');gate.resolve();
  await r.refresh();assert.ok(calls>=3);assert.ok(published.length>0);stop();r.dispose();
});
test('device switch never delivers previous account response',async()=>{
  let token='A';const gate=deferred(),published=[];
  const r=createCloudRuntime({fetch:async()=>{await gate.promise;return response({items:['private A']})},getToken:()=>token});
  r.subscribe('sync',d=>published.push(d));token='B';r.reset();gate.resolve();await new Promise(r=>setTimeout(r,20));
  assert.deepEqual(published,[]);r.dispose();
});
test('outbox overlays a write made while the server still returns the old list',async()=>{
  const storage=memory(),gate=deferred();let sends=0;
  const box=createOutbox({storage,getToken:()=> 'A',send:async()=>{sends++;await gate.promise;return {id:'server-id'}}});
  box.enqueue([{key:'thanks',action:'create',payload:{text:'new'},localId:123,local:{id:123,text:'new'}}]);
  assert.equal(box.merge('thanks',[])[0].text,'new');gate.resolve();await new Promise(r=>setTimeout(r,0));
  assert.equal(box.merge('thanks',[])[0].id,'server-id');
  assert.equal(box.merge('thanks',[{id:'server-id',text:'new'}]).length,1);assert.equal(box.pending().length,0);assert.equal(sends,1);
});
test('ambiguous writes survive reload without duplicates or cross-device leakage',async()=>{
  const storage=memory();let sends=0,token='A';const options={storage,getToken:()=>token,send:async()=>{sends++;throw Error('lost response')}};
  const box=createOutbox(options);box.enqueue([{key:'movies',action:'create',payload:{text:'film'},localId:1,local:{id:1,t:'film'}}]);await new Promise(r=>setTimeout(r,0));
  const reloaded=createOutbox(options);await reloaded.flush();assert.equal(sends,1);assert.equal(reloaded.merge('movies',[])[0].t,'film');
  token='B';assert.deepEqual(reloaded.merge('movies',[]),[]);
});
test('safe create retry keeps the same request id',async()=>{
  const storage=memory(),ids=[];let fail=true;
  const box=createOutbox({storage,getToken:()=> 'A',send:async(_action,payload)=>{ids.push(payload.request_id);if(fail)throw Error('lost');return {id:'server'}}});
  box.enqueue([{key:'movies',action:'create',payload:{text:'film'},localId:1,local:{id:1,t:'film'}}]);await new Promise(r=>setTimeout(r,0));
  fail=false;box.retryCreates();await new Promise(r=>setTimeout(r,0));assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);
});
test('deleting a pending create uses its confirmed server id',async()=>{
  const storage=memory(),gate=deferred(),sent=[];
  const box=createOutbox({storage,getToken:()=> 'A',send:async(action,payload)=>{sent.push([action,payload]);if(action==='create'){await gate.promise;return {id:'server'}}return {ok:true}}});
  box.enqueue([{key:'movies',action:'create',payload:{text:'film'},localId:1,local:{id:1,t:'film'}}]);
  box.enqueue([{key:'movies',action:'delete',payload:{id:1}}]);assert.deepEqual(box.merge('movies',[]),[]);
  gate.resolve();await new Promise(r=>setTimeout(r,0));assert.equal(sent[1][1].id,'server');assert.deepEqual(box.merge('movies',[]),[]);
});
