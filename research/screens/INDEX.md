# Индекс скриншотов

Мобильный вьюпорт **390 × 844** (наш базовый макет), Playwright.
Разбор — в [`../competitor-analysis.md`](../competitor-analysis.md).

Две съёмки:

- **2026-09-07** — все продукты из веба, без авторизации. Экраны, закрытые логином,
  помечены **«доступ ограничен»** в подписи и суффиксом `--dostup-ogranichen` в имени файла.
- **2026-09-08** — Meetup под живым аккаунтом: онбординг целиком (9 шагов), лента,
  карточка события, страница группы, чаты, профиль, настройки, репорт.
  Это снимает пометку «доступ ограничен» с Meetup — впервые видим продукт изнутри.

## AMI · Tinder · Peanut · Bumble For Friends · Karabas

| Файл | Продукт | Что на экране |
|---|---|---|
| `ami--landing--01-hero.png` | AMI | Первый экран лендинга: позиционирование и вход в Telegram-бот |
| `ami--landing--02-full.png` | AMI | Лендинг целиком: два режима (романтика / дружба), совместимость, «без прихованих платежів» |
| `ami--app--03-telegram-gate--dostup-ogranichen.png` | AMI | **Доступ ограничен.** Продукт живёт как Telegram mini-app; из веба доступна только страница бота, сам интерфейс подбора закрыт авторизацией Telegram |
| `tinder--landing--01-hero.png` | Tinder | Первый экран: «It starts with a swipe.™» — механика вынесена в главный слоган |
| `tinder--app--02-recs-login-wall--dostup-ogranichen.png` | Tinder | **Доступ ограничен.** `/app/recs` без сессии редиректит на лендинг; колода свайпов недоступна |
| `peanut--landing--01-hero.png` | Peanut | Первый экран: «Find mom friends», «Trusted by 5M+ women monthly» |
| `peanut--landing--02-three-pillars.png` | Peanut | Лендинг целиком: три контура — Swipe to Find Friends Nearby, Join Groups and Communities, Ask Questions and Get Advice |
| `peanut--safety--03-community-guidelines.png` | Peanut | Community Guidelines: обязательная селфи-верификация, ложные жалобы как нарушение, запрет коммерции, анти-гостинг |
| `peanut--app--04-store-screens.png` | Peanut | Карточка Google Play: витринные экраны, «Contains ads · In-app purchases», 1M+ загрузок. Внутренние экраны иначе **доступ ограничен** |
| `bumble-bff--landing--01-hero.png` | Bumble For Friends | Первый экран: «Find your people with Bumble For Friends», только App Store / Google Play |
| `bumble-bff--landing--02-full.png` | Bumble For Friends | Лендинг целиком: «There are friends for every era. Even your messy ones.», интент-чипы, The Friendship Hub |
| `bumble-bff--app--03-store-screens.png` | Bumble For Friends | Карточка Google Play: витринные экраны приложения, «Contains ads · In-app purchases», 1M+ загрузок. Сам продукт в Украине недоступен — внутренние экраны иначе **доступ ограничен** |
| `karabas--events--01-feed.png` | Karabas | Первый экран афиши: баннер, заголовок «Афіша подій 2026 в Україні». Отложен из разбора — материал по софт-группе |
| `karabas--events--02-feed-full.png` | Karabas | Лента целиком: карточки событий по категориям, участники нигде не показаны. Отложен из разбора |

## Meetup — полный флоу под аккаунтом (2026-09-08)

Порядок файлов = порядок прохождения продукта.

