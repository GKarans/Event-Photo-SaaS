import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ojcvnsbhphvijmzjfenl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5tHxxBuBgQJagyqIKuVVyg_2ZtruZ6J";

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

let authMode = "login";
let currentSession = null;

loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));
authForm.addEventListener("submit", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);
eventForm.addEventListener("submit", handleCreateEvent);

supabase.auth.onAuthStateChange((_event, session) => {
    renderSession(session);
});

const { data: initialSessionData } = await supabase.auth.getSession();
renderSession(initialSessionData.session);

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
        renderEvents([]);
    }
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
        `;

        card.querySelector("h3").textContent = event.name;
        card.querySelector("p").textContent = eventDate;
        card.querySelector(".status-pill").textContent = event.status;
        card.querySelector("code").textContent = eventUrl;
        fragment.appendChild(card);
    }

    eventsList.appendChild(fragment);
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

function formatDate(dateValue) {
    return new Intl.DateTimeFormat("lv-LV", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(`${dateValue}T00:00:00`));
}
