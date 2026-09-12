import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const encoder = new TextEncoder();
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const base64 = bytes => btoa(String.fromCharCode(...bytes));
const hex = bytes => [...bytes].map(n => n.toString(16).padStart(2, '0')).join('');
const digest = async value => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export function services(env) {
    const client = new S3Client({ region: 'auto', endpoint: env.R2_ENDPOINT,
        credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
        requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' });
    const db = async (route, body, method = 'POST') => {
        const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${route}`, {
            method, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json', Prefer: 'return=representation' },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) throw new Error('Database request failed');
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    };
    return { client, db, rpc: (name, args) => db(`rpc/${name}`, args) };
}

async function owner(request, env) {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return null;
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: authorization, apikey: env.SUPABASE_SERVICE_ROLE_KEY }, signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error('Invalid session');
    return (await response.json()).id;
}

async function signature(env, payload) {
    if (!env.MEDIA_SIGNING_SECRET || env.MEDIA_SIGNING_SECRET.length < 32) throw new Error('Missing configuration');
    const key = await crypto.subtle.importKey('raw', encoder.encode(env.MEDIA_SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return hex(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))));
}

async function objectRow(db, path) {
    return (await db(`r2_objects?path=eq.${encodeURIComponent(path)}&limit=1`, undefined, 'GET'))[0];
}

async function readObject(env, api, path) {
    const row = await objectRow(api.db, path);
    if (row) {
        if (row.status !== 'ready') return json({ error: 'Photo unavailable.' }, 404);
        const file = await api.client.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: row.object_key }));
        return new Response(file.Body.transformToWebStream(), { headers: { 'Content-Type': row.file_type } });
    }
    // Transitional path only: old photos still incur Supabase Storage egress.
    const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/authenticated/event-photos/${path.split('/').map(encodeURIComponent).join('/')}`, {
        headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY }, signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) return json({ error: 'Photo unavailable.' }, 404);
    return new Response(response.body, { headers: { 'Content-Type': response.headers.get('Content-Type') || 'image/jpeg' } });
}

export async function handle(request, env, api = services(env)) {
    const url = new URL(request.url);
    if (url.pathname === '/guest-gallery' && request.method === 'GET') {
        const q = url.searchParams;
        const slug = q.get('slug') || '';
        const photo = q.get('photo');
        if (!/^[a-zA-Z0-9-]{1,200}$/.test(slug) || (photo && !uuid(photo))) return json({ error: 'Gallery unavailable.' }, 400);
        const data = await api.rpc('guest_gallery_access', { p_slug: slug, p_photo: photo,
            p_full: q.get('full') === '1', p_offset: Math.max(0, Math.min(100000, Number(q.get('offset')) || 0)),
            p_guest: (q.get('guest') || '').slice(0, 80), p_oldest: q.get('sort') === 'oldest' });
        if (!data || data.closed) return json(data || { error: 'Gallery unavailable.' }, 403);
        return photo ? (data.path ? readObject(env, api, data.path) : json({ error: 'Photo unavailable.' }, 404)) : json(data);
    }
    if (url.pathname === '/object' && request.method === 'GET') {
        const payload = url.searchParams.get('access') || '';
        const sig = url.searchParams.get('signature') || '';
        if (payload.length > 2000 || sig !== await signature(env, payload)) return json({ error: 'Link expired.' }, 403);
        const access = JSON.parse(payload);
        if (!Number.isFinite(access.expires) || access.expires < Date.now()
            || !await api.rpc('r2_path_allowed', { p_path: access.path, p_owner: access.owner, p_remove: false })) return json({ error: 'Photo unavailable.' }, 403);
        return readObject(env, api, access.path);
    }
    if (request.method !== 'POST') return json({ error: 'Not found.' }, 404);
    const raw = await request.text();
    if (raw.length > 100000) return json({ error: 'Request too large.' }, 413);
    const body = JSON.parse(raw);
    const user = await owner(request, env);
    if (url.pathname === '/sign') {
        if (!Array.isArray(body.paths) || body.paths.length > 100) return json({ error: 'Invalid request.' }, 400);
        const rows = [];
        for (const path of body.paths) {
            if (!await api.rpc('r2_path_allowed', { p_path: path, p_owner: user, p_remove: false })) {
                rows.push({ path, signedUrl: null, error: 'Photo unavailable.' }); continue;
            }
            const payload = JSON.stringify({ path, owner: user, expires: Date.now() + Math.max(1, Math.min(3600, Number(body.seconds) || 300)) * 1000 });
            rows.push({ path, signedUrl: `${url.origin}/object?${new URLSearchParams({ access: payload, signature: await signature(env, payload) })}` });
        }
        return json(rows);
    }
    if (url.pathname === '/upload') {
        if (!uuid(body.token) || (body.media && (!uuid(body.media) || !uuid(body.guest)))) return json({ error: 'Invalid upload.' }, 400);
        const row = await api.rpc('reserve_r2_object', { p_path: body.path, p_media: body.media || null, p_guest: body.guest || null,
            p_owner: user, p_checksum: body.checksum, p_token: await digest(body.token), p_size: body.size, p_type: body.type });
        if (row.status === 'ready') return json({ ready: true });
        // The signed checksum prevents a still-valid URL from replacing a ready photo with different bytes.
        const headers = { 'Content-Type': row.file_type, 'x-amz-checksum-sha256': row.checksum };
        const signed = await getSignedUrl(api.client, new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: row.object_key,
            ContentType: row.file_type, ContentLength: Number(row.file_size), ChecksumSHA256: row.checksum }), {
            expiresIn: 300, unhoistableHeaders: new Set(['x-amz-checksum-sha256']), signableHeaders: new Set(['content-type', 'content-length'])
        });
        return json({ url: signed, headers });
    }
    if (url.pathname === '/complete-object') {
        if (!uuid(body.token)) return json({ error: 'Invalid upload.' }, 400);
        const row = await objectRow(api.db, body.path);
        if (!row || row.status === 'deleted' || row.token_hash !== await digest(body.token)) return json({ error: 'Upload unavailable.' }, 403);
        if (row.status === 'ready') return json({ ready: true });
        const file = await api.client.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: row.object_key }));
        if (Number(file.ContentLength) !== Number(row.file_size) || file.ContentType !== 'image/webp') throw new Error('Invalid object');
        const bytes = await file.Body.transformToByteArray();
        const checksum = base64(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)));
        const header = new TextDecoder().decode(bytes.slice(0, 12));
        if (checksum !== row.checksum || !header.startsWith('RIFF') || header.slice(8, 12) !== 'WEBP') throw new Error('Invalid photo');
        await api.db(`r2_objects?path=eq.${encodeURIComponent(body.path)}&status=eq.uploading`, { status: 'ready' }, 'PATCH');
        return json({ ready: true });
    }
    if (url.pathname === '/complete-photo') {
        if (!uuid(body.media) || !uuid(body.token)) return json({ error: 'Invalid upload.' }, 400);
        await api.rpc('complete_r2_photo', { p_media: body.media, p_token: await digest(body.token) });
        return json({ ready: true });
    }
    if (url.pathname === '/remove') {
        if (!user || !Array.isArray(body.paths) || body.paths.length > 100) return json({ error: 'Not allowed.' }, 403);
        for (const path of body.paths) {
            if (!await api.rpc('r2_path_allowed', { p_path: path, p_owner: user, p_remove: true })) return json({ error: 'Not allowed.' }, 403);
        }
        for (const path of body.paths) {
            const row = await objectRow(api.db, path);
            if (row) {
                await api.db(`r2_objects?path=eq.${encodeURIComponent(path)}`, { status: 'deleted' }, 'PATCH');
                await api.client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: row.object_key }));
            } else {
                const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/event-photos`, {
                    method: 'DELETE', headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prefixes: [path] }), signal: AbortSignal.timeout(30000)
                });
                if (!response.ok) throw new Error('Removal failed');
            }
        }
        return json({ removed: true });
    }
    return json({ error: 'Not found.' }, 404);
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin');
        const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
        if (origin && !allowed.includes(origin)) return json({ error: 'Origin not allowed.' }, 403);
        let response;
        try { response = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await handle(request, env); }
        catch { response = json({ error: 'Photo service is unavailable. Please try again.' }, 503); }
        const headers = new Headers(response.headers);
        if (origin) headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Vary', 'Origin');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        headers.set('Cache-Control', 'no-store');
        headers.set('X-Content-Type-Options', 'nosniff');
        return new Response(response.body, { status: response.status, headers });
    }
};
