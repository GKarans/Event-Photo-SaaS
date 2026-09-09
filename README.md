# Event Photo SaaS

Photo-only SaaS MVP pasakumu kopigai foto apkopošanai. Organizators izveido pasakumu, iegust viesu saiti un QR kodu, bet viesi bez konta var pievienot foto no telefona. Organizators pec tam savā privātajā galerijā redz, pārskata, dzēš un pēc pasākuma lejupielādē foto ZIP arhīvā.

Production URL: https://event-photo-saas.netlify.app/

## Galvenās funkcijas

- Organizatora register, login, logout, paroles atjaunošana un sesijas saglabāšana.
- Paroles atkārtošana, show/hide kontroles un 8+ simbolu drošības prasības.
- Organizatora profils ar vārdu, uzvārdu un e-pastu.
- Event izveide ar sākuma un beigu datumu.
- Maksimālais event periods: 3 dienas.
- Event aktivizēšana, deaktivizēšana un dzēšana.
- Unikāla guest saite un QR kods katram eventam.
- Guest flow bez konta: QR/link -> vārds -> Take Photo -> upload.
- Guest UX pielāgošana: cover photo, title, subtitle, camera button text un cover pozīcija.
- Mobile guest skats centrēts iPhone/Android viewportā ar safe-area atstarpi pārlūka apakšējai joslai.
- Slēgta, neatrasta vai neielādējama eventa stāvoklis izmanto vienotu centrētu skatu Android, iOS un desktop izmēros.
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
Redirect URLs:
https://event-photo-saas.netlify.app/auth/confirmed
https://event-photo-saas.netlify.app/auth/reset-password
```

Supabase Auth pusē jāiestata arī vismaz 8 simbolu paroles garums un jāieslēdz `Password changed` drošības paziņojums. Frontend pieprasa lielo burtu, mazo burtu, ciparu un simbolu, bet servera iestatījumi ir galīgā drošības kontrole.

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
/auth/reset-password
```

## Organizer flow

1. Organizators reģistrējas ar vārdu, uzvārdu, e-pastu un paroli.
2. Organizators apstiprina e-pastu.
3. Ja parole aizmirsta, organizators izmanto `Forgot password?`, saņem reset saiti un izveido jaunu paroli produkta lapā.
4. Organizators pieslēdzas dashboardā.
5. Organizators izveido eventu.
6. Organizators atver event detail skatu.
7. Aktīvam eventam organizators nokopē guest linku vai lejupielādē QR kodu.
8. Kad events ir inactive vai periods ir beidzies, guest linka un QR darbības vairs netiek rādītas.
9. Organizators pēc eventa beigām pārskata galeriju un lejupielādē ZIP.
10. Delete event galvenajā sarakstā pārvieto eventu uz `Archive`, nevis uzreiz fiziski dzēš failus.
11. `Archive` pogā zem `Logout` organizators redz arhivētos eventus ar nosaukumu un periodu.

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
- register paroles atkārtošana un drošības prasības;
- paroles show/hide kontroles;
- forgot password e-pasts, reset route un jaunās paroles saglabāšana;
- event create;
- guest design save;
- QR link;
- guest name input;
- photo upload Android Chrome;
- photo upload iPhone Safari;
- vismaz 10 secīgi camera upload vienam viesim bez klusa stāvokļa;
- 6 MB file size validation;
- gallery thumbnail loading;
- preview navigation;
- delete photo;
- organizer A neredz organizer B eventus/foto;
- inactive event neļauj upload;
- event ārpus perioda neļauj upload;
- inactive vai period ended event detail nerāda guest URL, QR un kopīgošanas pogas;
- archive modal rāda paslēptos/deleted eventus ar meklēšanu un kārtošanu;
- ZIP poga parādās tikai pēc eventa beigām;
- ZIP var lejupielādēt tikai vienu reizi.

## Egress un Storage optimizācija

MVP ir veidots photo-only režīmā, lai samazinātu izmaksas:

- video nav atbalstīts;
- pirms upload tiek veidots optimizēts foto;
- upload limits ir 6 MB optimizētajam foto failam;
- event un guest design title ievade ir ierobežota līdz 32 zīmēm, lai mobile guest skats nesalauztos ar pārāk gariem virsrakstiem;
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
