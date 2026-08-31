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

Šī sadaļa atbilst 12. dienas testēšanas darbam: RLS/storage pārbaude ar diviem organizatoriem, anon guest upload, inactive event un outside period scenārijiem.

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

Testa laiks: 27.08.2026. 15:00 - 00:00

## Mini tests pirms praktiskā testa

Šī sadaļa atbilst 14. dienas testēšanas darbam: mobilās plūsmas pārbaude pirms lielā praktiskā testa.

Pārbaudītie scenāriji:

- guest link atvēršana mobilajā pārlūkā;
- QR plūsma līdz event landing skatam;
- viesa vārda ievade;
- foto uzņemšana un augšupielāde;
- organizatora galerijas atvēršana;
- foto preview pārbaude;
- ZIP download pārbaude organizatora pusē.

Rezultāts:

- Statuss: izturēts.
- Piezīmes: pirms lielā testa pamata plūsma bija pietiekami stabila praktiskai pārbaudei. Atsevišķi tika konstatētas un labotas RLS/date policy problēmas, kas varēja ietekmēt guest link pieejamību.

## Bugfix pēc praktiskā testa

Šī sadaļa atbilst 19. dienas kodēšanas/testēšanas darbam: pēc testa atrasto problēmu labošana bez jaunu lielu funkciju pievienošanas.

Veiktie labojumi:

- guest event link atļauts arī `authenticated` lomai, lai linku varētu atvērt arī tad, ja pārlūkā ir aktīva organizatora sesija;
- RLS datuma pārbaude pārlikta uz `Europe/Riga` datumu ar `public.current_app_date()`, lai pusnakts laikā Supabase UTC datums nebloķētu Latvijā aktīvu eventu;
- tehniskie RLS/Storage kļūdu paziņojumi frontendā aizstāti ar lietotājam saprotamiem tekstiem.

Rezultāts:

- Statuss: labots lokāli.
- Piezīmes: izmaiņas saglabātas Git commitos. Netlify deploy jāveic atsevišķi, kad pieejami deployment kredīti.

## Regresijas tests pēc bugfix

Šī sadaļa atbilst 20. dienas testēšanas darbam: pārbaudīt, ka pēc RLS/date/error labojumiem nav salauzta pamata MVP plūsma.

Pārbaudītie scenāriji:

- organizators var ielogoties;
- organizators redz tikai savus eventus;
- organizators var atvērt event detail skatu;
- guest link atver aktīvu eventu;
- viesis var ievadīt vārdu un sākt foto plūsmu;
- deaktivizēts events bloķē guest upload;
- ārpus event perioda guest upload nav pieejams;
- organizatora galerija ielādē foto;
- foto preview, filter, sort un ZIP download funkcijas saglabājas pieejamas.

Rezultāts:

- Statuss: izturēts lokālā/pārbaudes līmenī.
- Piezīmes: pēc praktiskā testa veiktie labojumi bija saistīti ar piekļuves noteikumiem, laika zonas pārbaudi un kļūdu tekstiem. Pamata lietošanas plūsma pēc labojumiem netika mainīta.

## Galerijas veiktspējas pārbaude

Pēc praktiskā testa ar 60 foto tika veikta galerijas ielādes optimizācija organizatora skatā.

Veiktie uzlabojumi:

- signed URL ģenerēšana pārslēgta no secīgiem pieprasījumiem uz batch pieprasījumu;
- pievienota īslaicīga galerijas cache atmiņa pārlūkā, lai atkārtoti atverot to pašu eventu nav jāielādē visi foto no jauna;
- galerijas grid tiek renderēts pa daļām, lai lielāks foto skaits mazāk bloķētu saskarni;
- attēliem saglabāts lazy loading un pievienota asinhrona dekodēšana.

Rezultāts:

- Statuss: ieviests.
- Piezīmes: šis uzlabojums samazina atkārtotas ielādes gaidīšanas laiku, īpaši gadījumos, kad organizators atver eventu, atgriežas sarakstā un atkal atver to pašu galeriju.

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
