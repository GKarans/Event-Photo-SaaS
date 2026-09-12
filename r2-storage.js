import { MEDIA_API_URL } from './storage-config.js';

export const r2Enabled = Boolean(MEDIA_API_URL);
export const guestGalleryEndpoint = MEDIA_API_URL ? `${MEDIA_API_URL}/guest-gallery` : '';

export async function mediaRequest(client, route, body) {
    const { data } = await client.auth.getSession();
    const response = await fetch(`${MEDIA_API_URL}${route}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json',
            ...(data?.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
        body: JSON.stringify(body), signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error('Photo service is unavailable. Please try again.');
    return response.json();
}

async function uploadObject(client, path, file, context) {
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
    const checksum = btoa(String.fromCharCode(...bytes));
    const reservation = await mediaRequest(client, '/upload', { ...context, path, size: file.size, checksum, type: file.type });
    if (!reservation.ready) {
        const response = await fetch(reservation.url, {
            method: 'PUT', headers: reservation.headers, body: file, signal: AbortSignal.timeout(120000)
        });
        if (!response.ok) throw new Error('Upload failed. Please try again.');
        await mediaRequest(client, '/complete-object', { path, token: context.token });
    }
}

export async function uploadR2Photo(client, p) {
    p.token ||= crypto.randomUUID();
    if (!p.registered) {
        const { error } = await client.rpc('prepare_photo_upload', {
            p_id: p.id, p_event: p.eventId, p_guest: p.guestId, p_path: p.path,
            p_thumb: p.thumbPath, p_type: p.original.type, p_size: p.original.size
        });
        if (error) throw error;
        p.registered = true;
    }
    for (const [flag, path, file] of [['originalDone', p.path, p.original], ['thumbnailDone', p.thumbPath, p.thumbnail]]) {
        if (p[flag]) continue;
        await uploadObject(client, path, file, { media: p.id, guest: p.guestId, token: p.token });
        p[flag] = true;
    }
    await mediaRequest(client, '/complete-photo', { media: p.id, token: p.token });
}

export function mediaStorage(client, bucket) {
    if (!r2Enabled) return client.storage.from(bucket);
    const result = async action => {
        try { return { data: await action(), error: null }; }
        catch (error) { return { data: null, error }; }
    };
    return {
        createSignedUrl: (path, seconds) => result(() => mediaRequest(client, '/sign', { paths: [path], seconds }).then(rows => rows[0])),
        createSignedUrls: (paths, seconds) => result(async () => {
            const rows = [];
            for (let i = 0; i < paths.length; i += 100) rows.push(...await mediaRequest(client, '/sign', { paths: paths.slice(i, i + 100), seconds }));
            return rows;
        }),
        remove: paths => result(() => mediaRequest(client, '/remove', { paths })),
        upload: (path, file) => result(() => uploadObject(client, path, file, { token: crypto.randomUUID() }))
    };
}
