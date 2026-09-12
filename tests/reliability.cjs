const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('script.js','utf8');
function fn(name) {
 const start=source.search(new RegExp(`(?:async )?function ${name}\\(`));
 assert(start>=0,name);
 return source.slice(start,source.indexOf('\n}',start)+2);
}
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
(async()=>{
 const lib=await import('../reliability.js');
 assert.equal(lib.rigaDate(new Date('2026-09-11T21:30:00Z')),'2026-09-12');
 assert.equal(lib.shiftedRigaDate(-14,new Date('2026-09-11T21:30:00Z')),'2026-08-29');
 const rows=Array.from({length:5},(_,id)=>({id}));
 const query={select(){return this},eq(){return this},order(){return this},async range(start){return {data:rows.slice(start,start+2)}}};
 assert.equal((await lib.fetchEventPhotos({from:()=>query},'A')).length,5);

 const pending={id:'photo',eventId:'A',guestId:'guest',path:'A/photo',thumbPath:'A/thumb',original:{type:'image/jpeg',size:1},thumbnail:{type:'image/jpeg'}};
 let failThumb=true, completed=0; const uploads=[];
 const client={rpc:async name=>{if(name==='complete_photo_upload')completed++;return {};},storage:{from:()=>({upload:async path=>{uploads.push(path);return path.endsWith('thumb')&&failThumb?{error:Error('Offline')}:{}}})}};
 await assert.rejects(lib.resumePhotoUpload(client,pending,'bucket'));
 assert.equal(completed,0);
 failThumb=false; await lib.resumePhotoUpload(client,pending,'bucket');
 assert.deepEqual(uploads,['A/photo','A/thumb','A/thumb']); assert.equal(completed,1);
 const failedPrepare={rpc:async()=>({error:Error('DB unavailable')}),storage:{from:()=>{throw Error('Must not upload')}}};
 await assert.rejects(lib.resumePhotoUpload(failedPrepare,{...pending,registered:false},'bucket'),/DB unavailable/);
 const stages=[];
 const deletion={from:()=>({update(value){stages.push(value.status||'complete');return this},eq(){return this},select(){return this},single:async()=>({}),then(resolve){resolve({})}}),storage:{from:()=>({remove:async()=>{stages.push('storage');return {}}})}};
 await lib.deletePhotoFiles(deletion,{id:'P',storage_path:'A/photo'},'A','bucket');
 assert.deepEqual(stages,['deleted','storage','complete']);

 const context={console,Date,URL,Set,Error,supabase:{},fetch:async()=>({ok:true,blob:async()=>new Blob(['photo'])}),
 selectedEvent:{id:'A',slug:'event-a'},currentSession:{user:{id:'owner'}},currentEvents:[{id:'A'},{id:'B'}],
 currentGalleryPhotos:[{id:'filtered'}],allGalleryPhotos:[],galleryRequestToken:0,zipInProgress:false,preparedZip:null,
 downloadGalleryButton:{},galleryCount:{},galleryGuestFilter:{},gallerySort:{},galleryGrid:{},
 getCachedGallery:()=>null,setGalleryLoadingState(){},populateGalleryGuestFilter(){},applyGalleryControls(){},setCachedGallery(){},
 showMessage(){},updateDownloadGalleryState(){},canDownloadGalleryZip:()=>true,
 getPhotoOriginalSignedUrl:async p=>p.id,getUniqueZipPath:p=>p,EVENT_SELECT_FIELDS:'id',
 createSignedGalleryPhotos:async data=>data.map(p=>({...p,thumbSignedUrl:'thumb'})),
 fetchEventPhotos:()=>[],invalidateGalleryCache(){},
 };
 vm.createContext(context);
 vm.runInContext(['loadGallery','handleDownloadGallery','savePreparedZip'].map(fn).join('\n'),context);
 const a=deferred(), b=deferred();context.fetchEventPhotos=(_,id)=>id==='A'?a.promise:b.promise;
 const first=context.loadGallery('A'); context.selectedEvent={id:'B'};const second=context.loadGallery('B');
 b.resolve([{id:'b'}]);await second;a.resolve([{id:'a'}]);await first;
 assert.equal(context.allGalleryPhotos[0].id,'b','Late A response must not replace B');
 const request=deferred();context.selectedEvent={id:'A',slug:'event-a'};
 context.fetchEventPhotos=()=>request.promise;
 const exported=[];context.window={JSZip:class{file(path){exported.push(path)}async generateAsync(){return new Blob(['zip'])}}};
 const markers=[];context.supabase={from:()=>({update(){return this},eq(key,id){markers.push(id);return this},is(){return this},select(){return this},single:async()=>({data:{id:'A',zip_downloaded_at:'now'}})})};
 const downloads=[];context.triggerDownload=(url,name)=>downloads.push(name);
 const exporting=context.handleDownloadGallery();context.selectedEvent={id:'B'};
 request.resolve([{id:'1',storage_path:'1.jpg'},{id:'2',storage_path:'2.jpg'}]);await exporting;
 assert.deepEqual(exported,['1.jpg','2.jpg']);assert.deepEqual(markers,['A']);assert.equal(context.selectedEvent.id,'B');
 context.selectedEvent={id:'A'};await context.handleDownloadGallery();
 assert.equal(downloads.length,2);assert.equal(exported.length,2,'Retry must reuse blob');
 URL.revokeObjectURL(context.preparedZip.url);
 console.log('Reliability: pagination, Riga date, upload retry, deletion order, gallery race, ZIP completeness/event identity/blob retry passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
