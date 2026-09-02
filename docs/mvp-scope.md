# Event Photo SaaS MVP scope un nākotnes funkcijas

## Dokumenta mērķis

Šis dokuments definē Event Photo SaaS MVP robežas: kas ir iekļauts pašreizējā praktiskajā versijā, kas apzināti nav iekļauts prakses laikā un ko var attīstīt pēc prakses.

MVP mērķis nav izveidot pilnu komerciālu platformu ar maksājumiem, abonementiem un sarežģītu administrēšanu. MVP mērķis ir pierādīt galveno produkta vērtību:

```text
Viens QR kods -> viesi pievieno foto -> organizators redz privātu galeriju
```

## Galvenais MVP scenārijs

MVP ir uzskatāms par veiksmīgu, ja pilnībā darbojas šī ķēde:

1. Organizators reģistrējas un pieslēdzas.
2. Organizators izveido eventu.
3. Sistēma izveido unikālu guest URL un QR kodu.
4. Viesis bez konta atver QR/linku.
5. Viesis ievada vārdu un uzvārdu.
6. Viesis uzņem vai izvēlas foto telefonā.
7. Foto tiek optimizēts un augšupielādēts Supabase Storage.
8. Datubāzē tiek saglabāti foto metadati.
9. Organizators redz foto savā galerijā.
10. Organizators var filtrēt, pārskatīt, dzēst un pēc eventa beigām lejupielādēt ZIP.

## MVP iekļautā funkcionalitāte

### Organizatora konts

MVP iekļauj:

- organizatora reģistrāciju;
- vārda, uzvārda, e-pasta un paroles ievadi;
- e-pasta apstiprināšanas redirect uz produkta lapu;
- login/logout;
- sesijas saglabāšanu pārlūkā;
- dashboard sveicienu ar organizatora vārdu.

### Event pārvaldība

MVP iekļauj:

- event izveidi;
- event nosaukumu;
- sākuma un beigu datumu;
- maksimālo event periodu līdz 3 dienām;
- aizliegumu veidot eventu pagātnē;
- event aktivizēšanu un deaktivizēšanu;
- soft delete ar `status = deleted`;
- beigušos eventu automātisku paslēpšanu pēc noteikta laika;
- event detail skatu ar statusu, guest linku un QR kodu.

### Guest link un QR

MVP iekļauj:

- unikālu `slug` katram eventam;
- publisku guest URL formā `/event/{slug}`;
- QR koda ģenerēšanu;
- QR koda lejupielādi;
- linka kopēšanu;
- guest link pieejamību tikai aktīvam eventam tā datumu periodā.

### Guest plūsma

MVP iekļauj:

- guest piekļuvi bez konta;
- vārda un uzvārda ievadi;
- lokālu viesa sesijas saglabāšanu pārlūkā;
- iespēju mainīt viesa vārdu;
- `Let's go` sākuma soli;
- organizatora pielāgotu camera button text;
- telefona kameras/faila izvēles atvēršanu;
- upload statusu;
- saprotamus kļūdu paziņojumus.

### Guest UX pielāgošana

MVP iekļauj eventa viesu ekrāna pielāgošanu:

- cover photo;
- title;
- subtitle;
- camera button text;
- cover horizontal position;
- cover vertical position;
- cover zoom;
- live preview pirms saglabāšanas.

Šī funkcija ļauj organizatoram pielāgot viesu ekrānu konkrētam pasākumam, nepievienojot sarežģītu dizaina sistēmu vai vairākas tēmas.

### Foto upload

MVP ir tikai photo-only.

MVP iekļauj:

- tikai `image/*` failu upload;
- 6 MB maksimālo foto limitu;
- client-side foto optimizāciju;
- thumbnail ģenerēšanu pirms upload;
- oriģinālā foto un thumbnail saglabāšanu Supabase Storage;
- `media` ierakstu ar `storage_path`, `thumbnail_path`, file type un file size;
- bloķēšanu, ja events nav aktīvs vai ir ārpus perioda.

Video nav MVP daļa.

### Organizatora galerija

MVP iekļauj:

- foto ielādi no `media` tabulas;
- thumbnail signed URLs galerijas gridam;
- lazy loading;
- pakāpenisku grid renderēšanu;
- īslaicīgu browser cache galerijas datiem;
- foto preview;
- preview navigāciju ar bultiņām un swipe;
- filtrēšanu pēc viesa;
- kārtošanu pēc jaunākā, vecākā un viesa vārda;
- foto dzēšanu;
- ZIP lejupielādi tikai pēc eventa beigām;
- ZIP lejupielādi tikai vienu reizi vienam eventam.

Individuāla foto download poga pašreizējā UI ir paslēpta, lai samazinātu nejaušu Supabase egress patēriņu.

### Drošība

MVP iekļauj:

