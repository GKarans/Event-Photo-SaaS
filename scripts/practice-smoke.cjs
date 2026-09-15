// Read-only public checks. Never uses an organizer session or uploads media.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const site = 'https://event-photo-saas.netlify.app';
const worker = 'https://event-photo-media.gkarans-events.workers.dev';
const output = path.resolve('docs/evidence/20260915');
const report = { recordedAt: new Date().toISOString(), scope: 'Anonymous read-only public smoke; not authenticated E2E or physical-device testing', checks: [], screenshots: [] };
const hash = body => crypto.createHash('sha256').update(body).digest('hex');
async function check(name, run) {
  try { report.checks.push({ name, ...await run() }); }
  catch (error) { report.checks.push({ name, status: 'ERROR', detail: error.message }); }
}
(async () => {
  await fs.mkdir(output, { recursive: true });
  for (const route of ['/', '/auth/confirmed', '/auth/reset-password']) {
    await check(`GET ${route}`, async () => {
      const response = await fetch(site + route, { signal: AbortSignal.timeout(30000) });
      return { status: response.ok ? 'PASS' : 'FAIL', httpStatus: response.status, contentType: response.headers.get('content-type') };
    });
  }
  for (const file of ['index.html', 'script.js', 'storage-config.js', 'r2-storage.js']) {
    await check(`Published asset ${file}`, async () => {
      const response = await fetch(`${site}/${file}`, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
      const remote = Buffer.from(await response.arrayBuffer());
      const local = await fs.readFile(path.resolve('dist', file));
      return { status: response.ok && hash(remote) === hash(local) ? 'PASS' : 'REVIEW', httpStatus: response.status, localSha256: hash(local), publishedSha256: hash(remote) };
    });
  }
  await check('Worker production-origin preflight', async () => {
    const response = await fetch(`${worker}/sign`, { method: 'OPTIONS', signal: AbortSignal.timeout(30000), headers: { Origin: site, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
    const allowedOrigin = response.headers.get('access-control-allow-origin');
    return { status: response.status === 204 && allowedOrigin === site ? 'PASS' : 'FAIL', httpStatus: response.status, allowedOrigin };
  });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const width of [390, 1280]) {
      await check(`Public login Chromium ${width}px`, async () => {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        try {
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          await page.goto(site, { waitUntil: 'networkidle', timeout: 45000 });
          const loginVisible = await page.getByRole('button', { name: 'Login', exact: true }).first().isVisible();
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
          const filename = `production-login-${width}.png`;
          await page.screenshot({ path: path.join(output, filename), fullPage: true });
          report.screenshots.push(filename);
          return { status: loginVisible && !overflow && !errors.length ? 'PASS' : 'FAIL', loginVisible, horizontalOverflow: overflow, errors };
        } finally { await page.close(); }
      });
    }
  } finally {
    if (browser) await browser.close();
    await fs.writeFile(path.join(output, 'public-smoke.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  }
  if (report.checks.some(check => ['FAIL', 'ERROR'].includes(check.status))) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
