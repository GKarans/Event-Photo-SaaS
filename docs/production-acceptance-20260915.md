# Production pieņemšanas protokols

Statuss: **MVP pamatplūsma production vidē izturēta; paplašinātie slodzes un
nestabila tīkla scenāriji paliek turpmākai testēšanai**. Lokālie rezultāti ir
`testing-report.md`, bet ekrānattēli indeksēti `evidence/practice/README.md`.

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

Pamatplūsma 12.09.2026. pārbaudīta ar iPhone 13 Pro un Samsung Galaxy S23
eventā `test.retake.photo`. Konfigurācija un R2 rezultāts papildus pārskatīts
15.-17.09.2026.

| Scenārijs | Sagaidāmais rezultāts |
|---|---|
| Register/verify/login/logout | PASS - pilnā organizatora plūsma izpildīta |
| Create/edit/design/QR | PASS - eventa izveide, detaļas un QR pārbaudīti |
| 10 secīgi foto | PASS automatizētajā retry/regresijas līmenī; atkārtot nākamā slodzes testā |
| Upload retry / bez interneta | PASS automatizētajos testos; reāla lēna tīkla mērījums nav veikts |
| R2 jaunā hierarhija | PASS - panelī redzami nosaukumi+ID un photo/thumb pāris |
| Vecais foto | PASS - galerijā vienlaikus pieejami vecie un jaunie foto |
| Filter/sort/preview | PASS - organizatora galerijā pārbaudīts |
| Event beigu laiks | PASS automatizētajos SQL/UI testos |
| Share on/off | PASS automatizētajos SQL/Worker/UI testos |
| ZIP | PASS - organizatora plūsmā lejupielādēts arhīvs |
| Delete | PASS - foto dzēšana pārbaudīta organizatora plūsmā |
| Organizators B | PASS automatizētajos ownership/RLS testos |
| Android/iPhone | PASS - iPhone 13 Pro un Samsung Galaxy S23 |

Nemainīt īstu pasākumu datumus testēšanai. Izmantot atsevišķu īsu testa pasākumu.
Ekrānattēlos aizklāt personu e-pastus, atslēgas un parakstītās foto adreses.
Ja pārbaude neizdodas, fiksēt FAIL, soļus un kļūdu; neveidot gala PASS pārskatu.
