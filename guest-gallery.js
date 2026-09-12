export async function configureSharing(client, event, ended, message) {
    const host = document.getElementById('gallery-sharing');
    host.replaceChildren();
    host.classList.toggle('hidden', !ended || event.status === 'deleted');
    if (!ended || event.status === 'deleted') return;
    const { data, error } = await client.rpc('manage_gallery_share', { p_event: event.id });
    if (host.dataset.event !== event.id) return;
    if (error) {
        host.textContent = 'Gallery sharing is not available yet.';
        return;
    }
    const label = document.createElement('label');
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = data.enabled;
    label.append(toggle, ' Share gallery');
    const info = document.createElement('p');
    info.textContent = data.enabled
        ? `Available until ${new Date(data.expires_at).toLocaleDateString()}. ${data.requests_used} / ${data.request_limit} requests used.`
        : 'Share photos through the existing event link for up to 7 days, within 14 days after the event. Anyone with the link can view and download photos.';
    const link = document.createElement('a');
    link.href = `${location.origin}/event/${encodeURIComponent(event.slug)}`;
    link.textContent = 'Open guest link';
    toggle.addEventListener('change', async () => {
        toggle.disabled = true;
        const result = await client.rpc('manage_gallery_share', { p_event: event.id, p_enabled: toggle.checked });
        if (result.error) message('Could not update sharing. Please try again.', 'error');
        await configureSharing(client, event, ended, message);
    });
    host.append(label, info, link);
}

export async function openGuestGallery(baseUrl, slug, guestPanel, mediaEndpoint = '') {
    const endpoint = mediaEndpoint || `${baseUrl}/functions/v1/guest-gallery`;
    const url = params => `${endpoint}?${new URLSearchParams({ slug, ...params })}`;
    let initial;
    try {
        const response = await fetch(url({}));
        if (!response.ok) {
            const detail = await response.json();
            return detail.closed ? 'closed' : false;
        }
        initial = await response.json();
    } catch { return false; }
    guestPanel.classList.add('hidden');
    document.body.classList.remove('is-guest-view');
    document.body.classList.add('is-shared-gallery');
    const host = document.createElement('section');
    host.className = 'shared-gallery';
    host.innerHTML = `<div class="gallery-controls"><label>Guest <select id="shared-guest"><option value="">All guests</option></select></label><label>Sort <select id="shared-sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div><p role="status"></p><div class="gallery-grid"></div><button class="secondary-button" type="button">Load more</button>`;
    document.querySelector('main').append(host);
    const filter = host.querySelector('#shared-guest');
    const sort = host.querySelector('#shared-sort');
    const status = host.querySelector('[role="status"]');
    const grid = host.querySelector('.gallery-grid');
    const more = host.querySelector('button');
    for (const name of initial.guests) filter.add(new Option(name, name));
    let offset = 0;
    let generation = 0;
    const dialog = document.createElement('dialog');
    dialog.className = 'shared-photo-dialog';
    dialog.innerHTML = '<button type="button" aria-label="Close preview" autofocus>Close</button><img alt="Event photo"><button type="button">Download photo</button><p role="status"></p>';
    document.body.append(dialog);
    const preview = dialog.querySelector('img');
    const [close, download] = dialog.querySelectorAll('button');
    let blobUrl;
    let previewGeneration = 0;
    close.onclick = () => dialog.close();
    dialog.onclose = () => {
        previewGeneration++;
        preview.removeAttribute('src');
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        blobUrl = null;
    };
    async function open(photo) {
        dialog.showModal();
        const version = ++previewGeneration;
        download.disabled = true;
        const note = dialog.querySelector('p');
        note.textContent = 'Loading photo...';
        try {
            const response = await fetch(url({ photo: photo.id, full: '1' }));
            if (!response.ok) throw new Error();
            const blob = await response.blob();
            if (version !== previewGeneration) return;
            blobUrl = URL.createObjectURL(blob);
            preview.src = blobUrl;
            note.textContent = '';
            download.disabled = false;
            download.onclick = () => {
                const anchor = document.createElement('a');
                anchor.href = blobUrl;
                anchor.download = `event-photo-${photo.id}.jpg`;
                anchor.click();
            };
        } catch { if (version === previewGeneration) note.textContent = 'Photo unavailable. Sharing may have ended, or the connection was lost.'; }
    }
    function render(data) {
        for (const photo of data.photos) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'shared-photo';
            button.setAttribute('aria-label', `Open photo by ${photo.guest}`);
            const image = document.createElement('img');
            image.loading = 'lazy';
            image.alt = `Photo by ${photo.guest}`;
            image.src = url({ photo: photo.id });
            image.onerror = () => { status.textContent = 'Some photos are unavailable. Sharing may have ended or reached its limit.'; };
            const caption = document.createElement('span');
            caption.textContent = `${photo.guest} · ${new Date(photo.created_at).toLocaleDateString()}`;
            button.append(image, caption);
            button.onclick = () => open(photo);
            grid.append(button);
        }
        offset += data.photos.length;
        more.hidden = data.photos.length < 24;
        status.textContent = offset ? '' : 'No photos to display.';
    }
    async function load(reset) {
        const version = ++generation;
        if (reset) { offset = 0; grid.replaceChildren(); }
        more.disabled = true;
        status.textContent = 'Loading photos...';
        try {
            const response = await fetch(url({ offset: String(offset), guest: filter.value, sort: sort.value }));
            if (!response.ok) throw new Error();
            const data = await response.json();
            if (version === generation) render(data);
        } catch { if (version === generation) status.textContent = 'Gallery unavailable. Check your connection or contact the organizer.'; }
        finally { if (version === generation) more.disabled = false; }
    }
    more.onclick = () => load(false);
    filter.onchange = sort.onchange = () => load(true);
    render(initial);
    return true;
}
