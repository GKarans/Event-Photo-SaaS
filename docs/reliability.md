# Uzticamības risinājumi

Aktualizēts 17.09.2026. Koda pārbaudes ir reproducējamas ar `npm test`; production pamatplūsma ir pārbaudīta ar iPhone 13 Pro un Samsung Galaxy S23. Automatizētie testi un reālo ierīču testi ir atšķirīgi pierādījumu veidi.

## Foto dzīves cikls

Jaunā upload plūsma izveido optimizētu WebP originalu un WebP thumbnail. `prepare_photo_upload` vispirms reģistrē `pending` media ierakstu. Cloudflare Worker rezervē objektus ar `reserve_r2_object`, izsniedz īslaicīgas presigned PUT adreses un pēc upload pārbauda izmēru un checksum. `complete_r2_photo` maina media uz `uploaded` tikai tad, kad abi R2 objekti ir pabeigti.

Retry izmanto to pašu media UUID un ceļus. Veiksmīgi pabeigts posms netiek dublēts, un atkārtota finalize darbība ir idempotenta. Retry stāvoklis un optimizētie baiti glabājas tikai atvērtās lapas atmiņā.

Vecajiem Supabase Storage failiem saglabāta lasīšanas saderība. Tie netiek automātiski pārkodēti, migrēti vai dzēsti.

## Galerija

- Grid izmanto thumbnails; originals tiek pieprasīts preview vai ZIP.
- `Refresh` apiet galerijas kešu un ielādē jaunāko sarakstu.
- Novēlotas galerijas, detaļu un preview atbildes tiek ignorētas pēc skata, filtra, eventa vai sesijas maiņas.
- Pilna izmēra piekļuve tiek iegūta no Worker ar atkārtotu tiesību pārbaudi.
- Viesu galerija izmanto to pašu kontrolēto Worker API gan R2, gan vecajiem Supabase failiem.

## ZIP

- ZIP atlasa visus eventa `uploaded` media ierakstus ar lapošanu, neatkarīgi no redzamā viesa filtra.
- Eventa ID, lietotāja ID un faila nosaukums tiek fiksēti procesa sākumā.
- Vienlaikus darbojas viens ZIP process.
- Gatavais Blob paliek atvērtās lapas atmiņā; `Save ZIP again` neielādē foto vēlreiz.
- Logout vai konta maiņa atbrīvo sagatavoto arhīvu un kešus.
- Pēc lapas aizvēršanas Blob pazūd; servera pusē arhīvs netiek glabāts.
- Ļoti lielu arhīvu ierobežo pārlūka atmiņa. Produkta lielākam apjomam vajadzīgs servera fona eksports.

## Dzesana un arhivēšana

Atsevišķa foto dzēšana ir autorizēta Worker pusē un attiecas uz originalu un thumbnail. Eventa `Delete` galvenajā sarakstā nozīmē arhivēšanu, tāpēc nejauša darbība uzreiz fiziski neiznīcina visu pasākuma saturu.

Nepabeigtu un bāreņu objektu pilnīga automātiska tīrīšana fonā nav MVP sastāvdaļa. Tas ir dokumentēts atlikušais produkta risks.

## Eventa laiks

Organizators ievada precīzu sākuma un beigu pulksteņa laiku. Pārlūks automātiski pievieno IANA laika zonu. Datubāze ģenerē UTC `starts_at` un `ends_at`, validē laika zonu un DST robežas.

Upload ir atļauts tikai:

```text
starts_at <= now < ends_at
```

Pēc precīza beigu brīža kļūst pieejamas pēc-pasākuma darbības. Viesis periodu redz savas ierīces lokālajā laikā.

## Build un deploy drošība

`npm run build` izveido kontrolētu `dist/` direktoriju. Build skripts noraida neparedzētus publicēšanas failus. Netlify publicē tikai `dist`, nevis repozitorija sakni ar servera kodu un dokumentāciju.

Cloudflare Worker noslēpumi tiek glabāti ar Wrangler secrets. `wrangler.toml` satur tikai neslepenas vērtības. R2 bucket publiska piekļuve ir izslēgta.

## Testēšana

```bash
npm ci
npm test
npm run build
npm run test:r2
```

Testi pārbauda build, JavaScript sintaksi, Auth sesiju, upload retry/finalize, SQL atļaujas un laika robežas, Worker CORS/parakstus/dzēšanu un galvenos responsive UI stāvokļus.

Production manuāli jāpārbauda:

- register, e-pasta apstiprināšana, login un paroles atjaunošana;
- eventa izveide ar precīzu laiku;
- QR un viesa saite;
- vairāki secīgi camera upload Android un iPhone;
- galerijas thumbnails, preview, filtri un Refresh;
- foto dzēšana;
- viesu galerijas ieslēgšana/izslēgšana;
- ZIP pēc eventa beigām;
- otra organizatora piekļuves liegums.

12.09.2026. `test.retake.photo` pamatplūsma izdevās iPhone 13 Pro un Samsung Galaxy S23. Production pierādījumi ir indeksēti [evidence/practice](evidence/practice/README.md).

## Zināmās robežas

- Nav servera puses ZIP darba un ilgstoši glabāta eksporta.
- Nav pilnībā automatizēta R2 bāreņu objektu tīrītāja.
- Nav staging vides, kas būtu pilnīgi nodalīta no production servisiem.
- Lokālais `npm start` var izmantot konfigurēto īsto backend, tāpēc testu eventiem jābūt skaidri nodalītiem.
- Reproducējams tests nepierāda Cloudflare, Supabase vai Netlify paneļa faktiskos iestatījumus; tie jāpārbauda atsevišķi.
