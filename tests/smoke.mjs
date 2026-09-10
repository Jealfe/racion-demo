import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeThanksText,encodeThanksPayload,decodeThanksPayload,addUniqueThanks,pickByTag,localDateValue} from '../app-core.mjs';

let passed=0;
const test=(name,fn)=>{try{fn();passed++;console.log('✓',name)}catch(e){console.error('✗',name);throw e}};

test('готовая причина формирует благодарность',()=>{
  assert.equal(makeThanksText('кофе'),'Спасибо тебе за кофе ❤️');
});

test('свой текст формируется без двойного сердца',()=>{
  assert.equal(makeThanksText('','за чудесное утро ❤️'),'Спасибо тебе за чудесное утро ❤️');
});

test('пустая форма не создаёт сообщение',()=>{
  assert.equal(makeThanksText('',''),'');
});

test('ссылка спасибо кодируется и декодируется без потери текста',()=>{
  const src={id:'m_test',text:'Спасибо тебе за ужин ❤️',date:'2026-09-10T10:00:00.000Z'};
  assert.deepEqual(decodeThanksPayload(encodeThanksPayload(src)),src);
});

test('одно входящее сообщение не сохраняется повторно по refId',()=>{
  const a=[{id:1,refId:'m_1',text:'Спасибо ❤️',date:'2026-09-10T10:00:00.000Z',received:true}];
  const b=addUniqueThanks(a,{id:2,refId:'m_1',text:'Спасибо ❤️',date:'2026-09-10T10:05:00.000Z',received:true});
  assert.equal(b.length,1);
});

test('быстрый дубль одного локального действия отсекается',()=>{
  const a=[{id:1,refId:'',text:'Спасибо тебе за кофе ❤️',date:'2026-09-10T10:00:00.000Z',received:false}];
  const b=addUniqueThanks(a,{id:2,refId:'',text:'Спасибо тебе за кофе ❤️',date:'2026-09-10T10:00:01.000Z',received:false});
  assert.equal(b.length,1);
});

test('фильтр рандомайзера выбирает только нужную категорию',()=>{
  const items=[{t:'A',tag:'one'},{t:'B',tag:'two'}];
  assert.equal(pickByTag(items,'two',()=>0).t,'B');
  assert.equal(pickByTag(items,'missing',()=>0),null);
});

test('локальная дата не зависит от UTC-обрезки строки',()=>{
  const d=new Date(2026,8,10,23,30,0);
  assert.equal(localDateValue(d),'2026-09-10');
});

test('HTML содержит все основные экраны и новый модульный JS',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  for(const id of ['home','designs','movies','food','moments','thanks','wishlist','ideas','likes','surprise','shareThanks','saveThanks','designViewer','received']){
    assert.match(html,new RegExp(`id=["']${id}["']`),`Нет #${id}`);
  }
  assert.match(html,/type="module" src="\.\/app\.js"/);
});

console.log(`\n${passed} smoke-тестов пройдено.`);
