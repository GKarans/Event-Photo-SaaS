# Event Photo SaaS

Photo-only SaaS MVP pasakumu kopigai foto apkopošanai. Organizators izveido pasakumu, iegust viesu saiti un QR kodu, bet viesi bez konta var pievienot foto no telefona. Organizators pec tam savā privātajā galerijā redz, pārskata, dzēš un pēc pasākuma lejupielādē foto ZIP arhīvā.

Production URL: https://event-photo-saas.netlify.app/

## Galvenās funkcijas

- Organizatora register, login, logout un sesijas saglabāšana.
- Organizatora profils ar vārdu, uzvārdu un e-pastu.
- Event izveide ar sākuma un beigu datumu.
- Maksimālais event periods: 3 dienas.
- Event aktivizēšana, deaktivizēšana un dzēšana.
- Unikāla guest saite un QR kods katram eventam.
- Guest flow bez konta: QR/link -> vārds -> Take Photo -> upload.
- Guest UX pielāgošana: cover photo, title, subtitle, camera button text un cover pozīcija.
- Mobile guest skats centrēts iPhone/Android viewportā ar safe-area atstarpi pārlūka apakšējai joslai.
- Photo-only upload ar 6 MB limitu.
- Client-side foto optimizācija un thumbnail ģenerēšana pirms upload.
- Organizatora galerija ar thumbnails, preview, filtrēšanu pēc viesa un kārtošanu.
- Foto dzēšana no organizatora galerijas.
- ZIP lejupielāde tikai pēc eventa beigām un tikai vienu reizi.
- Supabase RLS un Storage policies, lai organizators redz tikai savus datus.

## Tehnoloģijas

- Frontend: HTML, CSS, JavaScript
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- Storage: Supabase Storage
- Hosting: Netlify
- QR: `qrcode-generator`
- ZIP: `JSZip`

## Projekta struktūra

```text
.
├── index.html
├── style.css
├── script.js
├── netlify.toml
├── supabase/
│   └── schema.sql
└── docs/
    ├── architecture.md
    ├── database-model.md
    ├── deployment-environment.md
    ├── mvp-scope.md
    ├── security-rls.md
    ├── testing-plan.md
    ├── testing-report.md
    └── user-flows.md
```

## Lokāla palaišana

Šis MVP ir statiska frontend aplikācija, tāpēc build solis nav vajadzīgs.

Ieteicamais variants:

```bash
npx netlify dev
```

Alternatīva ar jebkuru statisko serveri:

```bash
npx serve .
```

Pēc palaišanas atver lokālo URL, piemēram:

```text
http://127.0.0.1:8888/
```

## Supabase konfigurācija

1. Izveido Supabase projektu.
2. Atver Supabase SQL Editor.
3. Palaid pilno SQL failu:

```text
supabase/schema.sql
```

4. Pārbaudi, ka ir izveidotas tabulas:

- `users`
- `events`
- `guests`
- `media`

5. Pārbaudi, ka Storage bucket ir:

```text
event-photos
```

6. Pārbaudi Supabase Auth iestatījumus:

```text
Site URL: https://event-photo-saas.netlify.app
Redirect URL: https://event-photo-saas.netlify.app/auth/confirmed
```

Projektā drīkst izmantot tikai publishable/anon key. Nekad neliec GitHub repozitorijā service role key, passwords vai citus secrets.

## Netlify deploy

Netlify iestatījumi:

```text
Build command: nav vajadzīgs
Publish directory: projekta sakne
Deploy branch: main
```

`netlify.toml` nodrošina SPA redirect, lai strādā arī tiešās guest saites:

```text
/event/{slug}
/auth/confirmed
```

## Organizer flow

1. Organizators reģistrējas ar vārdu, uzvārdu, e-pastu un paroli.
2. Organizators apstiprina e-pastu.
3. Organizators pieslēdzas dashboardā.
4. Organizators izveido eventu.
5. Organizators atver event detail skatu.
6. Organizators nokopē guest linku vai lejupielādē QR kodu.
7. Organizators pēc eventa beigām pārskata galeriju un lejupielādē ZIP.

## Guest flow

1. Viesis noskenē QR kodu vai atver event linku.
2. Viesis ievada vārdu un uzvārdu.
3. Viesis nospiež `Let's go`.
4. Viesis nospiež organizatora definēto camera pogu, pēc noklusējuma `Take Photo`.
5. Telefons atver kameru.
6. Foto tiek optimizēts, augšupielādēts Supabase Storage un piesaistīts galerijai.

Viesim nav konta un viesis neredz organizatora galeriju.

## Testēšana

Pirms deploy vai pēc būtiskām izmaiņām pārbaudi:

- register/login/logout;
- e-pasta confirmation redirect;
- event create;
- guest design save;
- QR link;
- guest name input;
- photo upload Android Chrome;
- photo upload iPhone Safari;
- 6 MB file size validation;
- gallery thumbnail loading;
- preview navigation;
- delete photo;
- organizer A neredz organizer B eventus/foto;
- inactive event neļauj upload;
- event ārpus perioda neļauj upload;
- ZIP poga parādās tikai pēc eventa beigām;
- ZIP var lejupielādēt tikai vienu reizi.

## Egress un Storage optimizācija

MVP ir veidots photo-only režīmā, lai samazinātu izmaksas:

- video nav atbalstīts;
- upload limits ir 6 MB;
- pirms upload tiek veidots optimizēts foto;
- galerijas grid izmanto thumbnails;
- oriģinālais foto tiek pieprasīts tikai preview, delete vai ZIP vajadzībām;
- individuāla foto download poga organizatora UI ir paslēpta;
- ZIP download ir pieejams tikai pēc eventa beigām un tikai vienu reizi.

## Dokumentācija

Detalizētāka projekta dokumentācija atrodas `docs/` mapē:

- `docs/architecture.md` - tehniskā arhitektūra;
- `docs/database-model.md` - datubāzes modelis;
- `docs/security-rls.md` - drošības un RLS apraksts;
- `docs/testing-plan.md` - testēšanas plāns;
- `docs/testing-report.md` - testēšanas rezultāti;
- `docs/user-flows.md` - lietotāju plūsmas.
