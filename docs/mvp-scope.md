# Event Photo SaaS MVP scope

## Dokumenta mērķis

Šis dokuments definē Event Photo SaaS MVP robežas: kas ir iekļauts praktiskajā versijā, kas apzināti netiek iekļauts prakses laikā un kādas funkcijas paliek nākotnes attīstībai.

MVP mērķis nav izveidot pilnu komerciālu platformu ar visām biznesa funkcijām. MVP mērķis ir pierādīt galveno produkta plūsmu: organizators izveido eventu, viesi ar QR linku augšupielādē foto, un organizators pēc tam redz, pārskata, dzēš un lejupielādē eventa foto.

## MVP iekļautā funkcionalitāte

### Organizatora konts

MVP iekļauj:

- organizatora reģistrāciju;
- organizatora login/logout;
- e-pasta apstiprināšanas redirect uz produkta lapu;
- organizatora profila vārdu un uzvārdu;
- dashboard sveicienu ar organizatora vārdu;
- sesijas uzturēšanu pārlūkā.

### Event pārvaldība

MVP iekļauj:

- event izveidi;
- event nosaukumu;
- event sākuma un beigu datumu;
- maksimālo event periodu līdz 3 dienām;
- aizliegumu veidot eventu pagātnē;
- event edit funkciju;
- event activate/deactivate funkciju;
- soft delete ar `status = deleted`;
- automātisku beigušos eventu paslēpšanu no organizatora saraksta pēc noteikta laika.

### QR un guest link

MVP iekļauj:

- unikālu event slug;
- guest URL;
- QR koda ģenerēšanu;
- QR koda lejupielādi;
- linka kopēšanu;
- guest link pieejamību tikai aktīvam eventam tā perioda laikā.

### Viesa plūsma

MVP iekļauj:

- guest link atvēršanu bez konta;
- event nosaukuma un datuma attēlošanu;
- viesa vārda un uzvārda ievadi;
- foto uzņemšanas sākšanu;
- telefona kameras atvēršanu ar faila input/capture plūsmu;
- foto augšupielādi uz Supabase Storage;
- upload statusu un kļūdu paziņojumus;
- bloķēšanu, ja events ir inactive, deleted vai ārpus datuma perioda.

### Organizatora galerija

MVP iekļauj:

- foto ielādi no `media` tabulas;
- signed URL ģenerēšanu Supabase Storage failiem;
- foto grid skatu;
- lazy loading;
- foto preview;
- preview navigāciju ar bultiņām;
- viena foto lejupielādi;
- visu galerijas foto ZIP lejupielādi;
- foto dzēšanu;
- filtrēšanu pēc viesa;
- kārtošanu pēc jaunākā, vecākā un viesa vārda;
- galerijas ielādes optimizāciju ar batch signed URL un īslaicīgu pārlūka cache.

### Drošība

MVP iekļauj:

- Supabase Auth organizatoriem;
- RLS visām galvenajām tabulām;
- organizatoru datu izolāciju;
- anon guest upload tikai aktīvam eventam;
- Storage upload policy pēc event mapes un event perioda;
- Storage read/delete tikai event īpašniekam;
- publishable key izmantošanu frontendā;
- secret/service role key neiekļaušanu frontend kodā un repo.

## MVP apzinātie ierobežojumi

MVP apzināti neiekļauj:

- video upload;
- maksājumu sistēmu;
- subscription/plānu pārvaldību;
- publisku viesu galeriju;
- viesu kontus;
- organizatora komandas vai vairākus admin vienam eventam;
- pielāgotu domēnu katram klientam;
- e-pasta paziņojumus pēc eventa;
- automātisku server-side thumbnail ģenerēšanu;
- server-side ZIP ģenerēšanu;
- pilnu audit log;
- custom rate limiting ārpus Supabase platformas iespējām;
- pilnu analytics dashboard.

Šie ierobežojumi samazina izstrādes risku un ļauj pabeigt stabilu prakses MVP.

## Nākotnes funkcijas pēc prakses

Pēc MVP pabeigšanas var plānot:

- server-side thumbnail ģenerēšanu;
- server-side ZIP export ar Supabase Edge Function vai Netlify Function;
- PWA režīmu ērtākai lietošanai telefonā;
- custom event dizainu: fona attēls, teksts, krāsas;
- event expiration cleanup, kas fiziski dzēš vecos failus no Storage;
- pricing modeļus pēc event skaita vai storage apjoma;
- Stripe maksājumus;
- organizatora statistiku par foto un viesiem;
- guest upload limitus;
- labāku kameras UI ar priekšējo/aizmugurējo kameru, ja pārlūka iespējas to ļauj;
- ielūgumu un QR plakātu ģenerēšanu;
- daudzvalodu UI.

## MVP gatavības kritēriji

MVP uzskatāms par gatavu demonstrācijai, ja:

- organizators var reģistrēties un ielogoties;
- organizators var izveidot eventu;
- QR kods un guest links atver pareizo eventu;
- viesis bez konta var augšupielādēt foto;
- foto nonāk Supabase Storage;
- organizators redz foto savā galerijā;
- organizators var pārskatīt, filtrēt, dzēst un lejupielādēt foto;
- cita organizatora eventi un foto nav redzami;
- deaktivizēts vai beidzies events bloķē guest upload;
- kļūdu teksti ir saprotami lietotājam;
- mobilā plūsma ir pārbaudīta Android/iOS ierīcēs.

## Pašreizējais secinājums

Pēc praktiskā testa ar 12 viesiem un 60 foto MVP pamatplūsma strādā. Lietotāji varēja augšupielādēt foto, organizators varēja tos apskatīt galerijā, un būtiskas negatīvas atsauksmes netika saņemtas.

Galvenais atlikušais tehniskais uzlabojums nav jauna funkcija, bet veiktspēja: galerijai jābūt ērtākai arī pie lielāka foto skaita. Šim nolūkam tika sākta galerijas ielādes optimizācija ar signed URL batch pieprasījumu, īslaicīgu cache un pakāpenisku grid renderēšanu.
