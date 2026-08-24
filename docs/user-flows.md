# Event Photo SaaS MVP lietotāju plūsmas

## Mērķis

Šis dokuments apraksta Event Photo SaaS MVP galvenās lietotāju plūsmas. Produkts ir photo-only risinājums pasākumu fotogrāfiju apkopošanai vienā privātā galerijā.

MVP ir divas galvenās lomas:

- Organizators - izveido un pārvalda pasākumus.
- Viesis - bez konta atver QR/linku un augšupielādē foto.

## Organizatora plūsma

### 1. Reģistrācija

1. Organizators atver `https://event-photo-saas.netlify.app`.
2. Izvēlas `Register`.
3. Ievada vārdu, uzvārdu, e-pastu un paroli.
4. Sistēma izveido Supabase Auth lietotāju.
5. `public.users` tabulā tiek saglabāts lietotāja profils.

Rezultāts: organizators var izmantot dashboard pēc autentifikācijas.

### 2. Login

1. Organizators izvēlas `Login`.
2. Ievada e-pastu un paroli.
3. Supabase Auth pārbauda datus.
4. Ja dati ir pareizi, lietotājs nonāk organizer dashboard.

Rezultāts: dashboard rāda organizatora sveicienu un tikai viņa eventus.

### 3. Event izveide

1. Organizators nospiež `Create Event`.
2. Atveras modal logs.
3. Organizators ievada event nosaukumu.
4. Organizators izvēlas sākuma un beigu datumu.
5. Sistēma pārbauda:
   - datums nav pagātnē;
   - beigu datums nav pirms sākuma datuma;
   - periods nepārsniedz 3 dienas.
6. Sistēma saglabā eventu `events` tabulā.
7. Tiek ģenerēts unikāls `slug` un `storage_folder`.

Rezultāts: events parādās `My Events` sarakstā.

### 4. Event labošana

1. Organizators nospiež `Edit`.
2. Atveras tas pats modal logs ar esošajiem event datiem.
3. Organizators labo nosaukumu vai periodu.
4. Sistēma pārbauda perioda validāciju.
5. Izmaiņas tiek saglabātas Supabase.

Rezultāts: event sarakstā un event detail skatā redzama aktuālā informācija.

### 5. Event deaktivizēšana vai aktivizēšana

1. Organizators nospiež `Deactivate`.
2. Sistēma nomaina `events.status` uz `inactive`.
3. Viesu QR/link vairs neatļauj augšupielādi.
4. Ja event periods vēl nav beidzies, organizators var nospiest `Activate`.
5. Sistēma nomaina statusu atpakaļ uz `active`.

Rezultāts: organizators var ātri aizvērt vai atvērt foto upload piekļuvi.

### 6. Event detail un QR

1. Organizators nospiež `Open`.
2. Atveras event detail skats.
3. Organizators redz statusu, datumu periodu, guest URL un QR kodu.
4. Organizators var nokopēt linku vai lejupielādēt QR.

Rezultāts: organizators var nodot linku viesiem vai parādīt QR kodu.

### 7. Galerijas pārvaldība

1. Organizators atver event detail skatu.
2. Sistēma ielādē `media` ierakstus tikai šim organizatora eventam.
3. Supabase Storage izveido signed URLs.
4. Organizators redz foto grid.
5. Organizators var:
   - filtrēt pēc viesa;
   - kārtot pēc jaunākā, vecākā vai viesa vārda;
   - atvērt preview;
   - pāršķirt foto ar bultiņām vai swipe;
   - lejupielādēt vienu foto;
   - lejupielādēt redzamos foto ZIP arhīvā;
   - dzēst nevēlamu foto.

Rezultāts: organizators var pārskatīt un savākt pasākuma foto vienuviet.

## Viesa plūsma

### 1. QR/link atvēršana

1. Viesis noskenē QR kodu vai atver guest URL.
2. Sistēma meklē eventu pēc `slug`.
3. Sistēma pārbauda:
   - event statuss ir `active`;
   - šodienas datums ir event periodā;
   - event nav dzēsts vai deaktivizēts.

Rezultāts: ja events ir pieejams, viesis redz event lapu. Ja nav, viesis redz ziņu, ka links nav pieejams foto upload.

### 2. Viesa identifikācija

1. Viesis ievada vārdu un uzvārdu.
2. Nospiež `Start`.
3. Sistēma izveido ierakstu `guests` tabulā.
4. Viesa lokālā sesija tiek saglabāta pārlūkā `localStorage`.

Rezultāts: viesim nav jāveido konts, bet organizators vēlāk redz, kurš uzņēma foto.

### 3. Foto uzņemšana

1. Viesis nospiež `Take Photo`.
2. Telefons atver kameru vai faila izvēli.
3. Viesis uzņem foto.
4. Sistēma pārbauda:
   - fails ir attēls;
   - fails nepārsniedz 10 MB;
   - events joprojām ir aktīvs un periodā.

Rezultāts: tikai derīgs foto tiek sūtīts uz Storage.

### 4. Foto augšupielāde

1. Foto tiek augšupielādēts Supabase Storage bucketā `event-photos`.
2. Storage path satur event folderi, viesa folderi un cilvēkam saprotamu faila nosaukumu.
3. Pēc faila augšupielādes tiek izveidots `media` ieraksts datubāzē.
4. Viesis redz veiksmīgu upload paziņojumu.

Rezultāts: organizators redz foto savā galerijā.

### 5. Atkārtota foto uzņemšana

1. Viesis paliek tajā pašā foto panelī.
2. Var vēlreiz nospiest `Take Photo`.
3. Sistēma izmanto to pašu viesa identifikāciju.

Rezultāts: viens viesis var pievienot vairākas bildes bez atkārtotas vārda ievades.

## Kļūdu plūsmas

### Event nav pieejams

Iemesli:

- Nepareizs vai vecs links.
- Events ir deaktivizēts.
- Events ir ārpus datumu perioda.
- Events ir dzēsts.

Lietotāja rezultāts: viesim netiek rādīta upload forma.

### Upload neizdodas

Iemesli:

- Interneta savienojuma problēma.
- Fails ir pārāk liels.
- Fails nav attēls.
- Storage/RLS noteikumi bloķē darbību.

Lietotāja rezultāts: viesis saņem saprotamu kļūdas paziņojumu.

### Organizatoram nav tiesību

Iemesli:

- Organizators mēģina piekļūt cita organizatora eventam vai failiem.
- Sesija ir beigusies.

Lietotāja rezultāts: dati netiek ielādēti vai darbība tiek bloķēta.

## Datu drošības principi plūsmās

- Organizators redz tikai eventus, kuros `owner_id = auth.uid()`.
- Organizators redz tikai media ierakstus saviem eventiem.
- Viesim nav nepieciešams Auth konts.
- Viesis var pievienot foto tikai aktīvam eventam perioda laikā.
- Storage faili nav publiski; organizatoram tiek ģenerēti signed URLs.

## MVP plūsmas pieņemšanas kritēriji

MVP lietotāju plūsmas ir pabeigtas, ja:

- Organizators var reģistrēties un ielogoties.
- Organizators var izveidot, labot, deaktivizēt un atvērt eventu.
- Organizators var iegūt QR/linku.
- Viesis var atvērt linku bez konta.
- Viesis var ievadīt vārdu un augšupielādēt foto.
- Organizators redz foto galerijā.
- Organizators var filtrēt, kārtot, apskatīt, dzēst un lejupielādēt foto.
- Cita organizatora dati nav redzami.
