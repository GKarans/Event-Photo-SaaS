# 20. Atskaite: veikto darbu apraksta melnraksts
Stundu apjoms pēc plāna: **2 h**.
## Tehnoloģijas un izstrāde
Frontend veidots ar HTML, CSS un JavaScript. Supabase nodrošina organizatoru
autentifikāciju un PostgreSQL metadatus. Jaunie mediji paredzēti privātā R2
bucket; Worker nodrošina autorizētu piekļuvi, bet agrākie Supabase objekti
paliek atbalstīti. Netlify publicē statiskos frontend failus no build mapes.
## Datu modelis
Organizatora profils, pasākums, viesis un foto ir saistīti ar ID.
Foto metadati glabā pasākuma/viesa saistību un failu ceļus.
R2 rezervāciju ieraksti ļauj atšķirt nepabeigtu augšupielādi no gatava objekta.
## Piemēri problēmām un risinājumiem
- Pēc login netika atvērts dashboard: labota sesijas/maršruta apstrāde;
  lokāls regresijas tests pārbauda pāreju.
- Garš viesu lapas virsraksts pārsniedza konteineru: aplaušana un centrējums
  pārbaudīti vairākos viewport izmēros.
- Pasākuma maiņa ZIP laikā: pārbaudīta eksporta pasākuma identitāte un pilnīgums.
- R2 UUID mapes bija grūti identificēt: sagatavota migrācija ar normalizētu
  nosaukumu, ID un nemainīgiem rezervācijas ceļiem.
- Dokumentācijā bija novecojuši build/storage norādījumi: aktualizēta ieviešanas kārtība.
## Testēšana
Izmantoti unit testi, PGlite SQL testi un Playwright UI testi. 15.09.2026.
lokālais komplekts un build izturēti. Production publiskā smoke pārbaude
nodalīta no autorizēta gala E2E. 12.09.2026. pamatplūsma veiksmīgi pārbaudīta
ar iPhone 13 Pro un Samsung Galaxy S23.
## Pierādījumu avoti
`docs/testing-report.md`, `docs/evidence/20260915/public-smoke.json`,
`docs/evidence/practice/`, `tests/`, Git commit vēsture un SQL migrācijas.
## Dienasgrāmatas teksts
Sagatavots veikto darbu apraksts, sasaistot tehnoloģijas, konkrētas problēmas,
risinājumus un testēšanas pierādījumus. Atzīmētas production pārbaudes robežas.
