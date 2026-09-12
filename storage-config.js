// Explicit origins prevent previews/tests from accidentally using production storage.
const r2Origins = ['https://event-photo-saas.netlify.app', 'http://127.0.0.1:5604'];
export const MEDIA_API_URL = typeof location !== 'undefined' && r2Origins.includes(location.origin)
    ? 'https://event-photo-media.gkarans-events.workers.dev' : '';
