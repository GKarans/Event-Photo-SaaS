import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ojcvnsbhphvijmzjfenl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5tHxxBuBgQJagyqIKuVVyg_2ZtruZ6J";
const APP_URL = "https://event-photo-saas.netlify.app";
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
let editingEventId = "";
let allGalleryPhotos = [];
let currentGalleryPhotos = [];
let currentPreviewIndex = -1;
let previewTouchStartX = 0;
const activeEventSlug = getEventSlugFromPath();
const isAuthConfirmationRoute = window.location.pathname === "/auth/confirmed";

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
eventsList.addEventListener("click", handleEventsListClick);
backToEventsButton.addEventListener("click", showEventsList);
copyEventLinkButton.addEventListener("click", handleCopyEventLink);
editEventButton.addEventListener("click", handleEditSelectedEvent);
toggleEventStatusButton.addEventListener("click", handleToggleSelectedEventStatus);
downloadQrButton.addEventListener("click", handleDownloadQr);
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
photoDialog.addEventListener("close", () => document.body.classList.remove("is-dialog-open"));
photoDialog.addEventListener("touchstart", handlePreviewTouchStart, { passive: true });
photoDialog.addEventListener("touchend", handlePreviewTouchEnd);
document.addEventListener("keydown", handlePreviewKeydown);
guestForm.addEventListener("submit", handleGuestStart);
changeGuestButton.addEventListener("click", handleChangeGuest);
takePhotoButton.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", handlePhotoSelected);

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
    authConfirmationPanel.classList.add("hidden");
    dashboardPanel.classList.add("hidden");
    guestPanel.classList.add("hidden");
    authPanel.classList.remove("hidden");
    setAuthMode("login");
    hideMessage();
}

async function handleLogout() {
    setButtonLoading(logoutButton, true, "...");

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
        setButtonLoading(logoutButton, false, "⎋");
    }
}

