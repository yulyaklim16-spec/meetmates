# Индекс скриншотов

Веб-съёмки — мобильный вьюпорт **390 × 844** (наш базовый макет), Playwright.
Съёмка с телефона — нативное разрешение устройства.
Разбор — в [`../competitor-analysis.md`](../competitor-analysis.md).

Четыре съёмки:

- **2026-09-07** — все продукты из веба, без авторизации. Экраны, закрытые логином,
  помечены **«доступ ограничен»** в подписи и суффиксом `--dostup-ogranichen` в имени файла.
- **2026-09-08** — Meetup под живым аккаунтом: онбординг целиком (9 шагов), лента,
  карточка события, страница группы, чаты, профиль, настройки, репорт.
  Это снимает пометку «доступ ограничен» с Meetup — впервые видим продукт изнутри.
- **2026-09-08** — Tinder из мобильного приложения (iOS, 1170 × 2532): регистрация целиком,
  туториал, колода, Explore, чаты, настройки сообщений, свой профиль. Пометка
  «доступ ограничен» снимается и с Tinder. Скриншоты сняты с устройства, поэтому
  разрешение выше базового макета; пропорция 9:19.5 та же.
- **2026-09-09** — четыре полосы экранов из **[Mobbin](https://mobbin.com/)**, библиотеки
  UX-флоу (файлы `*--app--*-flow-strip.png`, ~1940 × 570). Это **не наша съёмка**: каждый файл —
  готовая композитная полоса из 6–7 экранов одного продукта плюс перечень доступных
  флоу справа. Так впервые видно изнутри Peanut, Bumble For Friends и Partiful —
  продукты, которые из веба закрыты авторизацией или недоступны в регионе.
  Пометка «доступ ограничен» с них **не снимается**: полоса показывает то, что отобрала
  библиотека, а не то, что мы прошли сами, и проверить полноту флоу по ней нельзя.

## AMI · Peanut · Bumble For Friends · Karabas

| Файл | Продукт | Что на экране |
|---|---|---|
| `ami--landing--01-hero.png` | AMI | Первый экран лендинга: позиционирование и вход в Telegram-бот |
| `ami--landing--02-full.png` | AMI | Лендинг целиком: два режима (романтика / дружба), совместимость, «без прихованих платежів» |
| `ami--app--03-telegram-gate--dostup-ogranichen.png` | AMI | **Доступ ограничен.** Продукт живёт как Telegram mini-app; из веба доступна только страница бота, сам интерфейс подбора закрыт авторизацией Telegram |
| `peanut--landing--01-hero.png` | Peanut | Первый экран: «Find mom friends», «Trusted by 5M+ women monthly» |
| `peanut--landing--02-three-pillars.png` | Peanut | Лендинг целиком: три контура — Swipe to Find Friends Nearby, Join Groups and Communities, Ask Questions and Get Advice |
| `peanut--safety--03-community-guidelines.png` | Peanut | Community Guidelines: обязательная селфи-верификация, ложные жалобы как нарушение, запрет коммерции, анти-гостинг |
| `peanut--app--04-store-screens.png` | Peanut | Карточка Google Play: витринные экраны, «Contains ads · In-app purchases», 1M+ загрузок. Внутренние экраны иначе **доступ ограничен** |
| `peanut--app--05-flow-strip.png` | Peanut | **Полоса из Mobbin.** Сплэш → вход: Apple, Facebook, Google, телефон — пароля нет вообще, только OAuth и SMS. Слоган на экране входа «A safe space for women to connect, ask questions and find support». Справа перечень флоу продукта: Onboarding · Adding lifestage · Subscribing to Peanut · **Swiping to connect** · **Verifying profile** · Explore — свайпы и верификация подтверждаются как отдельные контуры |
| `bumble-bff--landing--01-hero.png` | Bumble For Friends | Первый экран: «Find your people with Bumble For Friends», только App Store / Google Play |
| `bumble-bff--landing--02-full.png` | Bumble For Friends | Лендинг целиком: «There are friends for every era. Even your messy ones.», интент-чипы, The Friendship Hub |
| `bumble-bff--app--03-store-screens.png` | Bumble For Friends | Карточка Google Play: витринные экраны приложения, «Contains ads · In-app purchases», 1M+ загрузок. Сам продукт в Украине недоступен — внутренние экраны иначе **доступ ограничен** |
| `bumble-bff--app--04-flow-strip.png` | Bumble For Friends | **Полоса из Mobbin — первый взгляд внутрь BFF.** Get Started с двумя тумблерами (Location, Notifications) вместо системных диалогов; карточка колоды: «32 • Granada Hills North, Granada Hills» — **район вместо километров**, чипы интересов на фото, строка намерения «Looking for friends to hang out with in the city»; экран матча «You are connected with Christine» без слова *match*; профиль целиком с блоками About me / What I am into; гейт «Add your location to see people & groups» с картой и радиусом в милях; **My groups** — групповые чаты вне событий, с подписями «Active now» и «Last active 21 minutes ago» (бейдж присутствия, от которого мы отказались — §5.5.3); вход по номеру телефона. Флоу справа: Onboarding · **Verifying identity** · User profile · People · Completing account · Chatting a user. Лица размыты источником |
| `karabas--events--01-feed.png` | Karabas | Первый экран афиши: баннер, заголовок «Афіша подій 2026 в Україні». Отложен из разбора — материал по софт-группе |
| `karabas--events--02-feed-full.png` | Karabas | Лента целиком: карточки событий по категориям, участники нигде не показаны. Отложен из разбора |

## Tinder — полный флоу в приложении (2026-09-08)

Веб показывает неавторизованному только лендинг, поэтому продукт снят с телефона.
Язык интерфейса — русский: так его видит наша аудитория в регионе.

| Файл | Что на экране |
|---|---|
| `tinder--landing--01-hero.png` | Веб-лендинг: «It starts with a swipe.™» — механика вынесена в главный слоган |
| `tinder--app--02-recs-login-wall--dostup-ogranichen.png` | **Доступ ограничен.** `/app/recs` без сессии редиректит на лендинг — причина, по которой дальше снимали с телефона |
| `tinder--onboarding--03-welcome-rules.png` | Первый экран после входа — четыре правила сообщества: «Будьте собой», «Помните о безопасности», «Ведите себя достойно», «Действуйте решительно». Безопасность заявлена **до** анкеты, а не спрятана в настройках |
| `tinder--onboarding--04-name.png` | Имя, с предупреждением «Его нельзя изменить» |
| `tinder--onboarding--05-birthday.png` | Дата рождения: «В профиле отображается твой возраст, а не день рождения» — тот же приём, что у нас в §5.1 |
| `tinder--onboarding--06-gender.png` | Пол: Женщина / Мужчина / Ещё, плюс отдельный чекбокс «Показывать мой пол в профиле» — поле и его видимость разведены |
| `tinder--onboarding--07-orientation.png` | Ориентация, до 3 вариантов, шаг пропускаемый, видимость снова отдельным чекбоксом. У нас этого поля нет и не будет — §1 |
| `tinder--onboarding--08-show-me.png` | «Кого ты хочешь видеть?» — Женщины / Мужчины / Всех |
| `tinder--onboarding--09-distance.png` | «Настройки расстояния»: слайдер, по умолчанию **80 км**. Радиус задаётся широким и сужается пользователем — ровно наше решение из §2.1 |
| `tinder--onboarding--10-looking-for.png` | «Сейчас я ищу…» — шесть карточек, среди них **«🤝 Найти друзей»** и «🎉 Просто повеселиться». Дружба у Tinder есть, но как один из шести режимов внутри дейтинга |
| `tinder--onboarding--11-education.png` | Образование, шаг пропускаемый |
| `tinder--onboarding--12-interests.png` | Интересы: плоское облако тегов без категорий, лимит «Далее 0/5». У Meetup — 20 категорий-аккордеонов, у Tinder — один список; наш каталог (§5.1) ближе к Meetup |
| `tinder--onboarding--13-photos.png` | «Добавь свежие фото»: минимум 2, шесть слотов, «Добавь 4 или больше, если хочешь выделить свой профиль» |
| `tinder--onboarding--14-location-permission.png` | Экран-предупреждение перед системным запросом гео: «Иначе ты не сможешь создавать пары». Цена отказа названа честно — приём, который мы применяем к верификации (§7.3) |
| `tinder--onboarding--15-location-system-dialog.png` | Системный диалог iOS поверх экрана: Однократно / При использовании / Запретить. Карта с реальным местоположением закрашена |
| `tinder--safety--16-avoid-contacts-intro.png` | «Хотите избежать встречи с кем-нибудь из ваших знакомых?» — предложение отдать контакты, чтобы не пересечься со знакомыми. Проблема, которой у нас нет: мы не про случайную встречу с бывшим коллегой |
| `tinder--safety--17-block-contacts-empty.png` | «Заблокировать контакты»: вкладки Контакты / Заблокированные, импорт телефонной книги, пустое состояние |
| `tinder--onboarding--18-tutorial-start.png` | Старт обучения «Давайте начнём!» с уже видимым таб-баром из 5 вкладок |
| `tinder--onboarding--19-tutorial-actions.png` | Второй экран обучения: отмена свайпа, Суперлайк, Буст. Два из трёх действий — платные; обучение механике и продажа апселов слиты в один экран |
| `tinder--discover--20-card-verified.png` | **Карточка колоды.** Бейдж **Verified** у имени, бейдж расстояния **«Недалеко»** вместо числа, чипы интересов прямо на фото. Три сигнала, которые мы кладём на карточку в §5.2 и §7.1, здесь уже есть. Лицо и имя закрашены |
| `tinder--discover--21-card-intent.png` | Карточка с бейджем **«Активность сейчас»** и строкой намерения «Я ищу: Долгосрочный партнёр» — интент вынесен на карточку, а не спрятан в профиль. Фото и имя закрашены |
| `tinder--discover--22-card-distance.png` | Карточка с геоданными: «Живёт в городе Буча» и **«19 км от тебя»**. Точное число километров — то, от чего мы отказались в §7.1 в пользу округления. Фото и имя закрашены |
| `tinder--discover--23-friends-promo.png` | Полноэкранное промо **«Будем друзьями · Найди новых друзей»** с кнопками «Присоединиться» / «Нет, спасибо» |
| `tinder--discover--24-explore-vibes.png` | Вкладка Explore, блок «Мой вайб…»: Ищу любовь · Планы на сегодня · **Будем друзьями** · Свидание за кофе. Дружба стоит четвёртой плиткой рядом с романтикой — наш прямой конкурент по сценарию |
| `tinder--discover--25-explore-for-you.png` | Explore, «Для тебя»: Свидания, Смотрят сериалы запоем, Креативщики, Спортсмены |
| `tinder--discover--26-explore-categories.png` | Explore, категории: Любители музыки, Гурманы, Любители природы, Путешествия, Уход за собой, Экстремалы |
| `tinder--discover--27-explore-categories-more.png` | Explore, продолжение: Геймеры, Друзья зверей |
| `tinder--chat--28-empty-blurred-likes.png` | Пустые чаты «Найти пары» + полоса лайков, где лица **размыты самим Tinder**, и тултип «Новинка! Управляй, кто может тебе писать». Размытие лайкнувших — тот самый curiosity gap, на котором продаётся Gold |
| `tinder--chat--29-message-settings-verified.png` | «Настройки сообщений» → **«Чат с подтвержденными фото»**: получать сообщения только от верифицированных, но включить может лишь тот, кто верифицировался сам. Верификация как фильтр входящих, а не как гейт на отправку — противоположность нашему §7.3 |
| `tinder--profile--30-my-profile-gold.png` | Свой профиль: незакрытый бейдж верификации с подсказкой «Подтверди свой профиль!», счётчики суперлайков и бустов с кнопками «Получить ещё», карусель «Перейти на Tinder Gold — узнай, кто тебя лайкнул». Профиль сделан витриной апселов; репутационных сигналов нет ни одного |

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
| `meetup--app--29-flow-strip.png` | **Полоса из Mobbin — американский Meetup, где база плотная.** Лента New York: карточка «1.4 mi · by Neverwinter Free Parties · 4.8 ★» и **326 going** против 2–6 участников в Киеве; **карта событий** с числом на каждом пине (переключатель Map / Back to list); карточка события с конфетти и статусом Going, «You and 1 guest»; экран Attendees — **328 · Canceled 48**, бейдж **First event** у новичков и **Super Organizer** у хоста, гости считаются как «2 guests»; профиль организатора с кнопками **Chat / Add friend** и блоком «Looking to: Practice Hobbies · Professionally Network · Socialize · **Make Friends**» — интент вынесен на чужой профиль. Флоу справа: Onboarding · Subscribing to standard · Event detail · Home · Explore · Switching to map view. Имена и лица части гостей размыты источником |

## Partiful — полоса из Mobbin (2026-09-09)

Первые экраны Partiful в наборе. Продукт заявлен в [`../research.md`](../research.md), §4
как аспирационный эталон дизайна событий; строка в сводной таблице §4 заполнена
2026-09-09 по этой полосе и помечена **[Mobbin]** как вторичный источник.

| Файл | Что на экране |
|---|---|
| `partiful--app--01-flow-strip.png` | Сплэш; главная «Welcome to Partiful, Sam!» с вкладками **Upcoming · Hosting · Open invites** — роль организатора отделена от роли гостя прямо в навигации (наш §5.4, My events); карточка события целиком как **афиша**: обложка на весь экран, крупный титул, дата, таймзона `ET / ICT` и панель действий организатора внизу — Edit · Text Blast · **1 Going** · Invite · More; **Manage Guests** с вёдрами `Going 1 · Maybe 0 · Invited 1` и статусом, выставляемым вручную по каждому гостю; экран шеринга «Sending to someone? It looks way better when you share it» — **приглашение как объект**, ссылка `partiful.com` копируется, отправка через Messages; **Questionnaire** «Will you have cake?» — вопрос гостям с таблицей ответов. Аккаунта, матчей и подбора людей нет: продукт целиком про **одно событие и его гостей**. Флоу справа: Onboarding · Event detail · Home · **Creating an event** · **Inviting a guest** · Enabling text blasts |

Почему это важно для нас: Partiful — единственный в наборе, кто делает событие
самостоятельной единицей (§5.4 брифа) и не прячет его ни за группой, как Meetup,
ни за анкетой, как Tinder. Тон — ровно тот «энергичный и яркий», что описан в §8.
Обратная сторона: у Partiful нет ни открытия новых людей, ни репутации, ни блока
безопасности — он работает на уже знакомой компании. Наш контур поиска (§5.2)
закрывает ровно этот разрыв.

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
- Четыре файла `*--app--*-flow-strip.png` — **чужая съёмка из Mobbin**,
  а не наш проход. Отсюда три ограничения: набор экранов отобран Mobbin;
  дата съёмки самой библиотеки неизвестна, продукт мог с тех пор измениться;
  полосы шире базового макета (~1940 × 570 против 390 × 844), потому что это композит
  из 6–7 кадров, а не один экран. Ссылаться на них в разборе можно, но как
  на вторичный источник: наблюдение, ради которого экран важен, стоит подтверждать
  своей съёмкой, когда продукт станет доступен.
- Демо-данные в этих полосах витринные: «Sam Lee», «Jane Doe», «Alex Smith» у Partiful,
  «Judy Smith» в диалоге Google у Peanut. Это заготовки Mobbin, не реальные
  люди; лица и часть имён у BFF и Meetup размыты источником.

### Как замазаны персональные данные

Требование `README.md` — не публиковать имена, фото и переписку реальных людей.
Перед каждым снимком в страницу подмешивался CSS-блюр по трём правилам:

- фотографии участников — `img[src*="/photos/member/"]` и `img[alt^="Photo of the user"]`;
- ссылки на профили людей — `a[href*="/members/"]`;
- строка организатора — `[data-event-label="hosted-by"]`.

Адрес почты тестового аккаунта закрашен на `--03-verify-email-gate` и `--24-my-profile`.

Скриншоты Tinder сняты с телефона, подмешать CSS туда нельзя — там персональные данные
закрыты **пикселизацией по областям** уже в файле:

- `tinder--discover--20-card-verified` — лицо и строка имени;
- `tinder--discover--21-card-intent` и `--22-card-distance` — **всё фото целиком** и имя.
  На обеих карточках люди в военной форме; пикселизация здесь сильнее, чем на остальных
  экранах, и снимает узнаваемость полностью. Читаемым оставлено только «обвес» карточки:
  бейджи, строка намерения, строка расстояния — то, ради чего экран и снят;
- `tinder--onboarding--15-location-system-dialog` — карта с реальным местоположением
  владельца телефона.

Пикселизация необратима: закрашенные области перезаписаны в самих png, оригиналы не хранятся.

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
