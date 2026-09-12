const http=require('node:http');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const server=http.createServer((req,res)=>{
  const allowed=['/webp-encode.js','/webp-worker.js','/vendor/webp/webp_enc.js','/vendor/webp/webp_enc.wasm','/vendor/webp/meta.js'];
  if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<html><body></body></html>');return;}
  if(!allowed.includes(req.url)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',req.url.endsWith('.wasm')?'application/wasm':'text/javascript');res.end(fs.readFileSync('.'+req.url));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch();const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result=await page.evaluate(async()=>{
   const {encodeWebpFallback}=await import('/webp-encode.js');
   const c=document.createElement('canvas');c.width=64;c.height=48;c.getContext('2d').fillRect(0,0,64,48);
   const blob=await encodeWebpFallback(c,.75);
   const image=await createImageBitmap(blob);
   return {type:blob.type,width:image.width,height:image.height,header:new TextDecoder().decode((await blob.arrayBuffer()).slice(8,12))};
  });
  assert.deepEqual(result,{type:'image/webp',width:64,height:48,header:'WEBP'});
  console.log('WebP fallback: real WASM encode in browser worker, decoded dimensions and MIME passed.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1});
