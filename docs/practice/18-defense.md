# 18. Aizstāvēšanas jautājumi un atbildes
Stundu apjoms pēc plāna: **4 h**.
## Projekts
**Kādu problēmu risina?** Pasākuma viesu fotogrāfijas citādi paliek dažādos
telefonos; unikāla saite un QR palīdz tās savākt vienā galerijā.
**Kāpēc tikai foto?** Tas samazina validācijas, datu apjoma un apstrādes sarežģītību.
**Kādas tehnoloģijas?** HTML/CSS/JavaScript, Supabase Auth/PostgreSQL, R2 medijiem,
Cloudflare Worker piekļuves loģikai, Netlify frontend, GitHub versijām.
## Drošība
**Authentication pret authorization?** Pirmā nosaka, kas esi; otrā, kam drīksti piekļūt.
**Kas ir RLS?** PostgreSQL politikas ierobežo pieejamās rindas. UI paslēpta poga
neaizvieto servera autorizāciju.
**Kāpēc service-role slepena?** Tā var apiet RLS. Worker kodam pašam jāpārbauda
lietotājs un tiesības; atslēga paliek tikai servera secret.
**Vai UUID ir parole?** Nē. Nosaukumi/UUID organizē resursus, bet atļaujas pārbauda serveris.
**Vai CORS aizsargā no visiem uzbrukumiem?** Nē. Tas ir pārlūka origin mehānisms,
nevis autentifikācija; ārpus pārlūka pieprasījumus joprojām jāautorizē.
**Kāpēc privāts bucket?** Publiska foto adrese apietu galerijas kopīgošanas kontroli.
**Vai atslēgšana izdzēš jau lejupielādētu foto?** Nē. Kontrolēt var turpmāko piekļuvi,
nevis atsaukt lietotāja ierīcē saglabātu kopiju.
## Mediju plūsma
**Kāpēc divi attēli?** Thumbnail režģim; lielāks foto preview un eksportam.
**Kas ir presigned PUT?** Īslaicīga atļauja nosūtīt konkrētu objektu uz R2.
**Kāpēc rezervācija un finalize?** Nepabeigts upload nedrīkst parādīties kā gatavs foto;
retry izmanto iepriekšējo rezervāciju un samazina dublēšanas risku.
**Kāpēc UTC?** Viens nepārprotams laika moments; ierīces laika josla vajadzīga ievadei/attēlošanai.
**Ko nozīmē laiks faila nosaukumā?** Ieraksta izveides UTC laiks, nevis garantēts EXIF capture laiks.
## Darbināšana
**Kas ir egress?** Datu izsūtīšana no servisa. R2 neatceļ pārējās storage, operāciju,
Worker un datubāzes izmaksas; thumbnails samazina pārsūtāmo apjomu.
**Vai push izpilda SQL?** Nē. GitHub kods, SQL migrācija, Worker un frontend deploy
ir atsevišķi ieviešanas posmi.
**Vai visi testi izturēti nozīmē nav kļūdu?** Nē. Testi pārbauda konkrētus scenārijus;
production konfigurācija, reālas ierīces un liels apjoms jāpārbauda atsevišķi.
## Praktiskais vingrinājums
Uzzīmēt datu plūsmu, izsekot vienam foto no klienta līdz metadatiem, atrast
ownership pārbaudi un paskaidrot, kas notiek, ja internets pazūd pēc PUT.
## Dienasgrāmatas teksts
Sagatavotas atbildes par arhitektūru, RLS, mediju glabāšanu, egress,
autorizāciju un testēšanas robežām, kā arī praktiski aizstāvēšanas vingrinājumi.