function renderSession(session) {
    const isLoggedIn = Boolean(session?.user);
    currentSession = session;

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
    authPanel.classList.add("hidden");
    authConfirmationPanel.classList.add("hidden");
    dashboardPanel.classList.add("hidden");
    guestPanel.classList.remove("hidden");
    hideMessage();

    guestEventTitle.textContent = "Loading event...";
    guestEventDate.textContent = "";

    const { data, error } = await supabase
        .from("events")
        .select("id,name,date,start_date,end_date,slug,status,storage_folder")
        .eq("slug", slug)
        .maybeSingle();

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

    if (!isEventOpenForGuests(data)) {
        guestEventTitle.textContent = "This event is closed";
        guestEventDate.textContent = "Photo upload is not available for this event right now.";
        guestForm.classList.add("hidden");
        photoPanel.classList.add("hidden");
        return;
    }

    selectedEvent = data;
    guestEventTitle.textContent = data.name;
    guestEventDate.textContent = formatEventDateRange(data);

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
        setButtonLoading(startButton, false, "Start");
    }
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

    openEditEventModal(selectedEvent);
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

    if (nextStatus === "active" && getIsoDate(new Date()) > (eventData.end_date || eventData.date)) {
        showMessage("This event period has ended. Edit the period before activating it.", "error");
        return;
    }

    const label = nextStatus === "active" ? "Activating..." : "Deactivating...";
    setButtonLoading(button, true, label);

    try {
        const { error } = await supabase
            .from("events")
            .update({ status: nextStatus })
            .eq("id", eventData.id);

        if (error) {
            showMessage(toFriendlyDatabaseError(error.message, "organizer-event"), "error");
            return;
        }

        showMessage(nextStatus === "active" ? "Event activated." : "Event deactivated.", "success");
        await loadEvents();

        if (selectedEvent?.id === eventData.id) {
            const updatedEvent = currentEvents.find(item => item.id === eventData.id);

            if (updatedEvent) {
                await showEventDetail(updatedEvent);
            } else {
                showEventsList();
            }
        }
    } catch (error) {
        console.error("Event status update error", error);
        showMessage("Could not update event status. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(button, false, nextStatus === "active" ? "Activate" : "Deactivate");
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
            showUploadState("Upload failed.", "error");
            showMessage(toFriendlyStorageError(uploadError.message, "guest-upload"), "error");
            return;
        }

        showUploadState("Photo uploaded. Saving gallery details...", "loading");

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

        if (mediaError) {
            console.error("Media insert error", mediaError);
            showUploadState("The photo file was saved, but the gallery record could not be created.", "error");
            showMessage(toFriendlyDatabaseError(mediaError.message, "guest-upload"), "error");
            return;
        }

        showUploadState("Photo uploaded. You can take another photo.", "success");
        showMessage("Photo uploaded!", "success");
    } catch (error) {
        console.error("Photo upload request error", error);
        showUploadState("Upload failed.", "error");
        showMessage("Photo upload failed. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(takePhotoButton, false, "Take Photo");
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

    const { data, error } = await supabase
        .from("events")
        .select("id,name,date,start_date,end_date,slug,status,storage_folder,created_at")
        .eq("owner_id", currentSession.user.id)
        .neq("status", "deleted")
        .gte("end_date", getIsoDate(addDays(new Date(), -3)))
        .order("created_at", { ascending: false });

    if (error) {
        eventsCount.textContent = "Could not load events.";
        showMessage(toFriendlyDatabaseError(error.message, "organizer-events"), "error");
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
        eventsCount.textContent = "You do not have any events yet.";
        eventsList.innerHTML = `
            <div class="empty-state">
                <strong>No events yet</strong>
                <span>Create your first event to generate a guest link and QR code.</span>
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
            <div class="event-card-info">
                <h3></h3>
                <p></p>
            </div>
            <div class="event-card-actions">
                <button class="secondary-button compact-button open-event-button" type="button"></button>
                <button class="secondary-button compact-button edit-event-button" type="button"></button>
                <button class="secondary-button compact-button toggle-event-status-card-button" type="button"></button>
                <button class="danger-button compact-button delete-event-button" type="button"></button>
            </div>
            <span class="status-pill"></span>
        `;

        card.dataset.eventId = event.id;
        card.querySelector("h3").textContent = event.name;
        card.querySelector("p").textContent = eventDate;
        card.querySelector(".status-pill").textContent = formatStatus(displayStatus);
        card.querySelector(".status-pill").classList.toggle("is-inactive", displayStatus !== "active");
        card.querySelector(".open-event-button").textContent = "Open";
        card.querySelector(".edit-event-button").textContent = "Edit";
        card.querySelector(".toggle-event-status-card-button").textContent = event.status === "inactive" ? "Activate" : "Deactivate";
        card.querySelector(".delete-event-button").textContent = "Delete";
        fragment.appendChild(card);
    }

    eventsList.appendChild(fragment);
}

async function handleEventsListClick(event) {
    const openButton = event.target.closest(".open-event-button");
    const editButton = event.target.closest(".edit-event-button");
    const toggleStatusButton = event.target.closest(".toggle-event-status-card-button");
    const deleteButton = event.target.closest(".delete-event-button");
    const button = openButton || editButton || toggleStatusButton || deleteButton;

    if (!button) {
        return;
    }

    const card = button.closest(".event-card");
    const eventData = currentEvents.find(item => item.id === card?.dataset.eventId);

    if (!eventData) {
        showMessage("Could not find this event in the list.", "error");
        return;
    }

    if (deleteButton) {
        await handleDeleteEvent(eventData, deleteButton);
        return;
    }

    if (editButton) {
        openEditEventModal(eventData);
        return;
    }

    if (toggleStatusButton) {
        await handleToggleEventStatus(eventData, toggleStatusButton);
        return;
    }

    showEventDetail(eventData);
}

async function handleDeleteEvent(eventData, button) {
    const confirmed = window.confirm(`Delete "${eventData.name}"? Guests will no longer be able to upload photos to this event.`);

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

        showMessage("Event deleted.", "success");
        await loadEvents();
    } catch (error) {
        console.error("Event delete error", error);
        showMessage("Could not delete the event. Check your connection and try again.", "error");
    } finally {
        setButtonLoading(button, false, "Delete");
    }
}

async function showEventDetail(eventData) {
    selectedEvent = eventData;
    const eventUrl = getEventUrl(eventData);

    eventsListHeader.classList.add("hidden");
    eventsList.classList.add("hidden");
    eventDetail.classList.remove("hidden");

    eventDetailTitle.textContent = eventData.name;
    eventDetailDate.textContent = formatEventDateRange(eventData);
    eventDetailStatus.textContent = formatStatus(getDisplayEventStatus(eventData));
    toggleEventStatusButton.textContent = eventData.status === "inactive" ? "Activate" : "Deactivate";
    eventDetailUrl.textContent = eventUrl;

    await renderQrCode(eventUrl);
    await loadGallery(eventData.id);
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
    eventDetail.classList.add("hidden");
    eventsListHeader.classList.remove("hidden");
    eventsList.classList.remove("hidden");
}

