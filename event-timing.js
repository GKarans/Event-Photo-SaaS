export const EVENT_TIME_ZONE = 'Europe/Riga';

export function localTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function dateInZone(zone = localTimeZone(), now = new Date()) {
    return new Intl.DateTimeFormat('sv-SE', {timeZone:zone}).format(now);
}

export function formatTimedPeriod(event, zone = localTimeZone()) {
    const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:zone, day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hourCycle:'h23'});
    return `${formatter.format(new Date(event.starts_at))} - ${formatter.format(new Date(event.ends_at))}`;
}

export function periodIsCurrent(event, now = Date.now()) {
    if (event?.starts_at && event?.ends_at) return now >= Date.parse(event.starts_at) && now < Date.parse(event.ends_at);
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: EVENT_TIME_ZONE }).format(new Date(now));
    return Boolean(event && (event.start_date || event.date) <= today && today <= (event.end_date || event.date));
}

export function periodHasEnded(event, now = Date.now()) {
    if (event?.ends_at) return now >= Date.parse(event.ends_at);
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: EVENT_TIME_ZONE }).format(new Date(now));
    return Boolean(event && today > (event.end_date || event.date));
}

export function validateClockPeriod(startDate, endDate, startTime, endTime) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(endTime)) return 'Enter both start and end times.';
    if (`${endDate}T${endTime}` <= `${startDate}T${startTime}`) return 'End time must be after start time.';
    return '';
}
