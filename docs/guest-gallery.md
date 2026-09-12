# Viesu galerijas kopīgošana

12.09.2026. laidiens: viesu galerijas pieprasījumus apkalpo publicētais Cloudflare Worker ar esošo Supabase `guest_gallery_access` RPC. R2 un vecie Supabase faili ir pieejami caur vienu kontrolētu API; sharing termiņš nav mainīts. Vēsturiskā Edge Function paliek repozitorijā kā iepriekšējā realizācija.

Organizators pēc eventa beigu datuma ieslēdz `Share gallery`. Esošais QR un `/event/{slug}` kļūst par viesu galerijas saiti. Reģistrācija nav vajadzīga. Pirms perioda beigām joprojām darbojas upload skats; manuāli deaktivizēts events neatver galeriju pirms perioda beigām.

Events paliek My Events 14 kalendārās dienas pēc beigu datuma, tad nākamajā saraksta sinhronizācijā pāriet Archive. Kopīgošana darbojas līdz 7 dienām pēc ieslēgšanas, bet ne ilgāk par 14. pēcpasākuma dienas beigām (Europe/Riga). Organizators var to atslēgt; UI rāda faktisko termiņu. Slēgtai/izbeigtai kopīgošanai guests redz closed skatu. Dzēsts events nav pieejams. Saite darbojas kā piekļuves atslēga: ikviens tās saņēmējs var to pārsūtīt. Jau saņemtus failus atsaukt nevar.

Iepriekš arhivēti eventi netiek automātiski atjaunoti, jo esošais deleted statuss neatšķir manuālu dzēšanu no agrākās automātiskās arhivēšanas. Pēc deploy jāatsvaidzina agrāk atvērtie organizatora logi, kuros vēl darbojas vecais 3 dienu frontend kods.

## Viesu darbības

- 24 foto vienā lapā, Load more, jaunākais/vecākais un filtrs pēc viesa.
- Grid pieprasa tikai thumbnails. Foto bez thumbnail netiek iekļauti.
- Preview pieprasa `storage_path`: esošajā upload plūsmā tas ir optimizētais pilna izmēra foto. Veciem failiem tas var būt sākotnējais fails; kopīgošana tos nepārkodē.
- Download photo saglabā preview jau saņemto failu bez otra tīkla pieprasījuma.
- Viesiem nav ZIP, dzēšanas vai organizatora darbību.

## Servera kontrole

`gallery_shares` ir atsevišķa tabula ar RLS un bez anon/authenticated tabulas piekļuves. Tā glabā enabled, expires_at un requests_used. `manage_gallery_share` pārbauda `auth.uid()` un eventa īpašnieku; tieša events tabulas rediģēšana nevar atiestatīt skaitītāju.

`guest-gallery` Edge Function ir publiski izsaucama ar `verify_jwt=false`; piekļuvi kontrolē SQL, nevis JWT. Privātā service-role atslēga ir tikai servera vidē. `guest_gallery_access` drīkst izsaukt tikai service_role. Tā katram atļautam saraksta/attēla pieprasījumam atomiski palielina kopējo skaitītāju līdz 2000. Pēc limita sasniegšanas jaunus attēlus neizsniedz. Atkārtota ieslēgšana limitu neatiestata.

Pārbauda eventa periodu, dzēšanas statusu, sharing termiņu, media event_id, foto statusu un Storage mapes piederību. Nenodod klientam Storage ceļus vai signed URL. Failu atbilde ir no-store; jau sāktu pārsūtīšanu izslēgšana neatceļ.

2000 ir pieprasījumu limits, nevis cilvēku, lejupielāžu vai GB limits. Preview atkārtota atvēršana arī tērē limitu. Tas neaizsargā publisko funkciju no neierobežota neatļauto izsaukumu skaita un negarantē Supabase bezmaksas kvotu. Storage -> Edge -> pārlūks var radīt papildu pārraides izmaksas; mērījumi production vēl jāveic. Limitu var mainīt tikai uzturētājs SQL kodā.

## Ieviešana Supabase

1. Esošam projektam SQL Editor palaist `supabase/migrations/20260911_guest_gallery.sql`. Jaunam projektam vispirms `supabase/schema.sql`, tad migrāciju.
2. Supabase Edge Functions izveidot `guest-gallery`, ievietot `supabase/functions/guest-gallery/index.ts` saturu un izvietot. Šai funkcijai atslēgt JWT pārbaudi; pārējām funkcijām iestatījumus nemainīt.
3. CLI alternatīva pēc pieslēgšanās: `supabase functions deploy guest-gallery --project-ref ojcvnsbhphvijmzjfenl --no-verify-jwt`.
4. Servera videi vajadzīgi Supabase nodrošinātie `SUPABASE_URL` un `SUPABASE_SERVICE_ROLE_KEY`. Slepeno atslēgu nelikt frontendā vai Git.
5. Tikai tad publicēt frontend un izpildīt zemāk minēto reālo pārbaudi.

[Supabase funkciju konfigurācija](https://supabase.com/docs/guides/functions/function-configuration).

## Pārbaude

`npm test` pārbauda JS sintaksi un login regresiju. `npm run test:gallery-sql` prasa `@electric-sql/pglite` (vai PGLITE_MODULE ceļu). `node tests/gallery-ui.cjs` prasa Playwright (vai PLAYWRIGHT_MODULE ceļu) un instalētu Chrome. Papildu testu atkarības nav runtime prasība.

Lokāli PGlite pārbaudīti īpašnieks, periods, expiry, disable, limits 1999/2000, skaitītāja saglabāšana, sveša foto/mape un RPC atļaujas. Chrome ar imitētu API pārbaudīti 360, 390 un 1280 px platumi, grid, preview un sort. Tas nav īsta iPhone vai Supabase production tests.

Production: eventam pēc perioda beigām ieslēgt sharing, anon logā atvērt to pašu QR saiti, pārbaudīt filtrus, preview un vienu download. Izslēgt sharing un pārbaudīt jaunu pieprasījumu atteikumu. Otram organizatoram pārbaudīt, ka sharing iestatīšanu noraida. Pārbaudīt Android un iPhone. Kvotas robežu testēt ar izolētu testa eventu, nevis 2000 īstām lejupielādēm.
12.09.2026. lokālais papildinājums: ZIP/eventu pārslēgšanas aizsardzība, uploading/Retry upload, retryable Storage tīrīšana, nākotnes eventu vadība, Europe/Riga datumi un reproducējami testi. Pirms publicēšanas jāpalaiž 20260912_media_reliability.sql; production tests vēl nav veikts. Aktuālā uzvedība un testu robežas: [Uzticamības labojumi](reliability.md).