async function loadGallery(eventId) {
    galleryCount.textContent = "Loading photos...";
    galleryGrid.innerHTML = "";
    currentGalleryPhotos = [];
    downloadGalleryButton.disabled = true;

    const { data, error } = await supabase
        .from("media")
        .select(`
            id,
            storage_path,
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
        return;
    }

    const signedPhotos = await createSignedGalleryPhotos(data);
    const availablePhotos = signedPhotos.filter(photo => photo.signedUrl);
    allGalleryPhotos = availablePhotos;
    populateGalleryGuestFilter(availablePhotos);
    applyGalleryControls();
}

async function createSignedGalleryPhotos(photos) {
    const signedPhotos = [];

    for (const photo of photos) {
        const { data, error } = await supabase
            .storage
            .from(PHOTO_BUCKET)
            .createSignedUrl(photo.storage_path, 60 * 10);

        if (error) {
            console.error("Signed URL error", error);
            signedPhotos.push({
                ...photo,
                signedUrl: "",
                signedUrlError: error.message
            });
            continue;
        }

        signedPhotos.push({
            ...photo,
            signedUrl: data.signedUrl,
            signedUrlError: ""
        });
    }

    return signedPhotos;
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

function handleClearGalleryFilters() {
    galleryGuestFilter.value = "";
    gallerySort.value = "newest";
    applyGalleryControls();
}

function renderGallery(photos) {
    galleryGrid.innerHTML = "";

    if (!photos.length) {
        galleryCount.textContent = allGalleryPhotos.length ? "No photos match this filter." : "No photos yet.";
        downloadGalleryButton.disabled = true;
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
    downloadGalleryButton.disabled = false;

    const fragment = document.createDocumentFragment();

    for (const [index, photo] of photos.entries()) {
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
        image.src = photo.signedUrl;
        image.alt = `${guestName} photo`;
        image.loading = "lazy";
        thumbWrap.appendChild(image);

        button.querySelector("span").textContent = `${guestName} · ${uploadedAt}`;
        fragment.appendChild(button);
    }

    galleryGrid.appendChild(fragment);
}

async function handleDownloadGallery() {
    if (!currentGalleryPhotos.length) {
        showMessage("There are no photos to download yet.", "error");
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

            const response = await fetch(photo.signedUrl);

            if (!response.ok) {
                throw new Error(`Download failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const zipPath = getUniqueZipPath(photo.storage_path, usedNames);
            zip.file(zipPath, blob);
        }

        downloadGalleryButton.textContent = "Preparing ZIP...";
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const objectUrl = URL.createObjectURL(zipBlob);
        triggerDownload(objectUrl, getGalleryZipFileName());
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        showMessage("Gallery ZIP download started.", "success");
    } catch (error) {
        console.error("Gallery download error", error);
        showMessage("Could not prepare the gallery ZIP. Try again in a moment.", "error");
    } finally {
        downloadGalleryButton.disabled = !currentGalleryPhotos.length;
        downloadGalleryButton.textContent = "Download All";
    }
}

function handleGalleryClick(event) {
    const item = event.target.closest(".gallery-item");

    if (!item) {
        return;
    }

    const photoIndex = Number(item.dataset.photoIndex);
    const photo = currentGalleryPhotos[photoIndex];

    if (!photo?.signedUrl) {
        showMessage("Photo preview is not available.", "error");
        return;
    }

    openPhotoPreview(photoIndex);
}

function openPhotoPreview(photoIndex) {
    const photo = currentGalleryPhotos[photoIndex];

    if (!photo) {
        return;
    }

    currentPreviewIndex = photoIndex;
    const guestName = photo.guests?.name || "Unknown guest";

    previewImage.src = photo.signedUrl;
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
    document.body.classList.remove("is-dialog-open");
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

    if (!photo?.signedUrl) {
        showMessage("Could not find the photo to download.", "error");
        return;
    }

    const fileName = getStorageFileName(photo.storage_path);
    setButtonLoading(downloadPhotoButton, true, "Downloading...");

    try {
        const response = await fetch(photo.signedUrl);

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
        triggerDownload(photo.signedUrl, fileName);
        showMessage("Opened the photo for download. If your browser opens it in a new view, save it from there.", "success");
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

    const confirmed = window.confirm("Delete this photo from the gallery?");

    if (!confirmed) {
        return;
    }

    setButtonLoading(deletePhotoButton, true, "Deleting...");

    try {
        const { error: storageError } = await supabase
            .storage
            .from(PHOTO_BUCKET)
            .remove([photo.storage_path]);

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
    guestForm.classList.add("hidden");
    photoPanel.classList.remove("hidden");
    hideUploadState();
}

function validatePhoto(file) {
    if (!file.type.startsWith("image/")) {
        return "Only photo files are allowed.";
    }

    if (file.size > MAX_PHOTO_SIZE) {
        return "The photo is too large. Maximum size is 10 MB.";
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

function showUploadState(text, type = "info") {
    uploadState.textContent = text;
    uploadState.className = `upload-state ${type}`;
}

function hideUploadState() {
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
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    messageBox.setAttribute("role", type === "error" ? "alert" : "status");
}

function hideMessage() {
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
        return "The photo is too large. Maximum size is 10 MB.";
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
