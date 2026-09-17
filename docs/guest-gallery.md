# Viesu galerijas kopīgošana

Pēc pasākuma precīzā beigu laika organizators var ieslēgt galerijas kopīgošanu. Esošais QR kods un `/event/{slug}` saite kļūst par viesu galerijas adresi; jauns QR nav vajadzīgs.

## Lietotāja uzvedība

- Pirms eventa beigām saite rāda viesa upload plūsmu.
- Pēc eventa beigām galerija tiek rādīta tikai tad, ja organizators to ir ieslēdzis un termiņš nav beidzies.
- Izslēgtai, beigušai vai dzēsta eventa galerijai tiek rādīts slēgts stāvoklis.
- Saite nav individuāla parole: ikviens tās saņēmējs var to pārsūtīt.
- Jau lejupielādētu foto nevar atsaukt no lietotāja ierīces.

MVP kopīgošana darbojas līdz 7 dienām pēc ieslēgšanas, bet ne ilgāk par eventa pēcpasākuma saglabāšanas logu. Organizators redz faktisko beigu termiņu un var kopīgošanu izslēgt agrāk.

## Galerijas funkcijas

- 24 foto vienā lapā un `Load more`;
- kārtošana no jaunākā vai vecākā;
- filtrs pēc viesa;
- thumbnail režģis;
- pilna izmēra preview;
- viena foto lejupielāde no jau saņemtā preview faila;
- mobilais izkārtojums.

Viesim nav ZIP, dzēšanas vai organizatora iestatījumu.

## Servera kontrole

Jaunajā production arhitektūrā viesu galeriju apkalpo Cloudflare Worker. Tas izmanto Supabase `guest_gallery_access` RPC un piegādā gan jaunos R2, gan vecos Supabase Storage failus caur vienu kontrolētu API.

`gallery_shares` tabulai nav anonīmas tiešās piekļuves. Organizators izmanto `manage_gallery_share`, kas pārbauda `auth.uid()` un eventa īpašnieku. `guest_gallery_access` drīkst izsaukt tikai `service_role`, kuru glabā Worker secrets.

Katram saraksta vai attēla pieprasījumam serveris pārbauda:

- eventa slug un statusu;
- eventa beigu momentu;
- kopīgošanas `enabled` un `expires_at`;
- media piederību eventam un `uploaded` statusu;
- thumbnail vai originala ceļu;
- kopējo pieprasījumu limitu.

Atbildes ir `no-store`. Privāts objekta ceļš vai ilglaicīgs signed URL klientam netiek publicēts.

## Kvota

MVP limits ir 2000 atļauti galerijas pieprasījumi vienam kopīgošanas ierakstam. Tas ir HTTP pieprasījumu, nevis cilvēku, foto vai gigabaitu limits. Thumbnail, preview un atkārtota atvēršana patērē pieprasījumus.

Kvota palīdz kontrolēt nejaušu lietojumu, bet nav pilnīga aizsardzība pret visiem ļaunprātīgiem neatļautiem izsaukumiem. Produkta versijai papildus vajadzīgi ārējie rate limits, monitorings un izmaksu brīdinājumi.

## Migrācija

Esošam projektam jābūt izpildītai:

```text
supabase/migrations/20260911_guest_gallery.sql
```

Vēsturiskā `supabase/functions/guest-gallery` realizācija paliek repozitorijā saderībai un izstrādes vēsturei, bet production mediju piegādi veic Cloudflare Worker.

## Pārbaude

1. Izveido izolētu testa eventu ar beigu laiku tuvā nākotnē.
2. Pievieno vismaz divu viesu foto.
3. Pēc eventa beigām ieslēdz kopīgošanu.
4. Privātā pārlūka logā atver to pašu QR saiti.
5. Pārbaudi filtrus, `Load more`, preview un vienu lejupielādi.
6. Izslēdz kopīgošanu un pārliecinies, ka jauns pieprasījums tiek atteikts.
7. Ar citu organizatoru pārbaudi, ka iestatījumu mainīšana tiek noraidīta.

`npm test` pārbauda SQL piekļuves robežas un UI stāvokļus, bet production Worker, secrets un reāla telefona tīklu jātestē atsevišķi.
