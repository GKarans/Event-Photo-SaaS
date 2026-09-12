# Event clocks

New events capture the organizer browser's IANA time zone automatically.
There is no visible time zone selector or zone label. Start/end clock inputs
use that zone. Editing preserves the stored zone, including after travel.
Guests see timed periods converted to their browser's local time. Device
date/time settings must therefore be correct. This does not infer a venue's
zone from physical location or an address.

The database generates `starts_at` and `ends_at` UTC instants. Upload is
allowed at start (inclusive) and denied at end (exclusive). Sharing and ZIP
become available at end, without waiting for midnight. Sharing still requires
the organizer to enable it. Existing all-day events retain Europe/Riga and
end at the following midnight. Choosing All day uses the saved event zone.

Run `supabase/migrations/20260912_event_times.sql` in a NEW SQL Editor query
after the R2 storage migration and BEFORE deploying this frontend. Do not
replace or rerun the baseline schema over an existing production database.
The ID-folder migration is independent and its trigger remains in place.

Tests: `node tests/event-times.cjs` covers boundaries, legacy all-day,
New York/Riga conversion, invalid zones, DST invalid/ambiguous clocks,
same-day sharing and the ZIP schedule lock. Browser UI tests cover clock
inputs. Production SQL application and real-device timed-event testing
are tracked in the testing report. Reload the event view to pick up time-boundary changes.
