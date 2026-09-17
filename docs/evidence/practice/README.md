# Prakses darba ekrānattēlu pierādījumi

Šajā mapē apkopoti hronoloģiski Event Photo SaaS MVP izstrādes, testēšanas un production vides pierādījumi. Failu nosaukumi raksturo redzamo saturu un saglabā uzņemšanas datumu.

Ekrānattēlos nav publicētas paroles, service role atslēgas, R2 slepenās atslēgas vai sesiju tokeni.

## Izstrādes sākums un Supabase

| Datums | Fails | Ko pierāda |
|---|---|---|
| 15.08.2026. | [Organizer dashboard and event list](2026-08-15-organizer-dashboard-and-event-list.png) | Agrīna autentificēta organizatora paneļa un pasākumu saraksta versija. |
| 16.08.2026. | [Supabase Storage original photo](2026-08-16-supabase-storage-original-photo.png) | Sākotnējās arhitektūras foto objekts privātajā Supabase Storage. |
| 16.08.2026. | [Event QR and gallery loading](2026-08-16-event-qr-and-gallery-loading.png) | Pasākuma detaļu skats ar QR un galerijas ielādes stāvokli. |
| 16.08.2026. | [Organizer gallery with guest photos](2026-08-16-organizer-gallery-with-guest-photos.png) | Viesu pievienoto foto attēlošana organizatora galerijā. |
| 27.08.2026. | [RLS blocked guest action](2026-08-27-rls-blocked-guest-action.png) | Datubāzes piekļuves politikas atteikums neatļautā scenārijā. |

## Organizatora un viesa saskarne

| Datums | Fails | Ko pierāda |
|---|---|---|
| 31.08.2026. | [Organizer event list light theme](2026-08-31-organizer-event-list-light-theme.png) | Organizatora pasākumu saraksta gaišais dizains. |
| 31.08.2026. | [Event detail QR and controls](2026-08-31-event-detail-qr-and-controls.png) | Eventa detaļas, QR, saites un vadības pogas. |
| 31.08.2026. | [Guest camera ready screen](2026-08-31-guest-camera-ready-screen.png) | Viesa mobilais kameras ekrāns pirms foto uzņemšanas. |
| 31.08.2026. | [Event filter and sort controls](2026-08-31-event-filter-and-sort-controls.png) | Organizatora filtru, kārtošanas un atsvaidzināšanas vadība. |
| 31.08.2026. | [Create event modal](2026-08-31-create-event-modal.png) | Pasākuma izveides forma un ievades validācijas saskarne. |
| 31.08.2026. | [Responsive event list](2026-08-31-responsive-event-list.png) | Pasākumu saraksta izkārtojums šaurākā skatā. |
| 31.08.2026. | [Event detail dark theme QR](2026-08-31-event-detail-dark-theme-qr.png) | Eventa detaļas tumšajā dizainā. |
| 31.08.2026. | [Custom guest camera dark](2026-08-31-custom-guest-camera-screen-dark.png) | Organizatora pielāgots cover, teksts un kameras poga. |
| 31.08.2026. | [Custom guest welcome dark](2026-08-31-custom-guest-welcome-screen-dark.png) | Viesa vārda ievade ar pielāgotu pasākuma dizainu. |
| 31.08.2026. | [Custom guest camera light](2026-08-31-custom-guest-camera-screen-light.png) | Tā pati viesa plūsma gaišajā režīmā. |
| 02.09.2026. | [Delete event confirmation](2026-09-02-delete-event-confirmation.png) | Destruktīvas/arhivēšanas darbības apstiprinājums. |
| 09.09.2026. | [Mobile long title regression](2026-09-09-mobile-long-title-regression-test.png) | Gara virsraksta mobilā izkārtojuma regresijas pārbaude. |
| 09.09.2026. | [Guest cover welcome](2026-09-09-guest-cover-welcome-screen.png) | Viesa sākuma skats ar cover attēlu un datumu. |
| 09.09.2026. | [Guest cover camera](2026-09-09-guest-cover-camera-screen.png) | Viesa foto uzņemšanas skats ar cover attēlu. |
| 11.09.2026. | [Event list button alignment](2026-09-11-event-list-button-alignment.png) | Statusu un darbību pogu līdzinājuma labojums. |
| 12.09.2026. | [Organizer gallery filters and thumbnails](2026-09-12-organizer-gallery-filters-and-thumbnails.png) | Thumbnail režģis, viesu filtrs un kārtošana. |

## Production, R2 un gala rezultāts

| Datums | Fails | Ko pierāda |
|---|---|---|
| 11.09.2026. | [Supabase SQL Editor](2026-09-11-supabase-sql-editor.png) | SQL migrāciju izpildes vide. Ekrānattēls nepublicē slepenas vērtības. |
| 14.09.2026. | [R2 UUID folders before improvement](2026-09-14-r2-uuid-folder-structure-before-improvement.png) | Sākotnējā drošā, bet administratoram grūti lasāmā UUID struktūra. |
| 15.09.2026. | [R2 readable folders and WebP pairs](2026-09-15-r2-readable-folders-and-webp-pairs.png) | Lasāms organizators/event/viesis ceļš, kā arī originala un thumbnail WebP pāris privātā R2. |
| 15.09.2026. | [Supabase production project overview](2026-09-15-supabase-production-project-overview.png) | Production Supabase projekta veselības un pieprasījumu pārskats. |
| 17.09.2026. | [Legacy Supabase Storage folders](2026-09-17-legacy-supabase-storage-event-and-guest-folders.png) | Veco foto saderība: eventa un viesa mapes paliek Supabase Storage. |
| 06.09.2026. | [Production event gallery with 57 photos](2026-09-06-production-event-gallery-57-photos.png) | Reāla production pasākuma detaļas, QR un 57 foto galerija. |

## Mobilo ierīču pārbaude

12.09.2026. production vidē tika pārbaudīts pasākums `test.retake.photo` ar iPhone 13 Pro un Samsung Galaxy S23. Abās ierīcēs izdevās atvērt viesa saiti, ievadīt vārdu, atvērt kameru, pievienot foto un redzēt rezultātu organizatora galerijā. Lietotāji norādīja, ka plūsma bija saprotama.

## Izmantošana atskaitē un prezentācijā

Ekrānattēli ir pierādījumi konkrētiem darba posmiem, nevis atsevišķu stundu automātisks apliecinājums. Atskaitei ieteicams izmantot:

1. production galeriju ar 57 foto;
2. viesa mobilās plūsmas ekrānu;
3. R2 lasāmo ceļu un WebP pāra ekrānu;
4. Supabase production pārskatu;
5. RLS atteikuma vai SQL migrācijas pierādījumu.
