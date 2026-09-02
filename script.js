import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ojcvnsbhphvijmzjfenl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5tHxxBuBgQJagyqIKuVVyg_2ZtruZ6J";
const APP_URL = "https://event-photo-saas.netlify.app";
const PHOTO_BUCKET = "event-photos";
const MAX_PHOTO_SIZE_MB = 6;
const MAX_PHOTO_SIZE = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const ORIGINAL_IMAGE_MAX_DIMENSION = 2200;
const ORIGINAL_IMAGE_QUALITY = 0.82;
const THUMBNAIL_IMAGE_MAX_DIMENSION = 560;
const THUMBNAIL_IMAGE_QUALITY = 0.72;
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 10;
const GALLERY_CACHE_TTL_MS = 8 * 60 * 1000;
const GALLERY_RENDER_BATCH_SIZE = 24;
const EVENT_SELECT_FIELDS = "id,name,date,start_date,end_date,slug,status,storage_folder,guest_title,guest_subtitle,guest_button_text,cover_image_path,cover_position_x,cover_position_y,cover_zoom,zip_downloaded_at,created_at";
const PUBLIC_EVENT_SELECT_FIELDS = "id,name,date,start_date,end_date,slug,status,storage_folder,guest_title,guest_subtitle,guest_button_text,cover_image_path,cover_position_x,cover_position_y,cover_zoom";
const EVENT_SELECT_FIELDS_WITHOUT_ZOOM = "id,name,date,start_date,end_date,slug,status,storage_folder,guest_title,guest_subtitle,guest_button_text,cover_image_path,cover_position_x,cover_position_y,created_at";
const PUBLIC_EVENT_SELECT_FIELDS_WITHOUT_ZOOM = "id,name,date,start_date,end_date,slug,status,storage_folder,guest_title,guest_subtitle,guest_button_text,cover_image_path,cover_position_x,cover_position_y";
const LEGACY_EVENT_SELECT_FIELDS = "id,name,date,start_date,end_date,slug,status,storage_folder,created_at";
const LEGACY_PUBLIC_EVENT_SELECT_FIELDS = "id,name,date,start_date,end_date,slug,status,storage_folder";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

const authPanel = document.getElementById("auth-panel");
const authConfirmationPanel = document.getElementById("auth-confirmation-panel");
const dashboardPanel = document.getElementById("dashboard-panel");
const authForm = document.getElementById("auth-form");
const registerFields = document.getElementById("register-fields");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const submitButton = document.getElementById("submit-button");
const formHint = document.getElementById("form-hint");
const goToLoginButton = document.getElementById("go-to-login-button");
const logoutButton = document.getElementById("logout-button");
const dashboardTitle = document.getElementById("dashboard-title");
const userEmail = document.getElementById("user-email");
const messageBox = document.getElementById("message");
const openCreateEventButton = document.getElementById("open-create-event-button");
const createEventModal = document.getElementById("create-event-modal");
const eventForm = document.getElementById("event-form");
const eventModalTitle = document.getElementById("event-modal-title");
const eventModalDescription = document.getElementById("event-modal-description");
const eventNameInput = document.getElementById("event-name");
const eventStartDateInput = document.getElementById("event-start-date");
const eventEndDateInput = document.getElementById("event-end-date");
const createEventButton = document.getElementById("create-event-button");
const closeCreateEventButton = document.getElementById("close-create-event-button");
const cancelCreateEventButton = document.getElementById("cancel-create-event-button");
const eventsControls = document.getElementById("events-controls");
const eventSearchInput = document.getElementById("event-search");
const eventStatusFilter = document.getElementById("event-status-filter");
const eventSort = document.getElementById("event-sort");
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
const editEventButton = document.getElementById("edit-event-button");
const toggleEventStatusButton = document.getElementById("toggle-event-status-button");
const copyEventLinkButton = document.getElementById("copy-event-link-button");
const downloadQrButton = document.getElementById("download-qr-button");
const guestDesignModal = document.getElementById("guest-design-modal");
const guestDesignForm = document.getElementById("guest-design-form");
const closeGuestDesignButton = document.getElementById("close-guest-design-button");
const guestCoverInput = document.getElementById("guest-cover-input");
const guestCoverPositionXInput = document.getElementById("guest-cover-position-x");
const guestCoverPositionYInput = document.getElementById("guest-cover-position-y");
const guestCoverZoomInput = document.getElementById("guest-cover-zoom");
const guestDesignTitleInput = document.getElementById("guest-design-title-input");
const guestDesignSubtitleInput = document.getElementById("guest-design-subtitle-input");
const guestDesignButtonInput = document.getElementById("guest-design-button-input");
const saveGuestDesignButton = document.getElementById("save-guest-design-button");
const resetGuestDesignButton = document.getElementById("reset-guest-design-button");
const guestPreviewCover = document.getElementById("guest-preview-cover");
const guestPreviewTitle = document.getElementById("guest-preview-title");
const guestPreviewDate = document.getElementById("guest-preview-date");
const guestPreviewSubtitle = document.getElementById("guest-preview-subtitle");
const guestPreviewButton = document.getElementById("guest-preview-button");
const galleryGrid = document.getElementById("gallery-grid");
const galleryCount = document.getElementById("gallery-count");
const downloadGalleryButton = document.getElementById("download-gallery-button");
const galleryGuestFilter = document.getElementById("gallery-guest-filter");
const gallerySort = document.getElementById("gallery-sort");
const clearGalleryFiltersButton = document.getElementById("clear-gallery-filters-button");
const photoDialog = document.getElementById("photo-dialog");
const closePreviewButton = document.getElementById("close-preview-button");
const previewPrevButton = document.getElementById("preview-prev-button");
const previewNextButton = document.getElementById("preview-next-button");
const previewImage = document.getElementById("preview-image");
const previewTitle = document.getElementById("preview-title");
const previewSubtitle = document.getElementById("preview-subtitle");
const downloadPhotoButton = document.getElementById("download-photo-button");
const deletePhotoButton = document.getElementById("delete-photo-button");
const confirmModal = document.getElementById("confirm-modal");
const confirmForm = document.getElementById("confirm-form");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmDetail = document.getElementById("confirm-detail");
const confirmCloseButton = document.getElementById("confirm-close-button");
const confirmCancelButton = document.getElementById("confirm-cancel-button");
const confirmActionButton = document.getElementById("confirm-action-button");
const guestPanel = document.getElementById("guest-panel");
const guestCover = document.getElementById("guest-cover");
const guestEventTitle = document.getElementById("guest-event-title");
const guestEventSubtitle = document.getElementById("guest-event-subtitle");
const guestEventDate = document.getElementById("guest-event-date");
const guestForm = document.getElementById("guest-form");
const guestNameInput = document.getElementById("guest-name");
const guestStartButton = document.getElementById("guest-start-button");
const photoPanel = document.getElementById("photo-panel");
const guestDisplayName = document.getElementById("guest-display-name");
const changeGuestButton = document.getElementById("change-guest-button");
const takePhotoButton = document.getElementById("take-photo-button");
const photoInput = document.getElementById("photo-input");
const uploadState = document.getElementById("upload-state");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleLabel = document.getElementById("theme-toggle-label");

let authMode = "login";
let currentSession = null;
let currentEvents = [];
let selectedEvent = null;
let currentGuest = null;
let editingEventId = "";
let allGalleryPhotos = [];
let currentGalleryPhotos = [];
let currentPreviewIndex = -1;
let previewTouchStartX = 0;
let galleryRenderToken = 0;
let selectedGuestCoverFile = null;
let selectedGuestCoverPreviewUrl = "";
let shouldRemoveGuestCover = false;
let messageHideTimeout = null;
let uploadStateHideTimeout = null;
let pendingConfirmResolve = null;
const galleryCache = new Map();
const activeEventSlug = getEventSlugFromPath();
const isAuthConfirmationRoute = window.location.pathname === "/auth/confirmed";

syncThemeToggle();
themeToggle.addEventListener("click", handleThemeToggle);
loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));
goToLoginButton.addEventListener("click", handleGoToLogin);
authForm.addEventListener("submit", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);
openCreateEventButton.addEventListener("click", openCreateEventModal);
closeCreateEventButton.addEventListener("click", closeCreateEventModal);
cancelCreateEventButton.addEventListener("click", closeCreateEventModal);
eventForm.addEventListener("submit", handleCreateEvent);
eventStartDateInput.addEventListener("change", handleEventStartDateChange);
eventSearchInput.addEventListener("input", renderFilteredEvents);
eventStatusFilter.addEventListener("change", renderFilteredEvents);
eventSort.addEventListener("change", renderFilteredEvents);
eventsList.addEventListener("click", handleEventsListClick);
eventsList.addEventListener("keydown", handleEventsListKeydown);
backToEventsButton.addEventListener("click", showEventsList);
copyEventLinkButton.addEventListener("click", handleCopyEventLink);
editEventButton.addEventListener("click", handleEditSelectedEvent);
toggleEventStatusButton.addEventListener("click", handleToggleSelectedEventStatus);
downloadQrButton.addEventListener("click", handleDownloadQr);
closeGuestDesignButton.addEventListener("click", closeGuestDesignModal);
guestDesignForm.addEventListener("submit", handleSaveGuestDesign);
guestCoverInput.addEventListener("change", handleGuestCoverSelected);
guestCoverPositionXInput.addEventListener("input", updateGuestDesignPreview);
guestCoverPositionYInput.addEventListener("input", updateGuestDesignPreview);
guestCoverZoomInput.addEventListener("input", updateGuestDesignPreview);
guestDesignTitleInput.addEventListener("input", updateGuestDesignPreview);
guestDesignSubtitleInput.addEventListener("input", updateGuestDesignPreview);
guestDesignButtonInput.addEventListener("input", updateGuestDesignPreview);
resetGuestDesignButton.addEventListener("click", handleResetGuestDesign);
downloadGalleryButton.addEventListener("click", handleDownloadGallery);
galleryGuestFilter.addEventListener("change", applyGalleryControls);
gallerySort.addEventListener("change", applyGalleryControls);
clearGalleryFiltersButton.addEventListener("click", handleClearGalleryFilters);
galleryGrid.addEventListener("click", handleGalleryClick);
closePreviewButton.addEventListener("click", closePhotoPreview);
previewPrevButton.addEventListener("click", () => showAdjacentPhoto(-1));
previewNextButton.addEventListener("click", () => showAdjacentPhoto(1));
downloadPhotoButton.addEventListener("click", handleDownloadPhoto);
deletePhotoButton.addEventListener("click", handleDeletePhoto);
photoDialog.addEventListener("click", handlePreviewBackdropClick);
photoDialog.addEventListener("close", syncDialogOpenState);
photoDialog.addEventListener("touchstart", handlePreviewTouchStart, { passive: true });
photoDialog.addEventListener("touchend", handlePreviewTouchEnd);
confirmCloseButton.addEventListener("click", () => closeConfirmModal(false));
confirmCancelButton.addEventListener("click", () => closeConfirmModal(false));
confirmActionButton.addEventListener("click", () => closeConfirmModal(true));
confirmModal.addEventListener("click", handleConfirmBackdropClick);
confirmModal.addEventListener("close", () => closeConfirmModal(false));
document.addEventListener("keydown", handlePreviewKeydown);
guestForm.addEventListener("submit", handleGuestStart);
changeGuestButton.addEventListener("click", handleChangeGuest);
takePhotoButton.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", handlePhotoSelected);

