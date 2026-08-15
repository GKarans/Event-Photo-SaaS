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

let authMode = "login";

loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));
authForm.addEventListener("submit", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);

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

    authPanel.classList.toggle("hidden", isLoggedIn);
    dashboardPanel.classList.toggle("hidden", !isLoggedIn);
    userEmail.textContent = isLoggedIn ? session.user.email : "";
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
