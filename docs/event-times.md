# Pasākumu precīzais laiks

Jaunam eventam organizatora pārlūks automātiski pievieno IANA laika zonu. Lietotājam netiek rādīts zonas izvēles lauks vai tehniska zonas etiķete. Sākuma un beigu laika ievade attiecas uz eventa izveides brīdī noteikto zonu.

Datubāze ģenerē `starts_at` un `ends_at` kā UTC `timestamptz` momentus. Upload ir atļauts no sākuma brīža ieskaitot un aizliegts no beigu brīža:

```text
starts_at <= now < ends_at
```

Viesim periods tiek attēlots viņa pārlūka lokālajā laikā. Tādēļ ierīces datuma, laika un zonas iestatījumiem jābūt pareiziem. Sistēma nenosaka pasākuma norises vietu pēc GPS vai adreses.

Pēc `ends_at` organizators var ieslēgt viesu galerijas kopīgošanu un sagatavot ZIP, negaidot pusnakti. Vecie visas dienas eventi saglabā `Europe/Riga` zonu un beidzas nākamajā pusnaktī.

## Datubāzes validācija

Migrācija:

```text
supabase/migrations/20260912_event_times.sql
```

Tā jāpilda pēc R2 storage migrācijas un pirms frontend versijas, kas izmanto precīzos laikus. Esošai production datubāzei nedrīkst atkārtoti pārrakstīt visu pamata shēmu.

Datubāze noraida:

- nezināmu IANA laika zonu;
- beigu momentu, kas nav pēc sākuma;
- neeksistējošu vietējo laiku pavasara DST pārejā;
- divdomīgu vietējo laiku rudens DST pārejā.

## Testi

`node tests/event-times.cjs` pārbauda perioda robežas, vecos visas dienas eventus, Rīgas un Ņujorkas konversiju, nepareizu zonu, DST gadījumus, galerijas atvēršanu un ZIP laika bloķēšanu. UI testi pārbauda laika ievades laukus.

12.09.2026. mobilais production tests apstiprināja eventa pamatplūsmu iPhone 13 Pro un Samsung Galaxy S23. Precīza laika robežas testam jāizmanto atsevišķs testa events, lai pārbaude neietekmētu īstus viesu foto.
