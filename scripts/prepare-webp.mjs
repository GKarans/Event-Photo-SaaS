import { mkdir, copyFile } from 'node:fs/promises';
// Copy pinned upstream runtime assets without modifying third-party code.
const source = new URL('../node_modules/@jsquash/webp/', import.meta.url);
const target = new URL('../vendor/webp/', import.meta.url);
await mkdir(target, { recursive: true });
for (const [from, to] of [['codec/enc/webp_enc.js','webp_enc.js'],['codec/enc/webp_enc.wasm','webp_enc.wasm'],['meta.js','meta.js'],['LICENSE','LICENSE']]) {
    await copyFile(new URL(from, source), new URL(to, target));
}
