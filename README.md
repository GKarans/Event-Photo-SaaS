# Event Photo SaaS

Photo-only SaaS MVP pasakumu kopigai foto apkopošanai.

## MVP virziens

- Organizators registrejas un piesledzas.
- Organizators izveido pasakumu un sanem unikalu saiti/QR kodu.
- Viesis bez konta atver QR saiti, ievada vardu un uznem foto.
- Foto tiek glabati Supabase Storage.
- Galeriju redz tikai pasakuma organizators.

## Pašreizējais posms

Database + Authentication pamats:

- Supabase projekts pieslegts frontenda.
- Izveidots register/login/logout sakuma ekrans.
- Izveidota pasakuma izveides forma.
- Dashboarda tiek radits tikai pieslegta organizatora pasakumu saraksts.
- Katram pasakumam ir detail skats ar guest URL un QR koda lejupieladi.
- Guest URL `/event/{slug}` atver viesa sakuma skatu ar pasakuma nosaukumu un varda ievadi.
- Viesis var saglabat vardu, mainit vardu, uznemt foto un augšupieladet to Supabase Storage.
- Sagatavota sakotneja SQL shema un RLS politikas: `supabase/schema.sql`.

## Tehnologijas

- Frontend: HTML, CSS, JavaScript
- Auth/Database/Storage: Supabase
- Hosting: Netlify

## Lokala palaišana

Ši versija ir statiska un neprasa build soli.

```bash
npx netlify dev
```

vai atver projektu ar jebkuru lokalu static serveri.
