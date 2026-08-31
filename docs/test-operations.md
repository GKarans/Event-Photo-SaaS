# 28.08 praktiskā testa organizēšana

## Mērķis

Šis dokuments fiksē praktiskā testa sagatavošanas un testētāju instruktāžas darbības. Tas papildina `docs/testing-plan.md` un `docs/testing-report.md`.

## 13. diena - testa sagatavošana

Darba kategorija: sadarbošanās testēšanas un darbināšanas vidē.

Veiktie sagatavošanas darbi:

- pārbaudīta production adrese `https://event-photo-saas.netlify.app`;
- sagatavots organizatora konts testa eventa izveidei;
- izveidots vai pārbaudīts testa events ar aktīvu periodu;
- pārbaudīts guest URL;
- pārbaudīts QR kods event detail skatā;
- sagatavots rezerves links gadījumam, ja kādam viesim QR skenēšana nestrādā;
- pārskatīts testējamo ierīču pārklājums: Android, iOS un desktop pārlūks organizatora skatam;
- noteikts, ka viesiem nav jāveido konts un jātestē tikai QR -> name -> photo upload plūsma.

Sagaidāmais rezultāts:

- testētāji var ātri piekļūt eventam ar QR vai rezerves linku;
- organizators var sekot līdzi foto ielādei galerijā;
- problēmas var fiksēt pēc ierīces, pārlūka un darbības soļa.

## 15. diena - testētāju instruktāža

Darba kategorija: sadarbošanās testēšanas un darbināšanas vidē.

Testētājiem skaidrojamā instrukcija:

1. Noskenēt QR kodu vai atvērt rezerves linku.
2. Pārbaudīt, ka atveras pareizais event nosaukums.
3. Ievadīt vārdu un uzvārdu.
4. Nospiest `Start`.
5. Nospiest `Take Photo`.
6. Uzņemt foto ar telefona kameru.
7. Sagaidīt upload paziņojumu.
8. Ja parādās kļūda, paziņot organizatoram ierīces modeli, pārlūku un darbību, kurā kļūda notika.

Svarīgi testētājiem:

- nav jāreģistrējas un nav jāielogojas;
- jāaugšupielādē tikai foto, nevis video;
- ja QR nedarbojas, jāizmanto rezerves links;
- ja internets ir vājš, jāpagaida upload pabeigšana un nevajag uzreiz aizvērt lapu.

## Praktiskā testa kopsavilkums

Praktiskais tests notika no 27.08.2026. 17:00 līdz 28.08.2026. 02:00.

Reālais rezultāts:

- piedalījās 12 viesi;
- kopā augšupielādēti 60 foto;
- viesu pamata plūsma darbojās;
- organizatora galerijā foto bija pieejami;
- būtiskas negatīvas atsauksmes no organizatora vai viesiem netika saņemtas;
- pēc testa kā uzlabojums fiksēta galerijas ielādes veiktspēja pie lielāka foto skaita.
