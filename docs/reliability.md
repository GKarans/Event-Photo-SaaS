# Uzticamības labojumi, 12.09.2026.

Statuss: lokāli ieviesti un pārbaudīti ar imitētu API / PGlite. Nav publicēti, nav pārbaudīti production ar īstu telefonu vai Supabase Storage.

## ZIP un eventu pārslēgšana

- ZIP lasa visus uploaded media ierakstus ar lapošanu neatkarīgi no galerijas filtriem un thumbnail pieejamības. Datu lasīšana turpinās līdz tukšai lapai, arī ja API atgriež mazāk rindu nekā pieprasīts.
- Eventa ID, faila nosaukums un lietotāja ID tiek saglabāti procesa sākumā. Cita eventa atvēršana nemaina eksportu vai tā zip_downloaded_at ierakstu.
- Vienlaikus darbojas viens ZIP process. Pēc sagatavošanas atmiņā glabā vienu ZIP Blob. Save ZIP again izmanto to pašu failu, neielādējot foto vēlreiz. Arī neskaidra zip_downloaded_at atbildes kļūme ļauj atkārtot apstiprināšanu, kamēr lapa ir atvērta.
- Logout/konta maiņa atbrīvo sagatavoto ZIP un galeriju kešu. Jauna eventa ZIP aizvieto iepriekšējo sagatavoto failu.
- Pārlūks nevar apstiprināt saglabāšanu diskā. Pēc lapas pārlādes/aizvēršanas Blob pazūd; servera vienreizējais marķieris saglabājas. Ļoti lieli ZIP joprojām ir ierobežoti ar pārlūka atmiņu. Servera arhīvu glabāšana un ilgstoša atkārtota izsniegšana nav ieviesta.
- Galerijas, detaļu, preview un organizatora saraksta novēlotās atbildes tiek ignorētas pēc skata vai sesijas maiņas.

## Foto dzīves cikls

Jaunais upload vispirms sagatavo optimizētu JPEG un thumbnail. Ja thumbnail sagatavošana neizdodas, panākumus nerāda un failus nesūta. prepare_photo_upload izveido uploading media ierakstu pirms failu sūtīšanas. complete_photo_upload pārbauda abus Storage objektus un atvērto eventu, tikai tad ieraksts kļūst uploaded.

Retry upload izmanto to pašu rezervēto UUID un ceļus. Veiksmīgi pabeigtos failu sūtīšanas posmus neatkārto. Atkārtota pabeigšana pēc pazudušas atbildes ir idempotenta. Viesa vārdu nevar mainīt nepabeigtas augšupielādes laikā. Retry stāvoklis un foto atrodas tikai atvērtās lapas atmiņā.

Dzēšana vispirms atzīmē media kā deleted. Tikai tad dzēš failus un ieraksta storage_deleted_at. Ja Storage dzēšana neizdodas, foto nav galerijā, bet faili paliek uzskaitīti atkārtotai tīrīšanai.

Refresh atkārto līdz 50 deleted un līdz 50 vairāk nekā 24 h vecu uploading ierakstu tīrīšanu katrā piegājienā. Tā ir organizatora darbība, nevis fonā strādājošs cron. Kamēr nav refresh, nepabeigtie faili var palikt Storage.

Cover ceļš pirms upload tiek reģistrēts cover_cleanup. Vecā cover nomaiņa un tā tīrīšanas uzdevums tiek saglabāti vienā DB transakcijā ar trigger. Refresh pēc 24 h dzēš vairs neizmantotos cover failus; aktuālo cover nedzēš. Tabulas mērķis ir nepazaudēt faila ceļu pēc kļūmes. Esoši, pirms šī labojuma radušies orphan faili automātiski netiek atrasti.

Vecie uploaded foto bez thumbnail netiek automātiski pārkodēti. Tie joprojām ir organizatora galerijā/ZIP; viesu galerijā tie nav redzami līdz atsevišķai thumbnail atjaunošanai. Automātiska veco foto pārlāde nav ieslēgta, lai neradītu neplānotu egress.

## Vadība un datumi

Edit Event atver nosaukuma/datumu formu. Guest Design ir atsevišķa poga. Nākotnes un manuāli pauzētiem, vēl nebeigušiem eventiem organizators var sagatavot QR, saiti un dizainu. Upload joprojām atļauts tikai aktīvā periodā. Pēc perioda beigām šīs pogas paslēpj.

Datumu salīdzināšana un arhivēšanas robeža frontend izmanto Europe/Riga tāpat kā SQL. Precīzs sākuma/beigu pulksteņa laiks šajā labojumā nav ieviests; tā ir atsevišķa saskaņojama migrācija.

Galerijai ir Refresh ar keša apiešanu. Pilna izmēra signed URL tiek atjaunots pirms termiņa beigām. Nav polling/realtime; astoņu minūšu kešs saglabājas parastai atkārtotai atvēršanai, Refresh parāda jaunāko sarakstu.

## Uzstādīšana un testi

1. npm ci
2. npx playwright install chromium
3. npm test

npm test ietver JS sintaksi, Auth un uzticamības regresijas, abus SQL testus un viesu/organizatora pārlūka testus. Atkarību versijas ir package.json un package-lock.json. Testi neizmanto production kontus vai privātos foto. SQL testiem ir vienkāršota lokāla datubāzes vide, nevis pilns Supabase serviss.

Lokālais preview: npm start, noklusētā adrese http://127.0.0.1:5604. Backend joprojām ir konfigurētais Supabase projekts; preview izmantošana pati par sevi nav izolēts datu tests.

## Publicēšanas kārtība

Esošā projektā vispirms palaist supabase/migrations/20260912_media_reliability.sql SQL Editorā. Jaunā projektā secība: schema.sql, 20260911_guest_gallery.sql, 20260912_media_reliability.sql. Pēc tam publicēt frontend. guest-gallery Edge Function šajā izmaiņā nav jāmaina. Vecā schema.sql atkārtota palaišana atjauno vecās policies, tāpēc pēc tās jāatkārto migrācijas.

Production manuāli pārbaudīt: 10 secīgi foto; thumbnail kļūme un Retry upload; savienojuma zudums; dzēšana un Refresh; nākotnes eventa datumu/dizaina rediģēšana; ZIP ar ieslēgtu viesa filtru un pārslēgšanos uz citu eventu; Save ZIP again bez papildu foto tīkla pieprasījumiem. Testēt Android un iPhone. Testa rezultātus fiksēt atsevišķi no lokālajiem testiem.
