import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ojcvnsbhphvijmzjfenl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5tHxxBuBgQJagyqIKuVVyg_2ZtruZ6J";
const PHOTO_BUCKET = "event-photos";
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

const authPanel = document.getElementById("auth-panel");
const dashboardPanel = document.getElementById("dashboard-panel");
const authForm = document.getElementById("auth-form");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const submitButton = document.getElementById("submit-button");
const formHint = document.getElementById("form-hint");
const logoutButton = document.getElementById("logout-button");
const userEmail = document.getElementById("user-email");
const messageBox = document.getElementById("message");
const eventForm = document.getElementById("event-form");
const eventNameInput = document.getElementById("event-name");
const eventDateInput = document.getElementById("event-date");
const createEventButton = document.getElementById("create-event-button");
const eventsList = document.getElementById("events-list");
const eventsCount = document.getElementById("events-count");
const eventsListHeader = document.getElementById("events-list-header");
const eventDetail = document.getElementById("event-detail");
const backToEventsButton = document.getElementById("back-to-events-button");
const eventDetailTitle = document.getElementById("event-detail-title");
const eventDetailDate = document.getElementById("event-detail-date");
const eventDetailStatus = document.getElementById("event-detail-status");
const eventDetailUrl = document.getElementById("event-detail-url");
const qrImage = document.getElementById("qr-image");
const copyEventLinkButton = document.getElementById("copy-event-link-button");
const downloadQrButton = document.getElementById("download-qr-button");
const guestPanel = document.getElementById("guest-panel");
const guestEventTitle = document.getElementById("guest-event-title");
const guestEventDate = document.getElementById("guest-event-date");
const guestForm = document.getElementById("guest-form");
const guestNameInput = document.getElementById("guest-name");
const photoPanel = document.getElementById("photo-panel");
const guestDisplayName = document.getElementById("guest-display-name");
const changeGuestButton = document.getElementById("change-guest-button");
const takePhotoButton = document.getElementById("take-photo-button");
const photoInput = document.getElementById("photo-input");
const uploadState = document.getElementById("upload-state");

let authMode = "login";
let currentSession = null;
let currentEvents = [];
let selectedEvent = null;
let currentGuest = null;
const activeEventSlug = getEventSlugFromPath();

loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));
authForm.addEventListener("submit", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);
eventForm.addEventListener("submit", handleCreateEvent);
eventsList.addEventListener("click", handleEventsListClick);
backToEventsButton.addEventListener("click", showEventsList);
copyEventLinkButton.addEventListener("click", handleCopyEventLink);
downloadQrButton.addEventListener("click", handleDownloadQr);
guestForm.addEventListener("submit", handleGuestStart);
changeGuestButton.addEventListener("click", handleChangeGuest);
takePhotoButton.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", handlePhotoSelected);

supabase.auth.onAuthStateChange((_event, session) => {
    if (activeEventSlug) {
        return;
    }

    renderSession(session);
});

if (activeEventSlug) {
    await renderGuestRoute(activeEventSlug);
} else {
    const { data: initialSessionData } = await supabase.auth.getSession();
    renderSession(initialSessionData.session);
}

function setAuthMode(mode) {
    authMode = mode;
    const isLogin = mode === "login";

    loginTab.classList.toggle("is-active", isLogin);
    registerTab.classList.toggle("is-active", !isLogin);
    submitButton.textContent = isLogin ? "Login" : "Register";
    formHint.textContent = isLogin
        ? "Pieslēdzies kā organizators, lai vēlāk pārvaldītu savus pasākumus."
        : "Izveido organizatora kontu. Ja Supabase prasa e-pasta apstiprinājumu, pārbaudi inbox.";

    hideMessage();
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showMessage("Ievadi e-pastu un paroli.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = authMode === "login" ? "Pieslēdzam..." : "Reģistrējam...";

    const { data, error } = authMode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    submitButton.disabled = false;
    submitButton.textContent = authMode === "login" ? "Login" : "Register";

    if (error) {
        showMessage(toFriendlyAuthError(error.message), "error");
        return;
    }

    if (authMode === "register" && !data.session) {
        showMessage("Konts izveidots. Pārbaudi e-pastu un apstiprini reģistrāciju.", "success");
        return;
    }

    showMessage("Autentifikācija izdevās.", "success");
}

async function handleLogout() {
    logoutButton.disabled = true;
    const { error } = await supabase.auth.signOut();
    logoutButton.disabled = false;

    if (error) {
        showMessage("Neizdevās izrakstīties. Mēģini vēlreiz.", "error");
        return;
    }

    showMessage("Tu esi izrakstījies.", "success");
}

function renderSession(session) {
    const isLoggedIn = Boolean(session?.user);
    currentSession = session;

    authPanel.classList.toggle("hidden", isLoggedIn);
    dashboardPanel.classList.toggle("hidden", !isLoggedIn);
    userEmail.textContent = isLoggedIn ? session.user.email : "";

    if (isLoggedIn) {
        loadEvents();
    } else {
        currentEvents = [];
        selectedEvent = null;
        renderEvents([]);
        showEventsList();
    }
}

async function renderGuestRoute(slug) {
    authPanel.classList.add("hidden");
    dashboardPanel.classList.add("hidden");
    guestPanel.classList.remove("hidden");
    hideMessage();

    guestEventTitle.textContent = "Ielādējam pasākumu...";
    guestEventDate.textContent = "";

    const { data, error } = await supabase
        .from("events")
        .select("id,name,date,slug,status")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
        guestEventTitle.textContent = "Neizdevās ielādēt pasākumu";
        showMessage(toFriendlyDatabaseError(error.message), "error");
        return;
    }

    if (!data) {
        guestEventTitle.textContent = "Pasākums nav atrasts";
        guestEventDate.textContent = "Pārbaudi QR kodu vai saiti.";
        guestForm.classList.add("hidden");
        return;
    }

    selectedEvent = data;
    guestEventTitle.textContent = data.name;
    guestEventDate.textContent = data.date ? formatDate(data.date) : "Foto augšupielāde viesiem";

    const savedGuest = loadSavedGuest(data.slug);

    if (savedGuest?.event_id === data.id) {
        currentGuest = savedGuest;
        showPhotoPanel(savedGuest.name);
    }
}

