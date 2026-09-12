const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
    const browser = await chromium.launch();
    try {
        for (const width of [320, 390, 430, 768, 1280]) {
            const page = await browser.newPage({ viewport: { width, height: 844 } });
            await page.route('**/*', route => route.fulfill({ body: '', contentType: 'text/javascript' }));
            await page.setContent(fs.readFileSync('index.html', 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
            await page.addStyleTag({ content: fs.readFileSync('style.css', 'utf8') });
            for (const photo of [false, true]) {
                for (const title of ['Test.retake.photo', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456', 'Test 3 cover foto']) {
                    await page.evaluate(({ photo, title }) => {
                        const panel = document.querySelector('#guest-panel');
                        document.body.classList.add('is-guest-view');
                        for (const child of panel.parentElement.children) {
                            if (child !== panel && !child.classList.contains('theme-toggle')) child.classList.add('hidden');
                        }
                        panel.classList.remove('hidden', 'is-status-mode');
                        panel.classList.toggle('is-photo-mode', photo);
                        panel.classList.toggle('has-long-title', title.length > 20);
                        panel.classList.toggle('has-very-long-title', title.length > 40);
                        document.querySelector('#guest-event-title').textContent = title;
                        document.querySelector('#guest-event-date').textContent = '12 September 2026';
                        document.querySelector('#guest-form').classList.toggle('hidden', photo);
                        document.querySelector('#photo-panel').classList.toggle('hidden', !photo);
                        document.querySelector('#guest-display-name').textContent = 'Test Guest';
                    }, { photo, title });
                    const boxes = await page.evaluate(() => {
                        const rect = selector => {
                            const r = document.querySelector(selector).getBoundingClientRect();
                            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, center: r.left + r.width / 2 };
                        };
                        const h = document.querySelector('#guest-event-title');
                        return { heading: rect('#guest-event-title'), panel: rect('#guest-panel'), logo: rect('.guest-product-mark'), fits: h.scrollWidth <= h.clientWidth + 1 };
                    });
                    assert(boxes.fits, `Heading overflow: ${width}/${photo}/${title}`);
                    assert(Math.abs(boxes.heading.center - boxes.panel.center) < 2, `Heading not centered: ${width}`);
                    assert(boxes.heading.left >= boxes.logo.right || boxes.heading.top >= boxes.logo.bottom, `Logo overlap: ${width}`);
                }
            }
            await page.screenshot({ path: path.join(os.tmpdir(), `guest-heading-${width}.png`) });
            await page.close();
        }
        console.log('Guest heading: centered, wrapped, clear of logo at 320/390/430/768/1280px in both states.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
