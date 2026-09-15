const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

(async () => {
    const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), 'event-photo-build-'));
    const files = ['index.html', 'style.css', 'favicon.svg', 'script.js', 'guest-gallery.js',
        'reliability.js', 'r2-storage.js', 'storage-config.js', 'event-timing.js', 'webp-encode.js', 'webp-worker.js'];
    try {
        await fs.mkdir(path.join(sandbox, 'scripts'));
        await fs.copyFile('scripts/build-site.mjs', path.join(sandbox, 'scripts/build-site.mjs'));
        for (const file of files) await fs.writeFile(path.join(sandbox, file), `fixture ${file}`);
        await fs.mkdir(path.join(sandbox, 'vendor/webp'), { recursive: true });
        for (const file of ['webp_enc.js', 'webp_enc.wasm', 'meta.js', 'LICENSE']) {
            await fs.writeFile(path.join(sandbox, 'vendor/webp', file), `fixture ${file}`);
        }
        await fs.writeFile(path.join(sandbox, 'netlify.toml'), 'root config must remain');
        const run = () => spawnSync(process.execPath, ['scripts/build-site.mjs'], { cwd: sandbox, encoding: 'utf8' });
        let result = run();
        assert.equal(result.status, 0, result.stderr);
        await fs.writeFile(path.join(sandbox, 'dist/netlify.toml'), 'stale deploy config');
        result = run();
        assert.equal(result.status, 0, result.stderr);
        await assert.rejects(fs.stat(path.join(sandbox, 'dist/netlify.toml')), { code: 'ENOENT' });
        assert.equal(await fs.readFile(path.join(sandbox, 'netlify.toml'), 'utf8'), 'root config must remain');
        assert.equal(await fs.readFile(path.join(sandbox, 'dist/index.html'), 'utf8'), 'fixture index.html');
        assert.equal(run().status, 0);
        await fs.writeFile(path.join(sandbox, 'dist/.env'), 'fixture secret');
        result = run();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Unexpected build output: .env/);
        assert.equal(await fs.readFile(path.join(sandbox, 'dist/.env'), 'utf8'), 'fixture secret');
        await fs.unlink(path.join(sandbox, 'dist/.env'));
        await fs.mkdir(path.join(sandbox, 'dist/netlify.toml'));
        result = run();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Unexpected non-file build output: netlify.toml/);
        console.log('Build: clean/repeated builds, stale Netlify config removal, root config preservation and unexpected-file rejection passed.');
    } finally {
        const resolved = path.resolve(sandbox);
        if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('event-photo-build-')) {
            throw new Error('Refusing to remove unexpected fixture path');
        }
        await fs.rm(resolved, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