async function handleGuestStart(event) {
    event.preventDefault();

    const guestName = guestNameInput.value.trim();

    if (!guestName) {
        showMessage("Ievadi savu vārdu.", "error");
        return;
    }

    if (!selectedEvent?.id) {
        showMessage("Pasākums nav ielādēts. Atsvaidzini lapu un mēģini vēlreiz.", "error");
        return;
    }

    const startButton = document.getElementById("guest-start-button");
    startButton.disabled = true;
    startButton.textContent = "Sagatavojam...";

    const guestId = createClientId();

    const { error } = await supabase
        .from("guests")
        .insert({
            id: guestId,
            event_id: selectedEvent.id,
            name: guestName
        });

    startButton.disabled = false;
    startButton.textContent = "Start";

    if (error) {
        showMessage(toFriendlyDatabaseError(error.message), "error");
        return;
    }

    currentGuest = {
        id: guestId,
        event_id: selectedEvent.id,
        name: guestName
    };
    saveGuest(selectedEvent.slug, currentGuest);
    showPhotoPanel(currentGuest.name);
    showMessage("Vari sākt uzņemt foto.", "success");
}

function handleChangeGuest() {
    if (selectedEvent?.slug) {
        localStorage.removeItem(getGuestStorageKey(selectedEvent.slug));
    }

    currentGuest = null;
    photoPanel.classList.add("hidden");
    guestForm.classList.remove("hidden");
    guestNameInput.focus();
    hideUploadState();
    hideMessage();
}

async function handlePhotoSelected() {
    const file = photoInput.files?.[0];
    photoInput.value = "";

    if (!file) {
        return;
    }

    if (!selectedEvent?.id || !currentGuest?.id) {
        showMessage("Pirms foto uzņemšanas ievadi savu vārdu.", "error");
        return;
    }

    const validationError = validatePhoto(file);

    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    takePhotoButton.disabled = true;
    showUploadState("Augšupielādējam foto...");

    const storagePath = createStoragePath(file);

    const { error: uploadError } = await supabase
        .storage
        .from(PHOTO_BUCKET)
        .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error("Storage upload error", uploadError);
        takePhotoButton.disabled = false;
        showUploadState("Upload neizdevās.");
        showMessage(toFriendlyStorageError(uploadError.message), "error");
        return;
    }

    const { error: mediaError } = await supabase
        .from("media")
        .insert({
            event_id: selectedEvent.id,
            guest_id: currentGuest.id,
            storage_path: storagePath,
            file_type: file.type,
            file_size: file.size,
            status: "uploaded"
        });

    takePhotoButton.disabled = false;

    if (mediaError) {
        console.error("Media insert error", mediaError);
        showUploadState("Foto saglabāts storage, bet metadata ieraksts neizdevās.");
        showMessage(toFriendlyDatabaseError(mediaError.message), "error");
        return;
    }

    showUploadState("Photo uploaded! Vari uzņemt nākamo foto.");
    showMessage("Photo uploaded!", "success");
}

