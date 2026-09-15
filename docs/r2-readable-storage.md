# Saprotami R2 failu nosaukumi

## Struktūra

Privātajā `app-images` bucket jauniem upload:

```text
guntars-karans--ORGANIZER_UUID/
  dzimsanas-diena--EVENT_UUID/
    betija--GUEST_UUID/
      betija_2026-09-15T12-30-45Z_MEDIA_UUID.webp
      thumb-betija_2026-09-15T12-30-45Z_MEDIA_UUID.webp
    covers/cover-OBJECT_UUID.webp
```

Nosaukumi tiek normalizēti un saīsināti; ID atšķir vienādus vārdus. Ja
organizatora profilā nav vārda, izmanto `organizer--UUID`, nevis e-pastu.
Laiks ir foto datubāzes ieraksta izveides laiks UTC, nevis pārbaudīts EXIF
uzņemšanas laiks. `Z` nozīmē UTC.

Mapju nosaukumu momentuzņēmumus glabā `r2_objects`. Kamēr šie ieraksti pastāv,
nākamās rezervācijas atkārtoti izmanto jau izvēlētos mapju nosaukumus.
Pārdēvēšana nepārvieto failus. Vecie objekti un atkārtotas upload rezervācijas
saglabā iepriekšējos ceļus. Tukšs pasākums R2 mapju sarakstā neparādās, kamēr
nav augšupielādēts vāks vai foto.

Nosaukumi nav piekļuves kontrole. Bucket paliek privāts; Worker un datubāze
pārbauda organizatora vai viesa tiesības pēc ID. Parakstītās adreses var saturēt
šos nosaukumus, tāpēc tās nedrīkst publicēt žurnālos vai publiskā dokumentācijā.

## Ieviešana esošajā projektā

1. Saglabāt esošās datubāzes rezerves kopiju atbilstoši projekta kārtībai.
2. Supabase SQL Editor izveidot jaunu vaicājumu `R2 readable folders`.
3. Ievietot visu `supabase/migrations/20260914_r2_readable_folders.sql` saturu.
4. Izpildīt vienreiz un pārbaudīt `Success. No rows returned`.
5. Šī migrācija paredz jau uzstādītās R2 storage un ID folders migrācijas;
   esošā datubāzē nav jāpārlaiž visa `schema.sql`.
6. Izveidot testa pasākumu, augšupielādēt vāku un foto ar thumbnail.
7. R2 konsolē pārbaudīt jauno hierarhiju un privātu Public Access iestatījumu.
8. Pārbaudīt veca un jauna foto preview, download, organizatora ZIP un dzēšanu.
9. Pārdēvēt pasākumu un veikt vēl vienu upload: esošā mape jāsaglabā.
10. Pārbaudīt viesa galeriju pēc ieslēgšanas un aizliegumu pēc atslēgšanas.

Git push pats SQL migrāciju neizpilda. Šai izmaiņai nav jaunu Worker secrets
vai frontend iestatījumu. Vecie R2/Supabase faili netiek pārvietoti vai dzēsti.

## Lokālie pierādījumi

`npm run test:r2` pārbauda rezervāciju nemainīgumu, precīzu jauno foto un
thumbnail ceļu, nosaukumu saglabāšanu pēc pārdēvēšanas, migrācijas atkārtotu
izpildi un SQL/Worker piekļuves ierobežojumus. Tas neaizstāj reālu R2 PUT testu.
