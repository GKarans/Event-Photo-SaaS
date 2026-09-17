# 12. Konfigurācijas audits
Stundu apjoms pēc plāna: **4 h**.
## Pārbaudītais
- `netlify.toml`: build `npm run build`, publish `dist`, Node 22.
- Event un Auth maršruti pāradresēti uz `index.html`.
- `storage-config.js`: production un 5604 origin izmanto R2 Worker.
- `cloudflare/wrangler.toml`: pareizais projekta Supabase URL,
  privātajam mediju servisam paredzētais bucket `app-images`, production CORS origin.
- SQL piekļuves noteikumi pārbaudīti lokālajos SQL testos.
- Publiskais Worker preflight atgrieza 204 un production origin.
## Vadības paneļu pārbaude
- R2 `app-images` panelī Public Access ir `Disabled`, un redzama lasāmā
  organizators/event/viesis hierarhija ar originala/thumbnail WebP pāri.
- Cloudflare Worker `event-photo-media` ir publicēts; pārskata ekrānā kļūdu skaits ir 0.
- Supabase production projekts pārskata brīdī ir `Healthy`.
- Netlify publicē production no GitHub `main`; automātiskā publicēšana ir
  bloķēta, tāpēc deploy tiek apstiprināts manuāli.
- SQL migrācijas ir izpildītas SQL Editor un R2 rezultāts pārbaudīts ar reālu upload.

Koda konfigurācija viena pati nav pierādījums konta iestatījumiem, tāpēc auditam
pievienoti paneļu un gala plūsmas pierādījumi. Atslēgu un paroļu vērtības nav publicētas.
## Pierādījumi
[Publiskās pārbaudes JSON](../evidence/20260915/public-smoke.json).
[Prakses ekrānattēlu indekss](../evidence/practice/README.md).
## Dienasgrāmatas teksts
Salīdzināta lokālā Netlify, Supabase un R2 konfigurācija ar lietotnes darbības
prasībām. Pārbaudīti publicēšanas parametri un publiskā Worker CORS atbilde.
Salīdzināti arī servisu vadības paneļi un production upload rezultāts, neatklājot secrets.