- Supabase Auth organizatoriem;
- RLS visām galvenajām tabulām;
- organizatoru datu izolāciju;
- anon guest upload tikai konkrētam aktīvam eventam;
- Storage upload policy pēc event mapes un event perioda;
- Storage read/delete tikai event īpašniekam;
- privātu Storage bucket;
- signed URLs attēlu rādīšanai;
- publishable key izmantošanu frontendā;
- service role key un secrets neiekļaušanu repozitorijā.

## Apzināti neiekļauts MVP

Šīs funkcijas nav iekļautas prakses MVP, jo tās palielinātu sarežģītību vai nav nepieciešamas galvenās produkta vērtības pierādīšanai:

- video upload;
- video glabāšana, video preview vai video thumbnails;
- maksājumu sistēma;
- subscription/plānu pārvaldība;
- publiska viesu galerija;
- viesu konti;
- vairāki organizatori vienam eventam;
- team/admin role sistēma;
- custom domēni klientiem;
- e-pasta paziņojumi pēc eventa;
- analytics dashboard;
- server-side image processing;
- server-side ZIP generation;
- automātisks scheduled Storage cleanup;
- pilns audit log;
- custom rate limiting ārpus Supabase iespējām;
- daudzvalodu UI pārslēgs.

Šie ierobežojumi ir apzināti, lai prakses laikā pabeigtu stabilu un saprotamu MVP.

## Nākotnes funkcijas pēc prakses

Pēc prakses produktu var attīstīt vairākos virzienos.

### Veiktspēja un izmaksas

- Server-side thumbnails ar Supabase Edge Function.
- Server-side ZIP export, lai lielas galerijas neveidotu ZIP pārlūkā.
- Automātiska veco eventu un Storage failu tīrīšana.
- Foto skaita limits vienam eventam.
- Foto skaita limits vienam viesim.
- Storage limits pēc klienta plāna.
- Labāka CDN/cache stratēģija.

### Produkta funkcijas

- Pricing un subscription modeļi.
- Stripe maksājumi.
- Custom event URL.
- QR plakātu ģenerēšana drukai.
- Organizatora analytics: viesu skaits, foto skaits, upload dinamika.
- Event templates dažādiem pasākumu tipiem.
- E-pasta vai SMS paziņojumi organizatoram.
- PWA režīms telefonam.

### Drošība un administrēšana

- Audit log organizatora darbībām.
- Custom rate limiting viesu uploadam.
- Abuse detection pie pārāk daudz upload mēģinājumiem.
- Production SMTP konfigurācija Auth e-pastiem.
- Admin panelis sistēmas īpašniekam.

### UX uzlabojumi

- Plašāka guest design pielāgošana.
- Vairākas krāsu tēmas.
- Labāka mobile camera pieredze, ja pārlūka iespējas to ļauj.
- Iespēja izvēlēties priekšējo/aizmugurējo kameru, ja pārlūks to stabili atbalsta.
- Organizatora galerijas multi-select darbības.

## MVP gatavības kritēriji

MVP ir gatavs demonstrācijai, ja:

- organizators var reģistrēties un ielogoties;
- organizators var izveidot eventu;
- organizators var pielāgot guest ekrānu;
- QR kods un guest links atver pareizo eventu;
- viesis bez konta var ievadīt vārdu un augšupielādēt foto;
- fails tiek optimizēts un saglabāts Supabase Storage;
- galerijas grid izmanto thumbnails;
- organizators redz foto tikai savam eventam;
- organizators var filtrēt, kārtot, apskatīt un dzēst foto;
- ZIP download ir pieejams pēc eventa beigām;
- ZIP download nav atkārtoti izmantojams;
- cita organizatora dati nav redzami;
- inactive vai ārpus perioda esošs events bloķē guest upload;
- kļūdu teksti ir saprotami lietotājam;
- plūsma ir pārbaudīta Android un iOS ierīcēs.

## Secinājums pēc praktiskā testa

Pēc praktiskā testa ar 12 viesiem un 60 foto MVP pamatplūsma strādāja. Viesi varēja atvērt QR/linku, ievadīt vārdu, uzņemt foto un augšupielādēt tos Supabase Storage. Organizators varēja atvērt galeriju un pārskatīt augšupielādētos foto.

Pēc testa tika pieņemti vairāki arhitektūras lēmumi:

- galerijas grid izmanto thumbnails;
- upload limits samazināts līdz 6 MB;
- foto tiek optimizēti klienta pusē;
- cover photo tiek optimizēts pirms upload;
- ZIP download ierobežots līdz vienai reizei;
- ZIP pieejams tikai pēc eventa beigām;
- individuāla foto download poga paslēpta.

Šobrīd MVP nevajag papildināt ar lielām jaunām funkcijām. Līdz prakses beigām prioritāte ir testēšana, dokumentācija, drošības skaidrojums, deploy pārbaude un prakses atskaite.
