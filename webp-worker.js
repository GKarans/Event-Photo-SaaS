import createEncoder from './vendor/webp/webp_enc.js';
import { defaultOptions } from './vendor/webp/meta.js';
const encoder = createEncoder({ noInitialRun: true });
self.onmessage = async ({ data }) => {
    try {
        const module = await encoder;
        const result = module.encode(data.pixels, data.width, data.height, { ...defaultOptions, quality: data.quality * 100 });
        if (!result) throw new Error('Encoding failed');
        const bytes = result.slice();
        self.postMessage({ bytes: bytes.buffer }, [bytes.buffer]);
    } catch { self.postMessage({ error: 'Could not prepare photo.' }); }
};