| Файл | Что на экране |
|---|---|
| `meetup--landing--01-hero.png` | Первый экран: «The people platform. Where interests become friendships.» |
| `meetup--onboarding--02-login.png` | Логин: три OAuth-кнопки (Google, Apple, Facebook) выше формы, email + пароль, hCaptcha, «Keep me logged in» по умолчанию включён |
| `meetup--onboarding--03-verify-email-gate.png` | «Check your inbox» — гейт подтверждения почты. Не блокирует вход: сессия при этом уже установлена. Адрес аккаунта закрашен |
| `meetup--onboarding--04-intent.png` | Шаг 1/9. «What brings you to Meetup?» — Attend events / Organize events / Not sure yet. Организатор и участник разводятся на первом же экране |
| `meetup--onboarding--05-age-gate.png` | Шаг 2/9. Дата рождения, «Knowing your age helps us find the right events… It won't be shared with anyone» |
| `meetup--onboarding--06-gender.png` | Шаг 3/9. Пол: Female / Male / Non-binary / Prefer not to say |
| `meetup--onboarding--07-goal.png` | Шаг 4/9. «What's bringing you to Meetup, %name%?» — чипы целей. Среди них **«❤️ Find a date»**: Meetup не отстраивается от дейтинга, а держит его как один из сценариев |
| `meetup--onboarding--08-people.png` | Шаг 5/9. «Who do you want to meet?» — People my age, Other parents, Students, **Other expats**, Tech folks, Same-minded people. Прямой аналог нашего intent picker (§6) |
| `meetup--onboarding--09-hangout.png` | Шаг 6/9. «How do you like to hang out?» — Casual hangouts, Small gatherings, Big events, Quiet events. Формат встречи спрашивается отдельно от интереса |
| `meetup--onboarding--10-interests.png` | Шаг 7/9. Каталог интересов: поиск, «Popular Interests» сверху, 20 категорий-аккордеонов. Минимум 3 — как у нас (§5.1) |
| `meetup--onboarding--11-interests-selected.png` | Тот же шаг с выбранными тегами: счётчик в кнопке «3/3 selected» |
| `meetup--paywall--12-onboarding-paywall.png` | Шаг 8/9. **Пейволл внутри онбординга**: «Join Meetup+», €12.99/мес или €111.99/год, «Most popular» на месячном. Бесплатный путь — мелкой ссылкой «continue with free plan» и радиокнопкой «Not sure yet? Enable free access» |
| `meetup--onboarding--13-groups-autojoin.png` | Шаг 9/9. «Based on your interests and location, **we joined for you** a few groups» — продукт сам вступает за пользователя в 2 группы, чтобы лента не была пустой. Ниже «Others you might like» |
| `meetup--onboarding--14-discovery-survey.png` | Пост-онбординговый bottom sheet «How did you discover Meetup?» — атрибуция, не относится к продуктовой ценности |
| `meetup--discover--15-home-feed.png` | Домашняя лента: «For you» с горизонтальным каруселем, вкладки Going / Saved с пустым состоянием «Looks like you're free → Find events», «Your groups», «From your groups», баннер Meetup+ «Start 7-day free trial» |
| `meetup--events--16-kyiv-feed.png` | Лента «Events near Kyiv, UA» под аккаунтом: фильтры Any day / Any size / Any type, вкладки All events · New Groups · From your Groups, карточка с аватарами и «6 attendees» |
| `meetup--events--17-kyiv-feed-logged-out.png` | Та же лента без авторизации (съёмка 2026-09-07) — для сравнения, что видно до регистрации |
| `meetup--events--18-filters-date.png` | Фильтр по дате как bottom sheet: Any day · Starting soon · Today · Tomorrow · This week · This weekend · Next week · Custom |
| `meetup--event--19-detail-top.png` | Верх карточки события: организатор с бейджем **Super Organizer**, рейтинг группы «4.4 ★ · 3 reviews», цена **Free** рядом с кнопкой Attend |
| `meetup--event--20-detail-full.png` | Карточка события целиком: **точный адрес и карта Google для всех, а не только для участников**, список Attendees, Photos, «Report event», блок «You may also like». Прямой контраст с нашим §7.1–7.2 |
| `meetup--events--21-group-page.png` | Страница группы: обложка, счётчик участников, организаторы, ближайшие события, лента прошедших |
| `meetup--events--22-create-group-step1.png` | Создание группы, шаг 1 из 6: «First, set your location for your group». У Meetup нельзя создать событие, не создав сначала группу — у нас событие создаётся за 2 шага без промежуточной сущности (§5.4) |
| `meetup--chat--23-empty.png` | Пустое состояние сообщений: «This space is feeling a little… empty. Why not be the first to say hi?» Писать можно **кому угодно без матча** — контраст с нашим правилом «сообщение только после взаимного лайка» (§4) |
| `meetup--profile--24-my-profile.png` | Свой профиль: счётчики **2 Groups · 8 Interests · 0 RSVPs** — факты, а не оценки. Ни рейтинга, ни бейджа верификации, ни счётчика подтверждённых встреч. Адрес аккаунта закрашен |
| `meetup--profile--25-edit-profile.png` | Редактирование профиля с тумблерами приватности по полям: Show Meetup groups / Interests / **relationship status** / work industry |
| `meetup--profile--26-settings.png` | Настройки: Privacy, Mobile Notifications, Organizer Subscription, Meetup+ Subscription, Payment Methods, Payments Made / Received. **Списка заблокированных нет** |
| `meetup--profile--27-privacy.png` | Экран Privacy целиком: единственная настройка — «Who can contact you on Meetup? → Anyone on Meetup». Ни управления геолокацией, ни блок-листа |
| `meetup--safety--28-report-event.png` | Репорт как bottom sheet: Violent or hateful · Inappropriate · Poor quality or spam · Something that happened in person · Something else, с подписью «We won't share this information with the organizer». Ближайший аналог нашей приватной обратной связи (§7.5) |

