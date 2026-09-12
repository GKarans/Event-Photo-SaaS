const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('script.js', 'utf8');
function declaration(name) {
    const start = source.search(new RegExp(`(?:async )?function ${name}\\(`));
    const end = source.indexOf('\n}', start) + 2;
    return source.slice(start, end);
}
const element = () => ({ value: '', classList: { add() {}, remove() {}, toggle() {} } });
const context = {
    isAuthConfirmationRoute: true, isPasswordResetRoute: true,
    currentSession: null, currentEvents: [], selectedEvent: null,
    authMode: 'login', profileLoads: 0, eventLoads: 0,
    supabase: { auth: { signOut: async () => {}, signInWithPassword: async () => ({ data: { session: { user: { id: 'A', email: 'test@example.com' } } } }) } },
    history: { replaceState() {} }, setPageMode() {}, setAuthMode() {}, hideMessage() {},
    showMessage() {}, setButtonLoading() {}, renderEvents() {}, showEventsList() {}, console,
    resetOrganizerRequests() {},
};
for (const name of ['authPanel', 'authConfirmationPanel', 'passwordResetPanel', 'passwordResetSuccessPanel', 'dashboardPanel', 'guestPanel', 'dashboardTitle', 'userEmail', 'firstNameInput', 'lastNameInput', 'emailInput', 'passwordInput', 'submitButton']) context[name] = element();
context.emailInput.value = 'test@example.com';
context.passwordInput.value = 'test-only';
context.loadOrganizerProfile = () => context.profileLoads++;
context.loadEvents = () => context.eventLoads++;
vm.createContext(context);
vm.runInContext(['handleGoToLogin', 'handleAuthSubmit', 'renderSession'].map(declaration).join('\n'), context);
(async () => {
    await context.handleGoToLogin();
    assert.equal(context.isAuthConfirmationRoute, false);
    assert.equal(context.isPasswordResetRoute, false);
    // No Auth notification is emitted: login must still open the session.
    await context.handleAuthSubmit({ preventDefault() {} });
    assert.equal(context.currentSession.user.id, 'A');
    assert.equal(context.eventLoads, 1);
    context.renderSession(context.currentSession);
    assert.equal(context.eventLoads, 1, 'Duplicate notification must not reload events');
    context.renderSession(null);
    context.renderSession({ user: { id: 'B' } });
    assert.equal(context.eventLoads, 2);
    console.log('Auth regression checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
