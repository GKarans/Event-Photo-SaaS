# Event Photo SaaS MVP testēšanas pārskats

## Pārskata mērķis

Šis dokuments paredzēts praktisko testu rezultātu fiksēšanai. Sākotnēji tajā iekļauti RLS/storage pārbaudes scenāriji pirms lielā 28.08 testa. Pēc 28.08 testa šis dokuments jāpapildina ar reālajiem rezultātiem, ierīcēm, atrastajām kļūdām un secinājumiem.

## Testēšanas vide

- Frontend: `https://event-photo-saas.netlify.app`
- Backend: Supabase Auth, Database, Storage
- Storage bucket: `event-photos`
- Galvenās tabulas: `users`, `events`, `guests`, `media`
- Testa statuss: sagatavots praktiskajai pārbaudei

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

- Statuss: jāaizpilda pēc testa.
- Piezīmes: jāaizpilda pēc testa.

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

- Statuss: jāaizpilda pēc testa.
- Piezīmes: jāaizpilda pēc testa.

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

- Statuss: jāaizpilda pēc testa.
- Piezīmes: jāaizpilda pēc testa.

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

- Statuss: jāaizpilda pēc testa.
- Piezīmes: jāaizpilda pēc testa.

### 5. Anon viesis nevar uploadot ārpus event perioda

Soļi:

1. Izveidot eventu nākotnes datumam vai beigušam periodam.
2. Atvērt guest linku.
3. Mēģināt sākt guest upload plūsmu.

Sagaidāmais rezultāts:

- Guest upload nav pieejams.
- Storage INSERT policy bloķē faila upload, ja periods nav aktīvs.

Rezultāts:

- Statuss: jāaizpilda pēc testa.
- Piezīmes: jāaizpilda pēc testa.

## 28.08 praktiskā testa rezultātu veidne

### Dalībnieki

- Organizatoru skaits:
- Viesu skaits:
- Android ierīces:
- iOS ierīces:
- Citi pārlūki:

### Upload rezultāti

- Kopējais mēģinājumu skaits:
- Veiksmīgo upload skaits:
- Neveiksmīgo upload skaits:
- Biežākā kļūda:

### Galerijas rezultāti

- Vai foto parādījās organizatora galerijā:
- Vai filter pēc viesa strādāja:
- Vai sorting strādāja:
- Vai preview/swipe strādāja:
- Vai ZIP download strādāja:

### Atrastās kļūdas

| Prioritāte | Ierīce/pārlūks | Scenārijs | Faktiskais rezultāts | Statuss |
| --- | --- | --- | --- | --- |
| jāaizpilda | jāaizpilda | jāaizpilda | jāaizpilda | jāaizpilda |

### Secinājums

Pēc praktiskā testa jānovērtē, vai MVP ir gatavs demonstrācijai un kādi labojumi vēl jāveic pirms gala aizstāvēšanas.