## Замечания к съёмке

- Cookie-баннеры на Tinder, Bumble, Meetup и Karabas закрывают первый экран целиком.
  Скрины сняты после отклонения баннера — кроме `karabas--events--02-feed-full.png`,
  где баннер виден в верхней части: это честная картина первого визита.
- `tinder--landing--01-hero.png` и `tinder--app--02-...` визуально совпадают — это и есть результат:
  Tinder не показывает неавторизованному пользователю ничего, кроме лендинга.
- Внутренние экраны AMI, Tinder, Bumble For Friends и Peanut по-прежнему недоступны без регистрации.
  Для BFF и Peanut частично заменены витринными скриншотами из Google Play.
- Аккаунт Meetup при съёмке определился в **Бухарест** (по IP), поэтому домашняя лента,
  автовступление в группы и профиль показывают румынский контекст. Лента событий
  снята отдельно с принудительной локацией Киева.

### Как замазаны персональные данные

Требование `README.md` — не публиковать имена, фото и переписку реальных людей.
Перед каждым снимком в страницу подмешивался CSS-блюр по трём правилам:

- фотографии участников — `img[src*="/photos/member/"]` и `img[alt^="Photo of the user"]`;
- ссылки на профили людей — `a[href*="/members/"]`;
- строка организатора — `[data-event-label="hosted-by"]`.

Адрес почты тестового аккаунта закрашен на `--03-verify-email-gate` и `--24-my-profile`.

**Что осознанно НЕ замазано:** обложки событий и логотипы групп, даже когда на них есть люди
и имена спикеров. Это опубликованные организациями промо-материалы, и блюр обложки уничтожает
главное, ради чего снята карточка, — её вёрстку. Если решим ужесточить правило,
перекрывать придётся вручную, по одной картинке.

### Чего в наборе нет и почему

- **RSVP / Join и вступление в группу** не снимались: это действие видно организатору
  реального события и бесследно не отменяется. Кнопка `Attend` зафиксирована
  в исходном состоянии на `--19-detail-top`.
- **Групповой чат события** доступен только после Join — по той же причине не снят.
- **Создание события** требует сначала создать группу; дальше первого шага
  (`--22-create-group-step1`) флоу не проходился, чтобы не публиковать пустую группу.
- Две группы на `--13-groups-autojoin` и `--24-my-profile` отмечены как вступленные —
  это сделал сам Meetup на девятом шаге онбординга, а не мы.
