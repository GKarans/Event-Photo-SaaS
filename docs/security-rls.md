# Event Photo SaaS MVP drošības un RLS apraksts

## Mērķis

Šis dokuments apraksta Event Photo SaaS MVP drošības pieeju. Galvenais mērķis ir nodrošināt, ka organizators redz tikai savus pasākumus un foto, bet viesis bez konta var pievienot foto tikai konkrētam aktīvam pasākumam, kura QR saiti viņš ir saņēmis.

Sistēma izmanto:

- Supabase Authentication organizatoru kontiem;
- PostgreSQL Row Level Security datubāzes piekļuves kontrolei;
- Supabase Storage policies foto failu piekļuves kontrolei;
- Netlify kā statisku frontend hostingu;
- frontend validāciju lietotāja ērtībai;
- datubāzes un RLS validāciju drošībai.

## Lietotāju lomas

### Organizators

Organizators ir autentificēts Supabase Auth lietotājs. Viņš var:

- reģistrēties un ielogoties;
- izveidot pasākumu;
- labot pasākumu;
- aktivizēt vai deaktivizēt pasākumu;
- redzēt tikai savus pasākumus;
- redzēt tikai savu pasākumu viesus un foto;
- dzēst savas galerijas foto;
- pēc pasākuma beigām vienu reizi lejupielādēt savas galerijas ZIP arhīvu.

Organizators nedrīkst redzēt cita organizatora eventus, viesus vai foto.

### Viesis

Viesis nav pilns sistēmas lietotājs un neveido Supabase Auth kontu. Viesis var:

- atvērt konkrētu event linku vai QR kodu;
- ievadīt vārdu un uzvārdu;
- augšupielādēt foto tikai aktīvam eventam tā perioda laikā.

Viesis nedrīkst:

- piekļūt organizatora dashboard;
- redzēt organizatora galeriju;
- redzēt cita eventa foto;
- augšupielādēt foto deaktivizētā, dzēstā vai ārpus perioda esošā eventā.

## Auth pieeja

Organizatoru autentifikācija tiek veikta ar Supabase Auth.

Frontend izmanto Supabase publishable key. Tā nav slepena service role atslēga un drīkst atrasties frontend kodā. Service role key netiek izmantota frontendā un nedrīkst tikt commitota GitHub repozitorijā.

Pēc reģistrācijas `handle_new_user()` datubāzes funkcija izveido ierakstu `public.users` tabulā. Šī tabula satur organizatora profila datus:

- `id`;
- `email`;
- `first_name`;
- `last_name`;
- `created_at`.

## RLS pamata princips

RLS ir ieslēgts visām galvenajām tabulām:

- `public.users`;
- `public.events`;
- `public.guests`;
- `public.media`.

Tas nozīmē, ka tabulas nav pilnībā publiskas pēc noklusējuma. Datus var lasīt vai mainīt tikai tad, ja konkrētā RLS policy to atļauj.

## Users tabulas drošība

`users` tabulā organizators drīkst lasīt un labot tikai savu profilu.

Galvenais nosacījums:

```sql
auth.uid() = id
```

Tas nozīmē, ka ielogotā lietotāja Supabase Auth ID ir jāsakrīt ar `users.id`.

## Events tabulas drošība

### Organizators lasa savus eventus

Organizators drīkst redzēt tikai eventus, kuros:

```sql
owner_id = auth.uid()
```

Šis nosacījums nodrošina organizatoru izolāciju. Ja organizators B ielogojas savā kontā, viņš neredz organizatora A eventus, jo `owner_id` neatbilst viņa `auth.uid()`.

### Organizators izveido savus eventus

Jauns events drīkst tikt izveidots tikai ar:

```sql
owner_id = auth.uid()
```

Papildus tiek pārbaudīts:

- `start_date >= current_date`;
- `end_date >= start_date`;
- `end_date <= start_date + 2`.

Tas nodrošina, ka nevar izveidot eventu pagātnē un MVP perioda limits nepārsniedz 3 dienas.

### Organizators labo savus eventus

Event update policy atļauj labot tikai savus eventus:

```sql
owner_id = auth.uid()
```

Tiek saglabāta arī perioda validācija:

- beigu datums nedrīkst būt pirms sākuma datuma;
- periods nedrīkst pārsniegt 3 dienas.

### Viesis lasa event landing page

Anon viesis drīkst nolasīt eventu tikai tad, ja:

```sql
status = 'active'
and current_date >= start_date
and current_date <= end_date
```

Tas nozīmē, ka QR/link guest lapa ir pieejama tikai aktīvā pasākuma periodā. Ja eventu deaktivizē vai periods ir beidzies, viesis nevar izmantot upload plūsmu.

## Guests tabulas drošība

Organizators drīkst redzēt viesus tikai saviem eventiem. RLS policy pārbauda, vai `guests.event_id` pieder eventam, kura `owner_id = auth.uid()`.

Anon viesis drīkst izveidot `guests` ierakstu tikai tad, ja events:

- eksistē;
- ir `active`;
- atrodas aktīvā datumu periodā.

Šī pieeja ļauj viesim bez konta ievadīt savu vārdu, bet neļauj izveidot viesu ierakstus slēgtos vai svešos scenārijos.

## Media tabulas drošība

`media` tabula glabā foto metadatus:

- event ID;
- guest ID;
- storage path;
- file type;
- file size;
- created_at;
- status.

### Organizators lasa media tikai saviem eventiem

Organizators drīkst redzēt tikai `media` ierakstus, kas pieder viņa eventiem:

```sql
events.id = media.event_id
and events.owner_id = auth.uid()
```

Tas aizsargā galeriju no situācijas, kurā viens organizators redz cita organizatora foto.

### Organizators labo media statusu

Foto dzēšana MVP līmenī tiek apstrādāta kā Storage faila dzēšana un `media.status = 'deleted'`. Update policy ļauj to darīt tikai eventa īpašniekam.

### Viesis izveido media ierakstu

Anon vai authenticated viesis var izveidot `media` ierakstu tikai tad, ja:

- `file_type like 'image/%'`;
- `file_size <= 6291456`;
- events ir `active`;
- šodienas datums ir event periodā.

Tas samazina risku, ka viesis pievieno neatļautu failu vai mēģina augšupielādēt foto slēgtā eventā.

## Storage drošība

Foto faili glabājas Supabase Storage bucketā:

```text
event-photos
```

Bucket nav publisks:

```sql
public = false
```

Atļautie MIME tipi:

- `image/jpeg`;
- `image/png`;
- `image/webp`;
- `image/gif`;
- `image/heic`;
- `image/heif`.

Maksimālais faila izmērs:

```text
6 MB
```

## Storage upload policy

Viesis var augšupielādēt foto tikai tad, ja Storage path pirmais folderis sakrīt ar aktīva eventa `storage_folder`.

Policy pārbauda:

```sql
events.storage_folder = (storage.foldername(storage.objects.name))[1]
and events.status = 'active'
and current_date >= events.start_date
and current_date <= events.end_date
```

Tas nozīmē, ka viesis nevar vienkārši augšupielādēt failu jebkurā Storage folderī. Failam jāiet konkrētā event folderī, un eventam jābūt aktīvam.

## Storage read policy

Organizators var lasīt Storage failus tikai tad, ja:

- fails ir bucketā `event-photos`;
- faila `storage_path` vai `thumbnail_path` ir piesaistīts `media` ierakstam;
- `media` ieraksts pieder eventam, kura īpašnieks ir ielogotais organizators;
- `media.status = 'uploaded'`.

Storage faili nav publiski pieejami ar pastāvīgiem publiskiem URL. Galerijai tiek ģenerēti signed URLs ar ierobežotu derīguma laiku.

## Storage delete policy

Organizators var dzēst Storage failu tikai tad, ja fails pieder viņa eventam. Policy pārbauda saiti:

```text
storage.objects.name -> media.storage_path -> events.owner_id
```

Tas pats princips attiecas arī uz thumbnail failiem. Ja `events.owner_id` neatbilst `auth.uid()`, dzēšana tiek bloķēta.

## Frontend validācija

Frontend validācija uzlabo lietotāja pieredzi, bet nav vienīgā drošības aizsardzība.

Frontend pārbauda:

- event nosaukums ir aizpildīts;
- event periods nav garāks par 3 dienām;
- event periods nav pagātnē, veidojot jaunu eventu;
- viesis ievada vārdu;
- fails ir attēls;
- fails nepārsniedz 6 MB;
- event ir aktīvs pirms foto upload.

Svarīgi: pat ja lietotājs mēģina apiet frontend validāciju, Supabase RLS un Storage policies joprojām bloķē neatļautas darbības.

## Error messages

Frontend lietotājam nerāda stack trace vai sistēmas iekšējās kļūdas. Kļūdas tiek pārvērstas draudzīgākos paziņojumos, piemēram:

- nepareizs e-pasts vai parole;
- fails ir pārāk liels;
- foto upload neizdevās;
- nav tiesību veikt darbību;
- event link nav pieejams.

11. dienas UX uzlabojumā tehniskie RLS un Storage kļūdu teksti tika aizstāti ar lietotājam saprotamiem paziņojumiem, piemēram “This event is closed” vai “Photo upload is not available for this event right now”.

## Pašreizējie drošības ierobežojumi

MVP līmenī nav ieviests:

- custom rate limiting viesu uploadam;
- maks. foto skaits uz vienu eventu;
- maks. foto skaits uz vienu viesi;
- detalizēts audit log katrai darbībai;
- custom SMTP production e-pastiem;
- server-side image processing;
- server-side ZIP generation;
- automātisks scheduled cleanup ar backend funkciju.

Šie punkti nav bloķējoši MVP testam, bet tie jāplāno production versijai.

## Drošības pārbaudes pirms praktiskā testa

Pirms 28.08 praktiskā testa jāpārbauda:

1. Organizators A neredz organizatora B eventus.
2. Organizators B neredz organizatora A foto.
3. Anon viesis var uploadot foto aktīvam eventam perioda laikā.
4. Anon viesis nevar uploadot deaktivizētam eventam.
5. Anon viesis nevar uploadot ārpus event perioda.
6. Dzēsts vai deaktivizēts events vairs neatļauj guest upload.
7. Storage faili nav publiski pieejami bez signed URL.

## Secinājums

Event Photo SaaS MVP drošība balstās uz Supabase Auth, RLS un Storage policies. Frontend validācija palīdz lietotājam, bet galvenā drošības kontrole atrodas datubāzes un Storage līmenī.

Pašreizējā MVP drošības arhitektūra atbilst praktiskā testa vajadzībām: organizatori ir izolēti viens no otra, viesi var pievienot foto bez konta tikai konkrētā aktīvā eventā, un foto faili nav publiski atvērti. Production versijai vēl jāpapildina rate limiting, audit logging, SMTP un storage limitu pārvaldība.
