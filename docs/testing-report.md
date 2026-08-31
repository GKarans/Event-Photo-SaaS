# Event Photo SaaS MVP testēšanas pārskats

## Pārskata mērķis

Šis dokuments paredzēts praktisko testu rezultātu fiksēšanai. Tajā iekļauti RLS/storage pārbaudes scenāriji un praktiskā testa rezultāti ar reāliem viesiem un foto augšupielādi.

## Testēšanas vide

- Frontend: `https://event-photo-saas.netlify.app`
- Backend: Supabase Auth, Database, Storage
- Storage bucket: `event-photos`
- Galvenās tabulas: `users`, `events`, `guests`, `media`
- Testa statuss: praktiskais tests pabeigts

## RLS un Storage pārbaudes scenāriji

### 1. Organizators redz tikai savus eventus

Soļi:

1. Izveidot organizatoru A.
2. Ar organizatoru A izveidot eventu A.
3. Izlogoties.
4. Izveidot organizatoru B.
5. Ar organizatoru B atvērt dashboard.

Sagaidāmais rezultāts:

- Organizators B neredz organizatora A eventu.
- Organizatoram B sākotnēji ir tukšs vai tikai paša izveidots eventu saraksts.

Rezultāts:

- Statuss: izturēts.
- Piezīmes: pārbaudīts ar vairākiem organizatoru kontiem. Jaunam organizatoram netika rādīti cita organizatora eventi.

### 2. Organizators redz tikai sava eventa foto

Soļi:

1. Organizators A izveido eventu A.
2. Viesis augšupielādē foto eventā A.
3. Organizators B ielogojas savā kontā.
4. Organizators B mēģina apskatīt savu galeriju.

Sagaidāmais rezultāts:

- Organizators B neredz eventa A foto.
- Signed URLs tiek ģenerēti tikai foto, kas pieder organizatora eventiem.

Rezultāts:

- Statuss: izturēts.
- Piezīmes: organizatora galerijā tika rādīti tikai konkrētajam organizatoram piederošā eventa foto.

### 3. Anon viesis var uploadot tikai aktīvā eventā

Soļi:

1. Izveidot eventu ar šodienas datumu.
2. Atvērt guest linku bez login.
3. Ievadīt vārdu un augšupielādēt foto.

Sagaidāmais rezultāts:

- Viesis var izveidot `guests` ierakstu.
- Viesis var augšupielādēt foto Storage.
- Tiek izveidots `media` ieraksts.

Rezultāts:

- Statuss: izturēts.
- Piezīmes: praktiskajā testā viesi varēja atvērt QR/guest linku, ievadīt vārdu un augšupielādēt foto bez pilna lietotāja konta.

### 4. Anon viesis nevar uploadot deaktivizētā eventā

Soļi:

1. Organizators atver eventu.
2. Nospiež `Deactivate`.
3. Viesis atver guest linku.
4. Viesis mēģina sākt upload plūsmu.

Sagaidāmais rezultāts:

- Guest forma netiek piedāvāta vai upload tiek bloķēts.
- Supabase RLS neļauj izveidot `guests` vai `media` ierakstus deaktivizētam eventam.

Rezultāts:

- Statuss: izturēts.
- Piezīmes: deaktivizētam eventam guest upload plūsma tika bloķēta. Pēc testa tika uzlaboti kļūdu paziņojumi, lai tehniska RLS kļūda lietotājam tiktu parādīta kā saprotams slēgta eventa paziņojums.

### 5. Anon viesis nevar uploadot ārpus event perioda

Soļi:

1. Izveidot eventu nākotnes datumam vai beigušam periodam.
2. Atvērt guest linku.
3. Mēģināt sākt guest upload plūsmu.

Sagaidāmais rezultāts:

- Guest upload nav pieejams.
- Storage INSERT policy bloķē faila upload, ja periods nav aktīvs.

Rezultāts:

- Statuss: izturēts.
- Piezīmes: guest upload pieejamība ir piesaistīta eventa sākuma un beigu datumam. Pusnakts testos tika konstatēta laika zonas problēma, kas novērsta ar `public.current_app_date()` funkciju Supabase SQL shēmā.

## 28.08 praktiskā testa rezultāti

Testa laiks: 27.08.2026. 17:00 - 28.08.2026. 02:00

### Dalībnieki

- Organizatoru skaits: 1
- Viesu skaits: 12
- Android ierīces: testēts mobilajās ierīcēs
- iOS ierīces: testēts mobilajās ierīcēs
- Citi pārlūki: desktop pārlūks organizatora galerijas pārbaudei

### Upload rezultāti

- Kopējais augšupielādēto foto skaits: 60
- Veiksmīgo upload skaits: 60
- Neveiksmīgo upload skaits: 0
- Biežākā kļūda: praktiskā testa laikā viesiem būtiskas kļūdas netika konstatētas

### Galerijas rezultāti

- Vai foto parādījās organizatora galerijā: jā
- Vai filter pēc viesa strādāja: jā
- Vai sorting strādāja: jā
- Vai preview/swipe strādāja: jā
- Vai ZIP download strādāja: jā
- Piezīme: pie 60 foto galerijas sākotnējā ielāde organizatora skatā kļuva lēnāka. Nepieciešams nākamajā posmā uzlabot galerijas ielādi ar kešošanu, mazākiem attēliem vai pakāpenisku ielādi.

### Atrastās kļūdas

| Prioritāte | Ierīce/pārlūks | Scenārijs | Faktiskais rezultāts | Statuss |
| --- | --- | --- | --- | --- |
| P2 | Organizatora pārlūks | Event gallery ar 60 foto | Galerija un attēlu grid ielādējas lēnāk nekā mazā testā | Atvērts uzlabojumiem |
| P3 | Guest plūsma | QR link, vārda ievade, foto upload | Viesiem būtiskas problēmas netika novērotas | Izturēts |

### Secinājums

Praktiskais tests ar 12 viesiem un 60 foto apliecināja, ka MVP pamatplūsma darbojas: organizators izveido eventu, viesi atver QR/guest linku, ievada vārdu, uzņem foto, foto tiek saglabāti Supabase Storage un parādās organizatora galerijā. Organizatoram un viesiem nebija būtisku negatīvu atsauksmju par lietošanu.

MVP ir gatavs demonstrācijai pamatfunkcionalitātes līmenī. Nākamais tehniskais uzlabojums ir galerijas veiktspēja pie lielāka foto skaita: jāizvērtē signed URL kešošana, thumbnail izmantošana, lazy loading un atkārtotas galerijas ielādes samazināšana, kad organizators pārvietojas starp event list un event detail skatu.
