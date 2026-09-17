# 17. Mobilās ierīces
Stundu apjoms pēc plāna: **4 h**.
## Pieejamie rezultāti
- 12.09.2026. production tests: iPhone 13 Pro un Samsung Galaxy S23.
- Abās ierīcēs izdevās atvērt eventa saiti, ievadīt vārdu, atvērt kameru,
  pievienot foto un redzēt to organizatora galerijā.
- Testētāji norādīja, ka lietošana bija saprotama.
- Automatizēti: Chromium production login pie 390 px, bez horizontālas pārplūdes.
- Lokāli: viesu virsraksti pie 320/390/430/768/1280 px, organizatora UI pie
  390/1280 px un galerijas mobilais/desktop scenārijs izturēti.
Chromium šaurs viewport nav fizisks Android vai iPhone Safari tests.
## Pierādījumi
[390 px production ekrānattēls](../evidence/20260915/production-login-390.png).
[1280 px production ekrānattēls](../evidence/20260915/production-login-1280.png).
Abi attēli vizuāli pārskatīti: login teksts un pogas ir salasāmi un nepārklājas.
## Testa robežas
Nav fiksētas precīzas OS un pārlūku versijas, kā arī atsevišķs lēna tīkla mērījums.
Nākamajā regresijā jāatkārto 10 secīgi foto, upload retry, ainavas orientācija,
preview un galerijas atslēgšana.
## Dienasgrāmatas teksts
Apkopots iPhone un Android production testa rezultāts un veikta papildinoša responsive pārbaude.
Saglabāti production login ekrānattēli, pārbaudīta salasāmība un pārplūde.
Atsevišķi nodalīti fiziskas ierīces un pārlūka viewport testu pierādījumi.
