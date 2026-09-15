# Darbināšanas vide
Aktualizēts 15.09.2026. pēc lokālā koda un publiskās production pārbaudes.
Attiecas uz sākotnējo MVP, nevis atsevišķo Lumiq projektu.

## Sastāvdaļas
| Vide | Atbildība |
|---|---|
| GitHub GKarans/Event-Photo-SaaS, main | Kods, migrācijas, testi un dokumentācija |
| Netlify event-photo-saas.netlify.app | Frontend, HTTPS, Event/Auth maršruti |
| Supabase | Auth, PostgreSQL, RLS, guest-gallery funkcija un vecie Storage faili |
| Cloudflare Worker event-photo-media | Autorizācija un R2 mediju operācijas |
| R2 app-images | Jaunie optimizētie foto, thumbnails un vāki |

Service-role un R2 secrets paliek tikai serverī. Worker izmanto privileģētu
piekļuvi, tāpēc tam pašam obligāti jāpārbauda lietotājs un tiesības.

## Lokālā vide un Netlify
Node 22; atkarības uzstāda ar `npm ci`.
Pārbaudes: `npm test`, `npm run build`. Preview: `npm start`.
`netlify.toml`: build `npm run build`, publish `dist`, Node 22.
`/event/*` un `/auth/*` tiek apkalpoti ar `index.html`.
Projekta sakni publicēt nedrīkst: tajā ir servera kods un dokumentācija.
Build izmanto atļauto failu sarakstu, pārbauda negaidītus failus un kopē WebP runtime.

Lietotājs norādījis, ka deploy veic manuāli un automātiskā publicēšana ir izslēgta.
Pašreizējais Netlify paneļa iestatījums nav neatkarīgi pārbaudīts.
Git push pats negarantē jaunāku production versiju.
`node scripts/practice-smoke.cjs` lasa publisko production vidi un saglabā
pierādījumus `docs/evidence/20260915`; neveido kontus un nemaina pasākumus.

## Supabase un SQL
Tukšai datubāzei paredzēta `supabase/schema.sql`, pēc tam migrācijas atbilstoši
to priekšnosacījumiem. Esošā datubāzē izpilda konkrēto jauno migrāciju, nevis
akli pārraksta visu shēmu.
R2 lasāmiem ceļiem pēc esošās R2 storage un ID folders konfigurācijas izpilda
`20260914_r2_readable_folders.sql`. Tās production apstiprinājums vēl nav saņemts.

Auth Site URL: `https://event-photo-saas.netlify.app`.
Redirect ceļi: `/auth/confirmed` un `/auth/reset-password`.
Allowlist un e-pastu piegāde jāpārbauda panelī un reālā plūsmā.
Galvenās saistības: users → events → guests/media. Pieeju ierobežo RLS un RPC.
Precīzo event laiku uzvedība: [event-times.md](event-times.md).
Koda konfigurācija nav pierādījums reālās datubāzes konfigurācijai.

## Mediji
`storage-config.js` aktivizē R2 production origin un `http://127.0.0.1:5604`.
Lokāla lietotnes lietošana šajā origin var skart īstos servisus; automatizētie
testi ārējos servisus imitē.
`cloudflare/wrangler.toml` satur neslepeno bucket, endpoint un CORS konfigurāciju.
R2 bucket jāpaliek privātam.
Jaunās mapes: organizators+ID/pasākums+ID/viesis+ID/foto.
[Detalizēta migrācijas kārtība](r2-readable-storage.md).
Vecie Supabase `event-photos` un vecie R2 objekti netiek pārvietoti.
Veco Supabase foto ielāde vēl var radīt Supabase egress.
R2 neatceļ operāciju, Worker, storage vai datubāzes izmaksas.

## Ieviešanas kārtība
1. Pārskatīt diff; izpildīt `npm test`, `npm run build`, `git diff --check`.
2. Sagatavot rezerves kopiju un izpildīt nepieciešamo SQL migrāciju.
3. Ja mainīts Worker, pārbaudīt secrets nosaukumus, Wrangler dry-run un deploy.
4. Ja mainīta guest-gallery funkcija, izvietot arī to; SQL viens pats nav funkcijas deploy.
5. Izveidot loģiskus commitus un push.
6. Manuāli Netlify izvietot pareizo commit, pierakstīt deploy ID.
7. Izpildīt publisko smoke un autorizētā testa pasākuma pilnu plūsmu.
8. Aizpildīt [production protokolu](production-acceptance-20260915.md).

Dokumentācijas izmaiņas pašas par sevi neprasa Worker vai frontend deploy.

## Atjaunošana pēc kļūdas
Fiksēt kļūdas laiku, deploy ID un anonimizētu kļūdas tekstu.
Frontend var atjaunot uz iepriekšēju deploy; tas neatceļ SQL migrāciju.
Nedzēst objektus, lai slēptu neveiksmīgu upload. Pirms datubāzes atjaunošanas
izvērtēt rezerves kopiju un pēc tās izveidotos jaunos datus.
Retestēt vecu un jaunu foto lasīšanu.

## Prakses 16. darba ieraksts
Stundu apjoms pēc lietotāja plāna: **4 h**.
Aktualizēts darbināšanas vides apraksts, novēršot novecojušus norādījumus par
publicēšanu no projekta saknes, automātisku deploy un tikai Supabase Storage.
Aprakstīta GitHub, Netlify, Supabase, R2 un Worker atbildība, migrāciju un
publicēšanas secība un atjaunošanas riski.
