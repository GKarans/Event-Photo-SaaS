# Event Photo SaaS MVP tehniskais aizstāvēšanas ceļvedis

Šis materiāls paredzēts mutiskai projekta aizstāvēšanai. Atbildes balstās uz repozitorijā esošo kodu un production arhitektūru.

## 30 sekunžu projekta skaidrojums

Event Photo SaaS atrisina problēmu, ka pasākuma fotogrāfijas pēc pasākuma paliek dažādos viesu telefonos. Organizators izveido pasākumu un saņem saiti un QR kodu. Viesis bez konta atver saiti, ievada vārdu un uzņem foto. Jaunie attēli tiek optimizēti pārlūkā, droši augšupielādēti privātā Cloudflare R2 glabātuvē un parādās organizatora galerijā. Supabase nodrošina autentifikāciju, PostgreSQL datubāzi un piekļuves noteikumus, bet Netlify publicē frontend.

## Pilnā arhitektūra

**Jautājums: Kāpēc izmantoti vairāki servisi?**

Katram servisam ir viena galvenā atbildība. Netlify piegādā statisku HTML/CSS/JavaScript lietotni. Supabase Auth pārvalda organizatoru sesijas, PostgreSQL glabā metadatus un RLS nosaka datu piekļuvi. Cloudflare Worker ir droša servera robeža, kas glabā noslēpumus un autorizē R2 operācijas. R2 glabā lielos foto failus. Šādi datubāze netiek izmantota kā failu sistēma un R2 atslēgas nekad nenonāk pārlūkā.

**Jautājums: Kas notiek no pogas `Take Photo` līdz galerijai?**

1. Faila input ar `capture="environment"` pieprasa aizmugurējo kameru, ja telefons to atbalsta.
2. Frontend pārbauda, ka izvēlēts attēls.
3. Pārlūkā izveido optimizētu WebP originalu un mazāku WebP thumbnail.
4. `prepare_photo_upload` izveido `media` ierakstu ar `pending` statusu.
5. Worker rezervē katru R2 objektu un izdod īslaicīgu presigned PUT adresi.
6. Pārlūks augšupielādē bināros datus tieši R2.
7. Worker pārbauda objekta izmēru un checksum.
8. `complete_r2_photo` maina statusu uz `uploaded` tikai tad, kad gatavs gan originals, gan thumbnail.
9. Galerija atlasa tikai pabeigtos media ierakstus.

## Autentifikācija un autorizācija

**Jautājums: Kā atšķiras autentifikācija no autorizācijas?**

Autentifikācija nosaka, kas ir lietotājs; to dara Supabase Auth ar e-pastu, paroli un JWT sesiju. Autorizācija nosaka, ko šis lietotājs drīkst darīt; to pārbauda RLS, SQL funkcijas un Cloudflare Worker. Tas, ka poga nav redzama UI, nav autorizācija.

**Jautājums: Kā organizators tiek izolēts no cita organizatora?**

`events.owner_id` ir organizatora Auth UUID. RLS pieprasījumos salīdzina `owner_id` ar `auth.uid()`. Viesi un media ir piesaistīti eventam, tāpēc arī to piekļuve tiek pārbaudīta caur eventa īpašnieku. Worker papildus pārbauda Bearer tokenu un servera funkcijai nodod pārbaudīto identitāti.

**Jautājums: Vai eventa UUID vai faila adrese ir slepena parole?**

Nē. UUID samazina nejaušu uzminēšanu, bet pats par sevi nav autorizācija. R2 bucket ir privāts, un katrs faila pieprasījums iziet caur Worker, kas atkārtoti pārbauda tiesības.

**Jautājums: Kāpēc frontendā drīkst būt Supabase publishable key?**

Publishable key identificē projektu, bet nedod service role privilēģijas. Datu drošību nodrošina RLS un lietotāja JWT. Service role key apiet RLS, tāpēc tas glabājas tikai Worker noslēpumos un nedrīkst nonākt repozitorijā vai pārlūkā.

## R2 un failu glabāšana

**Jautājums: Kāpēc R2 bucket nav publisks?**

Publisks bucket ļautu atvērt zināmu objekta URL arī pēc galerijas atslēgšanas. Privāts bucket ļauj Worker katrā lasīšanas reizē pārbaudīt organizatoru, eventa statusu un kopīgošanas termiņu.

