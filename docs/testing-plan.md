# Event Photo SaaS MVP testēšanas plāns

## Mērķis

Pārbaudīt, vai Event Photo SaaS MVP ir gatavs praktiskai lietošanai 28.08 testā ar vienu organizatoru un apmēram 25 viesiem. Testēšanas galvenais mērķis ir pārliecināties, ka pilnā plūsma strādā production vidē: organizators izveido pasākumu, viesi skenē QR kodu, ievada vārdu, uzņem foto, augšupielādē tos, un organizators redz bildes galerijā.

## Testēšanas vide

- Frontend: Netlify production vide `https://event-photo-saas.netlify.app`
- Backend: Supabase Auth, Database un Storage
- Organizatora ierīce: dators vai telefons ar pārlūku
- Viesu ierīces: Android Chrome, Samsung Chrome un iPhone Safari
- Testa datums: 28.08.2026
- Testa dalībnieki: 1 organizators un apmēram 25 viesi

## Pirms testa sagatavošana

1. Pārliecināties, ka Netlify deploy ir veiksmīgs un production lapa atveras.
2. Pārliecināties, ka Supabase SQL shēma un RLS/storage policies ir aktuālas.
3. Izveidot vai pārbaudīt organizatora kontu.
4. Izveidot testa eventu ar periodu, kas ietver 28.08.2026.
5. Atvērt event detail skatu un pārbaudīt:
   - Guest URL ir redzams.
   - QR kods tiek ģenerēts.
   - QR kodu var lejupielādēt.
   - Linku var nokopēt.
6. Sagatavot rezerves event linku, ja kādam dalībniekam QR skenēšana nestrādā.

## Organizatora testēšanas scenāriji

### Register/Login

1. Organizators atver production lapu.
2. Ievada e-pastu un paroli.
3. Pārbauda, ka dashboard atveras un rāda organizatora vārdu/e-pastu.

Sagaidāmais rezultāts: organizators tiek ielogots un redz tikai savus eventus.

### Create Event

1. Organizators nospiež `Create Event`.
2. Ievada event nosaukumu.
3. Ievada sākuma un beigu datumu.
4. Saglabā eventu.

Sagaidāmais rezultāts: events parādās `My Events` sarakstā ar pareizu statusu un datumu.

### Edit Event

1. Organizators nospiež `Edit`.
2. Izmaina event nosaukumu vai periodu.
3. Saglabā izmaiņas.

Sagaidāmais rezultāts: event sarakstā un event detail skatā redzamas atjaunotās vērtības.

### Deactivate/Activate Event

1. Organizators nospiež `Deactivate`.
2. Atver guest linku.
3. Pārbauda, ka viesis nevar augšupielādēt foto.
4. Organizators nospiež `Activate`.
5. Vēlreiz pārbauda guest linku.

Sagaidāmais rezultāts: deaktivizēts events bloķē viesu upload; aktivizēts events perioda laikā atļauj upload.

### Gallery

1. Organizators atver event detail skatu.
2. Pārbauda galerijas foto grid.
3. Atver foto preview.
4. Pāršķir foto ar bultiņām vai swipe.
5. Lejupielādē vienu foto.
6. Lejupielādē visus redzamos foto ZIP arhīvā.
7. Pārbauda filtrēšanu pēc viesa.
8. Pārbauda kārtošanu pēc jaunākā, vecākā un viesa vārda.

Sagaidāmais rezultāts: galerija ir pārskatāma, foto atveras, filtrējas un lejupielādējas.

## Viesa testēšanas scenāriji

### QR atvēršana

1. Viesis ar telefonu noskenē QR kodu.
2. Atver event lapu.
3. Pārbauda, ka redz event nosaukumu un datumu.

Sagaidāmais rezultāts: event lapa atveras bez login prasības.

### Viesa sākuma solis

1. Viesis ievada vārdu un uzvārdu.
2. Nospiež `Start`.

Sagaidāmais rezultāts: viesim atveras foto uzņemšanas skats.

### Foto upload

1. Viesis nospiež `Take Photo`.
2. Telefons atver kameru.
3. Viesis uzņem foto.
4. Lapa rāda upload statusu.
5. Pēc upload pabeigšanas parādās veiksmīgs paziņojums.

Sagaidāmais rezultāts: foto nonāk Supabase Storage un organizatora galerijā.

## Ierīču pārklājums

Testā jāpiefiksē vismaz:

- Android Chrome
- Samsung Chrome
- iPhone Safari
- Dažādi ekrāna izmēri
- Wi-Fi un mobilais internets, ja iespējams

## Negatīvie testi

1. Atvērt event linku ārpus event perioda.
2. Deaktivizēt eventu un mēģināt uploadot foto.
3. Mēģināt uploadot pārāk lielu failu.
4. Mēģināt atvērt neeksistējošu event linku.
5. Pārbaudīt, ka viesim nav pieejams organizatora dashboard.

## Drošības testi

1. Izveidot divus organizatorus.
2. Organizators A izveido eventu un augšupielādē foto ar viesi.
3. Organizators B ielogojas savā kontā.
4. Pārbaudīt, ka organizators B neredz organizatora A eventus un foto.
5. Pārbaudīt, ka anon viesis var pievienot foto tikai aktīvam eventam perioda laikā.

## Kļūdu fiksēšana

Katram atrastajam defektam pierakstīt:

- Ierīci un pārlūku
- Precīzu darbību secību
- Sagaidāmo rezultātu
- Faktisko rezultātu
- Screenshot vai īsu aprakstu
- Vai kļūda atkārtojas
- Prioritāti: kritiska, augsta, vidēja, zema

## Pieņemšanas kritēriji 28.08 testam

Tests tiek uzskatīts par veiksmīgu, ja:

- Organizators var ielogoties un atvērt eventu.
- QR kods atver guest lapu Android un iOS ierīcēs.
- Vismaz 80% viesu var veiksmīgi augšupielādēt foto bez palīdzības.
- Organizatora galerijā redzami viesu foto.
- Preview, filter, sort un download funkcijas strādā.
- Neviens organizators neredz cita organizatora eventus vai foto.
- Nav kritisku kļūdu, kas bloķē pamata plūsmu.

## Rezultātu apkopošana

Pēc testa jāizveido `docs/testing-report.md`, kurā jāiekļauj:

- Testa datums un vide
- Ierīču saraksts
- Dalībnieku aptuvenais skaits
- Veiksmīgo upload skaits
- Atrastās kļūdas
- Labojumu saraksts
- Secinājums par MVP gatavību
