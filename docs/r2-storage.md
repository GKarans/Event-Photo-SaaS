# Privāta Cloudflare R2 glabāšana

12.09.2026. laidiens: lietotājs publicējis Worker `https://event-photo-media.gkarans-events.workers.dev` (versija `9a781ee7-7ea7-4279-a60b-3026cad4261f`), apstiprinājis R2 SQL migrāciju un 17:51 foto galerijā ar diviem WebP objektiem privātajā R2 bucket. Pēc lietotāja pieprasījuma konfigurācija ieslēdz R2 arī production origin. Veco failu pārnešana NAV veikta: lokāli nav pieejamas migrācijai nepieciešamās servera atslēgas. Vecie faili turpina ielādēties no Supabase, avoti netiek dzēsti. Viens veiksmīgs upload nenozīmē visu zemāk uzskaitīto integrācijas testu izpildi.

Netlify laidiens izmanto `npm run build` un publicē tikai `dist`, nevis visu repozitorija sakni. Tādēļ servera kods, `.env` un dokumentācija nav tīmekļa izplatījumā.

## Lēmums

Supabase Auth un PostgreSQL paliek. Organizators pēc pasākuma ieslēdz viesu galeriju uz ne vairāk kā 7 dienām esošajā 14 dienu pieejamības logā. R2 bucket ir PRIVĀTS; neieslēgt publisku `r2.dev` vai publisku media domēnu. CORS nav piekļuves kontrole. Jau lejupielādētu foto atsaukt nevar.

Nākotnes variants: organizators izvēlas ilgāku kopīgošanas termiņu. Pirms tam jāsaskaņo retention, izmaksas un kvotas; pašlaik 7 dienu noteikums nav mainīts.

## Arhitektūra

- Tukšs `MEDIA_API_URL` failā `storage-config.js` saglabā Supabase Storage uzvedību.
- `r2-storage.js` ieslēgtā režīmā nosūta WebP tieši R2 ar 5 minūšu parakstītu PUT. Saite piesaistīta izmēram, tipam un SHA-256 kontrolsummai, tāpēc to nevar atkārtoti izmantot citu baitu nosūtīšanai.
- `cloudflare/media-worker.js` izmanto oficiālos AWS S3 SDK/presigner. Slepenās atslēgas ir tikai Worker secrets. Worker pārbauda faila izmēru, kontrolsummu un WebP signatūru pirms tā pieejamības.
- Jauna `r2_objects` tabula reģistrē rezervācijas un provideru. Tā ir vajadzīga jauktai veco/jauno failu lasīšanai un upload/dzēšanas atkopšanai. Tikai `service_role` piekļūst šim reģistram un tā RPC.
- Esošie privātie `storage_path`/`thumbnail_path` saglabājas, netiek ievietoti publiski URL. Foto kļūst uploaded tikai pēc abu objektu pabeigšanas. Retry atvērtajā lapā atkārto trūkstošos soļus.
- Viesu saraksts/katrs foto iet caur esošo `guest_gallery_access` RPC: OFF, termiņš, eventa statuss un 2000 pieprasījumu kvota paliek serverī. Organizatora un cover parakstītās Worker saites arī pārbauda tiesības katrā pieprasījumā. Atbildes ir `no-store`.
- Veco, nemigrēto objektu lasīšana joprojām izmanto Supabase. Jaunie foto baiti neiet caur Supabase Edge Function.
- WebP encoding izmanto native canvas; ja tas nav atbalstīts, pēc vajadzības ielādē lokālu jSquash WASM encoder atsevišķā Web Worker. Esošie migrētie JPEG/PNG netiek pārkodēti.
- Sākotnējās aizsardzības robežas: 60 objektu rezervācijas/minūtē/eventā, 2 GiB reģistrētu nedzēstu objektu/eventā, foto līdz 6 MiB, thumbnail līdz 1 MiB. Viens foto ar thumbnail ir divi objekti. Tie nav cenu plāni.

## Izmaksas

R2 Standard cena pārbaudes brīdī: 10 GB-month free tier, pēc tam $0.015/GB-month, atsevišķas Class A/B operācijas. Tiešai R2 datu pārraidei nav egress maksas. 100 GB kopā pilnu mēnesi būtu aptuveni $1.35 par glabāšanu pēc free tier, neskaitot nodokļus/citus pakalpojumus. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

Supabase egress nav garantēti nulle: paliek Auth/DB, vecie faili un vienreizējā kopēšana. Worker pieprasījumiem/CPU var būt savas izmaksas. R2 ir failu krātuve, nevis lielāka aplikācijas RAM. 30-40 tūkstošus foto 10 GB nevar garantēt bez vidējā foto+thumbnail izmēra mērījuma.

Avoti: [Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/), [Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).

## Uzstādīšana

Vispirms testa vide/events; production frontend slēdzi atstāt izslēgtu līdz pieņemšanas testiem.

1. Cloudflare R2 izveido Standard bucket `app-images`. Public Development URL un publiskā domēna piekļuvi atstāj OFF. Saglabā precīzo S3 API endpoint, arī EU jurisdiction daļu, ja tāda ir.
2. R2 API token: Object Read & Write tikai šim bucket. Atslēgas nelikt frontendā/Git/sarakstē.
3. Bucket CORS norādi konkrētos frontend origin:

