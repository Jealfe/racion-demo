import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeThanksText,encodeThanksPayload,decodeThanksPayload,addUniqueThanks,pickByTag,localDateValue,normalizeAuthor,unreadTotal} from '../app-core.mjs';

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

test('ссылка спасибо сохраняет автора',()=>{
  const src={id:'m_test',text:'Спасибо тебе за ужин ❤️',date:'2026-09-10T10:00:00.000Z',author:'Алекс'};
  assert.deepEqual(decodeThanksPayload(encodeThanksPayload(src)),src);
});

test('старое спасибо без автора остаётся совместимым',()=>{
  const src={id:'m_old',text:'Спасибо ❤️',date:'2026-09-10T10:00:00.000Z'};
  assert.deepEqual(decodeThanksPayload(encodeThanksPayload(src)),{...src,author:''});
});

test('имя автора очищается и ограничивается',()=>{
  assert.equal(normalizeAuthor('  Алекс   Дом  '),'Алекс Дом');
  assert.equal(normalizeAuthor('x'.repeat(50)).length,32);
});

test('одно входящее сообщение не сохраняется повторно по refId',()=>{
  const a=[{id:1,refId:'m_1',text:'Спасибо ❤️',date:'2026-09-10T10:00:00.000Z',received:true,author:'Жена'}];
  const b=addUniqueThanks(a,{id:2,refId:'m_1',text:'Спасибо ❤️',date:'2026-09-10T10:05:00.000Z',received:true,author:'Жена'});
  assert.equal(b.length,1);
});

test('быстрый дубль одного локального действия отсекается',()=>{
  const a=[{id:1,refId:'',text:'Спасибо тебе за кофе ❤️',date:'2026-09-10T10:00:00.000Z',received:false,author:'Алекс'}];
  const b=addUniqueThanks(a,{id:2,refId:'',text:'Спасибо тебе за кофе ❤️',date:'2026-09-10T10:00:01.000Z',received:false,author:'Алекс'});
  assert.equal(b.length,1);
});

test('счётчик нового суммирует разделы',()=>{
  assert.equal(unreadTotal({thanks:2,wishlist:1,ideas:0}),3);
  assert.equal(unreadTotal(null),0);
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

test('JS содержит профиль автора и визуальный индикатор нового',()=>{
  const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(js,/id="profileSetup"/);
  assert.match(js,/notify-badge/);
  assert.match(js,/activity-lamp/);
  assert.match(js,/author:/);
});

console.log(`\n${passed} smoke-тестов пройдено.`);