**Jautājums: Kas ir presigned URL?**

Tā ir īslaicīga, kriptogrāfiski parakstīta atļauja vienai konkrētai R2 operācijai. Klients saņem PUT adresi tikai iepriekš pārbaudītam objekta ceļam, tipam un izmēram. R2 Access Key ID un Secret Access Key netiek nodoti klientam.

**Jautājums: Kāpēc ir gan `media`, gan `r2_objects` tabula?**

`media` apraksta lietotājam redzamu foto un tā attiecības ar eventu un viesi. `r2_objects` apraksta fiziskos objektus: originalu, thumbnail vai cover, to checksum, izmēru, R2 atslēgu un upload stāvokli. Vienam media ierakstam parasti ir divi R2 objekti.

**Jautājums: Kāpēc mapēs ir nosaukums un UUID?**

Nosaukums palīdz administratoram Cloudflare panelī saprast saturu. UUID nodrošina unikālumu, ja diviem viesiem vai eventiem ir vienāds nosaukums. Tiesības vienmēr balstās uz UUID, nevis uz tekstu.

**Jautājums: Kāpēc galerija izmanto thumbnails?**

Ja režģī ielādētu pilnos attēlus, palielinātos gaidīšanas laiks, atmiņas patēriņš un datu pārraide. Thumbnail ir daudz mazāks, bet originals tiek pieprasīts tikai preview vai ZIP vajadzībām.

## Laiki un darbība ārvalstīs

**Jautājums: Kā aplikācija strādā dažādās laika zonās?**

Veidojot eventu, pārlūks automātiski nodod IANA laika zonu, piemēram, `Europe/Riga`. Lietotājam zona nav jāizvēlas. PostgreSQL ģenerē `starts_at` un `ends_at` kā `timestamptz`, kas apzīmē vienu UTC momentu. Viesim periods tiek attēlots viņa ierīces lokālajā zonā.

**Jautājums: Kāpēc nepietiek ar datumu un tekstu `18:00`?**

Bez zonas `18:00` nav viennozīmīgs laika moments. Tas rada kļūdas ārvalstīs un vasaras/ziemas laika pārejās. Datubāze arī noraida neeksistējošu vai divdomīgu vietējo laiku DST pārejas stundā.

**Jautājums: Kad tieši uploads tiek slēgts?**

Nosacījums ir `starts_at <= now < ends_at`. Sākuma brīdis ir iekļauts, beigu brīdis nav. Tādēļ pēc precīzā beigu laika uploads tiek liegts un var kļūt pieejamas pēc-pasākuma darbības.

## Galerija, kopīgošana un ZIP

**Jautājums: Kā viesu galerija tiek atvērta pēc pasākuma?**

Organizators pēc eventa beigām ieslēdz kopīgošanu uz noteiktu termiņu. Esošā QR saite paliek tā pati. Worker izsauc `guest_gallery_access`, kas pārbauda eventa statusu, kopīgošanas termiņu, pieprasīto media un kvotu. Izslēdzot kopīgošanu, nākamie pieprasījumi tiek atteikti.

**Jautājums: Kā darbojas ZIP?**

MVP parlūkā ielasa visus eventa pabeigtos originalus neatkarīgi no aktīvā galerijas filtra un izveido arhīvu ar JSZip. Process ir bloķēts līdz eventa beigām. Gatavais Blob paliek atvērtās lapas atmiņā, tāpēc to var saglabāt atkārtoti bez atkārtotas foto ielādes. Lielam komerciālam apjomam arhīva veidošana būtu jāiznes servera fona darbā.

**Jautājums: Kāpēc `Delete event` uzreiz nedzēš failus?**

Nejauša tūlītēja fiziska dzēšana būtu grūti atjaunojama. MVP galvenā saraksta darbība pasākumu arhivē. Atsevišķa foto dzēšana ir kontrolēta: Worker pārbauda īpašnieku un dzēš originalu un thumbnail.

## Uzticamība un kļūdu apstrāde

**Jautājums: Kas notiek, ja uploads pārtrūkst pa vidu?**

Media paliek `pending`, tāpēc galerija to nerāda kā gatavu. Klients var atkārtot neizdevušos posmu ar to pašu UUID. Pabeigšanas funkcija ir idempotenta: atkārtota veiksmīga pieprasījuma rezultāts nedublē foto.

