# Production pieņemšanas protokols

Statuss: **sagatavots izpildei, nav aizpildīts gala production rezultāts**.
Lokālie testu rezultāti ir `testing-report.md`. Neatzīmēt PASS tikai tāpēc,
ka lapa atveras vai SQL atgriež Success.

## Konfigurācijas pārbaude

1. GitHub salīdzināt publicējamā commita SHA ar lokālo `git rev-parse HEAD`.
2. Netlify pārbaudīt pareizo repozitoriju un `main`, build `npm run build`,
   publish `dist`, Node 22. Lokālais `netlify.toml` satur šos build iestatījumus.
3. Supabase Authentication URL Configuration pārbaudīt production Site URL un
   tikai nepieciešamos apstiprināšanas/paroles atjaunošanas redirect URL.
   Izmēģināt reālu e-pasta apstiprināšanu un paroles atjaunošanu.
4. Pārbaudīt uzstādītās SQL migrācijas; jauno readable folders migrāciju palaist
   pēc R2 storage un ID folders migrācijām. Nepārrakstīt iepriekšējos SQL failus.
5. Supabase pārbaudīt RLS un divu organizatoru izolāciju ar īstiem testa kontiem.
   Service-role atslēga nedrīkst būt klientā vai ekrānattēlos.
6. R2 `app-images` Public Access jāpaliek Disabled. CORS atļauj paredzētos
   frontend origin un vajadzīgās PUT galvenes; nepaplašināt to bez vajadzības.
7. Worker pārbaudīt pareizo Supabase URL, R2 endpoint/bucket un allowed origins;
   secrets esamību pārbaudīt pēc nosaukumiem, neatklājot vērtības.
8. Pārbaudīt guest-gallery funkcijas esamību un viesa/organizatora piekļuves
   uzvedību. Pieejamība jāapstiprina ar scenāriju, ne tikai deploy statusu.
9. Pēc manuālā Netlify deploy pierakstīt deploy ID, commit SHA un laiku.

## Gala matrica

Katram ierakstam pievienot faktisko datumu, ierīci/pārlūku, rezultātu un
ekrānattēla vai žurnāla ceļu. Pašlaik visi zemāk ir **nav atkārtoti pārbaudīts**.

| Scenārijs | Sagaidāmais rezultāts |
|---|---|
| Register/verify/login/logout | Pareiza pāreja uz dashboard un sesijas izbeigšana |
| Create/edit/design/QR | Saglabāti dati, pareiza saite, QR atver tieši šo pasākumu |
| 10 secīgi foto | Nav dubultu/trūkstošu foto, visiem thumbnails |
| Upload retry / bez interneta | Saprotama kļūda un atkārtošana bez dublēšanas |
| R2 jaunā hierarhija | Organizer/event/guest nosaukumi+ID, pāris photo/thumb |
| Vecais foto | Preview/download turpina strādāt bez migrācijas |
| Filter/sort/preview | Pareizs viesis, secība un atbilstošais pilnais attēls |
| Event beigu laiks | Upload slēdzas laikā; kopīgošanu var ieslēgt pēc beigām |
| Share on/off | Viesis lasa tikai atļautajā periodā; izslēgšana liedz jaunu lasīšanu |
| ZIP | Pilns, atverams arhīvs tikai izvēlētajam pasākumam |
| Delete | Foto pazūd no galerijas un tiek iztīrīti saistītie objekti |
| Organizators B | Nevar lasīt/mainīt A pasākumu vai tā foto |
| Android/iPhone | Nav pārklājoša teksta, kamera/upload/preview ir lietojami |

Nemainīt īstu pasākumu datumus testēšanai. Izmantot atsevišķu īsu testa pasākumu.
Ekrānattēlos aizklāt personu e-pastus, atslēgas un parakstītās foto adreses.
Ja pārbaude neizdodas, fiksēt FAIL, soļus un kļūdu; neveidot gala PASS pārskatu.