async function handleCreateEvent(event) {
    event.preventDefault();

    if (!currentSession?.user) {
        showMessage("Lai izveidotu pasākumu, vispirms pieslēdzies.", "error");
        return;
    }

    const name = eventNameInput.value.trim();
    const date = eventDateInput.value || null;

    if (!name) {
        showMessage("Ievadi pasākuma nosaukumu.", "error");
        return;
    }

    createEventButton.disabled = true;
    createEventButton.textContent = "Saglabājam...";

    const slug = createSlug(name);

    const { error } = await supabase
        .from("events")
        .insert({
            owner_id: currentSession.user.id,
            name,
            date,
            slug,
            status: "active"
        });

    createEventButton.disabled = false;
    createEventButton.textContent = "Create Event";

    if (error) {
        showMessage(toFriendlyDatabaseError(error.message), "error");
        return;
    }

    eventForm.reset();
    showMessage("Pasākums izveidots.", "success");
    await loadEvents();
}

async function loadEvents() {
    if (!currentSession?.user) {
        return;
    }

    eventsCount.textContent = "Ielādējam pasākumus...";
    eventsList.innerHTML = "";

    const { data, error } = await supabase
        .from("events")
        .select("id,name,date,slug,status,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        eventsCount.textContent = "Pasākumus neizdevās ielādēt.";
        showMessage(toFriendlyDatabaseError(error.message), "error");
        return;
    }

    renderEvents(data || []);
}

function renderEvents(events) {
    if (!eventsList || !eventsCount) {
        return;
    }

    eventsList.innerHTML = "";
    currentEvents = events;

    if (!currentSession?.user) {
        eventsCount.textContent = "";
        return;
    }

    if (!events.length) {
        eventsCount.textContent = "Tev vēl nav pasākumu.";
        eventsList.innerHTML = `
            <div class="empty-state">
                <strong>Nav izveidotu pasākumu</strong>
                <span>Sāc ar pirmo pasākumu, lai vēlāk ģenerētu QR kodu.</span>
            </div>
        `;
        return;
    }

    eventsCount.textContent = `${events.length} pasākums${events.length === 1 ? "" : "i"}`;

    const fragment = document.createDocumentFragment();

    for (const event of events) {
        const card = document.createElement("article");
        card.className = "event-card";

        const eventUrl = `${window.location.origin}/event/${event.slug}`;
        const eventDate = event.date ? formatDate(event.date) : "Datums nav norādīts";

        card.innerHTML = `
            <div>
                <h3></h3>
                <p></p>
            </div>
            <div class="event-meta">
                <span class="status-pill"></span>
                <code></code>
            </div>
            <button class="secondary-button open-event-button" type="button"></button>
        `;

        card.dataset.eventId = event.id;
        card.querySelector("h3").textContent = event.name;
        card.querySelector("p").textContent = eventDate;
        card.querySelector(".status-pill").textContent = event.status;
        card.querySelector("code").textContent = eventUrl;
        card.querySelector(".open-event-button").textContent = "Open";
        fragment.appendChild(card);
    }

    eventsList.appendChild(fragment);
}

function handleEventsListClick(event) {
    const button = event.target.closest(".open-event-button");

    if (!button) {
        return;
    }

    const card = button.closest(".event-card");
    const eventData = currentEvents.find(item => item.id === card?.dataset.eventId);

    if (!eventData) {
        showMessage("Pasākumu neizdevās atrast sarakstā.", "error");
        return;
    }

    showEventDetail(eventData);
}

async function showEventDetail(eventData) {
    selectedEvent = eventData;
    const eventUrl = getEventUrl(eventData);

    eventsListHeader.classList.add("hidden");
    eventsList.classList.add("hidden");
    eventForm.classList.add("hidden");
    eventDetail.classList.remove("hidden");

    eventDetailTitle.textContent = eventData.name;
    eventDetailDate.textContent = eventData.date ? formatDate(eventData.date) : "Datums nav norādīts";
    eventDetailStatus.textContent = eventData.status;
    eventDetailUrl.textContent = eventUrl;

    await renderQrCode(eventUrl);
}

function showEventsList() {
    selectedEvent = null;
    eventDetail.classList.add("hidden");
    eventForm.classList.remove("hidden");
    eventsListHeader.classList.remove("hidden");
    eventsList.classList.remove("hidden");
}

async function renderQrCode(value) {
    const createQrCode = window.qrcode;

    if (!createQrCode) {
        showMessage("QR bibliotēku neizdevās ielādēt. Pārbaudi interneta savienojumu.", "error");
        return;
    }

    const qr = createQrCode(0, "M");
    qr.addData(value);
    qr.make();
    qrImage.src = qr.createDataURL(8, 10);
}

async function handleCopyEventLink() {
    if (!selectedEvent) {
        return;
    }

    const eventUrl = getEventUrl(selectedEvent);

    try {
        await navigator.clipboard.writeText(eventUrl);
        showMessage("Event saite nokopēta.", "success");
    } catch (_error) {
        showMessage("Neizdevās nokopēt saiti. Iezīmē un nokopē URL manuāli.", "error");
    }
}

