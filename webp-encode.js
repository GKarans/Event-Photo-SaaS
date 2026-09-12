// Used only when the browser cannot natively encode WebP (notably some Safari versions).
export function encodeWebpFallback(canvas, quality) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./webp-worker.js', import.meta.url), { type: 'module' });
        const finish = (error, bytes) => {
            clearTimeout(timer);
            worker.terminate();
            if (error) reject(new Error('Could not prepare photo.'));
            else resolve(new Blob([bytes], { type: 'image/webp' }));
        };
        const timer = setTimeout(() => finish(true), 120000);
        worker.onerror = () => finish(true);
        worker.onmessage = ({ data }) => finish(data.error, data.bytes);
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        worker.postMessage({ pixels, width: canvas.width, height: canvas.height, quality }, [pixels.buffer]);
    });
}
