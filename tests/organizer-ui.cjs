const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=req.url==='/'?'index.html':req.url.slice(1).split('?')[0];
  if(!['index.html','script.js','guest-gallery.js','reliability.js','r2-storage.js','storage-config.js','event-timing.js','style.css'].includes(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
  res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try {
  browser=await chromium.launch({headless:true});
  for(const width of [390,1280]) {
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.route('https://**/*',async route=>{
    if(!route.request().url().includes('esm.sh/@supabase/supabase-js')) return route.fulfill({body:'',contentType:'text/javascript'});
    const day=new Date(Date.now()+86400000).toISOString().slice(0,10);
    const event={id:'event-a',owner_id:'owner',name:'Future event',start_date:day,end_date:day,date:day,slug:'future-test',status:'active',storage_folder:'event-a',created_at:new Date().toISOString()};
    await route.fulfill({contentType:'text/javascript',body:`export function createClient(){
     const session={user:{id:'owner',email:'test@example.com',user_metadata:{full_name:'Test Organizer'}}};
     return {auth:{onAuthStateChange(){},getSession:async()=>({data:{session}})},rpc:async()=>({data:{enabled:false}}),from(table){let mutation=false;const q={select(){return q},eq(){return q},neq(){return q},gte(){return q},lt(){return q},lte(){return q},in(){return q},order(){return q},range(){return q},update(){mutation=true;return q},maybeSingle:async()=>({data:null}),then(resolve){resolve({data:mutation?null:table==='events'?[${JSON.stringify(event)}]:[]})}};return q}};
    }`});
   });
   await page.goto(`http://127.0.0.1:${server.address().port}/`);
   await page.getByRole('button',{name:'Open',exact:true}).click();
   await page.getByRole('button',{name:'Edit Event',exact:true}).waitFor({state:'visible'});
   assert(await page.getByRole('button',{name:'Guest Design',exact:true}).isVisible());
   assert(await page.getByRole('button',{name:'Copy Link',exact:true}).isVisible());
   await page.getByRole('button',{name:'Edit Event',exact:true}).click();
   assert.equal(await page.locator('#event-name').inputValue(),'Future event');
   assert(await page.locator('#event-all-day').isChecked());
   await page.locator('#event-all-day').uncheck();
   await page.locator('#event-start-time').fill('18:00');
   await page.locator('#event-end-time').fill('22:00');
   assert.equal(await page.locator('#event-end-time').inputValue(),'22:00');
   await page.locator('#cancel-create-event-button').click();
   await page.getByRole('button',{name:'Guest Design',exact:true}).click();
   await page.locator('#guest-design-modal').waitFor({state:'visible'});
   await page.locator('#close-guest-design-button').click();
   await page.screenshot({path:path.join(os.tmpdir(),`organizer-reliability-${width}.png`),fullPage:true});
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('Organizer UI: future-event QR/link/design controls and separate event editing passed at 390/1280px.');
 } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
