# Event Photo SaaS

Photo-only SaaS MVP pasakumu kopigai fotografiju apkopsanai. Organizators izveido pasakumu, sanem viesu saiti un QR kodu, bet viesi bez konta var uznemt un pievienot foto no telefona. Pec pasakuma organizators sava privataja galerija var apskatit, filtret, dzest un lejupieladet foto ZIP arhiva.

Production vide: [event-photo-saas.netlify.app](https://event-photo-saas.netlify.app/)

## MVP statuss

Production pamatplusma ir parbaudita ar iPhone 13 Pro un Samsung Galaxy S23:

```text
Register -> e-pasta apstiprinasana -> Login -> Create event -> QR/link
-> Guest name -> Take Photo -> R2 upload -> Gallery -> Delete / ZIP
```

Jaunie foto tiek glabati privata Cloudflare R2 bucket. Supabase nodrosina autentifikaciju, PostgreSQL datubazi un piekluves noteikumus. Vecie Supabase Storage faili nav parvietoti un saglaba lasisanas saderibu.

## Galvenas funkcijas

- Organizatora registracija, e-pasta apstiprinasana, login, logout un paroles atjaunosana.
- Organizatora profils ar vardu, uzvardu un e-pastu.
- Pasakuma izveide ar precizu sakuma un beigu laiku.
- Laika zona tiek noteikta automatiski; datubaze glaba viennozimigus UTC momentus.
- Pasakuma aktivizesana, deaktivizesana un arhivesana.
- Unikala viesu saite un lejupieladejams QR kods.
- Viesa plusma bez konta: QR/link -> vards -> kamera -> upload.
- Photo-only validacija, WebP optimizacija un thumbnail izveide parluka.
- Jauno foto tiesa augšupielade privata R2 ar islaicigu presigned PUT adresi.
- Organizatora galerija ar thumbnails, preview, viesu filtru un kartosanu.
- Viesu galerijas kopigosana pec pasakuma ar organizatora noteiktu terminu.
- Foto dzesana un pilna ZIP eksporta sagatavosana pec pasakuma.
- Responsive mobile-first saskarne Android Chrome un iPhone Safari.
- RLS un servera puses autorizacija organizatoru datu nodalisanai.

## Tehnologijas

- Frontend: HTML, CSS un JavaScript
- Autentifikacija: Supabase Auth
- Datubaze: Supabase PostgreSQL ar Row Level Security
- Jauno foto glabasana: privats Cloudflare R2
- Media API: Cloudflare Worker
- Veco foto saderiba: privats Supabase Storage bucket `event-photos`
- Hostings: Netlify
- QR: `qrcode-generator`
- ZIP: `JSZip`
- Testi: Node.js, PGlite un Playwright

## Arhitekturas kopsavilkums

```text
Organizators / viesis
        |
        v
Netlify statiskais frontend
   |                 |
   v                 v
Supabase Auth/DB   Cloudflare Worker
   |                 |
   v                 v
RLS un RPC        privats R2 bucket
```

Frontend satur tikai Supabase publishable key un publisku Worker URL. R2 atslēgas, Supabase service role key un media parakstisanas noslepums ir tikai Worker secretos.

Detalizeti: [arhitektura](docs/architecture.md), [datu modelis](docs/database-model.md), [R2 integracija](docs/r2-storage.md).

## Projekta struktura

```text
.
|-- index.html
|-- style.css
|-- script.js
|-- r2-storage.js
|-- guest-gallery.js
|-- reliability.js
|-- storage-config.js
|-- cloudflare/
|   |-- media-worker.js
|   `-- wrangler.toml
|-- scripts/
|-- supabase/
|   |-- schema.sql
|   `-- migrations/
|-- tests/
|-- docs/
|-- netlify.toml
`-- package.json
```

## Lokala palaisana

Prieks nosacijumi: Node.js 22 un instaletas pakotnes.

```bash
npm install
npm start
```

Atver terminala paradito adresi. Noklusejuma preview skripts izmanto `http://127.0.0.1:5604/`.

Build parbaude:

```bash
npm run build
```

Build izveido publicejamo `dist/` direktoriju un parbauda, ka taja nav neparedzetu failu.

## Testesana

Pilna lokala parbaude:

```bash
npm test
```

Atseviski R2 integracijas testi:

```bash
npm run test:r2
```

Testu kopa parbauda:

- statiskas vietnes build saturu;
- Auth sesijas un redirect regresijas;
- upload retry un finalize uzvedibu;
- R2 Worker CORS, parakstus, piekluves liegumus un dzesanu;
- SQL RLS/RPC robezas, eventa laikus un galerijas piekluvi;
- organizatora un viesa galvenos UI stavoklus.

Automatizeti testi neaizstaj production konfiguracijas un realu telefonu parbaudi. Praktiskais pieradijumu indekss: [docs/evidence/practice/README.md](docs/evidence/practice/README.md).

## Supabase konfiguracija

Jaunam projektam vispirms palaid:

```text
supabase/schema.sql
```

Esosam projektam migracijas japielieto hronologiska seciba:

```text
20260911_guest_gallery.sql
20260912_media_reliability.sql
20260912_r2_storage.sql
20260912_r2_id_folders.sql
20260912_event_times.sql
20260914_r2_readable_folders.sql
```

Pec izpildes parbaudi tabulas `users`, `events`, `guests`, `media`, `gallery_shares` un `r2_objects`, ka ari aktivu RLS. Veco failu saderibai bucket `event-photos` paliek privats.

Auth production iestatijumi:

```text
Site URL: https://event-photo-saas.netlify.app
Redirect URLs:
https://event-photo-saas.netlify.app/auth/confirmed
https://event-photo-saas.netlify.app/auth/reset-password
```

Repozitorija drikst atrasties tikai Supabase publishable key. Service role key, R2 access keys, paroles un citi noslepumi nedrikst but frontend koda vai Git vesture.

## Cloudflare R2 un Worker

Production Worker:

```text
https://event-photo-media.gkarans-events.workers.dev
```

Worker pienakumi:

- parbaudit organizatora JWT vai viesa galerijas piekluvi;
- rezervet objektu ar servera RPC;
- izveidot islaicigu presigned PUT adresi vienam objektam;
- piegadat privatu originalu vai thumbnail tikai pec autorizacijas;
- dzest R2 objektus un atjaunot datubazes stavokli.

Uzstadisana un noslepumi aprakstiti [docs/r2-storage.md](docs/r2-storage.md). Slepenas vertibas dokumentacija nav publicetas.

## Netlify deploy

`netlify.toml` ir repozitorija un nosaka:

```text
Build command: npm run build
Publish directory: dist
Node version: 22
Deploy branch: main
```

SPA redirects nodrosina tiesas `/event/*` un `/auth/*` adreses. Production publicesana tiek veikta pec GitHub `main` atjauninasanas un veiksmiga Netlify build.

## Organizer flow

1. Organizators registrejas un apstiprina e-pastu.
2. Piesledzas dashboard un izveido pasakumu.
3. Norada precizu sakuma/beigu laiku un pielago viesa dizainu.
4. Nokopē viesa saiti vai lejupielade QR kodu.
5. Pec pasakuma apskata galeriju, dzes nevajadzigos foto un sagatavo ZIP.
6. `Delete` no galvena saraksta pasakumu parvieto uz arhivu, nevis uzreiz fiziski dzes failus.

## Guest flow

1. Viesis noskene QR kodu vai atver pasakuma saiti.
2. Ievada vardu un uzvardu.
3. Nospiez `Let's go` un organizatora defineto kameras pogu.
4. Telefons atver aizmugurejo kameru, ja parluks to atbalsta.
5. Frontend izveido optimizetu WebP foto un thumbnail.
6. Klients sanem no Worker divas islaicigas upload adreses un suta failus tiesi uz privatu R2.
7. Pec abu objektu parbaudes Worker pabeidz `media` ierakstu; tikai tad foto klust redzams galerija.

Viesim nav organizatora konta un nav pieejams dashboard.

## Glabasanas optimizacija

- Video nav atbalstits.
- Optimizeta foto tehniskais limits ir 6 MiB.
- Thumbnail limits ir 1 MiB.
- Galerijas rezgis ielade thumbnails; originals tiek prasits preview un ZIP vajadzibam.
- R2 bucket nav publisks; katrs lasisanas pieprasijums iziet caur Worker.
- Failu atslegas ietver nemainigus ID, bet Cloudflare paneli izmanto ari lasamus organizatora, pasakuma un viesa prefiksus.
- Vecie Supabase Storage foto netiek parvietoti vai dzesti bez atseviskas verificetas migracijas.

## Dokumentacija

- [Arhitektura](docs/architecture.md)
- [Datubazes modelis](docs/database-model.md)
- [Drošiba un RLS](docs/security-rls.md)
- [Testesanas plans](docs/testing-plan.md)
- [Testesanas rezultati](docs/testing-report.md)
- [Lietotaju plusmas](docs/user-flows.md)
- [Darbināšanas vide](docs/deployment-environment.md)
- [Prakses pieradijumi](docs/evidence/practice/README.md)

## MVP robezas

MVP neietver video, maksajumus, abonementus, komandu kontus, servera puses attelu apstradi vai servera puses ZIP sagatavosanu. Prioritate ir stabila photo-only pamatplusma, piekluves kontrole un uzturama demonstracijas vide.