function handleDownloadQr() {
    if (!selectedEvent) {
        return;
    }

    const link = document.createElement("a");
    link.download = `${selectedEvent.slug}-qr.png`;
    link.href = qrImage.src;
    link.click();
}

function showPhotoPanel(guestName) {
    guestDisplayName.textContent = guestName;
    guestNameInput.value = guestName;
    guestForm.classList.add("hidden");
    photoPanel.classList.remove("hidden");
    hideUploadState();
}

function validatePhoto(file) {
    if (!file.type.startsWith("image/")) {
        return "Atļauti tikai foto faili.";
    }

    if (file.size > MAX_PHOTO_SIZE) {
        return "Foto ir pārāk liels. Maksimālais izmērs ir 10 MB.";
    }

    return "";
}

function createStoragePath(file) {
    const extension = getFileExtension(file);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `${selectedEvent.id}/${currentGuest.id}/${timestamp}-${randomPart}.${extension}`;
}

function getFileExtension(file) {
    const extensionFromName = file.name.split(".").pop()?.toLowerCase();

    if (extensionFromName && /^[a-z0-9]{2,5}$/.test(extensionFromName)) {
        return extensionFromName;
    }

    const extensionByType = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/heic": "heic",
        "image/heif": "heif"
    };

    return extensionByType[file.type] || "jpg";
}

function saveGuest(slug, guest) {
    localStorage.setItem(
        getGuestStorageKey(slug),
        JSON.stringify({
            id: guest.id,
            event_id: guest.event_id,
            name: guest.name
        })
    );
}

function loadSavedGuest(slug) {
    try {
        const value = localStorage.getItem(getGuestStorageKey(slug));
        const guest = value ? JSON.parse(value) : null;

        if (!guest?.id || !guest?.name) {
            return null;
        }

        return guest;
    } catch (_error) {
        return null;
    }
}

function getGuestStorageKey(slug) {
    return `event-photo-saas:guest:${slug}`;
}

function showUploadState(text) {
    uploadState.textContent = text;
    uploadState.classList.remove("hidden");
}

function hideUploadState() {
    uploadState.textContent = "";
    uploadState.classList.add("hidden");
}

function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
}

function hideMessage() {
    messageBox.textContent = "";
    messageBox.className = "message hidden";
}

function toFriendlyAuthError(message) {
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login")) {
        return "Nepareizs e-pasts vai parole.";
    }

    if (normalized.includes("password")) {
        return "Parole neatbilst prasībām. Izmanto vismaz 6 simbolus.";
    }

    if (normalized.includes("email")) {
        return "Pārbaudi e-pasta adresi vai apstiprinājuma statusu.";
    }

    return "Autentifikācija neizdevās. Mēģini vēlreiz.";
}

function toFriendlyDatabaseError(message) {
    const normalized = message.toLowerCase();

    if (normalized.includes("duplicate") || normalized.includes("unique")) {
        return "Šāds pasākuma URL jau eksistē. Pamēģini nedaudz citu nosaukumu.";
    }

    if (normalized.includes("violates foreign key")) {
        return "Lietotāja profils datubāzē vēl nav sagatavots. Palaid atjaunoto Supabase SQL shēmu un mēģini vēlreiz.";
    }

    if (normalized.includes("row-level security")) {
        return "Datubāzes drošības noteikumi neļāva šo darbību. Pārbaudi, vai Supabase SQL shēma ir palaista.";
    }

    return "Datu saglabāšana neizdevās. Pārbaudi Supabase konfigurāciju un mēģini vēlreiz.";
}

function toFriendlyStorageError(message) {
    const normalized = message.toLowerCase();

    if (normalized.includes("row-level security") || normalized.includes("unauthorized")) {
        return `Storage drošības noteikumi neļāva augšupielādi: ${message}`;
    }

    if (normalized.includes("exceeded") || normalized.includes("too large")) {
        return "Foto ir pārāk liels. Maksimālais izmērs ir 10 MB.";
    }

    return "Foto augšupielāde neizdevās. Pārbaudi interneta savienojumu un mēģini vēlreiz.";
}

function createSlug(name) {
    const base = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base || "event"}-${suffix}`;
}

function createClientId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, char =>
        (Number(char) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(char) / 4).toString(16)
    );
}

function getEventUrl(eventData) {
    return `${window.location.origin}/event/${eventData.slug}`;
}

function getEventSlugFromPath() {
    const match = window.location.pathname.match(/^\/event\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : "";
}

function formatDate(dateValue) {
    return new Intl.DateTimeFormat("lv-LV", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(`${dateValue}T00:00:00`));
}
