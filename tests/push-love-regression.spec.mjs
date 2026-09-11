import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');

test('push восстанавливается после перезапуска без нового запроса разрешения',()=>{
  const core=read('app-core.mjs');
  const recovery=read('push-recovery.js');
  expect(core).toMatch(/push-recovery\.js\?v=1/);
  expect(recovery).toMatch(/Notification\.permission!==['"]granted['"]/);
  expect(recovery).toMatch(/pushManager\.getSubscription\(\)/);
  expect(recovery).toMatch(/pushManager\.subscribe/);
  expect(recovery).toMatch(/action:'push_subscribe'/);
  expect(recovery).toMatch(/pageshow/);
  expect(recovery).toMatch(/visibilitychange/);
  expect(recovery).toMatch(/controllerchange/);
  expect(recovery).toMatch(/updateViaCache:'none'/);
});

test('love popup по центру и повторно поднимается после холодного запуска',()=>{
  const popup=read('love-popup.js');
  const sw=read('sw.js');
  expect(popup).toMatch(/\.love-pop\{[^}]*left:50%;top:50%/s);
  expect(popup).toMatch(/translate\(-50%,-50%\)/);
  expect(popup).toMatch(/\[80,500,1400,3200,6500\]/);
  expect(popup).toMatch(/replayPending/);
  expect(popup).toMatch(/sw\.js\?v=4/);
  expect(sw).toMatch(/function isLovePush/);
  expect(sw).toMatch(/data\.kind==='love'/);
  expect(sw).toMatch(/await rememberLove\(item\)/);
  expect(sw).toMatch(/url=loveUrl\(item\)/);
});