**Jautājums: Kā tiek novērsts, ka atbilde no veca eventa parādās jaunā skatā?**

Galerijas un detaļu ielādei tiek saglabāts pieprasījuma konteksts. Ja lietotājs pa to laiku pārslēdz eventu, filtru vai sesiju, novēlotā atbilde tiek ignorēta.

**Jautājums: Kāpēc checksum ir vajadzīgs?**

Checksum ļauj Worker pārbaudīt, ka R2 nonākušie baiti atbilst klienta rezervētajam failam. Tas palīdz atklāt bojātu vai neatbilstošu upload un nepaļauties tikai uz HTTP statusu.

**Jautājums: Vai CORS nodrošina drošību?**

CORS nosaka, kuri pārlūka origin drīkst izsaukt API, bet tas neaizstāj autentifikāciju un autorizāciju. API joprojām pārbauda JWT, eventa piederību, periodu un objekta ceļu.

## Testēšana

**Jautājums: Kādi automatizētie testi ir projektā?**

`npm test` palaiž build, JavaScript sintakses, Auth sesijas, reliability, SQL un Playwright UI testus. PGlite pārbauda SQL funkciju loģiku un atļaujas izolētā PostgreSQL vidē. Worker testi imitē pieprasījumus un pārbauda parakstus, CORS, aizliegtus ceļus, dzēšanu un galerijas atslēgšanu. Playwright pārbauda galvenos responsive UI stāvokļus.

**Jautājums: Ko automatizētie testi nepierāda?**

Tie nepierāda, ka production panelī pareizi iestatīti noslēpumi, Auth redirecti un DNS, kā arī neaizstāj reālu iPhone/Android kameru. Tāpēc tika veikti production smoke un reālo ierīču testi.

**Jautājums: Kādi reālie testi veikti?**

12.09.2026. pārbaudīta pilnā viesa pamatplūsma ar iPhone 13 Pro un Samsung Galaxy S23 eventā `test.retake.photo`. Abās ierīcēs strādāja saites atvēršana, vārda ievade, kamera, upload un rezultāta parādīšanās galerijā. Atsevišķā production pasākumā 17 dalībnieki pievienoja 57 foto.

## Būtiskākās problēmas un risinājumi

**Netlify build kļūda.** `dist/` bija palicis novecojis `netlify.toml`, bet build skripts atļauj tikai noteiktu publicējamo failu kopu. Tika labots build sagatavošanas process, lai vispirms izveidotu tīru un kontrolētu `dist/`.

**Grūti saprotami R2 UUID ceļi.** Drošā UUID struktūra Cloudflare panelī nebija ērti administrējama. Tika ieviesti normalizēti `vārds--UUID` prefiksi, saglabājot UUID kā identitātes pamatu.

**Mobilās kameras atgriešanās.** Dažos gadījumos pārlūks pēc kameras neizraisīja sagaidīto vienu notikumu. Apstrāde papildināta ar kontrolētu `input`/`change` stāvokli un redzamu atgriešanās statusu.

**Galerijas un ZIP stāvoklis.** Filtrs nedrīkstēja ietekmēt pilnu eksportu, bet lēna atbilde nedrīkstēja pārrakstīt cita eventa skatu. Datu ielāde eksportam tika nodalīta no UI filtra un papildināta ar request konteksta pārbaudi.

## Ierobežojumi un turpmākā attīstība

MVP apzināti neatbalsta video, maksājumus, komandas un servera fona ZIP. Vecie Supabase Storage faili nav migrēti uz R2. Nākamie tehniskie soļi būtu servera eksporta darbi, monitorings, automatizēta retention tīrīšana, staging vide un slodzes testi ar vienlaicīgiem pasākumiem.

## Īsā noslēguma atbilde

Projekta būtiskākais tehniskais rezultāts ir ne tikai funkcionējošs interfeiss, bet pilna kontrolēta datu plūsma: lietotāja identitāte, eventa periods, foto optimizācija, privāts failu uploads, metadatu stāvoklis, piekļuves pārbaude un mobilā galerija. Katras daļas atbildība ir nodalīta, un drošība netiek balstīta tikai uz frontend uzvedību.
