# Darbināšanas vides apraksts

## Dokumenta mērķis

Šis dokuments apraksta Event Photo SaaS MVP darbināšanas vidi: Netlify hostingu, Supabase backend konfigurāciju, GitHub repozitoriju, Auth iestatījumus, Storage konfigurāciju un deploy kārtību.

Dokuments paredzēts prakses pierādījumam un projekta uzturēšanai pēc praktiskā testa.

## Vides pārskats

MVP sastāv no trim galvenajām ārējām vidēm:

- GitHub - projekta koda glabāšanai un versiju kontrolei;
- Netlify - statiskās frontend lietotnes hostēšanai;
- Supabase - Auth, Database un Storage funkcijām.

Frontend ir statiska HTML/CSS/JavaScript lietotne. Netlify neveic servera loģiku. Supabase nodrošina visu datu un failu drošības slāni.

## GitHub

GitHub repozitorijs:

- `GKarans/Event-Photo-SaaS`

Galvenais branch:

- `main`

GitHub tiek izmantots:

- koda versiju kontrolei;
- pierādījumam par paveiktajiem prakses darbiem;
- commit vēsturei pa posmiem;
- Netlify automātiskajam deploy no `main` branch.

Darba kārtība:

1. Izmaiņas tiek veiktas lokāli.
2. Tiek palaistas pārbaudes, piemēram `node --check script.js`.
3. Tiek izveidots loģisks Git commit.
4. Kad izmaiņas ir gatavas publicēšanai, tās tiek pushotas uz `main`.
5. Netlify paņem jaunāko `main` branch stāvokli un veic production deploy.

## Netlify

Production URL:

- `https://event-photo-saas.netlify.app`

Netlify funkcija šajā MVP:

- hostēt frontend failus;
- nodrošināt publisku HTTPS adresi;
- apstrādāt route pāradresācijas uz `index.html`.

Build konfigurācija:

- build command: nav vajadzīgs;
- publish directory: projekta sakne `.`.

Route konfigurācija atrodas `netlify.toml`:

```toml
[build]
publish = "."

[[redirects]]
from = "/event/*"
to = "/index.html"
status = 200

[[redirects]]
from = "/auth/*"
to = "/index.html"
status = 200
```

Šī konfigurācija ir nepieciešama, jo lietotne izmanto frontend route:

- `/event/{slug}` guest linkiem;
- `/auth/confirmed` e-pasta apstiprināšanas rezultātam.

Bez šīm pāradresācijām Netlify mēģinātu atrast fizisku mapi vai failu un refresh/QR atvēršana varētu beigties ar 404.

## Supabase

Supabase projekta publiskā adrese:

- `https://ojcvnsbhphvijmzjfenl.supabase.co`

Supabase funkcijas MVP:

- organizatoru autentifikācija;
- datubāzes tabulas `users`, `events`, `guests`, `media`;
- privāts Storage bucket foto failiem;
- RLS un Storage policies piekļuves kontrolei.

Supabase SQL shēma atrodas:

- `supabase/schema.sql`

SQL shēma jāpalaiž Supabase SQL Editorā pēc datubāzes izmaiņām. Tā satur tabulas, indeksus, RLS policies, Storage bucket konfigurāciju un Auth trigger funkciju organizatora profila izveidei.

## Auth Settings

Supabase Authentication konfigurācijā jābūt:

- Signups enabled;
- Confirm email enabled;
- Site URL: `https://event-photo-saas.netlify.app`;
- Redirect URL: `https://event-photo-saas.netlify.app/auth/confirmed`.

Frontend reģistrācijas kods izmanto `emailRedirectTo`, lai e-pasta apstiprināšana atgrieztu lietotāju production lapā, nevis `localhost`.

MVP Auth princips:

- organizatoram vajag kontu;
- viesim kontu nevajag;
- viesis piekļūst eventam tikai caur konkrēto QR/guest linku.

## Database

Galvenās tabulas:

- `users` - organizatora profils;
- `events` - organizatora eventi;
- `guests` - viesu ieraksti konkrētā eventā;
- `media` - foto metadati un Storage ceļš.

Svarīgākie drošības principi:

- RLS ir ieslēgts visām galvenajām tabulām;
- organizators redz tikai savus eventus;
- organizators redz tikai savu eventu viesus un foto;
- viesis var izveidot `guests` un `media` ierakstu tikai aktīvam eventam;
- event pieejamība tiek pārbaudīta pēc `Europe/Riga` datuma ar `public.current_app_date()`.

