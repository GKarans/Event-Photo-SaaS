# Prakses noslēguma plāns

Atjaunots 15.09.2026. Pamatā ir praktikanta iesniegtā stundu uzskaite.
Nostrādāts **120 / 160 h**; atlikušas **40 h**. Prakses 7. nedēļa no 9.
Kalendāra plāns ir izpildāms, bet faktiskos datumus un ilgumu vēl jāfiksē.

| Kategorija | Uzskaitīts | Plānots | Atlicis |
|---|---:|---:|---:|
| Iepazīšanās | 2 | 2 | 0 |
| Koda rakstīšana | 36 | 36 | 0 |
| Projektēšana | 36 | 36 | 0 |
| Testēšana | 41 | 48 | 7 |
| Sadarbošanās un darbināšana | 4 | 32 | 28 |
| Prakses atskaite | 1 | 6 | 5 |

## Atlikušie darbi

15.09.2026. sagatavoti atsevišķi [11.–21. darba materiāli un dienasgrāmatas
teksti](practice/README.md), atkārtoti lokālie testi un publisks production
smoke ar ekrānattēliem. Detalizētais izpildes statuss ir jaunajā materiālu indeksā.
Zemāk saglabāts sākotnējais plāns un lietotāja stundu sadalījums.

Stundas zemāk ir **plānotas**, nevis automātiski nostrādātas. Dokumenta
sagatavošana vai testa palaišana pati par sevi neapstiprina visu stundu apjomu.

| Nr. | Darbs | h | Pierādījums / statuss |
|---|---|---:|---|
| 11 | Pilnā MVP scenārija regresija | 7 | Lokālie testi; production gala matrica vēl jāaizpilda |
| 12 | Auth URLs, RLS, R2, Netlify konfigurācija | 4 | Konfigurācijas ekrānattēli bez atslēgām; vēl jāpārbauda |
| 13 | Production deploy un demonstrācijas vide | 4 | Deploy ID, datums un smoke tests; vēl jāveic |
| 14 | Testētāju atsauksmju apkopošana | 4 | Sākotnējā lietotāja atsauksme zemāk; detaļas vēl jāprecizē |
| 15 | Demonstrācijas scenāriji | 4 | Zemāk sagatavots scenārijs; izmēģinājums vēl jāveic |
| 16 | Darbināšanas vides dokumentēšana | 4 | R2 migrācijas pamācība sagatavota; pārējā konfigurācija jāpārbauda |
| 17 | Android/iPhone production vizuālā pārbaude | 4 | iPhone rezultāts lietotāja ziņots; ierīce/datums jāprecizē |
| 18 | Aizstāvēšanas sagatavošana | 4 | Jautājumi zemāk; praktiska izskaidrošana vēl jāizmēģina |
| 19 | Atskaite: ievads un prakses vieta | 2 | Gaida lietotāja gala dokumentu un faktisko informāciju |
| 20 | Atskaite: darbi, problēmas, risinājumi | 2 | Gaida gala dokumentu; izmantot reālos testus un commitus |
| 21 | Secinājumi un pielikumi | 1 | Pēc gala pārbaudēm |

R2 ceļu labojumu nedrīkst mākslīgi ieskaitīt jau aizpildītajās programmēšanas
stundās vai pārsaukt par testēšanu. Ja tas maina kategoriju sadalījumu, saskaņot
izmaiņas ar prakses vadītāju un uzskaitīt faktiski paveikto.

## Atsauksme

Lietotājs 15.09.2026. sarunā ziņoja: iPhone testā viss strādāja, visi saprata
lietošanu. Tas nav neatkarīgi atkārtots tests. Vēl vajag testa datumu, ierīces
modeli, iOS/pārlūka versiju, testētos soļus un testētāju skaitu. Personu vārdus
nav nepieciešams publicēt. Nefiksēt izdomātas atsauksmes vai ekrānattēlus.

## Demonstrācijas secība

1. Organizators reģistrējas, apstiprina e-pastu un pieslēdzas.
2. Izveido pasākumu ar sākuma/beigu laiku, pielāgo dizainu un lejupielādē QR.
3. Viesis telefonā atver QR, ievada vārdu un uzņem tikai foto.
4. Parāda upload statusu, thumbnail un lielā attēla preview.
5. Organizators atsvaidzina galeriju un izmanto filtrus.
6. Pēc pasākuma beigām ieslēdz viesu galeriju un pārbauda to privātā logā.
7. Izveido ZIP, pārbauda arhīva saturu, izdzēš atsevišķu testa foto.
8. Atslēdz galeriju un demonstrē, ka viesis vairs nevar lasīt foto.
9. Ar otru organizatoru pārbauda pirmā konta pasākuma nepieejamību.

Izmantot tikai testa pasākumu un testa foto; nedzēst īstu viesu materiālus.

## Aizstāvēšanas jautājumi

- Kāpēc R2? Foto datu glabāšana ir nodalīta no Supabase Auth un PostgreSQL.
- Kas ir RLS? Datubāzes rindu piekļuves politikas; frontend paslēpta poga nav autorizācija.
- Kāpēc nosaukumam pievienots ID? Vienādi vārdi nekonfliktē; tiesības balstās uz ID.
- Kāpēc privāts bucket? Publiska adrese ļautu apiet galerijas atslēgšanu.
- Kas ir presigned PUT? Īslaicīga atļauja augšupielādēt konkrētu objektu, neizpaužot atslēgas.
- Kāpēc thumbnail? Galerijas režģis nelādē visus pilnos attēlus.
- Vai R2 nozīmē nulles izmaksas? Nē; joprojām ir storage, operāciju, Worker un citu servisu izmaksas.
- Kā darbojas neveiksmīgs upload? Rezervācija, atkārtošana un finalize nodala nepabeigtu failu no gatava foto.
- Vai tests garantē drošību? Nē; lokālām pārbaudēm papildus vajag reālo konfigurāciju un production testus.
- Kāpēc nav video? Photo-only MVP samazina apstrādi, izmaksas un testēšanas apjomu.

## Dienasgrāmatas ieraksta sagatave

Datums: [faktiskais datums]. Ilgums: [faktiskais ilgums]. Kategorija: [kategorija].
Paveiktais: [konkrēts darbs]. Iemācītais: [praktikanta skaidrojums].
Problēma un risinājums: [faktiski novērotais]. Rezultāts: [tests vai dokuments].
Pierādījums: [fails, ekrānattēls, commit].

Pirms iesniegšanas aizpildīt faktiskos laukus; plānoto laiku nekopēt kā nostrādāto.
