const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
    const source = fs.readFileSync('dist/storage-config.js', 'utf8');
    try {
        for (const [origin, enabled] of [['https://event-photo-saas.netlify.app', true], ['http://127.0.0.1:5604', true], ['https://untrusted.example', false]]) {
            global.location = { origin };
            const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${encodeURIComponent(origin)}`);
            assert.equal(Boolean(module.MEDIA_API_URL), enabled);
        }
    } finally { delete global.location; }
    for (const file of ['.env', '.env.r2', 'cloudflare', 'supabase', 'scripts', 'docs', 'node_modules']) {
        assert(!fs.existsSync(`dist/${file}`), `Private/server file in release: ${file}`);
    }
    for (const file of ['script.js','storage-config.js','r2-storage.js','reliability.js','guest-gallery.js','webp-worker.js','webp-encode.js','vendor/webp/webp_enc.wasm']) {
        assert(fs.statSync(`dist/${file}`).size > 0);
    }
    console.log('Release: production/local R2 enabled, other origins disabled, static assets present and server files excluded.');
})().catch(error => { console.error(error); process.exitCode = 1; });
