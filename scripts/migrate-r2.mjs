// Read-only inventory unless --apply is supplied. Never deletes source objects.
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createHash, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const env = process.env;
const args = process.argv.slice(2);
const event = args.find(value => /^[0-9a-f-]{36}$/i.test(value));
if (!event) throw new Error('Usage: node --env-file=.env.r2 scripts/migrate-r2.mjs EVENT_UUID [--apply]');
for (const name of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']) if (!env[name]) throw new Error(`Missing ${name}`);
const db = async (route, body) => {
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${route}`, { method: body ? 'POST' : 'GET',
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`Database request failed (${r.status})`);
    return r.status === 201 || r.status === 204 ? null : r.json();
};
const e = (await db(`events?id=eq.${event}&select=id,storage_folder,cover_image_path`))[0];
if (!e) throw new Error('Event not found');
const paths = new Map();
let offset = 0;
for (;;) {
    const photos = await db(`media?event_id=eq.${event}&status=eq.uploaded&select=id,guest_id,storage_path,thumbnail_path&order=id&limit=200&offset=${offset}`);
    if (!photos.length) break;
    for (const photo of photos) for (const p of [photo.storage_path,photo.thumbnail_path].filter(Boolean)) {
        if (p.split('/')[0] !== e.storage_folder || p.split('/').includes('..')) throw new Error('Unsafe photo path');
        if (!/^[0-9a-f-]{36}$/i.test(photo.guest_id || '')) throw new Error('Photo has no valid guest ID; investigate before migration');
        paths.set(p, {id:photo.id,guest:photo.guest_id,thumbnail:p===photo.thumbnail_path});
    }
    offset += photos.length;
}
if (e.cover_image_path) {
    if (!e.cover_image_path.startsWith(`event-covers/${event}/`) || e.cover_image_path.split('/').includes('..')) throw new Error('Unsafe cover path');
    paths.set(e.cover_image_path, null);
}
console.log(`Event ${event}: ${paths.size} referenced objects. ${args.includes('--apply') ? 'COPY AND VERIFY' : 'DRY RUN: no file downloads, copies or deletions'}`);
if (!args.includes('--apply')) process.exit(0);
for (const name of ['R2_ENDPOINT','R2_BUCKET','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY']) if (!env[name]) throw new Error(`Missing ${name}`);
const s3 = new S3Client({region:'auto',endpoint:env.R2_ENDPOINT,credentials:{accessKeyId:env.R2_ACCESS_KEY_ID,secretAccessKey:env.R2_SECRET_ACCESS_KEY},requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'});
const manifest = [];
const manifestFile = `.env.r2-manifest-${event}.json`;
const checksum = bytes => createHash('sha256').update(bytes).digest('base64');
for (const [path,media] of paths) {
    const existing = (await db(`r2_objects?path=eq.${encodeURIComponent(path)}`))[0];
    if (existing) {
        if (existing.status !== 'ready') throw new Error('Existing reservation is not ready; investigate before migration');
        const stored = await s3.send(new GetObjectCommand({Bucket:env.R2_BUCKET,Key:existing.object_key}));
        if (checksum(await stored.Body.transformToByteArray()) !== existing.checksum) throw new Error('Existing R2 checksum mismatch');
        manifest.push({path,key:existing.object_key,status:'already-verified'});
        continue;
    }
    const source = await fetch(`${env.SUPABASE_URL}/storage/v1/object/authenticated/event-photos/${path.split('/').map(encodeURIComponent).join('/')}`, {
        headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`},signal:AbortSignal.timeout(120000)
    });
    if (!source.ok) throw new Error(`Source object unavailable (${source.status}); source remains untouched`);
    const bytes = new Uint8Array(await source.arrayBuffer());
    const type = (source.headers.get('Content-Type') || '').split(';')[0];
    if (!['image/jpeg','image/png','image/webp'].includes(type) || bytes.length > 6291456) throw new Error('Legacy file needs separate validation');
    const extension = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type];
    const prefix = media ? `events/${event}/guests/${media.guest}/${media.thumbnail ? 'thumb' : 'photo'}-` : `events/${event}/covers/`;
    const key = `${prefix}${randomUUID()}.${extension}`;
    const hash = checksum(bytes);
    // Save the key before upload so an interrupted copy can be investigated.
    manifest.push({path,key,status:'copying'});
    await writeFile(manifestFile,JSON.stringify(manifest,null,2));
    await s3.send(new PutObjectCommand({Bucket:env.R2_BUCKET,Key:key,Body:bytes,ContentType:type,ChecksumSHA256:hash}));
    const target = await s3.send(new GetObjectCommand({Bucket:env.R2_BUCKET,Key:key}));
    if (checksum(await target.Body.transformToByteArray()) !== hash) throw new Error('Verification failed; database remains unchanged');
    await db('r2_objects',{path,event_id:event,media_id:media?.id ?? null,object_key:key,checksum:hash,token_hash:createHash('sha256').update(randomUUID()).digest('hex'),file_size:bytes.length,file_type:type,status:'ready'});
    manifest.at(-1).status='verified';
    await writeFile(manifestFile,JSON.stringify(manifest,null,2));
    console.log(`Verified ${manifest.length}/${paths.size}`);
}
console.log(`Done. Local manifest: ${manifestFile}. Supabase source files were NOT deleted.`);
