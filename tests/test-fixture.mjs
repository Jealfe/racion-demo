import {test as base,expect} from '@playwright/test';
// Tests must never reach the live family backend. Scenario-specific routes override this fallback.
export const test=base.extend({
  networkIsolation:[async({context},use)=>{
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='127.0.0.1'||url.hostname==='localhost')return route.continue();
      if(url.pathname.endsWith('/reminder-api'))return route.fulfill({json:{ok:true,items:[],people:[]}});
      if(url.pathname.endsWith('/family-api'))return route.fulfill({status:401,json:{error:'Unmocked cloud request'}});
      return route.abort();
    });
    await use();
  },{auto:true}],
});
export {expect};
