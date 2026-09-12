import { mkdir, copyFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const target = new URL('../dist/', import.meta.url);
await mkdir(target, { recursive: true });
const files = ['index.html', 'style.css', 'favicon.svg', 'script.js', 'guest-gallery.js',
    'reliability.js', 'r2-storage.js', 'storage-config.js', 'event-timing.js', 'webp-encode.js', 'webp-worker.js'];
// Fail on unexpected leftovers instead of publishing unknown files or deleting local work.
const allowed = new Set([...files, 'vendor']);
for (const entry of await readdir(target)) {
    if (!allowed.has(entry)) throw new Error(`Unexpected build output: ${entry}`);
}
for (const file of files) await copyFile(new URL(file, root), new URL(file, target));
await mkdir(new URL('vendor/webp/', target), { recursive: true });
const vendorFiles = ['webp_enc.js', 'webp_enc.wasm', 'meta.js', 'LICENSE'];
for (const entry of await readdir(new URL('vendor/', target))) {
    if (entry !== 'webp') throw new Error(`Unexpected vendor output: ${entry}`);
}
for (const entry of await readdir(new URL('vendor/webp/', target))) {
    if (!vendorFiles.includes(entry)) throw new Error(`Unexpected codec output: ${entry}`);
}
for (const file of vendorFiles) await copyFile(new URL(`vendor/webp/${file}`, root), new URL(`vendor/webp/${file}`, target));
console.log('Static site built in dist; no server code, environment files or documentation published.');