function handleThemeToggle() {
    const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("eventPhotoTheme", nextTheme);
    syncThemeToggle();
}

function syncThemeToggle() {
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const nextTheme = theme === "dark" ? "light" : "dark";

    themeToggleLabel.textContent = `${capitalizeFirstLetter(nextTheme)} mode`;
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
}

function capitalizeFirstLetter(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

supabase.auth.onAuthStateChange((_event, session) => {
    if (activeEventSlug || isAuthConfirmationRoute) {
        return;
    }

    renderSession(session);
});

if (isAuthConfirmationRoute) {
    await renderAuthConfirmationRoute();
} else if (activeEventSlug) {
    await renderGuestRoute(activeEventSlug);
} else {
    setEventDateLimits();
    const { data: initialSessionData } = await supabase.auth.getSession();
    renderSession(initialSessionData.session);
}

function setAuthMode(mode) {
    authMode = mode;
    const isLogin = mode === "login";

    loginTab.classList.toggle("is-active", isLogin);
    registerTab.classList.toggle("is-active", !isLogin);
    registerFields.classList.toggle("hidden", isLogin);
    firstNameInput.required = !isLogin;
    lastNameInput.required = !isLogin;
    submitButton.textContent = isLogin ? "Login" : "Register";
    formHint.textContent = isLogin
        ? "Log in as an organizer to manage your events and photo galleries."
        : "Create an organizer account. If email confirmation is enabled, check your inbox.";

    hideMessage();
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (authMode === "register" && (!firstName || !lastName)) {
        showMessage("Enter your first and last name.", "error");
        return;
    }

    if (!email || !password) {
        showMessage("Enter your email and password.", "error");
        return;
    }

    const defaultText = authMode === "login" ? "Login" : "Register";
    setButtonLoading(submitButton, true, authMode === "login" ? "Logging in..." : "Registering...");

    try {
        const { data, error } = authMode === "login"
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${APP_URL}/auth/confirmed`,
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`.trim()
                    }
                }
            });

        if (error) {
            showMessage(toFriendlyAuthError(error.message), "error");
            return;
        }

        if (authMode === "register" && !data.session) {
            showMessage("Account created. Check your email to confirm registration.", "success");
            return;
        }

        showMessage("Authentication successful.", "success");
    } catch (error) {
        console.error("Auth request error", error);
        showMessage("Could not reach the authentication service. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(submitButton, false, defaultText);
    }
}

async function renderAuthConfirmationRoute() {
    setPageMode("auth");
    authPanel.classList.add("hidden");
    dashboardPanel.classList.add("hidden");
    guestPanel.classList.add("hidden");
    authConfirmationPanel.classList.remove("hidden");
    hideMessage();

    const confirmationCode = new URLSearchParams(window.location.search).get("code");

    try {
        if (confirmationCode) {
            const { error } = await supabase.auth.exchangeCodeForSession(confirmationCode);

            if (error) {
                throw error;
            }

            history.replaceState({}, "", "/auth/confirmed");
            return;
        }

        await supabase.auth.getSession();
    } catch (error) {
        console.error("Email confirmation session error", error);
        showMessage("Email was confirmed, but the session could not be opened automatically. Use the login form.", "error");
    }
}

async function handleGoToLogin() {
    await supabase.auth.signOut();
    history.replaceState({}, "", "/");
    setPageMode("auth");
    authConfirmationPanel.classList.add("hidden");
    dashboardPanel.classList.add("hidden");
    guestPanel.classList.add("hidden");
    authPanel.classList.remove("hidden");
    setAuthMode("login");
    hideMessage();
}

async function handleLogout() {
    setButtonLoading(logoutButton, true, "Logging out...");

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            showMessage("Could not log out. Try again.", "error");
            return;
        }

        showMessage("You are logged out.", "success");
    } catch (error) {
        console.error("Logout request error", error);
        showMessage("Logout failed because of a connection problem.", "error");
    } finally {
        setButtonLoading(logoutButton, false, "Logout");
    }
}

function renderSession(session) {
    const isLoggedIn = Boolean(session?.user);
    currentSession = session;
    setPageMode(isLoggedIn ? "dashboard" : "auth");

    authPanel.classList.toggle("hidden", isLoggedIn);
    authConfirmationPanel.classList.add("hidden");
    dashboardPanel.classList.toggle("hidden", !isLoggedIn);
    dashboardTitle.textContent = "Welcome!";
    userEmail.textContent = isLoggedIn ? session.user.email : "";

    if (isLoggedIn) {
        loadOrganizerProfile(session.user);
        loadEvents();
    } else {
        currentEvents = [];
        selectedEvent = null;
        renderEvents([]);
        showEventsList();
    }
}

function setPageMode(mode) {
    document.body.classList.toggle("is-auth-view", mode === "auth");
    document.body.classList.toggle("is-dashboard-view", mode === "dashboard");
    document.body.classList.toggle("is-guest-view", mode === "guest");
}

async function loadOrganizerProfile(user) {
    const fallbackName = user.user_metadata?.full_name
        || [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ")
        || "";

    if (fallbackName) {
        dashboardTitle.textContent = `Welcome, ${fallbackName}`;
    }

    const { data, error } = await supabase
        .from("users")
        .select("first_name,last_name,email")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Profile load error", error);
        return;
    }

    const profileName = [data?.first_name, data?.last_name].filter(Boolean).join(" ");

    if (profileName) {
        dashboardTitle.textContent = `Welcome, ${profileName}`;
    }

    if (data?.email) {
        userEmail.textContent = data.email;
    }
}

async function renderGuestRoute(slug) {
    setPageMode("guest");
    authPanel.classList.add("hidden");
    authConfirmationPanel.classList.add("hidden");
    dashboardPanel.classList.add("hidden");
    guestPanel.classList.remove("hidden");
    guestPanel.classList.remove("is-photo-mode");
    hideMessage();

    guestEventTitle.textContent = "Loading event...";
    guestEventDate.textContent = "";

    const { data, error } = await queryEventBySlug(slug);

    if (error) {
        guestEventTitle.textContent = "Could not load event";
        showMessage(toFriendlyDatabaseError(error.message, "guest-load"), "error");
        return;
    }

    if (!data) {
        guestEventTitle.textContent = "Event not found";
        guestEventDate.textContent = "Check the QR code or link and try again.";
        guestForm.classList.add("hidden");
        photoPanel.classList.add("hidden");
        return;
    }

    await renderLoadedGuestEvent(data);
}

async function queryEventBySlug(slug) {
    const response = await supabase
        .from("events")
        .select(PUBLIC_EVENT_SELECT_FIELDS)
        .eq("slug", slug)
        .maybeSingle();

    if (!isBrandingSchemaMissingError(response.error)) {
        return response;
    }

    const noZoomResponse = await supabase
        .from("events")
        .select(PUBLIC_EVENT_SELECT_FIELDS_WITHOUT_ZOOM)
        .eq("slug", slug)
        .maybeSingle();

    if (!isBrandingSchemaMissingError(noZoomResponse.error)) {
        return {
            ...noZoomResponse,
            data: addGuestDesignDefaults(noZoomResponse.data)
        };
    }

    const fallbackResponse = await supabase
        .from("events")
        .select(LEGACY_PUBLIC_EVENT_SELECT_FIELDS)
        .eq("slug", slug)
        .maybeSingle();

    return {
        ...fallbackResponse,
        data: addGuestDesignDefaults(fallbackResponse.data)
    };
}

function isBrandingSchemaMissingError(error) {
    if (!error?.message) {
        return false;
    }

    const message = error.message.toLowerCase();

    return message.includes("guest_title")
        || message.includes("guest_subtitle")
        || message.includes("guest_button_text")
        || message.includes("cover_image_path")
        || message.includes("cover_position_x")
        || message.includes("cover_position_y")
        || message.includes("cover_zoom")
        || message.includes("zip_downloaded_at")
        || message.includes("column")
        && message.includes("events");
}

function addGuestDesignDefaults(eventData) {
    if (!eventData) {
        return eventData;
    }

    return {
        guest_title: null,
        guest_subtitle: null,
        guest_button_text: null,
        cover_image_path: null,
        cover_position_x: 50,
        cover_position_y: 50,
        cover_zoom: 108,
        zip_downloaded_at: null,
        ...eventData
    };
}

async function renderLoadedGuestEvent(data) {
    if (!isEventOpenForGuests(data)) {
        guestEventTitle.textContent = "This event is closed";
        guestEventDate.textContent = "Photo upload is not available for this event right now.";
        guestForm.classList.add("hidden");
        photoPanel.classList.add("hidden");
        return;
    }

    selectedEvent = data;
    await applyGuestLandingDesign(data);
    guestEventDate.textContent = formatEventDateRange(data);

    const savedGuest = loadSavedGuest(data.slug);

    if (savedGuest?.event_id === data.id) {
        currentGuest = savedGuest;
        showPhotoPanel(savedGuest.name);
    }
}

