const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const photos = Array.from({length:24}, (_,i) => ({id:String(i),guest:'Test Guest',created_at:'2026-09-01'}));
 let calls=[];
 const server=http.createServer((req,res) => {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.endsWith('/guest-gallery')) {
   calls.push(url.search);
   if(url.searchParams.has('photo')) {
    res.setHeader('Content-Type','image/svg+xml');
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#329f83"/></svg>');
   }
   res.setHeader('Content-Type','application/json');
   return res.end(JSON.stringify({photos:url.searchParams.get('offset')==='24'?[]:photos,guests:['Test Guest']}));
  }
  if(['/style.css','/guest-gallery.js'].includes(url.pathname)) {
   res.setHeader('Content-Type',url.pathname.endsWith('.js')?'text/javascript':'text/css');
   return res.end(fs.readFileSync('.'+url.pathname));
  }
  res.setHeader('Content-Type','text/html');
  res.end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><main class="app-shell"><section id="guest-panel"></section></main><script type="module">import {openGuestGallery} from '/guest-gallery.js';await openGuestGallery(location.origin,'test',document.getElementById('guest-panel'));</script></body></html>`);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try {
  browser=await chromium.launch({channel:'chrome',headless:true});
  for (const width of [360,390,1280]) {
   const page=await browser.newPage({viewport:{width,height:844}});
   const errors=[]; page.on('pageerror',error=>errors.push(error.message));
   await page.goto(`http://127.0.0.1:${server.address().port}`);
   await page.waitForSelector('.shared-photo');
   assert.equal(await page.locator('.shared-photo').count(),24);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.equal(calls.some(call=>call.includes('full=1')),false);
   await page.screenshot({path:path.join(os.tmpdir(),`guest-gallery-${width}.png`)});
   await page.locator('.shared-photo').first().click();
   await page.waitForFunction(()=>!document.querySelector('.shared-photo-dialog button:last-of-type').disabled);
   await page.getByRole('button',{name:'Close preview'}).click();
   await page.locator('#shared-sort').selectOption('oldest');
   await page.waitForTimeout(100);
   assert(calls.some(call=>call.includes('sort=oldest')));
   assert.deepEqual(errors,[]);
   await page.close(); calls=[];
  }
  console.log('Gallery UI: mobile/desktop, grid, no full-size grid requests, preview, sorting passed. Screenshots in OS temp.');
 } finally { if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{ console.error(error); process.exitCode=1; });
