const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('r2-storage.js','utf8').replace("import { MEDIA_API_URL } from './storage-config.js';","const MEDIA_API_URL = 'https://media.example';");
 const {uploadR2Photo,mediaStorage}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
 const calls=[];let failFinalize=true;
 const originalFetch=global.fetch;
 global.fetch=async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/upload'))return Response.json({url:'https://r2.example/upload',headers:{'Content-Type':'image/webp'}});
  if(url.endsWith('/complete-photo')&&failFinalize){failFinalize=false;return new Response('',{status:503});}
  return Response.json({ready:true});
 };
 try{
  const client={auth:{getSession:async()=>({data:{session:null}})},rpc:async()=>({error:null})};
  const p={id:crypto.randomUUID(),eventId:crypto.randomUUID(),guestId:crypto.randomUUID(),path:'event/photo.webp',thumbPath:'event/thumb.webp',original:new Blob(['RIFF0000WEBP'],{type:'image/webp'}),thumbnail:new Blob(['RIFF0000WEBP'],{type:'image/webp'})};
  await assert.rejects(uploadR2Photo(client,p));
  assert(p.originalDone&&p.thumbnailDone);
  await uploadR2Photo(client,p);
  assert.equal(calls.filter(c=>c.options.method==='PUT').length,2,'Finalize retry must not resend files');
  assert.equal(calls.filter(c=>c.url.endsWith('/complete-photo')).length,2);
  const reservations=calls.filter(c=>c.url.endsWith('/upload')&&c.options.method==='POST').map(c=>JSON.parse(c.options.body));
  assert.equal(reservations[0].token,reservations[1].token);
  assert.equal(reservations[0].checksum.length,44);
  assert.equal(reservations[0].type,'image/webp');
  assert.equal(typeof mediaStorage(client,'event-photos').createSignedUrls,'function');
  console.log('R2 client: direct PUT, checksum, shared reservation token and finalize-only retry passed.');
 }finally{global.fetch=originalFetch;}
})().catch(error=>{console.error(error);process.exitCode=1});
