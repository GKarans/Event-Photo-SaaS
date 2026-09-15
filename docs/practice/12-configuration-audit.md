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
## Nepārbaudāmais no publiskas lapas
Supabase Auth URL allowlist, bucket Public Access, reālais RLS stāvoklis un
Netlify konta deploy iestatījumi jāapstiprina vadības panelī.
Koda konfigurācija nav pierādījums konta faktiskajai konfigurācijai.
Nedrīkst pievienot atslēgu vai paroļu ekrānattēlus.
## Pierādījumi
[Publiskās pārbaudes JSON](../evidence/20260915/public-smoke.json).
Vadības paneļu ekrānattēli: vēl jāpievieno.
## Dienasgrāmatas teksts
Salīdzināta lokālā Netlify, Supabase un R2 konfigurācija ar lietotnes darbības
prasībām. Pārbaudīti publicēšanas parametri un publiskā Worker CORS atbilde.
Nodalīti tie iestatījumi, kas papildus jāapstiprina servisu vadības paneļos.

