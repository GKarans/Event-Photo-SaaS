# 13. Production pārbaude un demonstrācijas vide
Stundu apjoms pēc plāna: **4 h**.
## Veikts
Izveidots reproducējams, tikai lasošs `node scripts/practice-smoke.cjs`.
Production sākumlapa un abi Auth maršruti atgrieza HTTP 200.
`script.js`, `storage-config.js`, `r2-storage.js` SHA256 sakrita ar lokālo build.
HTML kontrolsumma atšķīrās; publicētajā HTML konstatēts Netlify ievietots
hostinga komentārs un metadati. Pilna HTML ekvivalence nav apstiprināta.
Anonīmā login lapa atvērta Chromium 390/1280 px bez JS izņēmumiem un horizontālas
pārplūdes. Jauns deploy netika veikts; Netlify deploy ID nav iegūts.
## Demonstrācijas sagatavošana
1. Sagatavot atsevišķu testa organizatoru un otru kontu izolācijas pārbaudei.
2. Izveidot testa pasākumu ar īsu, skaidri zināmu sākuma/beigu periodu.
3. Pievienot tikai demonstrācijai paredzētus foto un divus viesu vārdus.
4. Sagatavot QR PNG, telefonu un atsevišķu privāto pārlūka logu.
5. Lejupielāžu mapē nodalīt testa ZIP un pārbaudīt tā failu skaitu.
6. Pierakstīt faktisko frontend deploy ID un testa pasākuma identifikatoru privāti.
Šie soļi nav atzīmēti kā izpildīti kontā.
## Dienasgrāmatas teksts
Veikta publiskās demonstrācijas vides pieejamības pārbaude, salīdzināti
publicētie JavaScript faili ar lokālo izplatījumu un saglabāti ekrānattēli.
Sagatavota testa datu un demonstrācijas vides izveides kārtība.