```json
[
  {
    "AllowedOrigins": ["https://event-photo-saas.netlify.app", "http://127.0.0.1:5604"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "x-amz-checksum-sha256"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Supabase SQL Editor izveido JAUNU snippet `R2 private storage`. Vispirms jābūt palaistām `20260911_guest_gallery.sql` un `20260912_media_reliability.sql`. Tad palaid `supabase/migrations/20260912_r2_storage.sql`. Esošā DB nepārraksti/nepalaid visu `schema.sql` no jauna.
5. `cloudflare/wrangler.toml` aizstāj `R2_ENDPOINT`, pārbaudi bucket, Supabase URL un `ALLOWED_ORIGINS`. Tie nav slepeni dati.
6. Projekta terminālī:

```powershell
npm ci
npx wrangler login
npx wrangler secret put R2_ACCESS_KEY_ID --config cloudflare/wrangler.toml
npx wrangler secret put R2_SECRET_ACCESS_KEY --config cloudflare/wrangler.toml
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --config cloudflare/wrangler.toml
npx wrangler secret put MEDIA_SIGNING_SECRET --config cloudflare/wrangler.toml
```

Vērtības ievada CLI slepenās vērtības uzvednē, nevis komandā. Supabase atslēga ir servera `service_role`, nevis frontend publishable key. `MEDIA_SIGNING_SECRET` ģenerē paroļu pārvaldniekā: jauns nejaušs vismaz 32 simbolu noslēpums.

7. Pārbaudi un publicē Worker tikai pēc konfigurācijas:

```powershell
npm run test:r2
npx wrangler deploy --dry-run --config cloudflare/wrangler.toml
npx wrangler deploy --config cloudflare/wrangler.toml
```

Tas nav Netlify deploy. Worker saknes URL var atgriezt Not found, jo tā nav lietotāja galerijas lapa.

8. `storage-config.js` ieliec precīzu Worker HTTPS URL bez beigu `/`, piemēram, `https://event-photo-media.ACCOUNT.workers.dev`. Nepievieno `/functions/v1`. Vispirms ieslēdz tikai lokālajā/testa frontendā. Pēc testiem Netlify publicē atsevišķi ar apstiprinājumu.

## Esošo failu migrācija

`scripts/migrate-r2.mjs` noklusēti veic tikai viena eventa inventarizāciju. Kopēšanā saglabā ceļus, pārbauda R2 kopijas SHA-256 un tikai tad pievieno reģistra ierakstu. Tas NEIZDZĒŠ Supabase avotus un neveic SQL URL REPLACE.

Lokālā, Git ignorētā `.env.r2` failā vajag `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Šo failu nekad nepublicēt Netlify un nelikt publiskā serverī. Lieto Node ar `--env-file` atbalstu.

```powershell
node --env-file=.env.r2 scripts/migrate-r2.mjs EVENT_UUID
node --env-file=.env.r2 scripts/migrate-r2.mjs EVENT_UUID --apply
```

EVENT_UUID aizstāj ar testa eventa ID, nevis slug. Pirmais variants nelasa foto baitus. Otrais izmanto Supabase egress kopēšanai un R2 lasīšanu pārbaudei. Lokālais ignorētais `.env.r2-manifest-EVENT_UUID.json` satur ceļus/kopiju statusus, nevis atslēgas. Pārtraukta darba `copying` ieraksti jāpārbauda, pirms atkārto, jo var būt nereģistrēta R2 kopija.

Trūkstoši thumbnails netiek ģenerēti. Nederīgs avots/tips apstādina darbu, tas nav pamatojums avota dzēšanai. Veco Supabase kopiju tīrīšana ir atsevišķs darbs pēc failu skaita, checksum, galerijas un ZIP pārbaudes.

## Atkopšana un ierobežojumi

- Kamēr nav R2-only foto, tukšs API URL atjauno veco frontend ceļu. Pēc jauniem R2 upload to akli izslēgt nedrīkst: vispirms jāatjauno faili Supabase vai jāsaglabā abu provideru lasīšana.
- Migrēto avotu kopijas paliek. Tikai konkrētu verificētas migrācijas reģistra rindu izņemšana atjauno to veco ceļu; nekādas visas tabulas dzēšanas.
- Nepabeigtie objekti paliek reģistrā. Organizer Refresh izmanto esošo pending/deleted media un cover cleanup. Background/cron tīrīšana vēl nav ieviesta.
- Dzēšanas tombstone nepieļauj atgriešanos pie vecās Supabase kopijas. Derīga PUT atkārtošana līdz 5 minūtēm pēc dzēšanas var atjaunot tos pašus baitus R2, bet ne to redzamību; pēc termiņa jāatkārto fiziskās tīrīšanas pārbaude.
- Pirms publiska mēroga vajag automatizētu orphan/tombstone tīrīšanu, pieprasījumu/CPU monitoringu un izmaksu brīdinājumus. 7 dienu piekļuves termiņš nenozīmē foto fizisku dzēšanu.

## Pieņemšanas testi

- [ ] Privāts bucket: foto nav pieejams ar publisku bucket URL.
- [ ] Īsts Android/iPhone foto -> WebP+thumbnail -> viens uploaded ieraksts; Safari fallback.
- [ ] Īstā R2 CORS, parakstīts Content-Length/SHA-256, upload un finalize.
- [ ] Interneta pārtraukums katrā solī; retry bez dublikātiem, saprotams status/kļūda.
- [ ] Nepareizs path/guest/checksum/tips/izmērs, slēgts events tiek noraidīti.
- [ ] A/B kontu lasīšanas un dzēšanas izolācija, esošā ZIP plūsma.
- [ ] Sharing OFF/ON/OFF/expiry; arī vecs foto URL neapiet piekļuvi.
- [ ] Cover maiņa, foto dzēšana un cleanup retry abiem provideriem.
- [ ] Viena eventa migrācija: skaits/checksum/gallery/ZIP, avoti joprojām saglabāti.
- [ ] Network: jaunie foto baiti iet caur Cloudflare, nevis Supabase; izmērītas abu pakalpojumu izmaksas.

Lokālie SQL, Worker/klienta imitāciju un reāla WASM encoding testi nav production R2/Supabase vai fizisku telefonu tests.
