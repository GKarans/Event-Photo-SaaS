# 11. Gala sistēmas testēšana
Stundu apjoms pēc lietotāja plāna: **7 h**. Datumu un faktisko laiku ievada praktikants.
## Faktiski veikts 15.09.2026.
Atkārtoti izpildīts `npm test` un `npm run build`; abas komandas pabeigtas veiksmīgi.
- Auth testi: sesijas apstrāde, login pārejas un logout regresija.
- Uzticamības testi: galerijas sacensības, dzēšanas secība, upload atkārtošana,
  ZIP pilnīgums, pasākuma identitāte un Blob atkārtošana.
- SQL: ownership, galerijas termiņš/limits, rezervācijas, finalize,
  precīzs pasākuma beigu laiks un laika joslu robežgadījumi.
- R2: jaunā ceļu struktūra, veco rezervāciju saglabāšana, parakstu un piekļuves pārbaudes.
- UI: galerijas preview/sort un thumbnails; organizatora edit/design vadība
  390/1280 px; viesu virsraksts 320/390/430/768/1280 px.
- Reāls WebP WASM encode pārlūkā: dekodējams attēls ar pareiziem izmēriem.
## Robežas
Lokālie unit/integrācijas/pārlūka testi ir nodalīti no reālo servisu pārbaudes.
12.09.2026. production eventā `test.retake.photo` ar iPhone 13 Pro un Samsung
Galaxy S23 veiksmīgi pārbaudīta viesa saite, vārda ievade, kamera, upload un
foto parādīšanās organizatora galerijā. Organizatora plūsmā pārbaudīta
reģistrācija, e-pasta apstiprināšana, paroles atjaunošana, login, eventa izveide,
QR/saite, galerija, dzēšana, ZIP un arhīvs. Gala MVP pamatplūsmas statuss: **PASS**.
Atlikušās robežas ir slodzes, nestabila tīkla un ilgstošas ekspluatācijas testi.
## Dienasgrāmatas teksts
Veikta sistēmas automatizētā regresijas pārbaude, analizēta sesiju apstrāde,
foto augšupielādes atkārtošana, galerijas darbība, dzēšana un ZIP sagatavošana.
Pārbaudīta R2 ceļu ģenerēšana un SQL piekļuves kontrole. Lokālie testi izturēti,
un pamatplūsma papildus pārbaudīta production vidē ar iPhone un Android ierīci.
