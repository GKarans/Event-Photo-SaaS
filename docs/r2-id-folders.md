# R2 object folders

Apply `supabase/migrations/20260912_r2_id_folders.sql` as a new Supabase SQL
Editor query after the R2 storage migration. It is safe to run twice and is
independent of the event-times migration. No Worker redeployment is needed
for the reservation folder change.

New reservations use database IDs, never event names or guest names:

```text
events/<event-uuid>/guests/<guest-uuid>/photo-<object-uuid>.webp
events/<event-uuid>/guests/<guest-uuid>/thumb-<object-uuid>.webp
events/<event-uuid>/covers/<object-uuid>.webp
```

The database trigger derives the guest from the media record. Retries reuse
the existing reservation and object key. Existing `objects/` and `migrated/`
keys are not renamed: registry-based reads continue to work.

The legacy migration script uses the same ID folders for newly copied files,
preserving JPEG/PNG/WebP extensions. Already registered copies retain their
keys. Source Supabase files are not deleted. A missing guest ID stops the
copy for investigation instead of placing the photo under the wrong guest.

Folders do not grant access. The bucket remains private and Worker access
checks still apply. Do not manually rename objects in the R2 console.

Verification: `npm run test:r2` passed locally, including repeated migration,
unchanged legacy keys, thumbnail guest prefix, cover event prefix and retry
key stability. User confirmed production SQL application: Success. No rows returned.
