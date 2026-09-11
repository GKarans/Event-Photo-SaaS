import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, apikey, authorization', 'Cache-Control': 'no-store' };
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  const fail = (status: number) => new Response(JSON.stringify({ error: 'Gallery is unavailable.' }), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
  if (request.method !== 'GET') return fail(405);
  try {
    const query = new URL(request.url).searchParams;
    const slug = query.get('slug') || '';
    const photo = query.get('photo');
    if (!/^[a-zA-Z0-9-]{1,200}$/.test(slug) || (photo && !/^[0-9a-f-]{36}$/i.test(photo))) return fail(400);
    const { data, error } = await admin.rpc('guest_gallery_access', {
      p_slug: slug, p_photo: photo, p_full: query.get('full') === '1',
      p_offset: Math.max(0, Math.min(100000, Number(query.get('offset')) || 0)),
      p_guest: (query.get('guest') || '').slice(0, 80), p_oldest: query.get('sort') === 'oldest'
    });
    if (error || !data) return fail(403);
    if (data.closed) return new Response(JSON.stringify(data), { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } });
    if (!photo) return new Response(JSON.stringify(data), { headers: { ...headers, 'Content-Type': 'application/json' } });
    if (!data.path) return fail(404);
    const { data: file, error: fileError } = await admin.storage.from('event-photos').download(data.path);
    if (fileError || !file) return fail(404);
    return new Response(file, { headers: { ...headers, 'Content-Type': file.type || 'image/jpeg', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return fail(503); }
});
