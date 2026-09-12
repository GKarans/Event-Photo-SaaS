import { r2Enabled, uploadR2Photo, mediaStorage } from './r2-storage.js';

export async function fetchEventPhotos(client, eventId, pageSize = 200) {
    const photos = [];
    // Stable ordering and actual page length also support a lower API row cap.
    for (;;) {
        const { data, error } = await client.from('media')
            .select('id,event_id,storage_path,thumbnail_path,file_type,file_size,created_at,guests(name)')
            .eq('event_id', eventId).eq('status', 'uploaded')
            .order('created_at', { ascending: false }).order('id', { ascending: false })
            .range(photos.length, photos.length + pageSize - 1);
        if (error) throw error;
        if (!data?.length) return photos;
        photos.push(...data);
    }
}

export function rigaDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Riga', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const value = type => parts.find(part => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
}

export function shiftedRigaDate(days, date = new Date()) {
    const calendar = new Date(`${rigaDate(date)}T12:00:00Z`);
    calendar.setUTCDate(calendar.getUTCDate() + days);
    return calendar.toISOString().slice(0, 10);
}

export async function resumePhotoUpload(client, pending, bucket) {
    if (r2Enabled) return uploadR2Photo(client, pending);
    const p = pending;
    if (!p.registered) {
        const { error } = await client.rpc('prepare_photo_upload', {
            p_id:p.id,p_event:p.eventId,p_guest:p.guestId,p_path:p.path,p_thumb:p.thumbPath,
            p_type:p.original.type,p_size:p.original.size
        });
        if (error) throw error;
        p.registered = true;
    }
    for (const [flag,path,file] of [['originalDone',p.path,p.original],['thumbnailDone',p.thumbPath,p.thumbnail]]) {
        if (p[flag]) continue;
        const { error } = await client.storage.from(bucket).upload(path,file,{
            upsert:false,contentType:file.type,cacheControl:'604800'
        });
        // A lost successful response can be retried using the same reserved path.
        if (error && !(String(error.statusCode)==='409' || /already exists|duplicate/i.test(error.message || ''))) throw error;
        p[flag]=true;
    }
    const { error } = await client.rpc('complete_photo_upload',{p_id:p.id});
    if (error) throw error;
}

export async function deletePhotoFiles(client, photo, eventId, bucket) {
    // Hide first. Any later failure leaves a durable retryable deletion record.
    const marked = await client.from('media').update({status:'deleted'})
        .eq('id',photo.id).eq('event_id',eventId).select('id').single();
    if (marked.error) throw marked.error;
    const removal = await mediaStorage(client, bucket).remove([photo.storage_path,photo.thumbnail_path].filter(Boolean));
    if (removal.error) throw removal.error;
    const completed = await client.from('media').update({storage_deleted_at:new Date().toISOString()})
        .eq('id',photo.id).eq('event_id',eventId);
    if (completed.error) throw completed.error;
}

export async function retryStorageCleanup(client,eventId,bucket) {
    for (const status of ['deleted','uploading']) {
        let query=client.from('media').select('id,storage_path,thumbnail_path').eq('event_id',eventId)
            .eq('status',status).is('storage_deleted_at',null).order('created_at').limit(50);
        if (status==='uploading') query=query.lt('created_at',new Date(Date.now()-86400000).toISOString());
        const result=await query;
        if(result.error) throw result.error;
        for(const photo of result.data || []) await deletePhotoFiles(client,photo,eventId,bucket);
    }
    const event = await client.from('events').select('cover_image_path').eq('id',eventId).single();
    if(event.error) throw event.error;
    const jobs = await client.from('cover_cleanup').select('id,path').eq('event_id',eventId)
        .lt('created_at',new Date(Date.now()-86400000).toISOString()).order('created_at').limit(50);
    if(jobs.error) throw jobs.error;
    for(const job of jobs.data || []) {
        if(job.path!==event.data.cover_image_path) {
            const removed=await mediaStorage(client, bucket).remove([job.path]);
            if(removed.error) throw removed.error;
        }
        const done=await client.from('cover_cleanup').delete().eq('id',job.id);
        if(done.error) throw done.error;
    }
}