async function applyGuestLandingDesign(eventData) {
    const title = getGuestDisplayTitle(eventData);
    const subtitle = eventData.guest_subtitle?.trim() || "";
    const buttonText = getGuestButtonText(eventData);

    guestEventTitle.textContent = title;
    guestEventSubtitle.textContent = subtitle;
    guestEventSubtitle.classList.toggle("hidden", !subtitle);
    guestStartButton.textContent = "Let's go";
    takePhotoButton.textContent = buttonText;
    setCoverImage(guestCover, "");
    applyCoverPosition(guestCover, eventData);

    if (eventData.cover_image_path) {
        const coverUrl = await createStorageSignedUrl(eventData.cover_image_path, 600);

        if (coverUrl) {
            setCoverImage(guestCover, coverUrl);
            applyCoverPosition(guestCover, eventData);
        }
    }
}

function getGuestDisplayTitle(eventData) {
    return eventData?.name?.trim() || "Event";
}

function getGuestButtonText(eventData) {
    return eventData?.guest_button_text?.trim() || "Take Photo";
}

async function handleGuestStart(event) {
    event.preventDefault();

    const guestName = guestNameInput.value.trim();

    if (!guestName) {
        showMessage("Enter your name.", "error");
        return;
    }

    if (!selectedEvent?.id) {
        showMessage("The event is not loaded. Refresh the page and try again.", "error");
        return;
    }

    const startButton = document.getElementById("guest-start-button");
    setButtonLoading(startButton, true, "Preparing...");

    try {
        const guestId = createClientId();

        const { error } = await supabase
            .from("guests")
            .insert({
                id: guestId,
                event_id: selectedEvent.id,
                name: guestName
            });

        if (error) {
            showMessage(toFriendlyDatabaseError(error.message, "guest-start"), "error");
            return;
        }

        currentGuest = {
            id: guestId,
            event_id: selectedEvent.id,
            name: guestName,
            folder_suffix: createNumericSuffix()
        };
        saveGuest(selectedEvent.slug, currentGuest);
        showPhotoPanel(currentGuest.name);
        showMessage("You can start taking photos.", "success");
    } catch (error) {
        console.error("Guest start error", error);
        showMessage("Could not prepare your guest session. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(startButton, false, "Let's go");
    }
}

function handleChangeGuest() {
    if (selectedEvent?.slug) {
        localStorage.removeItem(getGuestStorageKey(selectedEvent.slug));
    }

    currentGuest = null;
    guestPanel.classList.remove("is-photo-mode");
    photoPanel.classList.add("hidden");
    guestForm.classList.remove("hidden");
    guestNameInput.focus();
    hideUploadState();
    hideMessage();
}

function openCreateEventModal() {
    editingEventId = "";
    eventModalTitle.textContent = "Create Event";
    eventModalDescription.textContent = "Create an event period. Guest upload is available only during that period.";
    createEventButton.textContent = "Create Event";
    eventForm.reset();
    setEventDateLimits();
    hideMessage();

    const today = getIsoDate(new Date());
    eventStartDateInput.value = today;
    eventEndDateInput.value = today;

    if (createEventModal.showModal) {
        createEventModal.showModal();
    } else {
        createEventModal.setAttribute("open", "");
    }

    eventNameInput.focus();
}

function closeCreateEventModal() {
    if (createEventModal.close) {
        createEventModal.close();
    } else {
        createEventModal.removeAttribute("open");
    }

    setButtonLoading(createEventButton, false, "Create Event");
    editingEventId = "";
}

function setEventDateLimits() {
    const today = getIsoDate(new Date());
    eventStartDateInput.min = today;
    eventEndDateInput.min = today;
}

function handleEventStartDateChange() {
    eventEndDateInput.min = eventStartDateInput.value || getIsoDate(new Date());

    if (!eventEndDateInput.value || eventEndDateInput.value < eventEndDateInput.min) {
        eventEndDateInput.value = eventEndDateInput.min;
    }
}

function openEditEventModal(eventData) {
    editingEventId = eventData.id;
    eventModalTitle.textContent = "Edit Event";
    eventModalDescription.textContent = "Update the event name, date period, or guest upload window.";
    createEventButton.textContent = "Save Event";
    eventNameInput.value = eventData.name || "";
    eventStartDateInput.value = eventData.start_date || eventData.date || getIsoDate(new Date());
    eventEndDateInput.value = eventData.end_date || eventData.date || eventStartDateInput.value;
    setEventDateLimits();
    eventEndDateInput.min = eventStartDateInput.value || getIsoDate(new Date());
    hideMessage();

    if (createEventModal.showModal) {
        createEventModal.showModal();
    } else {
        createEventModal.setAttribute("open", "");
    }

    eventNameInput.focus();
}

function handleEditSelectedEvent() {
    if (!selectedEvent) {
        showMessage("Open an event before editing it.", "error");
        return;
    }

    openGuestDesignModal(selectedEvent);
}

async function openGuestDesignModal(eventData) {
    await populateGuestDesignForm(eventData);
    hideMessage();

    if (guestDesignModal.showModal) {
        guestDesignModal.showModal();
    } else {
        guestDesignModal.setAttribute("open", "");
    }

    guestDesignTitleInput.focus();
}

function closeGuestDesignModal() {
    if (guestDesignModal.close) {
        guestDesignModal.close();
    } else {
        guestDesignModal.removeAttribute("open");
    }

    setButtonLoading(saveGuestDesignButton, false, "Save Design");
}

async function handleToggleSelectedEventStatus() {
    if (!selectedEvent) {
        showMessage("Open an event before changing its status.", "error");
        return;
    }

    await handleToggleEventStatus(selectedEvent, toggleEventStatusButton);
}

async function handleToggleEventStatus(eventData, button) {
    const nextStatus = eventData.status === "inactive" ? "active" : "inactive";

    if (nextStatus === "active" && hasEventPeriodEnded(eventData)) {
        showMessage("This event period has ended. Edit the period before activating it.", "error");
        setEventStatusButtonState(eventData);
        return;
    }

    const label = nextStatus === "active" ? "Activating..." : "Deactivating...";
    setButtonLoading(button, true, label);
    let updateSucceeded = false;

    try {
        const { error } = await supabase
            .from("events")
            .update({ status: nextStatus })
            .eq("id", eventData.id);

        if (error) {
            showMessage(toFriendlyDatabaseError(error.message, "organizer-event"), "error");
            return;
        }

        updateSucceeded = true;
        showMessage(nextStatus === "active" ? "Event activated." : "Event deactivated.", "success");
        await loadEvents();

        if (selectedEvent?.id === eventData.id) {
            const updatedEvent = currentEvents.find(item => item.id === eventData.id);

            if (updatedEvent) {
                selectedEvent = updatedEvent;
                await showEventDetail(selectedEvent);
            } else {
                showEventsList();
            }
        }
    } catch (error) {
        console.error("Event status update error", error);
        showMessage("Could not update event status. Check your connection and try again.", "error");
    } finally {
        const currentEvent = updateSucceeded ? currentEvents.find(item => item.id === eventData.id) || selectedEvent || eventData : eventData;
        setButtonLoading(button, false);
        setEventStatusButtonState(currentEvent);
    }
}

function validateEventPeriod(startDate, endDate, options = {}) {
    if (!startDate || !endDate) {
        return "Choose the event start and end date.";
    }

    const today = getIsoDate(new Date());

    if ((!options.allowPastStart && startDate < today) || endDate < today) {
        return "Past dates are not allowed.";
    }

    if (endDate < startDate) {
        return "End date cannot be before start date.";
    }

    const durationInDays = getDateDiffInDays(startDate, endDate) + 1;

    if (durationInDays > 3) {
        return "The event period can be a maximum of 3 days.";
    }

    return "";
}

async function syncExpiredEvents() {
    if (!currentSession?.user) {
        return;
    }

    const today = getIsoDate(new Date());
    const deleteBeforeDate = getIsoDate(addDays(new Date(), -3));

    const { error: inactiveError } = await supabase
        .from("events")
        .update({ status: "inactive" })
        .eq("owner_id", currentSession.user.id)
        .eq("status", "active")
        .lt("end_date", today);

    if (inactiveError) {
        console.error("Expired event sync error", inactiveError);
    }

    const { error: deletedError } = await supabase
        .from("events")
        .update({ status: "deleted" })
        .eq("owner_id", currentSession.user.id)
        .in("status", ["active", "inactive"])
        .lt("end_date", deleteBeforeDate);

    if (deletedError) {
        console.error("Old event cleanup error", deletedError);
    }
}

async function handlePhotoSelected() {
    const file = photoInput.files?.[0];
    photoInput.value = "";

    if (!file) {
        return;
    }

    if (!selectedEvent?.id || !currentGuest?.id) {
        showMessage("Enter your name before taking photos.", "error");
        return;
    }

    if (!isEventOpenForGuests(selectedEvent)) {
        showMessage("Photo upload is closed for this event.", "error");
        photoPanel.classList.add("hidden");
        guestForm.classList.add("hidden");
        return;
    }

    const validationError = validatePhoto(file);

    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    setButtonLoading(takePhotoButton, true, "Uploading...");
    showUploadState("Uploading photo. Keep this page open.", "loading");

    try {
        showUploadState("Preparing photo for upload...", "loading");

        const optimizedPhoto = await optimizePhotoFile(file);
        const storagePath = createStoragePath(optimizedPhoto.original);
        const thumbnailPath = optimizedPhoto.thumbnail ? createThumbnailStoragePath(storagePath) : null;
        let uploadedThumbnailPath = null;

        showUploadState("Uploading photo. Keep this page open.", "loading");

        const { error: uploadError } = await supabase
            .storage
            .from(PHOTO_BUCKET)
            .upload(storagePath, optimizedPhoto.original, {
                cacheControl: "3600",
                contentType: optimizedPhoto.original.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Storage upload error", uploadError);
            showUploadState("Upload failed.", "error");
            showMessage(toFriendlyStorageError(uploadError.message, "guest-upload"), "error");
            return;
        }

        if (optimizedPhoto.thumbnail && thumbnailPath) {
            const { error: thumbnailUploadError } = await supabase
                .storage
                .from(PHOTO_BUCKET)
                .upload(thumbnailPath, optimizedPhoto.thumbnail, {
                    cacheControl: "604800",
                    contentType: optimizedPhoto.thumbnail.type,
                    upsert: false
                });

            if (thumbnailUploadError) {
                console.error("Thumbnail upload error", thumbnailUploadError);
            } else {
                uploadedThumbnailPath = thumbnailPath;
            }
        }

        showUploadState("Photo uploaded. Saving gallery details...", "loading");

        const { error: mediaError } = await supabase
            .from("media")
            .insert({
                event_id: selectedEvent.id,
                guest_id: currentGuest.id,
                storage_path: storagePath,
                thumbnail_path: uploadedThumbnailPath,
                file_type: optimizedPhoto.original.type,
                file_size: optimizedPhoto.original.size,
                status: "uploaded"
            });

        if (mediaError) {
            console.error("Media insert error", mediaError);
            showUploadState("The photo file was saved, but the gallery record could not be created.", "error");
            showMessage(toFriendlyDatabaseError(mediaError.message, "guest-upload"), "error");
            return;
        }

        invalidateGalleryCache(selectedEvent.id);
        showUploadState("Photo uploaded!", "success", true);
    } catch (error) {
        console.error("Photo upload request error", error);
        showUploadState("Upload failed.", "error");
        showMessage("Photo upload failed. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(takePhotoButton, false, getGuestButtonText(selectedEvent));
    }
}

async function handleCreateEvent(event) {
    event.preventDefault();

    if (!currentSession?.user) {
        showMessage("Log in before creating an event.", "error");
        return;
    }

    const name = eventNameInput.value.trim();
    const startDate = eventStartDateInput.value;
    const endDate = eventEndDateInput.value;

    if (!name) {
        showMessage("Enter an event name.", "error");
        return;
    }

    const isEditing = Boolean(editingEventId);
    const eventIdBeingEdited = editingEventId;
    const dateValidationError = validateEventPeriod(startDate, endDate, {
        allowPastStart: isEditing
    });

    if (dateValidationError) {
        showMessage(dateValidationError, "error");
        return;
    }

    setButtonLoading(createEventButton, true, "Saving...");

    try {
        const payload = {
            name,
            date: startDate,
            start_date: startDate,
            end_date: endDate
        };

        const request = isEditing
            ? supabase
                .from("events")
                .update(payload)
                .eq("id", eventIdBeingEdited)
            : supabase
                .from("events")
                .insert({
                    ...payload,
                    owner_id: currentSession.user.id,
                    slug: createSlug(name),
                    storage_folder: `${createStorageFolderName(name)}-${createNumericSuffix()}`,
                    status: "active"
                });

        const { error } = await request;

        if (error) {
            showMessage(toFriendlyDatabaseError(error.message, "organizer-event"), "error");
            return;
        }

        eventForm.reset();
        closeCreateEventModal();
        showMessage(isEditing ? "Event updated." : "Event created.", "success");
        await loadEvents();

        if (isEditing && selectedEvent?.id === eventIdBeingEdited) {
            const updatedEvent = currentEvents.find(item => item.id === eventIdBeingEdited);

            if (updatedEvent) {
                await showEventDetail(updatedEvent);
            }
        }
    } catch (error) {
        console.error("Save event error", error);
        showMessage("Could not save the event. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(createEventButton, false, isEditing ? "Save Event" : "Create Event");
    }
}

async function loadEvents() {
    if (!currentSession?.user) {
        return;
    }

    eventsCount.textContent = "Loading events...";
    eventsList.innerHTML = "";
    await syncExpiredEvents();

    const { data, error } = await queryOrganizerEvents();

    if (error) {
        eventsCount.textContent = "Could not load events.";
        showMessage(toFriendlyDatabaseError(error.message, "organizer-events"), "error");
        return;
    }

    renderEvents(data || []);
}

async function queryOrganizerEvents() {
    const response = await supabase
        .from("events")
        .select(EVENT_SELECT_FIELDS)
        .eq("owner_id", currentSession.user.id)
        .neq("status", "deleted")
        .gte("end_date", getIsoDate(addDays(new Date(), -3)))
        .order("created_at", { ascending: false });

    if (!isBrandingSchemaMissingError(response.error)) {
        return response;
    }

    const noZoomResponse = await supabase
        .from("events")
        .select(EVENT_SELECT_FIELDS_WITHOUT_ZOOM)
        .eq("owner_id", currentSession.user.id)
        .neq("status", "deleted")
        .gte("end_date", getIsoDate(addDays(new Date(), -3)))
        .order("created_at", { ascending: false });

    if (!isBrandingSchemaMissingError(noZoomResponse.error)) {
        return {
            ...noZoomResponse,
            data: (noZoomResponse.data || []).map(addGuestDesignDefaults)
        };
    }

    const fallbackResponse = await supabase
        .from("events")
        .select(LEGACY_EVENT_SELECT_FIELDS)
        .eq("owner_id", currentSession.user.id)
        .neq("status", "deleted")
        .gte("end_date", getIsoDate(addDays(new Date(), -3)))
        .order("created_at", { ascending: false });

    return {
        ...fallbackResponse,
        data: (fallbackResponse.data || []).map(addGuestDesignDefaults)
    };
}

function renderEvents(events) {
    if (!eventsList || !eventsCount) {
        return;
    }

    currentEvents = events;
    renderFilteredEvents();
}

function renderFilteredEvents() {
    if (!eventsList || !eventsCount) {
        return;
    }

    eventsList.innerHTML = "";

    if (!currentSession?.user) {
        eventsCount.textContent = "";
        return;
    }

    if (!currentEvents.length) {
        eventsCount.textContent = "You do not have any events yet.";
        eventsList.innerHTML = `
            <div class="empty-state">
                <strong>No events yet</strong>
                <span>Create your first event to generate a guest link and QR code.</span>
            </div>
        `;
        return;
    }

    const events = getFilteredEvents();

    if (!events.length) {
        eventsCount.textContent = "No events match these filters.";
        eventsList.innerHTML = `
            <div class="empty-state">
                <strong>No matching events</strong>
                <span>Change the search, status, or sort options.</span>
            </div>
        `;
        return;
    }

    eventsCount.textContent = `${events.length} event${events.length === 1 ? "" : "s"}`;

    const fragment = document.createDocumentFragment();

    for (const event of events) {
        const card = document.createElement("article");
        card.className = "event-card";

        const eventDate = formatEventDateRange(event);
        const displayStatus = getDisplayEventStatus(event);

        card.innerHTML = `
            <div class="event-card-info" role="button" tabindex="0">
                <h3></h3>
                <p></p>
            </div>
            <div class="event-card-actions">
                <button class="secondary-button compact-button open-event-button" type="button"></button>
                <button class="danger-button compact-button delete-event-button" type="button"></button>
            </div>
            <span class="status-pill"></span>
        `;

        card.dataset.eventId = event.id;
        card.querySelector(".event-card-info").setAttribute("aria-label", `Open ${event.name}`);
        card.querySelector("h3").textContent = event.name;
        card.querySelector("p").textContent = eventDate;
        card.querySelector(".status-pill").textContent = formatStatus(displayStatus);
        card.querySelector(".status-pill").classList.toggle("is-inactive", displayStatus !== "active");
        card.querySelector(".open-event-button").textContent = "Open";
        card.querySelector(".delete-event-button").textContent = "Delete";
        fragment.appendChild(card);
    }

    eventsList.appendChild(fragment);
}

function getFilteredEvents() {
    const searchTerm = eventSearchInput.value.trim().toLowerCase();
    const statusFilter = eventStatusFilter.value;
    const sortMode = eventSort.value;

    const filteredEvents = currentEvents.filter(event => {
        const displayStatus = getDisplayEventStatus(event);
        const matchesSearch = !searchTerm || event.name.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    filteredEvents.sort((a, b) => {
        if (sortMode === "oldest") {
            return new Date(a.created_at) - new Date(b.created_at);
        }

        if (sortMode === "date-asc") {
            return new Date(a.start_date || a.date) - new Date(b.start_date || b.date);
        }

        if (sortMode === "name") {
            return a.name.localeCompare(b.name);
        }

        return new Date(b.created_at) - new Date(a.created_at);
    });

    return filteredEvents;
}

async function handleEventsListClick(event) {
    const openButton = event.target.closest(".open-event-button");
    const deleteButton = event.target.closest(".delete-event-button");
    const cardInfo = event.target.closest(".event-card-info");
    const button = openButton || deleteButton;
    const card = event.target.closest(".event-card");
    const eventData = currentEvents.find(item => item.id === card?.dataset.eventId);

    if (!eventData) {
        if (button || cardInfo) {
            showMessage("Could not find this event in the list.", "error");
        }
        return;
    }

    if (deleteButton) {
        await handleDeleteEvent(eventData, deleteButton);
        return;
    }

    if (!openButton && !cardInfo && !isMobileViewport()) {
        return;
    }

    showEventDetail(eventData);
}

function handleEventsListKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const cardInfo = event.target.closest(".event-card-info");

    if (!cardInfo) {
        return;
    }

    event.preventDefault();

    const card = cardInfo.closest(".event-card");
    const eventData = currentEvents.find(item => item.id === card?.dataset.eventId);

    if (!eventData) {
        showMessage("Could not find this event in the list.", "error");
        return;
    }

    showEventDetail(eventData);
}

function isMobileViewport() {
    return window.matchMedia("(max-width: 760px)").matches;
}

async function handleDeleteEvent(eventData, button) {
    const confirmed = await requestConfirmation({
        title: "Delete event?",
        message: `Delete "${eventData.name}"? Guests will no longer be able to upload photos to this event.`,
        detail: "The event will be hidden from your list.",
        confirmText: "Delete"
    });

    if (!confirmed) {
        return;
    }

    setButtonLoading(button, true, "Deleting...");

    try {
        const { error } = await supabase
            .from("events")
            .update({ status: "deleted" })
            .eq("id", eventData.id);

        if (error) {
            showMessage(toFriendlyDatabaseError(error.message, "organizer-event"), "error");
            return;
        }

        invalidateGalleryCache(eventData.id);
        showMessage("Event deleted.", "success");
        await loadEvents();
    } catch (error) {
        console.error("Event delete error", error);
        showMessage("Could not delete the event. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(button, false, "Delete");
    }
}

function requestConfirmation({ title, message, detail, confirmText = "Delete" }) {
    if (!confirmModal || typeof confirmModal.showModal !== "function") {
        return Promise.resolve(false);
    }

    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmDetail.textContent = detail || "";
    confirmDetail.classList.toggle("hidden", !detail);
    confirmActionButton.textContent = confirmText;

    document.body.classList.add("is-dialog-open");

    return new Promise(resolve => {
        pendingConfirmResolve = resolve;
        confirmModal.showModal();
        confirmActionButton.focus();
    });
}

function closeConfirmModal(confirmed) {
    const resolver = pendingConfirmResolve;
    pendingConfirmResolve = null;

    if (confirmModal.open) {
        confirmModal.close();
    }

    syncDialogOpenState();

    if (resolver) {
        resolver(confirmed);
    }
}

function handleConfirmBackdropClick(event) {
    if (event.target === confirmModal) {
        closeConfirmModal(false);
    }
}

function syncDialogOpenState() {
    const hasOpenDialog = [photoDialog, confirmModal, createEventModal, guestDesignModal].some(dialog => dialog?.open);
    document.body.classList.toggle("is-dialog-open", hasOpenDialog);
}

async function showEventDetail(eventData) {
    selectedEvent = eventData;
    allGalleryPhotos = [];
    currentGalleryPhotos = [];
    const eventUrl = getEventUrl(eventData);

    eventsListHeader.classList.add("hidden");
    eventsControls.classList.add("hidden");
    eventsList.classList.add("hidden");
    eventDetail.classList.remove("hidden");

    eventDetailTitle.textContent = eventData.name;
    eventDetailDate.textContent = formatEventDateRange(eventData);
    eventDetailStatus.textContent = formatStatus(getDisplayEventStatus(eventData));
    setEventStatusButtonState(eventData);
    eventDetailUrl.textContent = eventUrl;
    updateDownloadGalleryState();

    await renderQrCode(eventUrl);
    await loadGallery(eventData.id);
}

async function populateGuestDesignForm(eventData) {
    clearSelectedGuestCoverPreview();
    selectedGuestCoverFile = null;
    shouldRemoveGuestCover = false;
    guestCoverInput.value = "";
    guestDesignTitleInput.value = getGuestDisplayTitle(eventData);
    guestDesignSubtitleInput.value = eventData.guest_subtitle?.trim() || "";
    guestDesignButtonInput.value = getGuestButtonText(eventData);
    guestCoverPositionXInput.value = normalizeCoverPosition(eventData.cover_position_x);
    guestCoverPositionYInput.value = normalizeCoverPosition(eventData.cover_position_y);
    guestCoverZoomInput.value = normalizeCoverZoom(eventData.cover_zoom);
    updateGuestDesignPreview();

    if (eventData.cover_image_path) {
        const coverUrl = await createStorageSignedUrl(eventData.cover_image_path, SIGNED_URL_EXPIRES_IN_SECONDS);

        if (coverUrl && selectedEvent?.id === eventData.id && !selectedGuestCoverFile && !shouldRemoveGuestCover) {
            setCoverImage(guestPreviewCover, coverUrl);
            applyCoverPosition(guestPreviewCover, eventData);
        }
    }
}

function handleGuestCoverSelected() {
    const file = guestCoverInput.files?.[0] || null;

    clearSelectedGuestCoverPreview();
    selectedGuestCoverFile = null;
    shouldRemoveGuestCover = false;

    if (!file) {
        updateGuestDesignPreview();
        return;
    }

    const validationError = validatePhoto(file);

    if (validationError) {
        guestCoverInput.value = "";
        showMessage(validationError, "error");
        updateGuestDesignPreview();
        return;
    }

    selectedGuestCoverFile = file;
    selectedGuestCoverPreviewUrl = URL.createObjectURL(file);
    setCoverImage(guestPreviewCover, selectedGuestCoverPreviewUrl);
    updateGuestDesignPreview();
}

function handleResetGuestDesign() {
    clearSelectedGuestCoverPreview();
    selectedGuestCoverFile = null;
    shouldRemoveGuestCover = Boolean(selectedEvent?.cover_image_path);
    guestCoverInput.value = "";
    guestDesignTitleInput.value = selectedEvent?.name || "";
    guestDesignSubtitleInput.value = "";
    guestDesignButtonInput.value = "Take Photo";
    guestCoverPositionXInput.value = "50";
    guestCoverPositionYInput.value = "50";
    guestCoverZoomInput.value = "108";
    updateGuestDesignPreview();
}

async function handleSaveGuestDesign(event) {
    event.preventDefault();

    if (!selectedEvent?.id) {
        showMessage("Open an event before saving guest design.", "error");
        return;
    }

    const title = guestDesignTitleInput.value.trim();
    const subtitle = guestDesignSubtitleInput.value.trim();
    const buttonText = guestDesignButtonInput.value.trim() || "Take Photo";
    const coverPositionX = normalizeCoverPosition(guestCoverPositionXInput.value);
    const coverPositionY = normalizeCoverPosition(guestCoverPositionYInput.value);
    const coverZoom = normalizeCoverZoom(guestCoverZoomInput.value);

    if (!title) {
        showMessage("Enter a title for the guest screen.", "error");
        return;
    }

    setButtonLoading(saveGuestDesignButton, true, "Saving...");

    try {
        const payload = {
            name: title,
            guest_title: title,
            guest_subtitle: subtitle || null,
            guest_button_text: buttonText === "Take Photo" ? null : buttonText,
            cover_position_x: coverPositionX,
            cover_position_y: coverPositionY,
            cover_zoom: coverZoom
        };

        if (selectedGuestCoverFile) {
            const optimizedCover = await optimizePhotoFile(selectedGuestCoverFile);
            const coverFile = optimizedCover.original;
            const coverPath = createCoverStoragePath(coverFile);
            const { error: uploadError } = await supabase
                .storage
                .from(PHOTO_BUCKET)
                .upload(coverPath, coverFile, {
                    cacheControl: "3600",
                    contentType: coverFile.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("Cover upload error", uploadError);
                showMessage(toFriendlyStorageError(uploadError.message, "organizer-upload"), "error");
                return;
            }

            payload.cover_image_path = coverPath;
        } else if (shouldRemoveGuestCover) {
            await deleteCurrentCoverImage();
            payload.cover_image_path = null;
        }

        const { data, error } = await supabase
            .from("events")
            .update(payload)
            .eq("id", selectedEvent.id)
            .select(EVENT_SELECT_FIELDS)
            .single();

        if (error) {
            showMessage(toFriendlyDatabaseError(error.message, "organizer-event"), "error");
            return;
        }

        selectedEvent = data;
        currentEvents = currentEvents.map(item => item.id === data.id ? data : item);
        clearSelectedGuestCoverPreview();
        selectedGuestCoverFile = null;
        shouldRemoveGuestCover = false;
        guestCoverInput.value = "";
        eventDetailTitle.textContent = data.name;
        showMessage("Guest design saved.", "success");
        renderFilteredEvents();
        await showEventDetail(data);
    } catch (error) {
        console.error("Guest design save error", error);
        showMessage("Could not save guest design. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(saveGuestDesignButton, false, "Save Design");
    }
}

async function deleteCurrentCoverImage() {
    if (!selectedEvent?.cover_image_path) {
        return;
    }

    const { error } = await supabase
        .storage
        .from(PHOTO_BUCKET)
        .remove([selectedEvent.cover_image_path]);

    if (error) {
        console.error("Cover delete error", error);
    }
}

function updateGuestDesignPreview() {
    const previewTitle = guestDesignTitleInput.value.trim() || selectedEvent?.name || "Event";
    const previewSubtitle = guestDesignSubtitleInput.value.trim() || "Guests enter their name, start the camera, and upload photos.";
    const previewButtonText = guestDesignButtonInput.value.trim() || "Take Photo";

    guestPreviewTitle.textContent = previewTitle;
    guestPreviewDate.textContent = selectedEvent ? formatEventDateRange(selectedEvent) : "";
    guestPreviewSubtitle.textContent = previewSubtitle;
    guestPreviewButton.textContent = previewButtonText;
    applyCoverPosition(guestPreviewCover, {
        cover_position_x: guestCoverPositionXInput.value,
        cover_position_y: guestCoverPositionYInput.value,
        cover_zoom: guestCoverZoomInput.value
    });

    if (selectedGuestCoverPreviewUrl) {
        setCoverImage(guestPreviewCover, selectedGuestCoverPreviewUrl);
    } else if (shouldRemoveGuestCover || !selectedEvent?.cover_image_path) {
        setCoverImage(guestPreviewCover, "");
    }
}

function setCoverImage(element, url) {
    if (url) {
        element.style.setProperty("--cover-image", `url("${url}")`);
        return;
    }

    element.style.removeProperty("--cover-image");
}

function applyCoverPosition(element, eventData) {
    element.style.setProperty("--cover-position", `${normalizeCoverPosition(eventData?.cover_position_x)}% ${normalizeCoverPosition(eventData?.cover_position_y)}%`);
    element.style.setProperty("--cover-scale", (normalizeCoverZoom(eventData?.cover_zoom) / 100).toFixed(2));
}

function normalizeCoverPosition(value) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return 50;
    }

    return Math.min(100, Math.max(0, Math.round(numberValue)));
}

function normalizeCoverZoom(value) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return 108;
    }

    return Math.min(140, Math.max(100, Math.round(numberValue)));
}

function clearSelectedGuestCoverPreview() {
    if (selectedGuestCoverPreviewUrl) {
        URL.revokeObjectURL(selectedGuestCoverPreviewUrl);
        selectedGuestCoverPreviewUrl = "";
    }
}

function createCoverStoragePath(file) {
    const extension = getFileExtension(file);
    const timestamp = createReadableTimestamp();

    return `event-covers/${selectedEvent.id}/cover_${timestamp}.${extension}`;
}

async function createStorageSignedUrl(path, expiresInSeconds) {
    const { data, error } = await supabase
        .storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(path, expiresInSeconds);

    if (error) {
        console.error("Signed URL error", error);
        return "";
    }

    return data?.signedUrl || "";
}

function setEventStatusButtonState(eventData) {
    if (!eventData) {
        toggleEventStatusButton.disabled = true;
        toggleEventStatusButton.textContent = "Unavailable";
        return;
    }

    const shouldActivate = eventData.status === "inactive";
    const activationBlocked = shouldActivate && hasEventPeriodEnded(eventData);

    toggleEventStatusButton.disabled = activationBlocked;
    toggleEventStatusButton.title = activationBlocked ? "Edit the event period before activating this event." : "";
    toggleEventStatusButton.textContent = activationBlocked
        ? "Period ended"
        : shouldActivate
            ? "Activate"
            : "Deactivate";
}

function hasEventPeriodEnded(eventData) {
    return getIsoDate(new Date()) > (eventData.end_date || eventData.date);
}

function showEventsList() {
    selectedEvent = null;
    allGalleryPhotos = [];
    currentGalleryPhotos = [];
    currentPreviewIndex = -1;
    galleryGrid.innerHTML = "";
    galleryCount.textContent = "";
    galleryGuestFilter.innerHTML = '<option value="">All guests</option>';
    gallerySort.value = "newest";
    downloadGalleryButton.disabled = true;
    downloadGalleryButton.classList.add("hidden");
    eventDetail.classList.add("hidden");
    eventsListHeader.classList.remove("hidden");
    eventsControls.classList.remove("hidden");
    eventsList.classList.remove("hidden");
}

function setGalleryLoadingState() {
    galleryRenderToken += 1;
    galleryCount.textContent = "Loading photos...";
    galleryGrid.innerHTML = "";
    currentGalleryPhotos = [];
    updateDownloadGalleryState();
}

function getCachedGallery(eventId) {
    const cachedGallery = galleryCache.get(eventId);

    if (!cachedGallery) {
        return null;
    }

    if (Date.now() - cachedGallery.loadedAt > GALLERY_CACHE_TTL_MS) {
        galleryCache.delete(eventId);
        return null;
    }

    return cachedGallery;
}

function setCachedGallery(eventId, photos) {
    galleryCache.set(eventId, {
        loadedAt: Date.now(),
        photos
    });
}

function invalidateGalleryCache(eventId) {
    if (eventId) {
        galleryCache.delete(eventId);
    }
}

async function loadGallery(eventId) {
    const cachedGallery = getCachedGallery(eventId);

    if (cachedGallery) {
        allGalleryPhotos = cachedGallery.photos;
        populateGalleryGuestFilter(cachedGallery.photos);
        applyGalleryControls();
        return;
    }

    setGalleryLoadingState();

    const { data, error } = await supabase
        .from("media")
        .select(`
            id,
            storage_path,
            thumbnail_path,
            file_type,
            file_size,
            created_at,
            guests (
                name
            )
        `)
        .eq("event_id", eventId)
        .eq("status", "uploaded")
        .order("created_at", { ascending: false });

    if (error) {
        galleryCount.textContent = "Could not load photos.";
        showMessage(toFriendlyDatabaseError(error.message, "gallery"), "error");
        return;
    }

    if (!data?.length) {
        allGalleryPhotos = [];
        currentGalleryPhotos = [];
        galleryGuestFilter.innerHTML = '<option value="">All guests</option>';
        gallerySort.value = "newest";
        galleryCount.textContent = "No photos yet.";
        galleryGrid.innerHTML = `
            <div class="empty-state gallery-empty">
                <strong>No photos</strong>
                <span>Guest uploads will appear here.</span>
            </div>
        `;
        updateDownloadGalleryState();
        return;
    }

    const signedPhotos = await createSignedGalleryPhotos(data);
    const availablePhotos = signedPhotos.filter(photo => photo.thumbSignedUrl || photo.signedUrl);
    allGalleryPhotos = availablePhotos;
    setCachedGallery(eventId, availablePhotos);
    populateGalleryGuestFilter(availablePhotos);
    applyGalleryControls();
}

async function createSignedGalleryPhotos(photos) {
    const paths = photos.map(photo => getPhotoDisplayPath(photo));

    const { data, error } = await supabase
        .storage
        .from(PHOTO_BUCKET)
        .createSignedUrls(paths, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error) {
        console.error("Signed URLs batch error", error);
        return createSignedGalleryPhotosIndividually(photos);
    }

    return photos.map((photo, index) => {
        const signedPhoto = data?.[index];
        const signedUrlError = signedPhoto?.error || "";

        if (signedUrlError) {
            console.error("Signed URL item error", signedUrlError);
        }

        return {
            ...photo,
            thumbSignedUrl: signedPhoto?.signedUrl || "",
            signedUrl: "",
            signedUrlError
        };
    });
}

async function createSignedGalleryPhotosIndividually(photos) {
    const signedPhotos = await Promise.all(photos.map(async photo => {
        const displayPath = getPhotoDisplayPath(photo);
        const { data, error } = await supabase
            .storage
            .from(PHOTO_BUCKET)
            .createSignedUrl(displayPath, SIGNED_URL_EXPIRES_IN_SECONDS);

        if (error) {
            console.error("Signed URL error", error);
            return {
                ...photo,
                thumbSignedUrl: "",
                signedUrl: "",
                signedUrlError: error.message
            };
        }

        return {
            ...photo,
            thumbSignedUrl: data.signedUrl,
            signedUrl: "",
            signedUrlError: ""
        };
    }));

    return signedPhotos;
}

function getPhotoDisplayPath(photo) {
    return photo.thumbnail_path || photo.storage_path;
}

async function getPhotoOriginalSignedUrl(photo) {
    if (!photo?.storage_path) {
        return "";
    }

    if (photo.signedUrl) {
        return photo.signedUrl;
    }

    const signedUrl = await createStorageSignedUrl(photo.storage_path, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (signedUrl) {
        photo.signedUrl = signedUrl;
    }

    return signedUrl;
}

function populateGalleryGuestFilter(photos) {
    const previousValue = galleryGuestFilter.value;
    const guestNames = [...new Set(photos.map(photo => photo.guests?.name || "Unknown guest"))]
        .sort((a, b) => a.localeCompare(b));

    galleryGuestFilter.innerHTML = '<option value="">All guests</option>';

    for (const guestName of guestNames) {
        const option = document.createElement("option");
        option.value = guestName;
        option.textContent = guestName;
        galleryGuestFilter.appendChild(option);
    }

    if (guestNames.includes(previousValue)) {
        galleryGuestFilter.value = previousValue;
    }
}

function applyGalleryControls() {
    const selectedGuest = galleryGuestFilter.value;
    const sortMode = gallerySort.value;
    let photos = [...allGalleryPhotos];

    if (selectedGuest) {
        photos = photos.filter(photo => (photo.guests?.name || "Unknown guest") === selectedGuest);
    }

    photos.sort((a, b) => {
        if (sortMode === "oldest") {
            return new Date(a.created_at) - new Date(b.created_at);
        }

        if (sortMode === "guest") {
            const guestCompare = (a.guests?.name || "Unknown guest").localeCompare(b.guests?.name || "Unknown guest");
            return guestCompare || new Date(b.created_at) - new Date(a.created_at);
        }

        return new Date(b.created_at) - new Date(a.created_at);
    });

    currentGalleryPhotos = photos;
    renderGallery(photos);
}

function canDownloadGalleryZip() {
    return Boolean(selectedEvent && hasEventPeriodEnded(selectedEvent) && !selectedEvent.zip_downloaded_at);
}

function getGalleryDownloadUnavailableText() {
    if (!selectedEvent) {
        return "Download ZIP";
    }

    if (selectedEvent.zip_downloaded_at) {
        return "ZIP already downloaded";
    }

    if (!hasEventPeriodEnded(selectedEvent)) {
        return "ZIP available after event";
    }

    if (!currentGalleryPhotos.length) {
        return "No photos to download";
    }

    return "Download ZIP";
}

function updateDownloadGalleryState() {
    const canDownload = canDownloadGalleryZip() && currentGalleryPhotos.length > 0;

    downloadGalleryButton.classList.toggle("hidden", !canDownload);
    downloadGalleryButton.disabled = !canDownload;
    downloadGalleryButton.textContent = canDownload ? "Download ZIP" : getGalleryDownloadUnavailableText();
}

function handleClearGalleryFilters() {
    galleryGuestFilter.value = "";
    gallerySort.value = "newest";
    applyGalleryControls();
}

function renderGallery(photos) {
    galleryRenderToken += 1;
    const renderToken = galleryRenderToken;
    galleryGrid.innerHTML = "";

    if (!photos.length) {
        galleryCount.textContent = allGalleryPhotos.length ? "No photos match this filter." : "No photos yet.";
        updateDownloadGalleryState();
        galleryGrid.innerHTML = `
            <div class="empty-state gallery-empty">
                <strong>${allGalleryPhotos.length ? "No matching photos" : "No available photos"}</strong>
                <span>${allGalleryPhotos.length ? "Clear filters or choose another guest." : "Guest uploads will appear here."}</span>
            </div>
        `;
        return;
    }

    const filterSuffix = photos.length === allGalleryPhotos.length ? "" : ` of ${allGalleryPhotos.length}`;
    galleryCount.textContent = `${photos.length}${filterSuffix} photo${photos.length === 1 ? "" : "s"}`;
    updateDownloadGalleryState();

    const fragment = document.createDocumentFragment();
    renderGalleryBatch(photos, fragment, 0, renderToken);
}

function renderGalleryBatch(photos, fragment, startIndex, renderToken) {
    if (renderToken !== galleryRenderToken) {
        return;
    }

    const endIndex = Math.min(startIndex + GALLERY_RENDER_BATCH_SIZE, photos.length);

    for (let index = startIndex; index < endIndex; index += 1) {
        const photo = photos[index];
        const button = document.createElement("button");
        button.className = "gallery-item";
        button.type = "button";
        button.dataset.photoId = photo.id;
        button.dataset.photoIndex = String(index);

        const guestName = photo.guests?.name || "Unknown guest";
        const uploadedAt = formatDateTime(photo.created_at);

        button.innerHTML = `
            <div class="thumb-wrap"></div>
            <span></span>
        `;

        const thumbWrap = button.querySelector(".thumb-wrap");
        const image = document.createElement("img");
        image.src = photo.thumbSignedUrl || photo.signedUrl;
        image.alt = `${guestName} photo`;
        image.loading = "lazy";
        image.decoding = "async";
        thumbWrap.appendChild(image);

        button.querySelector("span").textContent = `${guestName} · ${uploadedAt}`;
        fragment.appendChild(button);
    }

    galleryGrid.appendChild(fragment);

    if (endIndex < photos.length) {
        window.requestAnimationFrame(() => {
            renderGalleryBatch(photos, document.createDocumentFragment(), endIndex, renderToken);
        });
    }
}

async function handleDownloadGallery() {
    if (!canDownloadGalleryZip()) {
        showMessage(getGalleryDownloadUnavailableText(), "error");
        updateDownloadGalleryState();
        return;
    }

    if (!currentGalleryPhotos.length) {
        showMessage("There are no photos to download yet.", "error");
        updateDownloadGalleryState();
        return;
    }

    const ZipLibrary = window.JSZip;

    if (!ZipLibrary) {
        showMessage("Could not load the ZIP library. Check your connection.", "error");
        return;
    }

    const zip = new ZipLibrary();
    const usedNames = new Set();
    downloadGalleryButton.disabled = true;

    try {
        for (const [index, photo] of currentGalleryPhotos.entries()) {
            downloadGalleryButton.textContent = `Zipping ${index + 1}/${currentGalleryPhotos.length}`;

            const signedUrl = await getPhotoOriginalSignedUrl(photo);

            if (!signedUrl) {
                throw new Error("Original photo URL is not available");
            }

            const response = await fetch(signedUrl);

            if (!response.ok) {
                throw new Error(`Download failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const zipPath = getUniqueZipPath(photo.storage_path, usedNames);
            zip.file(zipPath, blob);
        }

        downloadGalleryButton.textContent = "Preparing ZIP...";
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const { data: updatedEvent, error: zipMarkerError } = await supabase
            .from("events")
            .update({ zip_downloaded_at: new Date().toISOString() })
            .eq("id", selectedEvent.id)
            .is("zip_downloaded_at", null)
            .select(EVENT_SELECT_FIELDS)
            .single();

        if (zipMarkerError) {
            console.error("ZIP marker error", zipMarkerError);
            showMessage("Could not confirm ZIP access. Refresh the page and try again.", "error");
            return;
        }

        selectedEvent = updatedEvent;
        currentEvents = currentEvents.map(item => item.id === updatedEvent.id ? updatedEvent : item);
        const objectUrl = URL.createObjectURL(zipBlob);
        triggerDownload(objectUrl, getGalleryZipFileName());
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        showMessage("Gallery ZIP download started.", "success");
    } catch (error) {
        console.error("Gallery download error", error);
        showMessage("Could not prepare the gallery ZIP. Try again in a moment.", "error");
    } finally {
        updateDownloadGalleryState();
    }
}

function handleGalleryClick(event) {
    const item = event.target.closest(".gallery-item");

    if (!item) {
        return;
    }

    const photoIndex = Number(item.dataset.photoIndex);
    const photo = currentGalleryPhotos[photoIndex];

    if (!photo?.thumbSignedUrl && !photo?.signedUrl) {
        showMessage("Photo preview is not available.", "error");
        return;
    }

    openPhotoPreview(photoIndex);
}

async function openPhotoPreview(photoIndex) {
    const photo = currentGalleryPhotos[photoIndex];

    if (!photo) {
        return;
    }

    currentPreviewIndex = photoIndex;
    const guestName = photo.guests?.name || "Unknown guest";

    previewImage.src = photo.thumbSignedUrl || photo.signedUrl;
    previewImage.alt = `${guestName} photo`;
    previewTitle.textContent = guestName;
    previewSubtitle.textContent = `${formatDateTime(photo.created_at)} · ${formatFileSize(photo.file_size)}`;
    updatePreviewNavigation();

    if (!photoDialog.open && photoDialog.showModal) {
        photoDialog.showModal();
    } else if (!photoDialog.open) {
        photoDialog.setAttribute("open", "");
    }

    document.body.classList.add("is-dialog-open");

    const signedUrl = await getPhotoOriginalSignedUrl(photo);

    if (currentPreviewIndex === photoIndex && signedUrl) {
        previewImage.src = signedUrl;
    }
}

function showAdjacentPhoto(direction) {
    if (!currentGalleryPhotos.length) {
        return;
    }

    const nextIndex = (currentPreviewIndex + direction + currentGalleryPhotos.length) % currentGalleryPhotos.length;
    openPhotoPreview(nextIndex);
}

function updatePreviewNavigation() {
    const hasMultiplePhotos = currentGalleryPhotos.length > 1;
    previewPrevButton.classList.toggle("hidden", !hasMultiplePhotos);
    previewNextButton.classList.toggle("hidden", !hasMultiplePhotos);
}

function closePhotoPreview() {
    if (photoDialog.close) {
        photoDialog.close();
    } else {
        photoDialog.removeAttribute("open");
    }

    previewImage.src = "";
    currentPreviewIndex = -1;
    syncDialogOpenState();
}

function handlePreviewBackdropClick(event) {
    if (event.target === photoDialog) {
        closePhotoPreview();
    }
}

function handlePreviewKeydown(event) {
    if (!photoDialog.open) {
        return;
    }

    if (event.key === "ArrowLeft") {
        showAdjacentPhoto(-1);
    }

    if (event.key === "ArrowRight") {
        showAdjacentPhoto(1);
    }

    if (event.key === "Escape") {
        closePhotoPreview();
    }
}

function handlePreviewTouchStart(event) {
    previewTouchStartX = event.changedTouches?.[0]?.clientX || 0;
}

function handlePreviewTouchEnd(event) {
    const endX = event.changedTouches?.[0]?.clientX || 0;
    const distance = endX - previewTouchStartX;

    if (Math.abs(distance) < 48 || currentGalleryPhotos.length < 2) {
        return;
    }

    showAdjacentPhoto(distance > 0 ? -1 : 1);
}

async function handleDownloadPhoto() {
    const photo = currentGalleryPhotos[currentPreviewIndex];

    if (!photo) {
        showMessage("Could not find the photo to download.", "error");
        return;
    }

    const fileName = getStorageFileName(photo.storage_path);
    setButtonLoading(downloadPhotoButton, true, "Downloading...");

    try {
        const signedUrl = await getPhotoOriginalSignedUrl(photo);

        if (!signedUrl) {
            throw new Error("Original photo URL is not available");
        }

        const response = await fetch(signedUrl);

        if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, fileName);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        showMessage("Photo download started.", "success");
    } catch (error) {
        console.error("Photo download error", error);
        if (photo.signedUrl) {
            triggerDownload(photo.signedUrl, fileName);
            showMessage("Opened the photo for download. If your browser opens it in a new view, save it from there.", "success");
        } else {
            showMessage("Could not prepare the photo download. Try again in a moment.", "error");
        }
    } finally {
        setButtonLoading(downloadPhotoButton, false, "Download Photo");
    }
}

async function handleDeletePhoto() {
    const photo = currentGalleryPhotos[currentPreviewIndex];

    if (!photo || !selectedEvent?.id) {
        showMessage("Could not find the photo to delete.", "error");
        return;
    }

    const confirmed = await requestConfirmation({
        title: "Delete photo?",
        message: "Delete this photo from the gallery?",
        detail: "The original photo and thumbnail will be removed from Storage, and the gallery item will be marked as deleted.",
        confirmText: "Delete"
    });

    if (!confirmed) {
        return;
    }

    setButtonLoading(deletePhotoButton, true, "Deleting...");

    try {
        const pathsToDelete = [photo.storage_path, photo.thumbnail_path].filter(Boolean);
        const { error: storageError } = await supabase
            .storage
            .from(PHOTO_BUCKET)
            .remove(pathsToDelete);

        if (storageError) {
            console.error("Storage delete error", storageError);
            showMessage(toFriendlyStorageDeleteError(storageError.message), "error");
            return;
        }

        const { error: mediaError } = await supabase
            .from("media")
            .update({ status: "deleted" })
            .eq("id", photo.id);

        if (mediaError) {
            console.error("Media delete error", mediaError);
            closePhotoPreview();
            showMessage("The Storage file was deleted, but the gallery status could not be updated.", "error");
            await loadGallery(selectedEvent.id);
            return;
        }

        closePhotoPreview();
        invalidateGalleryCache(selectedEvent.id);
        showMessage("Photo deleted.", "success");
        await loadGallery(selectedEvent.id);
    } catch (error) {
        console.error("Photo delete request error", error);
        showMessage("Could not delete the photo. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(deletePhotoButton, false, "Delete Photo");
    }
}

async function renderQrCode(value) {
    const createQrCode = window.qrcode;

    if (!createQrCode) {
        showMessage("Could not load the QR library. Check your connection.", "error");
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
        showMessage("Event link copied.", "success");
    } catch (_error) {
        showMessage("Could not copy the link. Select and copy the URL manually.", "error");
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
    guestPanel.classList.add("is-photo-mode");
    guestForm.classList.add("hidden");
    photoPanel.classList.remove("hidden");
    hideUploadState();
}

async function optimizePhotoFile(file) {
    try {
        const original = await resizeImageFile(file, {
            maxDimension: ORIGINAL_IMAGE_MAX_DIMENSION,
            quality: ORIGINAL_IMAGE_QUALITY,
            prefix: "optimized"
        });
        const thumbnail = await resizeImageFile(file, {
            maxDimension: THUMBNAIL_IMAGE_MAX_DIMENSION,
            quality: THUMBNAIL_IMAGE_QUALITY,
            prefix: "thumb"
        });

        return {
            original: original.size < file.size ? original : file,
            thumbnail
        };
    } catch (error) {
        console.error("Photo optimization skipped", error);
        return {
            original: file,
            thumbnail: null
        };
    }
}

async function resizeImageFile(file, options) {
    const image = await loadImageForResize(file);
    const { width, height } = calculateResizeDimensions(image.width, image.height, options.maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Canvas is not available");
    }

    context.drawImage(image, 0, 0, width, height);
    releaseLoadedImage(image);

    const blob = await canvasToBlob(canvas, "image/jpeg", options.quality);

    return new File([blob], createOptimizedFileName(file, options.prefix), {
        type: "image/jpeg",
        lastModified: Date.now()
    });
}

async function loadImageForResize(file) {
    if ("createImageBitmap" in window) {
        return createImageBitmap(file);
    }

    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Image could not be loaded"));
        };
        image.src = objectUrl;
    });
}

function releaseLoadedImage(image) {
    if (typeof image.close === "function") {
        image.close();
    }
}

function calculateResizeDimensions(width, height, maxDimension) {
    const longestSide = Math.max(width, height);

    if (longestSide <= maxDimension) {
        return { width, height };
    }

    const scale = maxDimension / longestSide;

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale))
    };
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Image compression failed"));
                return;
            }

            resolve(blob);
        }, type, quality);
    });
}

function createOptimizedFileName(file, prefix) {
    const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
    return `${prefix}-${baseName}.jpg`;
}

function validatePhoto(file) {
    if (!file.type.startsWith("image/")) {
        return "Only photo files are allowed.";
    }

    if (file.size > MAX_PHOTO_SIZE) {
        return `The photo is too large. Maximum size is ${MAX_PHOTO_SIZE_MB} MB.`;
    }

    return "";
}

function createStoragePath(file) {
    const extension = getFileExtension(file);
    const eventFolder = selectedEvent.storage_folder || `${createStorageFolderName(selectedEvent.name)}-${createDeterministicSuffix(selectedEvent.id)}`;
    const guestBaseName = createStorageFolderName(currentGuest.name);
    const guestSuffix = currentGuest.folder_suffix || createNumericSuffix();
    currentGuest.folder_suffix = guestSuffix;
    saveGuest(selectedEvent.slug, currentGuest);

    const guestFolder = `${guestBaseName}-${guestSuffix}`;
    const timestamp = createReadableTimestamp();
    const filename = `${guestBaseName}_${timestamp}.${extension}`;

    return `${eventFolder}/${guestFolder}/${filename}`;
}

function createThumbnailStoragePath(storagePath) {
    const pathParts = storagePath.split("/");
    const filename = pathParts.pop() || `thumbnail_${createReadableTimestamp()}.jpg`;
    const baseName = filename.replace(/\.[^/.]+$/, "") || "photo";
    pathParts.push(`thumb_${baseName}.jpg`);

    return pathParts.join("/");
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
            name: guest.name,
            folder_suffix: guest.folder_suffix || createNumericSuffix()
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

function showUploadState(text, type = "info", autoHide = false) {
    clearTimeout(uploadStateHideTimeout);
    uploadState.textContent = text;
    uploadState.className = `upload-state ${type}`;

    if (autoHide) {
        uploadStateHideTimeout = setTimeout(hideUploadState, 3000);
    }
}

function hideUploadState() {
    clearTimeout(uploadStateHideTimeout);
    uploadState.textContent = "";
    uploadState.classList.add("hidden");
}

function setButtonLoading(button, isLoading, text) {
    button.disabled = isLoading;
    button.classList.toggle("is-loading", isLoading);
    button.setAttribute("aria-busy", String(isLoading));

    if (text) {
        button.textContent = text;
    }
}

function showMessage(text, type) {
    clearTimeout(messageHideTimeout);
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    messageBox.setAttribute("role", type === "error" ? "alert" : "status");
    messageHideTimeout = setTimeout(hideMessage, 3000);
}

function hideMessage() {
    clearTimeout(messageHideTimeout);
    messageBox.textContent = "";
    messageBox.className = "message hidden";
}

function toFriendlyAuthError(message) {
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login")) {
        return "Incorrect email or password.";
    }

    if (normalized.includes("password")) {
        return "Password does not meet the requirements. Use at least 6 characters.";
    }

    if (normalized.includes("email")) {
        return "Check the email address or confirmation status.";
    }

    return "Authentication failed. Try again.";
}

function toFriendlyDatabaseError(message, context = "general") {
    const normalized = message.toLowerCase();

    if (normalized.includes("duplicate") || normalized.includes("unique")) {
        return "This event URL already exists. Try a slightly different event name.";
    }

    if (normalized.includes("violates foreign key")) {
        if (context.startsWith("guest")) {
            return "This event is closed. Photo upload is not available right now.";
        }

        return "Your organizer profile is still being prepared. Log out, log in again, and try once more.";
    }

    if (isPermissionError(normalized)) {
        if (context === "guest-load") {
            return "This event link is not available for photo upload.";
        }

        if (context === "guest-start" || context === "guest-upload") {
            return "This event is closed. Photo upload is not available right now.";
        }

        if (context === "gallery") {
            return "You do not have access to this gallery.";
        }

        if (context.startsWith("organizer")) {
            return "You do not have permission to change this event. Refresh the page and try again.";
        }

        return "You do not have permission to perform this action.";
    }

    if (context.startsWith("guest")) {
        return "Could not continue. Refresh the event link and try again.";
    }

    if (context === "gallery") {
        return "Could not load the gallery. Refresh the page and try again.";
    }

    return "Could not save the data. Check your connection and try again.";
}

function toFriendlyStorageError(message, context = "general") {
    const normalized = message.toLowerCase();

    if (isPermissionError(normalized)) {
        if (context === "guest-upload") {
            return "This event is closed. Photo upload is not available right now.";
        }

        return "You do not have permission to upload photos here.";
    }

    if (normalized.includes("exceeded") || normalized.includes("too large")) {
        return `The photo is too large. Maximum size is ${MAX_PHOTO_SIZE_MB} MB.`;
    }

    return "Photo upload failed. Check your connection and try again.";
}

function toFriendlyStorageDeleteError(message) {
    const normalized = message.toLowerCase();

    if (isPermissionError(normalized)) {
        return "You do not have permission to delete this photo, or it has already been removed.";
    }

    return "Could not delete the Storage file. Check your connection and try again.";
}

function isPermissionError(normalizedMessage) {
    return normalizedMessage.includes("row-level security")
        || normalizedMessage.includes("unauthorized")
        || normalizedMessage.includes("not authorized")
        || normalizedMessage.includes("permission denied")
        || normalizedMessage.includes("insufficient privilege");
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

function createStorageFolderName(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "event";
}

function createNumericSuffix() {
    return String(Math.floor(Math.random() * 9000) + 1000);
}

function createDeterministicSuffix(value) {
    let total = 0;

    for (const char of value) {
        total = (total + char.charCodeAt(0)) % 9000;
    }

    return String(total + 1000).padStart(4, "0");
}

function createReadableTimestamp() {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");

    return [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate())
    ].join("-") + "_" + [
        pad(now.getHours()),
        pad(now.getMinutes()),
        pad(now.getSeconds())
    ].join("-");
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
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(`${dateValue}T00:00:00`));
}

function formatEventDateRange(eventData) {
    const startDate = eventData.start_date || eventData.date;
    const endDate = eventData.end_date || eventData.date || startDate;

    if (!startDate) {
        return "No date set";
    }

    if (!endDate || startDate === endDate) {
        return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function isEventOpenForGuests(eventData) {
    if (eventData.status !== "active") {
        return false;
    }

    const today = getIsoDate(new Date());
    const startDate = eventData.start_date || eventData.date;
    const endDate = eventData.end_date || eventData.date || startDate;

    return Boolean(startDate && endDate && today >= startDate && today <= endDate);
}

function getDisplayEventStatus(eventData) {
    if (eventData.status === "deleted") {
        return "deleted";
    }

    return isEventOpenForGuests(eventData) ? "active" : "inactive";
}

function formatDateTime(dateValue) {
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(dateValue));
}

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    const labels = {
        active: "Active",
        inactive: "Inactive",
        deleted: "Deleted"
    };

    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function getIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getDateDiffInDays(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    return Math.round((end - start) / 86400000);
}

function formatFileSize(bytes) {
    if (!Number.isFinite(bytes)) {
        return "";
    }

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getStorageFileName(storagePath) {
    return storagePath?.split("/").filter(Boolean).pop() || "event-photo.jpg";
}

function getUniqueZipPath(storagePath, usedNames) {
    const cleanPath = storagePath?.split("/").filter(Boolean).join("/") || "event-photo.jpg";

    if (!usedNames.has(cleanPath)) {
        usedNames.add(cleanPath);
        return cleanPath;
    }

    const lastDotIndex = cleanPath.lastIndexOf(".");
    const baseName = lastDotIndex > 0 ? cleanPath.slice(0, lastDotIndex) : cleanPath;
    const extension = lastDotIndex > 0 ? cleanPath.slice(lastDotIndex) : "";
    let counter = 2;
    let candidate = `${baseName}-${counter}${extension}`;

    while (usedNames.has(candidate)) {
        counter += 1;
        candidate = `${baseName}-${counter}${extension}`;
    }

    usedNames.add(candidate);
    return candidate;
}

function getGalleryZipFileName() {
    const eventSlug = selectedEvent?.slug || "event-gallery";
    return `${eventSlug}-photos.zip`;
}

function triggerDownload(url, fileName) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
}