## Storage

Storage bucket:

- `event-photos`

Bucket konfigurācija:

- private bucket;
- maksimālais foto izmērs: 6 MB;
- atļautie formāti: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`, `image/heif`.

Storage ceļa struktūra:

```text
event-name-1234/
  guest-name-5678/
    guest-name_2026-08-16_14-37-11.jpg
    thumb_guest-name_2026-08-16_14-37-11.jpg
event-covers/
  event-name-1234/
    cover_2026-08-31_18-45-20.jpg
```

Storage piekļuves princips:

- viesis var tikai augšupielādēt foto aktīvam eventam;
- viesis neredz Storage failu sarakstu;
- organizators var lasīt un dzēst tikai sava eventa Storage failus;
- galerijas grid izmanto īslaicīgas signed URLs thumbnail failiem;
- oriģinālie foto tiek pieprasīti tikai preview, dzēšanai un ZIP sagatavošanai;
- cover attēli tiek izmantoti tikai konkrētā eventa guest ekrānam.

## Environment variables un secrets

Frontendā drīkst būt tikai Supabase publishable/anon key, jo tā ir paredzēta lietošanai klienta pusē kopā ar RLS.

Repo nedrīkst glabāt:

- Supabase service role key;
- privātas API atslēgas;
- Dropbox vai citu servisu secrets;
- paroles vai refresh tokenus.

Iepriekšējie Dropbox env mainīgie MVP versijā vairs netiek izmantoti, jo foto plūsma pārcelta uz Supabase Storage.

## Deploy kārtība

Standarta deploy process:

1. Pārbaudīt lokālo Git statusu ar `git status -sb`.
2. Veikt koda vai dokumentācijas izmaiņas.
3. Palaist tehnisko pārbaudi:
   - `node --check script.js`, ja mainīts JavaScript;
   - `git diff --check`, lai pārbaudītu formatēšanas kļūdas.
4. Izveidot Git commit ar skaidru nosaukumu.
5. Push uz GitHub `main` branch.
6. Netlify automātiski sāk production deploy.
7. Pēc deploy pārbaudīt production lapu:
   - login;
   - event list;
   - event detail;
   - guest link;
   - QR;
   - upload;
   - gallery;
   - ZIP download pēc eventa beigām.

Ja mainīta Supabase SQL shēma, tad pirms production testa:

1. Palaist aktuālo `supabase/schema.sql` Supabase SQL Editorā.
2. Pārbaudīt, ka policies ir izveidotas bez kļūdām.
3. Tikai tad testēt production frontend plūsmu.

## Darbināšanas riski

Svarīgākie riski:

- Netlify deploy nav jaunākais, ja commit ir tikai lokāli vai GitHub push nav veikts;
- Supabase SQL shēma nav palaista pēc policy izmaiņām;
- e-pasta confirmation link atver nepareizu URL, ja Auth settings nav pareizi;
- viesu upload var tikt bloķēts, ja events nav aktīvs vai ir ārpus perioda;
- galerijas ielāde kļūst lēnāka pie lielāka foto skaita;
- Supabase egress var pieaugt, ja bieži tiek ielādēti oriģinālie foto vai atkārtoti veidots ZIP.

Risinājumi:

- salīdzināt Netlify production commit ar GitHub jaunāko commit;
- pēc SQL izmaiņām vienmēr palaist pilnu aktuālo shēmu vai konkrētu migration bloku;
- uzturēt pareizu Site URL un Redirect URL Supabase Auth konfigurācijā;
- pirms testa pārbaudīt event statusu un datuma periodu;
- optimizēt galeriju ar thumbnails, signed URL batch pieprasījumiem, cache un lazy loading;
- ierobežot ZIP lejupielādi līdz vienai reizei pēc eventa beigām;
- samazināt augšupielādējamo foto izmēru ar client-side optimizāciju.

## Praktiskais secinājums

MVP darbināšanas vide ir vienkārša un piemērota prakses projektam: GitHub nodrošina versiju kontroli, Netlify nodrošina production frontend, bet Supabase nodrošina autentifikāciju, datubāzi, Storage un piekļuves kontroli.

Šāda arhitektūra ļauj uzturēt produktu bez atsevišķa servera, vienlaikus saglabājot pietiekamu drošības līmeni ar RLS un privātu Storage bucket.
